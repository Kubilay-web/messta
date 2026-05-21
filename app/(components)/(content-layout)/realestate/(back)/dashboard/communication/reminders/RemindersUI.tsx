"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Bell } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Reminder = {
  id: string; subject: string; message: string;
  recipient: string; from: string;
  name: string | null; email: string | null;
  createdAt: Date;
};
type FormVals = {
  subject: string; message: string;
  recipient: string; from: string;
  name: string; email: string;
};

interface Props {
  reminders: Reminder[];
  createReminder: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateReminder: (id: string, data: Partial<FormVals>) => Promise<{ ok: boolean; error?: string }>;
  deleteReminder: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const RECIPIENT_LABEL: Record<string, string> = {
  Clients: "Müşteriler", Agents: "Danışmanlar", All: "Tümü", Management: "Yönetim",
};
const FROM_LABEL: Record<string, string> = {
  Management: "Yönetim", Agent: "Danışman", Client: "Müşteri",
};
const RECIPIENT_COLOR: Record<string, string> = {
  Clients:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Agents:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  All:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Management: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium block mb-1";

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RemindersUI({ reminders, createReminder, updateReminder, deleteReminder }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  function openCreate() {
    reset({ subject: "", message: "", recipient: "All", from: "Management", name: "", email: "" });
    setEditing(null); setView("form");
  }
  function openEdit(r: Reminder) {
    reset({ subject: r.subject, message: r.message, recipient: r.recipient, from: r.from, name: r.name ?? "", email: r.email ?? "" });
    setEditing(r); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updateReminder(editing.id, data) : await createReminder(data);
    if (res.ok) {
      toast.success(editing ? "Hatırlatma güncellendi." : "Hatırlatma oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteReminder(id);
    setDeleting(null);
    if (res.ok) toast.success("Hatırlatma silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* Başlık satırı */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === "form" && (
            <button onClick={backToList} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          )}
          <div>
            <p className="text-sm font-medium">
              {view === "form" ? (editing ? "Hatırlatmayı Düzenle" : "Yeni Hatırlatma") : `${reminders.length} hatırlatma`}
            </p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni Hatırlatma</span>
            <span className="sm:hidden">Ekle</span>
          </button>
        )}
      </div>

      {/* FORM */}
      {view === "form" && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Alıcı *</label>
                  <select {...register("recipient", { required: true })} className={inputCls}>
                    <option value="All">Tümü</option>
                    <option value="Clients">Müşteriler</option>
                    <option value="Agents">Danışmanlar</option>
                    <option value="Management">Yönetim</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Gönderen *</label>
                  <select {...register("from", { required: true })} className={inputCls}>
                    <option value="Management">Yönetim</option>
                    <option value="Agent">Danışman</option>
                    <option value="Client">Müşteri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Konu *</label>
                <input
                  {...register("subject", { required: "Konu zorunlu." })}
                  type="text"
                  placeholder="Hatırlatma konusu..."
                  className={inputCls}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Mesaj *</label>
                <textarea
                  {...register("message", { required: "Mesaj zorunlu." })}
                  rows={4}
                  placeholder="Hatırlatma mesajını buraya yazın..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>İsim (isteğe bağlı)</label>
                  <input {...register("name")} type="text" placeholder="Gönderen / alıcı adı..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-posta (isteğe bağlı)</label>
                  <input {...register("email")} type="email" placeholder="eposta@ornek.com" className={inputCls} />
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
                  className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* LİSTE */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {reminders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Bell className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz hatırlatma eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">İlk hatırlatmayı ekle</button>
              </div>
            ) : (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Konu</th>
                        <th className="text-left px-4 py-3">Alıcı</th>
                        <th className="text-left px-4 py-3">Gönderen</th>
                        <th className="text-left px-4 py-3">Tarih</th>
                        <th className="text-right px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {reminders.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{r.subject}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{r.message}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${RECIPIENT_COLOR[r.recipient] ?? ""}`}>
                              {RECIPIENT_LABEL[r.recipient] ?? r.recipient}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                            {FROM_LABEL[r.from] ?? r.from}
                            {r.name && <span className="block text-gray-400">{r.name}</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(r.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30">
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
                  {reminders.map((r) => (
                    <div key={r.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{r.subject}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{r.message}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${RECIPIENT_COLOR[r.recipient] ?? ""}`}>
                          {RECIPIENT_LABEL[r.recipient] ?? r.recipient}
                        </span>
                        <span className="text-gray-500">{FROM_LABEL[r.from] ?? r.from}</span>
                        {r.name && <span className="text-gray-400">{r.name}</span>}
                        <span className="text-gray-400 ml-auto">{fmtDate(r.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
