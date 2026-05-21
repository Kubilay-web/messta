"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, CreditCard } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Payment = {
  id: string; title: string; amount: number; dueDate: Date;
  paidDate: Date | null; status: string; paymentMethod: string | null;
  receiptNo: string | null; notes: string | null; createdAt: Date;
  contract: { id: string; contractNo: string; contractType: string; client: { firstName: string; lastName: string } };
};
type Contract = { id: string; contractNo: string; contractType: string; currency: string; client: { firstName: string; lastName: string } };
type FormVals = { contractId: string; title: string; amount: string; dueDate: string; paymentMethod: string; notes: string };
type UpdateVals = { title: string; amount: string; dueDate: string; status: string; paymentMethod: string; receiptNo: string; notes: string };

interface Props {
  payments: Payment[];
  contracts: Contract[];
  createPayment: (d: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updatePayment: (id: string, d: Partial<UpdateVals>) => Promise<{ ok: boolean; error?: string }>;
  deletePayment: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = { PENDING: "Bekliyor", PAID: "Ödendi", PARTIAL: "Kısmi", FAILED: "Başarısız", REFUNDED: "İade" };
const STATUS_COLOR: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FAILED:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const CONTRACT_TYPE_LABEL: Record<string, string> = { SALE: "Satış", RENTAL: "Kira", PRE_SALE: "Ön Satış" };

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium block mb-1";

function fmt(d: Date) { return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtMoney(n: number) { return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(n); }
function toDateInput(d: Date) { return new Date(d).toISOString().split("T")[0]; }

export default function FeesUI({ payments, contracts, createPayment, updatePayment, deletePayment }: Props) {
  const [view, setView]         = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing]   = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter]     = useState("ALL");

  const createForm = useForm<FormVals>();
  const editForm   = useForm<UpdateVals>();

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  // Özet istatistikler
  const total   = payments.reduce((s, p) => s + p.amount, 0);
  const paid    = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  function openCreate() { createForm.reset({ status: "PENDING" } as any); setView("create"); }
  function openEdit(p: Payment) {
    editForm.reset({ title: p.title, amount: String(p.amount), dueDate: toDateInput(p.dueDate), status: p.status, paymentMethod: p.paymentMethod ?? "", receiptNo: p.receiptNo ?? "", notes: p.notes ?? "" });
    setEditing(p); setView("edit");
  }
  function back() { setEditing(null); setView("list"); }

  async function onCreateSubmit(data: FormVals) {
    const res = await createPayment(data);
    if (res.ok) { toast.success("Ödeme kalemi oluşturuldu."); back(); }
    else toast.error(res.error ?? "Hata.");
  }
  async function onEditSubmit(data: UpdateVals) {
    if (!editing) return;
    const res = await updatePayment(editing.id, data);
    if (res.ok) { toast.success("Güncellendi."); back(); }
    else toast.error(res.error ?? "Hata.");
  }
  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deletePayment(id);
    setDeleting(null);
    if (res.ok) toast.success("Silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }
  async function quickStatus(id: string, status: string) {
    const res = await updatePayment(id, { status });
    if (res.ok) toast.success(`${STATUS_LABEL[status]} olarak işaretlendi.`);
    else toast.error(res.error ?? "Hata.");
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Özet kartlar */}
      {view === "list" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Toplam", amount: total, cls: "border-l-gray-400" },
            { label: "Ödendi",  amount: paid,   cls: "border-l-green-500" },
            { label: "Bekliyor", amount: pending, cls: "border-l-yellow-500" },
          ].map((s) => (
            <Card key={s.label} className={`shadow-sm border-l-4 ${s.cls}`}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-xl font-bold">{fmtMoney(s.amount)} ₺</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Başlık + buton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view !== "list" && (
            <button onClick={back} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          )}
          <p className="text-sm font-medium">
            {view === "create" ? "Yeni Ödeme Kalemi" : view === "edit" ? "Kalemi Düzenle" : `${filtered.length} kayıt`}
          </p>
        </div>
        {view === "list" && (
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 px-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
              <option value="ALL">Tümü</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Yeni Ödeme</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE FORM */}
      {view === "create" && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className={labelCls}>Sözleşme *</label>
                <select {...createForm.register("contractId", { required: true })} className={inputCls}>
                  <option value="">Sözleşme seçin...</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNo} — {CONTRACT_TYPE_LABEL[c.contractType] ?? c.contractType} — {c.client.firstName} {c.client.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Başlık *</label>
                  <input {...createForm.register("title", { required: true })} placeholder='örn. "1. Taksit", "Depozito"' className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tutar (₺) *</label>
                  <input {...createForm.register("amount", { required: true })} type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Vade Tarihi *</label>
                  <input {...createForm.register("dueDate", { required: true })} type="date" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ödeme Yöntemi</label>
                  <select {...createForm.register("paymentMethod")} className={inputCls}>
                    <option value="">Seçin...</option>
                    <option value="Nakit">Nakit</option>
                    <option value="EFT/Havale">EFT / Havale</option>
                    <option value="Çek">Çek</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Notlar</label>
                <textarea {...createForm.register("notes")} rows={2} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={createForm.formState.isSubmitting} className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                  {createForm.formState.isSubmitting ? "Kaydediliyor..." : "Oluştur"}
                </button>
                <button type="button" onClick={back} className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">İptal</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* EDIT FORM */}
      {view === "edit" && editing && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs text-gray-500 mb-4">{editing.contract.contractNo} — {editing.contract.client.firstName} {editing.contract.client.lastName}</p>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Başlık</label>
                  <input {...editForm.register("title")} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tutar (₺)</label>
                  <input {...editForm.register("amount")} type="number" step="0.01" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Vade</label>
                  <input {...editForm.register("dueDate")} type="date" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Durum</label>
                  <select {...editForm.register("status")} className={inputCls}>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ödeme Yöntemi</label>
                  <select {...editForm.register("paymentMethod")} className={inputCls}>
                    <option value="">Seçin...</option>
                    <option value="Nakit">Nakit</option>
                    <option value="EFT/Havale">EFT / Havale</option>
                    <option value="Çek">Çek</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Makbuz No</label>
                  <input {...editForm.register("receiptNo")} placeholder="Makbuz / fiş numarası" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Notlar</label>
                  <input {...editForm.register("notes")} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={editForm.formState.isSubmitting} className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                  {editForm.formState.isSubmitting ? "Kaydediliyor..." : "Güncelle"}
                </button>
                <button type="button" onClick={back} className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">İptal</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* LİSTE */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <CreditCard className="h-10 w-10 opacity-30" />
                <p className="text-sm">{filter !== "ALL" ? "Bu filtrede kayıt yok." : "Henüz ödeme kalemi eklenmedi."}</p>
                {filter === "ALL" && <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">İlk kalemi ekle</button>}
              </div>
            ) : (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Sözleşme / Müşteri</th>
                        <th className="text-left px-4 py-3">Başlık</th>
                        <th className="text-left px-4 py-3">Tutar</th>
                        <th className="text-left px-4 py-3">Vade</th>
                        <th className="text-left px-4 py-3">Durum</th>
                        <th className="text-left px-4 py-3">Yöntem</th>
                        <th className="text-right px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-xs">{p.contract.contractNo}</p>
                            <p className="text-xs text-gray-400">{p.contract.client.firstName} {p.contract.client.lastName}</p>
                          </td>
                          <td className="px-4 py-3 font-medium">{p.title}</td>
                          <td className="px-4 py-3 font-semibold">{fmtMoney(p.amount)} ₺</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {fmt(p.dueDate)}
                            {p.paidDate && <p className="text-green-600">✓ {fmt(p.paidDate)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{p.paymentMethod ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {p.status === "PENDING" && (
                                <button onClick={() => quickStatus(p.id, "PAID")} title="Ödendi olarak işaretle" className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 text-xs transition-colors">✓</button>
                              )}
                              <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart */}
                <div className="md:hidden divide-y">
                  {filtered.map((p) => (
                    <div key={p.id} className={`p-4 space-y-2 border-l-4 ${p.status === "PAID" ? "border-l-green-500" : p.status === "PENDING" ? "border-l-yellow-500" : p.status === "FAILED" ? "border-l-red-500" : "border-l-gray-300"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.contract.contractNo} · {p.contract.client.firstName} {p.contract.client.lastName}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {p.status === "PENDING" && <button onClick={() => quickStatus(p.id, "PAID")} className="p-1.5 rounded text-green-600 hover:bg-green-50 text-xs">✓</button>}
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                        <span className="font-bold">{fmtMoney(p.amount)} ₺</span>
                        <span className="text-gray-500">Vade: {fmt(p.dueDate)}</span>
                        {p.paymentMethod && <span className="text-gray-400">{p.paymentMethod}</span>}
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
