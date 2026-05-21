"use client";

import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Users, Save, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../../../../components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

type Agent = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  designation: string;
};

type Department = {
  id: string;
  name: string;
  agents: Agent[];
};

type AttendanceRecord = {
  id: string;
  agentId: string;
  status: AttendanceStatus;
  checkIn: Date | string | null;
  checkOut: Date | string | null;
  note: string | null;
  date: Date | string;
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE" | "REMOTE";

type RowState = {
  recordId?: string;
  status: AttendanceStatus | "";
  checkIn: string;
  checkOut: string;
  note: string;
  dirty: boolean;
  saving: boolean;
};

interface Props {
  departments: Department[];
  getAttendanceForDept: (deptId: string, date: string) => Promise<AttendanceRecord[]>;
  upsertAttendance: (data: {
    agentId: string; date: string; status: string;
    checkIn?: string | null; checkOut?: string | null; note?: string | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  deleteAttendance: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  PRESENT:  { label: "Var",       color: "text-green-700",  bg: "bg-green-100" },
  ABSENT:   { label: "Yok",       color: "text-red-700",    bg: "bg-red-100" },
  LATE:     { label: "Geç Geldi", color: "text-orange-700", bg: "bg-orange-100" },
  ON_LEAVE: { label: "İzinli",    color: "text-blue-700",   bg: "bg-blue-100" },
  REMOTE:   { label: "Uzaktan",   color: "text-purple-700", bg: "bg-purple-100" },
};

function toTimeStr(val: Date | string | null): string {
  if (!val) return "";
  try { return format(new Date(val as any), "HH:mm"); } catch { return ""; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentAttendanceListing({
  departments,
  getAttendanceForDept,
  upsertAttendance,
  deleteAttendance,
}: Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedDept, setSelectedDept] = useState(departments[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading,   setLoading]   = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [rowMap,    setRowMap]    = useState<Record<string, RowState>>({});

  const currentDept = departments.find((d) => d.id === selectedDept);

  // ── helpers ─────────────────────────────────────────────────────────────────

  function buildMap(agents: Agent[], records: AttendanceRecord[]): Record<string, RowState> {
    const map: Record<string, RowState> = {};
    for (const agent of agents) {
      const rec = records.find((r) => r.agentId === agent.id);
      map[agent.id] = {
        recordId: rec?.id,
        status:   (rec?.status as AttendanceStatus) ?? "",
        checkIn:  toTimeStr(rec?.checkIn ?? null),
        checkOut: toTimeStr(rec?.checkOut ?? null),
        note:     rec?.note ?? "",
        dirty:    false,
        saving:   false,
      };
    }
    return map;
  }

  function patch(agentId: string, fields: Partial<RowState>) {
    setRowMap((prev) => ({ ...prev, [agentId]: { ...prev[agentId], ...fields } }));
  }

  // ── GET ─────────────────────────────────────────────────────────────────────

  async function loadAttendance() {
    if (!selectedDept) { toast.error("Departman seçin"); return; }
    if (!currentDept)  return;
    setLoading(true);
    try {
      const records = await getAttendanceForDept(selectedDept, selectedDate);
      setRowMap(buildMap(currentDept.agents, records));
      setLoaded(true);
    } catch {
      toast.error("Yükleme başarısız");
    } finally {
      setLoading(false);
    }
  }

  // ── POST / PUT ───────────────────────────────────────────────────────────────

  async function saveRecord(agentId: string) {
    const rec = rowMap[agentId];
    if (!rec?.status) { toast.error("Durum seçin"); return; }
    patch(agentId, { saving: true });
    try {
      const checkIn  = rec.checkIn  ? new Date(`${selectedDate}T${rec.checkIn}:00`).toISOString()  : null;
      const checkOut = rec.checkOut ? new Date(`${selectedDate}T${rec.checkOut}:00`).toISOString() : null;
      const res = await upsertAttendance({
        agentId, date: selectedDate, status: rec.status,
        checkIn, checkOut, note: rec.note || null,
      });
      if (res.ok) {
        toast.success("Kaydedildi");
        // Reload to sync recordId
        const records = await getAttendanceForDept(selectedDept, selectedDate);
        setRowMap(buildMap(currentDept!.agents, records));
      } else {
        toast.error(res.error ?? "Kayıt başarısız");
        patch(agentId, { saving: false });
      }
    } catch {
      toast.error("Hata oluştu");
      patch(agentId, { saving: false });
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────

  async function handleDelete(agentId: string) {
    const rec = rowMap[agentId];
    if (!rec?.recordId) return;
    patch(agentId, { saving: true });
    try {
      const res = await deleteAttendance(rec.recordId);
      if (res.ok) {
        toast.success("Silindi");
        patch(agentId, {
          recordId: undefined, status: "", checkIn: "",
          checkOut: "", note: "", dirty: false, saving: false,
        });
      } else {
        toast.error(res.error ?? "Silme başarısız");
        patch(agentId, { saving: false });
      }
    } catch {
      toast.error("Hata oluştu");
      patch(agentId, { saving: false });
    }
  }

  // ── Bulk mark ────────────────────────────────────────────────────────────────

  function markAll(status: AttendanceStatus) {
    if (!currentDept) return;
    setRowMap((prev) => {
      const next = { ...prev };
      for (const agent of currentDept.agents) {
        next[agent.id] = { ...next[agent.id], status, dirty: true };
      }
      return next;
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const selectBase = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Departman</label>
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setLoaded(false); }}
                className={selectBase}
              >
                {departments.length === 0 && <option value="">Departman bulunamadı</option>}
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tarih</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setLoaded(false); }}
                className={selectBase}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadAttendance}
              disabled={loading || !selectedDept}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? "Yükleniyor…" : "Listele"}
            </button>
            {loaded && (
              <>
                <button
                  onClick={() => markAll("PRESENT")}
                  className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-md transition-colors"
                >
                  Tümü Var
                </button>
                <button
                  onClick={() => markAll("ABSENT")}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors"
                >
                  Tümü Yok
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {loaded && currentDept && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {/* Card header */}
            <div className="px-4 py-3 border-b flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="font-medium text-sm">{currentDept.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {currentDept.agents.length} danışman
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(`${selectedDate}T12:00:00`), "dd MMMM yyyy")}
              </span>
            </div>

            {currentDept.agents.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                Bu departmanda aktif danışman yok.
              </div>
            ) : (
              <>
                {/* ── Desktop table ─────────────────────────────────────── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Danışman</th>
                        <th className="text-left px-4 py-3 min-w-[150px]">Durum</th>
                        <th className="text-left px-4 py-3">Giriş</th>
                        <th className="text-left px-4 py-3">Çıkış</th>
                        <th className="text-left px-4 py-3">Not</th>
                        <th className="text-right px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentDept.agents.map((agent) => {
                        const row = rowMap[agent.id];
                        if (!row) return null;
                        return (
                          <tr
                            key={agent.id}
                            className={`transition-colors ${
                              row.dirty
                                ? "bg-yellow-50 dark:bg-yellow-900/10"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium">{agent.firstName} {agent.lastName}</p>
                              <p className="text-xs text-gray-400">{agent.employeeId} · {agent.designation}</p>
                            </td>

                            <td className="px-4 py-3">
                              <select
                                value={row.status}
                                onChange={(e) => patch(agent.id, { status: e.target.value as any, dirty: true })}
                                className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                              >
                                <option value="">— Seç —</option>
                                {(Object.keys(STATUS_CFG) as AttendanceStatus[]).map((s) => (
                                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="time"
                                value={row.checkIn}
                                onChange={(e) => patch(agent.id, { checkIn: e.target.value, dirty: true })}
                                className="w-28 h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="time"
                                value={row.checkOut}
                                onChange={(e) => patch(agent.id, { checkOut: e.target.value, dirty: true })}
                                className="w-28 h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={row.note}
                                placeholder="Not…"
                                onChange={(e) => patch(agent.id, { note: e.target.value, dirty: true })}
                                className="w-36 h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => saveRecord(agent.id)}
                                  disabled={row.saving || !row.dirty}
                                  title="Kaydet"
                                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 disabled:opacity-30 transition-colors"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                {row.recordId && (
                                  <button
                                    onClick={() => handleDelete(agent.id)}
                                    disabled={row.saving}
                                    title="Sil"
                                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-30 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ──────────────────────────────────────── */}
                <div className="md:hidden divide-y">
                  {currentDept.agents.map((agent) => {
                    const row = rowMap[agent.id];
                    if (!row) return null;
                    const cfg = row.status ? STATUS_CFG[row.status] : null;
                    return (
                      <div
                        key={agent.id}
                        className={`p-4 space-y-3 ${row.dirty ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{agent.firstName} {agent.lastName}</p>
                            <p className="text-xs text-gray-500">{agent.employeeId} · {agent.designation}</p>
                            {cfg && (
                              <span className={`inline-flex mt-1 items-center text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => saveRecord(agent.id)}
                              disabled={row.saving || !row.dirty}
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 disabled:opacity-30"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            {row.recordId && (
                              <button
                                onClick={() => handleDelete(agent.id)}
                                disabled={row.saving}
                                className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs text-gray-500">Durum</label>
                            <select
                              value={row.status}
                              onChange={(e) => patch(agent.id, { status: e.target.value as any, dirty: true })}
                              className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                            >
                              <option value="">— Seç —</option>
                              {(Object.keys(STATUS_CFG) as AttendanceStatus[]).map((s) => (
                                <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-gray-500">Giriş</label>
                            <input
                              type="time"
                              value={row.checkIn}
                              onChange={(e) => patch(agent.id, { checkIn: e.target.value, dirty: true })}
                              className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-gray-500">Çıkış</label>
                            <input
                              type="time"
                              value={row.checkOut}
                              onChange={(e) => patch(agent.id, { checkOut: e.target.value, dirty: true })}
                              className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs text-gray-500">Not</label>
                            <input
                              type="text"
                              value={row.note}
                              placeholder="Not…"
                              onChange={(e) => patch(agent.id, { note: e.target.value, dirty: true })}
                              className="w-full h-9 px-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
