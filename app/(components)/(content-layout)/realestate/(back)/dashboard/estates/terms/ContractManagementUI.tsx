"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, FileText, Calendar } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Contract = {
  id: string; contractNo: string;
  contractType: string; status: string;
  startDate: Date; endDate: Date | null; signedDate: Date | null;
  salePrice: number | null; rentalPrice: number | null;
  deposit: number | null; commission: number | null; currency: string;
  notes: string | null; agentName: string; clientName: string;
  createdAt: Date;
  property: { title: string; city: string };
  _count: { payments: number };
};

type FormVals = {
  propertyId: string; agentId: string; clientId: string;
  contractType: string; status: string;
  startDate: string; endDate: string; signedDate: string;
  salePrice: string; rentalPrice: string; deposit: string;
  commission: string; currency: string; notes: string;
};

interface Props {
  contracts: Contract[];
  properties: { id: string; title: string; city: string }[];
  agents:     { id: string; firstName: string; lastName: string }[];
  clients:    { id: string; firstName: string; lastName: string }[];
  createContract: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateContract: (id: string, data: Partial<FormVals>) => Promise<{ ok: boolean; error?: string }>;
  deleteContract: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const TYPE_LABEL:   Record<string, string> = { SALE: "Satış", RENTAL: "Kira", PRE_SALE: "Ön Satış" };
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak", ACTIVE: "Aktif", COMPLETED: "Tamamlandı",
  CANCELLED: "İptal", EXPIRED: "Süresi Doldu",
};
const STATUS_COLOR: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ACTIVE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function fmt(n: number | null, cur = "TRY") {
  if (!n) return null;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { dateStyle: "medium" });
}
function toInput(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium";

export default function ContractManagementUI({ contracts, properties, agents, clients, createContract, updateContract, deleteContract }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormVals>();
  const contractType = watch("contractType");

  function openCreate() {
    reset({ contractType: "SALE", status: "DRAFT", currency: "TRY" });
    setEditing(null); setView("form");
  }
  function openEdit(c: Contract) {
    reset({
      contractType: c.contractType, status: c.status,
      startDate: toInput(c.startDate), endDate: toInput(c.endDate),
      signedDate: toInput(c.signedDate),
      salePrice: c.salePrice?.toString() ?? "",
      rentalPrice: c.rentalPrice?.toString() ?? "",
      deposit: c.deposit?.toString() ?? "",
      commission: c.commission?.toString() ?? "",
      currency: c.currency, notes: c.notes ?? "",
    });
    setEditing(c); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updateContract(editing.id, data) : await createContract(data);
    if (res.ok) {
      toast.success(editing ? "Sözleşme güncellendi." : "Sözleşme oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string, paymentCount: number) {
    if (paymentCount > 0) { toast.error("Ödemesi olan sözleşme silinemez."); return; }
    setDeleting(id);
    const res = await deleteContract(id);
    setDeleting(null);
    if (res.ok) toast.success("Sözleşme silindi.");
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
              {view === "form" ? (editing ? "Sözleşme Düzenle" : "Yeni Sözleşme") : "Sözleşme Yönetimi"}
            </h1>
            <p className="text-xs text-gray-500">{contracts.length} sözleşme</p>
          </div>
        </div>
        {view === "list" && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
            <Plus className="h-4 w-4" /> Yeni Sözleşme
          </button>
        )}
      </div>

      {/* ── LİSTE ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {contracts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <FileText className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz sözleşme eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">İlk sözleşmeyi ekle</button>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Sözleşme No</th>
                        <th className="text-left px-4 py-3">Mülk</th>
                        <th className="text-left px-4 py-3">Müşteri / Danışman</th>
                        <th className="text-left px-4 py-3">Tip / Durum</th>
                        <th className="text-left px-4 py-3">Tutar</th>
                        <th className="text-left px-4 py-3">Tarih</th>
                        <th className="text-left px-4 py-3">Ödeme</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                              </div>
                              <p className="font-medium text-xs">{c.contractNo}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-xs">{c.property.title}</p>
                            <p className="text-xs text-gray-400">{c.property.city}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs">{c.clientName}</p>
                            <p className="text-xs text-gray-400">{c.agentName}</p>
                          </td>
                          <td className="px-4 py-3 space-y-1">
                            <p className="text-xs text-gray-500">{TYPE_LABEL[c.contractType] ?? c.contractType}</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? ""}`}>
                              {STATUS_LABEL[c.status] ?? c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {fmt(c.salePrice, c.currency) || fmt(c.rentalPrice, c.currency) || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />{fmtDate(c.startDate)}
                            </div>
                            {c.endDate && <p className="text-xs text-gray-400">Bitiş: {fmtDate(c.endDate)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                              {c._count.payments}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id, c._count.payments)}
                                disabled={deleting === c.id}
                                title={c._count.payments > 0 ? "Ödemesi olan sözleşme silinemez" : "Sil"}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
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
                  {contracts.map((c) => (
                    <div key={c.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{c.contractNo}</p>
                          <p className="text-xs text-gray-500">{c.property.title} · {c.property.city}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="h-4 w-4" /></button>
                          <button
                            onClick={() => handleDelete(c.id, c._count.payments)}
                            disabled={deleting === c.id}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[c.status] ?? ""}`}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                        <span className="text-gray-500">{TYPE_LABEL[c.contractType]}</span>
                        <span className="font-medium">{fmt(c.salePrice, c.currency) || fmt(c.rentalPrice, c.currency) || "—"}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{c.clientName}</span>
                        <span>{c.agentName}</span>
                        <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{fmtDate(c.startDate)}</span>
                        <span>{c._count.payments} ödeme</span>
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

              {/* Yeni sözleşmede mülk + danışman + müşteri */}
              {!editing && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className={labelCls}>Mülk *</label>
                    <select {...register("propertyId", { required: "Mülk seçin" })} className={inputCls}>
                      <option value="">Mülk seçin...</option>
                      {properties.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.city})</option>)}
                    </select>
                    {errors.propertyId && <p className="text-xs text-red-500">{errors.propertyId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Danışman *</label>
                    <select {...register("agentId", { required: "Danışman seçin" })} className={inputCls}>
                      <option value="">Danışman seçin...</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                    </select>
                    {errors.agentId && <p className="text-xs text-red-500">{errors.agentId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Müşteri *</label>
                    <select {...register("clientId", { required: "Müşteri seçin" })} className={inputCls}>
                      <option value="">Müşteri seçin...</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                    {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className={labelCls}>Sözleşme Tipi *</label>
                  <select {...register("contractType", { required: true })} className={inputCls}>
                    <option value="SALE">Satış</option>
                    <option value="RENTAL">Kira</option>
                    <option value="PRE_SALE">Ön Satış</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Durum</label>
                  <select {...register("status")} className={inputCls}>
                    <option value="DRAFT">Taslak</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="COMPLETED">Tamamlandı</option>
                    <option value="CANCELLED">İptal</option>
                    <option value="EXPIRED">Süresi Doldu</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Para Birimi</label>
                  <select {...register("currency")} className={inputCls}>
                    <option value="TRY">TRY ₺</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className={labelCls}>Başlangıç Tarihi *</label>
                  <input {...register("startDate", { required: "Zorunlu alan" })} type="date" className={inputCls} />
                  {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Bitiş Tarihi</label>
                  <input {...register("endDate")} type="date" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>İmza Tarihi</label>
                  <input {...register("signedDate")} type="date" className={inputCls} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(contractType === "SALE" || contractType === "PRE_SALE" || !contractType) && (
                  <div className="space-y-1">
                    <label className={labelCls}>Satış Fiyatı</label>
                    <input {...register("salePrice")} type="number" step="1" placeholder="ör. 2500000" className={inputCls} />
                  </div>
                )}
                {contractType === "RENTAL" && (
                  <div className="space-y-1">
                    <label className={labelCls}>Kira Bedeli (aylık)</label>
                    <input {...register("rentalPrice")} type="number" step="1" placeholder="ör. 15000" className={inputCls} />
                  </div>
                )}
                <div className="space-y-1">
                  <label className={labelCls}>Depozito</label>
                  <input {...register("deposit")} type="number" step="1" placeholder="ör. 30000" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Komisyon</label>
                  <input {...register("commission")} type="number" step="0.01" placeholder="ör. 62500" className={inputCls} />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Notlar</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Sözleşme notları..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                  {isSubmitting ? "Kaydediliyor..." : editing ? "Güncelle" : "Oluştur"}
                </button>
                <button type="button" onClick={backToList}
                  className="flex-1 sm:flex-none sm:w-28 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">
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
