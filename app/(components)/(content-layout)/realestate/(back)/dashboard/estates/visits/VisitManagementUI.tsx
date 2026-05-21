"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, CalendarCheck, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Visit = {
  id: string;
  scheduledAt: Date;
  completedAt: Date | null;
  status: string;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  property: { title: string; city: string };
  agent: { firstName: string; lastName: string };
  client: { firstName: string; lastName: string };
  createdAt: Date;
};

type FormVals = {
  propertyId: string; agentId: string; clientId: string;
  scheduledAt: string; status: string;
  notes: string; feedback: string; rating: string;
};

interface Props {
  visits: Visit[];
  properties: { id: string; title: string; city: string }[];
  agents:     { id: string; firstName: string; lastName: string }[];
  clients:    { id: string; firstName: string; lastName: string }[];
  createVisit: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateVisit: (id: string, data: Partial<FormVals>) => Promise<{ ok: boolean; error?: string }>;
  deleteVisit: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Planlandı", COMPLETED: "Tamamlandı",
  CANCELLED: "İptal", NO_SHOW: "Gelmedi",
};
const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  NO_SHOW:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
}

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium";

export default function VisitManagementUI({ visits, properties, agents, clients, createVisit, updateVisit, deleteVisit }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Visit | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  function toInputDate(d: Date) {
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  function openCreate() {
    reset({ status: "SCHEDULED", rating: "" });
    setEditing(null); setView("form");
  }
  function openEdit(v: Visit) {
    reset({
      status: v.status,
      scheduledAt: toInputDate(v.scheduledAt),
      notes: v.notes ?? "", feedback: v.feedback ?? "",
      rating: v.rating?.toString() ?? "",
    });
    setEditing(v); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updateVisit(editing.id, data) : await createVisit(data);
    if (res.ok) {
      toast.success(editing ? "Gezi güncellendi." : "Gezi oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteVisit(id);
    setDeleting(null);
    if (res.ok) toast.success("Gezi silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === "form" && (
            <button onClick={backToList} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              {view === "form" ? (editing ? "Gezi Düzenle" : "Yeni Gezi / Randevu") : "Mülk Gezileri"}
            </h1>
            <p className="text-xs text-gray-500">{visits.length} gezi</p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni Gezi
          </button>
        )}
      </div>

      {/* ── LİSTE ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {visits.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <CalendarCheck className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz gezi/randevu eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                  İlk geziyi ekle
                </button>
              </div>
            ) : (
              <>
                {/* Desktop tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Mülk</th>
                        <th className="text-left px-4 py-3">Müşteri</th>
                        <th className="text-left px-4 py-3">Danışman</th>
                        <th className="text-left px-4 py-3">Tarih</th>
                        <th className="text-left px-4 py-3">Durum</th>
                        <th className="text-left px-4 py-3">Puan</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visits.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{v.property.title}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{v.property.city}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {v.client.firstName} {v.client.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {v.agent.firstName} {v.agent.lastName}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                            {fmtDate(v.scheduledAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v.status] ?? ""}`}>
                              {STATUS_LABEL[v.status] ?? v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {v.rating
                              ? <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600"><Star className="h-3 w-3 fill-current" />{v.rating}/5</span>
                              : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30">
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
                  {visits.map((v) => (
                    <div key={v.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{v.property.title}</p>
                          <p className="text-xs text-gray-500">{v.property.city} · {fmtDate(v.scheduledAt)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(v)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[v.status] ?? ""}`}>
                          {STATUS_LABEL[v.status] ?? v.status}
                        </span>
                        <span className="text-gray-500">{v.client.firstName} {v.client.lastName}</span>
                        <span className="text-gray-400">{v.agent.firstName} {v.agent.lastName}</span>
                        {v.rating && <span className="inline-flex items-center gap-0.5 text-yellow-600"><Star className="h-3 w-3 fill-current" />{v.rating}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── FORM ──────────────────────────────────────────────────────── */}
      {view === "form" && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Yeni gezi: mülk + danışman + müşteri */}
              {!editing && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className={labelCls}>Mülk *</label>
                    <select {...register("propertyId", { required: "Mülk seçin" })} className={inputCls}>
                      <option value="">Mülk seçin...</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                      ))}
                    </select>
                    {errors.propertyId && <p className="text-xs text-red-500">{errors.propertyId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Danışman *</label>
                    <select {...register("agentId", { required: "Danışman seçin" })} className={inputCls}>
                      <option value="">Danışman seçin...</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                      ))}
                    </select>
                    {errors.agentId && <p className="text-xs text-red-500">{errors.agentId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Müşteri *</label>
                    <select {...register("clientId", { required: "Müşteri seçin" })} className={inputCls}>
                      <option value="">Müşteri seçin...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                      ))}
                    </select>
                    {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Randevu Tarihi / Saati *</label>
                  <input
                    {...register("scheduledAt", { required: "Tarih zorunlu" })}
                    type="datetime-local"
                    className={inputCls}
                  />
                  {errors.scheduledAt && <p className="text-xs text-red-500">{errors.scheduledAt.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Durum</label>
                  <select {...register("status")} className={inputCls}>
                    <option value="SCHEDULED">Planlandı</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="CANCELLED">İptal</option>
                    <option value="NO_SHOW">Gelmedi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Notlar</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Gezi notları..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Müşteri Geri Bildirimi</label>
                  <textarea
                    {...register("feedback")}
                    rows={2}
                    placeholder="Müşteri görüşü..."
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Memnuniyet Puanı (1-5)</label>
                  <select {...register("rating")} className={inputCls}>
                    <option value="">Puan seçin...</option>
                    {[1,2,3,4,5].map((n) => (
                      <option key={n} value={n}>{n} — {"★".repeat(n)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
                >
                  {isSubmitting ? "Kaydediliyor..." : editing ? "Güncelle" : "Oluştur"}
                </button>
                <button
                  type="button" onClick={backToList}
                  className="flex-1 sm:flex-none sm:w-28 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
