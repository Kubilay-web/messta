"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { format, addDays, startOfWeek } from "date-fns";
import { Check, X, Clock, Loader2, Save, UserCheck } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Agent = { id: string; firstName: string; lastName: string; employeeId: string; designation: string };
type Department = { id: string; name: string; agents: Agent[] };
type AttendanceRecord = { id: string; agentId: string; status: string; checkIn: Date | null; checkOut: Date | null; note: string | null };
type AgentStatus = { agentId: string; status: string };

interface Props {
  departments: Department[];
  getAttendanceForDept: (deptId: string, date: string) => Promise<AttendanceRecord[]>;
  upsertAttendance: (data: { agentId: string; date: string; status: string; checkIn?: string | null; checkOut?: string | null; note?: string | null }) => Promise<{ ok: boolean; error?: string }>;
  saveBulkAttendance: (records: { agentId: string; date: string; status: string }[]) => Promise<{ ok: boolean; error?: string }>;
  deleteAttendance: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUSES = [
  { value: "PRESENT",  label: "Mevcut",   cls: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" },
  { value: "ABSENT",   label: "Yok",      cls: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400" },
  { value: "LATE",     label: "Geç",      cls: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "ON_LEAVE", label: "İzinli",   cls: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "REMOTE",   label: "Uzaktan",  cls: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400" },
];

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(weekStart, i);
  return { date: d, label: format(d, "EEEE"), value: format(d, "yyyy-MM-dd") };
});

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function AgentBulkAttendance({ departments, getAttendanceForDept, upsertAttendance, saveBulkAttendance, deleteAttendance }: Props) {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedDay, setSelectedDay]   = useState(weekDays[0].value);
  const [existingMap, setExistingMap]   = useState<Record<string, AttendanceRecord>>({});
  const [statusMap, setStatusMap]       = useState<Record<string, string>>({});
  const [fetching, setFetching]         = useState(false);
  const [saving, setSaving]             = useState(false);

  const agents = selectedDept?.agents ?? [];

  async function handleLoad() {
    if (!selectedDept) return toast.error("Departman seçin.");
    setFetching(true);
    try {
      const records = await getAttendanceForDept(selectedDept.id, selectedDay);
      const map: Record<string, AttendanceRecord> = {};
      const smap: Record<string, string> = {};
      records.forEach((r) => { map[r.agentId] = r; smap[r.agentId] = r.status; });
      // default unmarked agents to PRESENT
      selectedDept.agents.forEach((a) => { if (!smap[a.id]) smap[a.id] = "PRESENT"; });
      setExistingMap(map);
      setStatusMap(smap);
    } catch {
      toast.error("Kayıtlar alınamadı.");
    } finally {
      setFetching(false);
    }
  }

  function setStatus(agentId: string, status: string) {
    setStatusMap((prev) => ({ ...prev, [agentId]: status }));
  }

  function markAll(status: string) {
    const next: Record<string, string> = {};
    agents.forEach((a) => { next[a.id] = status; });
    setStatusMap(next);
  }

  async function handleSave() {
    if (!selectedDept || agents.length === 0) return;
    setSaving(true);
    const records = agents.map((a) => ({
      agentId: a.id, date: selectedDay, status: statusMap[a.id] ?? "PRESENT",
    }));
    const res = await saveBulkAttendance(records);
    setSaving(false);
    if (res.ok) {
      toast.success("Devam kayıtları kaydedildi.");
      await handleLoad();
    } else {
      toast.error(res.error ?? "Kayıt başarısız.");
    }
  }

  const hasLoaded = agents.length > 0 && Object.keys(statusMap).length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* Filtre */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Departman</label>
              <select
                className={inputCls}
                value={selectedDept?.id ?? ""}
                onChange={(e) => {
                  const d = departments.find((x) => x.id === e.target.value) ?? null;
                  setSelectedDept(d);
                  setStatusMap({});
                  setExistingMap({});
                }}
              >
                <option value="">Departman seçin...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.agents.length} danışman)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Tarih</label>
              <select className={inputCls} value={selectedDay} onChange={(e) => { setSelectedDay(e.target.value); setStatusMap({}); setExistingMap({}); }}>
                {weekDays.map((d) => (
                  <option key={d.value} value={d.value}>{d.label} — {format(d.date, "d MMM yyyy")}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleLoad}
            disabled={fetching || !selectedDept}
            className="w-full sm:w-auto px-6 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {fetching && <Loader2 className="h-4 w-4 animate-spin" />}
            {fetching ? "Yükleniyor..." : "Devam Listesini Getir"}
          </button>
        </CardContent>
      </Card>

      {/* Tablo */}
      {hasLoaded && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {/* Toplu işlem başlığı */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b">
              <div>
                <p className="font-semibold text-sm sm:text-base">{selectedDept?.name}</p>
                <p className="text-xs text-gray-500">{weekDays.find((d) => d.value === selectedDay)?.label} — {selectedDay}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => markAll("PRESENT")} className="px-3 h-8 text-xs rounded-md border border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <Check className="inline h-3 w-3 mr-1" />Tümü Mevcut
                </button>
                <button onClick={() => markAll("ABSENT")} className="px-3 h-8 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <X className="inline h-3 w-3 mr-1" />Tümü Yok
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 h-8 text-xs rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors flex items-center gap-1"
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                </button>
              </div>
            </div>

            {agents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                <UserCheck className="h-10 w-10 opacity-30" />
                <p className="text-sm">Bu departmanda aktif danışman yok.</p>
              </div>
            ) : (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Danışman</th>
                        <th className="text-left px-4 py-3">Sicil No</th>
                        <th className="text-left px-4 py-3">Ünvan</th>
                        <th className="text-left px-4 py-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agents.map((a, i) => {
                        const cur = statusMap[a.id] ?? "PRESENT";
                        return (
                          <tr key={a.id} className={`transition-colors ${i % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"}`}>
                            <td className="px-4 py-3 font-medium">{a.firstName} {a.lastName}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{a.employeeId}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{a.designation}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {STATUSES.map((s) => (
                                  <button
                                    key={s.value}
                                    onClick={() => setStatus(a.id, s.value)}
                                    className={`px-2.5 h-7 text-xs rounded-full border font-medium transition-all ${cur === s.value ? s.cls + " ring-2 ring-offset-1 ring-current" : "border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700"}`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart */}
                <div className="md:hidden divide-y">
                  {agents.map((a) => {
                    const cur = statusMap[a.id] ?? "PRESENT";
                    const curStatus = STATUSES.find((s) => s.value === cur);
                    return (
                      <div key={a.id} className={`p-4 border-l-4 ${cur === "PRESENT" ? "border-l-green-500" : cur === "ABSENT" ? "border-l-red-500" : cur === "LATE" ? "border-l-yellow-500" : cur === "ON_LEAVE" ? "border-l-purple-500" : "border-l-blue-500"}`}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-medium text-sm">{a.firstName} {a.lastName}</p>
                            <p className="text-xs text-gray-500">{a.designation} · {a.employeeId}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${curStatus?.cls ?? ""}`}>
                            {curStatus?.label ?? cur}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => setStatus(a.id, s.value)}
                              className={`px-2.5 h-7 text-xs rounded-full border font-medium transition-all ${cur === s.value ? s.cls + " ring-2 ring-offset-1 ring-current" : "border-gray-200 text-gray-500 dark:border-gray-700"}`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Alt kaydet butonu */}
                <div className="px-4 sm:px-6 py-4 border-t flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
