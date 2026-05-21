"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { addDays, format, startOfWeek } from "date-fns";
import {
  Clock, Pencil, Trash2, X, UserCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "../../../../../components/ui/card";

type Agent = { id: string; firstName: string; lastName: string; employeeId: string; designation: string };
type AttendanceRecord = {
  id: string; agentId: string; status: string;
  checkIn: Date | null; checkOut: Date | null; note: string | null; date: Date;
};

type FormVals = {
  status: string; checkIn: string; checkOut: string; note: string;
};

interface Props {
  agents: Agent[];
  getAttendanceForAgent: (agentId: string, date: string) => Promise<AttendanceRecord[]>;
  upsertAttendance: (data: { agentId: string; date: string; status: string; checkIn?: string | null; checkOut?: string | null; note?: string | null }) => Promise<{ ok: boolean; error?: string }>;
  deleteAttendance: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  PRESENT: "Mevcut", ABSENT: "Yok", LATE: "Geç", ON_LEAVE: "İzinli", REMOTE: "Uzaktan",
};
const STATUS_COLOR: Record<string, string> = {
  PRESENT:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ABSENT:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LATE:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ON_LEAVE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  REMOTE:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(weekStart, i);
  return { date: d, label: format(d, "EEEE"), value: format(d, "yyyy-MM-dd") };
});

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium block mb-1";

function fmtTime(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function AgentView({ agents, getAttendanceForAgent, upsertAttendance, deleteAttendance }: Props) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedDay, setSelectedDay] = useState(weekDays[0].value);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  async function fetchRecords(agentId: string, date: string) {
    setLoading(true);
    try {
      const data = await getAttendanceForAgent(agentId, date);
      setRecords(data);
    } catch {
      toast.error("Kayıtlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!selectedAgent) return toast.error("Danışman seçin.");
    await fetchRecords(selectedAgent.id, selectedDay);
  }

  function openCreate() {
    reset({ status: "PRESENT", checkIn: "", checkOut: "", note: "" });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(rec: AttendanceRecord) {
    const toTimeInput = (d: Date | null) => {
      if (!d) return "";
      const dt = new Date(d);
      return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    };
    reset({
      status: rec.status,
      checkIn: toTimeInput(rec.checkIn),
      checkOut: toTimeInput(rec.checkOut),
      note: rec.note ?? "",
    });
    setEditing(rec);
    setShowForm(true);
  }

  async function onSubmit(vals: FormVals) {
    if (!selectedAgent) return;
    const toDateTime = (time: string) => {
      if (!time) return null;
      return `${selectedDay}T${time}:00.000Z`;
    };
    const res = await upsertAttendance({
      agentId: selectedAgent.id,
      date: selectedDay,
      status: vals.status,
      checkIn: toDateTime(vals.checkIn),
      checkOut: toDateTime(vals.checkOut),
      note: vals.note?.trim() || null,
    });
    if (res.ok) {
      toast.success(editing ? "Kayıt güncellendi." : "Kayıt eklendi.");
      setShowForm(false);
      await fetchRecords(selectedAgent.id, selectedDay);
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteAttendance(id);
    setDeleting(null);
    if (res.ok) {
      toast.success("Kayıt silindi.");
      if (selectedAgent) await fetchRecords(selectedAgent.id, selectedDay);
    } else {
      toast.error(res.error ?? "Silme başarısız.");
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">

      {/* Filtre Kartı */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Danışman Seç</label>
              <select
                className={inputCls}
                value={selectedAgent?.id ?? ""}
                onChange={(e) => {
                  const a = agents.find((x) => x.id === e.target.value) ?? null;
                  setSelectedAgent(a);
                  setRecords([]);
                }}
              >
                <option value="">Danışman seçin...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.firstName} {a.lastName} — {a.designation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Gün Seç</label>
              <select className={inputCls} value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {weekDays.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} ({format(d.date, "d MMM")})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !selectedAgent}
            className="w-full sm:w-auto px-6 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
          >
            {loading ? "Yükleniyor..." : "Devam Kayıtlarını Getir"}
          </button>
        </CardContent>
      </Card>

      {/* Sonuçlar */}
      {selectedAgent && records !== null && !loading && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {/* Başlık */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-sm sm:text-base">
                  {selectedAgent.firstName} {selectedAgent.lastName}
                </h2>
                <p className="text-xs text-gray-500">
                  {weekDays.find((d) => d.value === selectedDay)?.label} — {selectedDay}
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-md transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Kayıt Ekle</span>
                  <span className="sm:hidden">Ekle</span>
                </button>
              )}
            </div>

            {/* Form */}
            {showForm && (
              <div className="px-4 sm:px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm">{editing ? "Kaydı Düzenle" : "Yeni Devam Kaydı"}</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Durum *</label>
                      <select {...register("status", { required: true })} className={inputCls}>
                        <option value="PRESENT">Mevcut</option>
                        <option value="ABSENT">Yok</option>
                        <option value="LATE">Geç</option>
                        <option value="ON_LEAVE">İzinli</option>
                        <option value="REMOTE">Uzaktan</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Giriş Saati</label>
                      <input type="time" {...register("checkIn")} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Çıkış Saati</label>
                      <input type="time" {...register("checkOut")} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Not</label>
                    <input type="text" {...register("note")} placeholder="İsteğe bağlı not..." className={inputCls} />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none sm:w-36 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? "Kaydediliyor..." : editing ? "Güncelle" : "Kaydet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Kayıt yoksa */}
            {records.length === 0 && !showForm ? (
              <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                <UserCheck className="h-10 w-10 opacity-30" />
                <p className="text-sm">Bu tarih için kayıt bulunamadı.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">Kayıt ekle</button>
              </div>
            ) : records.length > 0 ? (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Durum</th>
                        <th className="text-left px-4 py-3">Giriş</th>
                        <th className="text-left px-4 py-3">Çıkış</th>
                        <th className="text-left px-4 py-3">Not</th>
                        <th className="text-right px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[rec.status] ?? ""}`}>
                              {STATUS_LABEL[rec.status] ?? rec.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fmtTime(rec.checkIn)}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fmtTime(rec.checkOut)}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{rec.note ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(rec)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(rec.id)} disabled={deleting === rec.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart */}
                <div className="md:hidden divide-y">
                  {records.map((rec) => (
                    <div key={rec.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[rec.status] ?? ""}`}>
                          {STATUS_LABEL[rec.status] ?? rec.status}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(rec)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(rec.id)} disabled={deleting === rec.id} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Giriş: {fmtTime(rec.checkIn)}</span>
                        <span>Çıkış: {fmtTime(rec.checkOut)}</span>
                      </div>
                      {rec.note && <p className="text-xs text-gray-400">{rec.note}</p>}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
