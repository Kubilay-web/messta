"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, CreditCard, Clock } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Payment = {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  paidDate: Date | null;
  status: string;
  paymentMethod: string | null;
  receiptNo: string | null;
  notes: string | null;
  createdAt: Date;
  contract: { contractNo: string; contractType: string; currency: string };
};

type FormVals = {
  contractId: string; title: string; amount: string;
  dueDate: string; paidDate: string; status: string;
  paymentMethod: string; receiptNo: string; notes: string;
};

interface Props {
  payments: Payment[];
  contracts: { id: string; contractNo: string; contractType: string; currency: string }[];
  createPayment: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updatePayment: (id: string, data: Partial<FormVals>) => Promise<{ ok: boolean; error?: string }>;
  deletePayment: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor", PAID: "Ödendi", PARTIAL: "Kısmi",
  FAILED: "Başarısız", REFUNDED: "İade",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FAILED:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
const TYPE_LABEL: Record<string, string> = {
  SALE: "Satış", RENTAL: "Kira", PRE_SALE: "Ön Satış",
};

function fmt(n: number, cur = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", { dateStyle: "medium" });
}
function toInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium";

export default function PaymentManagementUI({ payments, contracts, createPayment, updatePayment, deletePayment }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  function openCreate() {
    reset({ status: "PENDING" });
    setEditing(null); setView("form");
  }
  function openEdit(p: Payment) {
    reset({
      title: p.title, amount: p.amount.toString(),
      dueDate: toInput(p.dueDate), paidDate: toInput(p.paidDate),
      status: p.status,
      paymentMethod: p.paymentMethod ?? "", receiptNo: p.receiptNo ?? "",
      notes: p.notes ?? "",
    });
    setEditing(p); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updatePayment(editing.id, data) : await createPayment(data);
    if (res.ok) {
      toast.success(editing ? "Ödeme güncellendi." : "Ödeme oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deletePayment(id);
    setDeleting(null);
    if (res.ok) toast.success("Ödeme silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  // Özet hesapla
  const total   = payments.reduce((s, p) => s + p.amount, 0);
  const paid    = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

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
              {view === "form" ? (editing ? "Ödeme Düzenle" : "Yeni Ödeme") : "Ödeme Raporları"}
            </h1>
            <p className="text-xs text-gray-500">{payments.length} kayıt</p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni Ödeme
          </button>
        )}
      </div>

      {/* Özet kartlar */}
      {view === "list" && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Toplam", value: fmt(total), color: "text-gray-800 dark:text-gray-100" },
            { label: "Ödendi", value: fmt(paid),  color: "text-green-600 dark:text-green-400" },
            { label: "Bekliyor", value: fmt(pending), color: "text-yellow-600 dark:text-yellow-400" },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-sm sm:text-base font-semibold truncate ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── LİSTE ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <CreditCard className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz ödeme kaydı eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                  İlk ödemeyi ekle
                </button>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Sözleşme</th>
                        <th className="text-left px-4 py-3">Ödeme Kalemi</th>
                        <th className="text-left px-4 py-3">Tutar</th>
                        <th className="text-left px-4 py-3">Vade</th>
                        <th className="text-left px-4 py-3">Durum</th>
                        <th className="text-left px-4 py-3">Yöntem</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-xs">{p.contract.contractNo}</p>
                            <p className="text-xs text-gray-400">{TYPE_LABEL[p.contract.contractType] ?? p.contract.contractType}</p>
                          </td>
                          <td className="px-4 py-3 font-medium">{p.title}</td>
                          <td className="px-4 py-3 font-semibold">{fmt(p.amount, p.contract.currency)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {fmtDate(p.dueDate)}
                            </div>
                            {p.paidDate && (
                              <p className="text-xs text-green-600 mt-0.5">Ödendi: {fmtDate(p.paidDate)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {p.paymentMethod || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30">
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
                  {payments.map((p) => (
                    <div key={p.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.contract.contractNo} · {TYPE_LABEL[p.contract.contractType]}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                        <span className="font-semibold">{fmt(p.amount, p.contract.currency)}</span>
                        <span className="text-gray-500 flex items-center gap-0.5"><Clock className="h-3 w-3" />{fmtDate(p.dueDate)}</span>
                        {p.paidDate && <span className="text-green-600">Ödendi: {fmtDate(p.paidDate)}</span>}
                      </div>
                      {p.paymentMethod && <p className="text-xs text-gray-400">{p.paymentMethod}</p>}
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

              {!editing && (
                <div className="space-y-1">
                  <label className={labelCls}>Sözleşme *</label>
                  <select {...register("contractId", { required: "Sözleşme seçin" })} className={inputCls}>
                    <option value="">Sözleşme seçin...</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.contractNo} — {TYPE_LABEL[c.contractType] ?? c.contractType}
                      </option>
                    ))}
                  </select>
                  {errors.contractId && <p className="text-xs text-red-500">{errors.contractId.message}</p>}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Ödeme Kalemi *</label>
                  <input
                    {...register("title", { required: "Zorunlu alan" })}
                    placeholder="ör. Peşinat, 1. Taksit, Kira - Ocak"
                    className={inputCls}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Tutar *</label>
                  <input
                    {...register("amount", { required: "Zorunlu alan" })}
                    type="number" step="1" placeholder="ör. 500000"
                    className={inputCls}
                  />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Vade Tarihi *</label>
                  <input
                    {...register("dueDate", { required: "Zorunlu alan" })}
                    type="date" className={inputCls}
                  />
                  {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Ödeme Tarihi</label>
                  <input {...register("paidDate")} type="date" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Durum</label>
                  <select {...register("status")} className={inputCls}>
                    <option value="PENDING">Bekliyor</option>
                    <option value="PAID">Ödendi</option>
                    <option value="PARTIAL">Kısmi Ödendi</option>
                    <option value="FAILED">Başarısız</option>
                    <option value="REFUNDED">İade</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Ödeme Yöntemi</label>
                  <select {...register("paymentMethod")} className={inputCls}>
                    <option value="">Seçin...</option>
                    <option value="Nakit">Nakit</option>
                    <option value="EFT/Havale">EFT / Havale</option>
                    <option value="Çek">Çek</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Makbuz No</label>
                  <input {...register("receiptNo")} placeholder="ör. MKB-2025-001" className={inputCls} />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Notlar</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Ek notlar..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={isSubmitting}
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
