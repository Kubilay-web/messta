"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, FileText, Eye } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Listing = {
  id: string; title: string; listingNo: string;
  listingType: string; status: string;
  askingPrice: number; currency: string;
  monthlyRent: number | null; isNegotiable: boolean;
  agentName: string; description: string | null;
  isPublic: boolean; views: number; createdAt: Date;
  property: { title: string; city: string; propertyType: string };
};

type FormVals = {
  title: string; propertyId: string; agentId: string; agentName: string;
  listingType: string; status: string; askingPrice: string;
  currency: string; monthlyRent: string; deposit: string;
  isNegotiable: string; isPublic: string; description: string;
};

interface Props {
  listings: Listing[];
  properties: { id: string; title: string; city: string; propertyType: string }[];
  agents: { id: string; firstName: string; lastName: string }[];
  createListing: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateListing: (id: string, data: Partial<FormVals>) => Promise<{ ok: boolean; error?: string }>;
  deleteListing: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Aktif", SOLD: "Satıldı", RENTED: "Kiralandı", WITHDRAWN: "Geri Çekildi", PENDING: "Beklemede", RESERVED: "Rezerve" };
const TYPE_LABEL:   Record<string, string> = { SALE: "Satılık", RENT: "Kiralık", SHORT_RENT: "Kısa Dönem" };
const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SOLD:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RENTED:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  WITHDRAWN: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  PENDING:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESERVED:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function fmt(n: number, cur = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium";

export default function ListingManagementUI({ listings, properties, agents, createListing, updateListing, deleteListing }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormVals>();
  const listingType = watch("listingType");

  function openCreate() {
    reset({ listingType: "SALE", status: "ACTIVE", currency: "TRY", isNegotiable: "true", isPublic: "true" });
    setEditing(null); setView("form");
  }
  function openEdit(l: Listing) {
    reset({
      title: l.title, listingType: l.listingType, status: l.status,
      askingPrice: l.askingPrice.toString(), currency: l.currency,
      monthlyRent: l.monthlyRent?.toString() ?? "",
      isNegotiable: l.isNegotiable ? "true" : "false",
      isPublic: l.isPublic ? "true" : "false",
      description: l.description ?? "", agentName: l.agentName,
    });
    setEditing(l); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updateListing(editing.id, data) : await createListing(data);
    if (res.ok) {
      toast.success(editing ? "İlan güncellendi." : "İlan oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteListing(id);
    setDeleting(null);
    if (res.ok) toast.success("İlan silindi.");
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
              {view === "form" ? (editing ? "İlan Düzenle" : "Yeni İlan") : "İlan Yönetimi"}
            </h1>
            <p className="text-xs text-gray-500">{listings.length} ilan</p>
          </div>
        </div>
        {view === "list" && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
            <Plus className="h-4 w-4" /> Yeni İlan
          </button>
        )}
      </div>

      {/* ── LİSTE ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <FileText className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz ilan eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">İlk ilanı ekle</button>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">İlan</th>
                        <th className="text-left px-4 py-3">Tip / Durum</th>
                        <th className="text-left px-4 py-3">Fiyat</th>
                        <th className="text-left px-4 py-3">Danışman</th>
                        <th className="text-left px-4 py-3 w-12"><Eye className="h-3.5 w-3.5" /></th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {listings.map((l) => (
                        <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{l.title}</p>
                            <p className="text-xs text-gray-400">{l.listingNo} · {l.property.city}</p>
                          </td>
                          <td className="px-4 py-3 space-y-1">
                            <p className="text-xs text-gray-500">{TYPE_LABEL[l.listingType] ?? l.listingType}</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status] ?? ""}`}>
                              {STATUS_LABEL[l.status] ?? l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{fmt(l.askingPrice, l.currency)}</p>
                            {l.monthlyRent && <p className="text-xs text-gray-400">{fmt(l.monthlyRent, l.currency)}/ay</p>}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{l.agentName}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{l.views}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobil kart */}
                <div className="md:hidden divide-y">
                  {listings.map((l) => (
                    <div key={l.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{l.title}</p>
                          <p className="text-xs text-gray-500">{l.listingNo} · {l.property.city}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status] ?? ""}`}>{STATUS_LABEL[l.status] ?? l.status}</span>
                        <span className="text-gray-500">{TYPE_LABEL[l.listingType]}</span>
                        <span className="font-medium">{fmt(l.askingPrice, l.currency)}</span>
                        <span className="text-gray-400 flex items-center gap-0.5"><Eye className="h-3 w-3" />{l.views}</span>
                      </div>
                      <p className="text-xs text-gray-500">Danışman: {l.agentName}</p>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelCls}>Mülk *</label>
                    <select {...register("propertyId", { required: "Mülk seçin" })} className={inputCls}>
                      <option value="">Mülk seçin...</option>
                      {properties.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.city})</option>)}
                    </select>
                    {errors.propertyId && <p className="text-xs text-red-500">{errors.propertyId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Danışman</label>
                    <select {...register("agentId")} className={inputCls}>
                      <option value="">Danışman seçin...</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className={labelCls}>İlan Başlığı *</label>
                <input {...register("title", { required: "Zorunlu alan" })} placeholder="ör. Deniz Manzaralı 3+1 Daire" className={inputCls} />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className={labelCls}>İlan Tipi *</label>
                  <select {...register("listingType", { required: true })} className={inputCls}>
                    <option value="SALE">Satılık</option>
                    <option value="RENT">Kiralık</option>
                    <option value="SHORT_RENT">Kısa Dönem</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Durum</label>
                  <select {...register("status")} className={inputCls}>
                    <option value="ACTIVE">Aktif</option>
                    <option value="SOLD">Satıldı</option>
                    <option value="RENTED">Kiralandı</option>
                    <option value="WITHDRAWN">Geri Çekildi</option>
                    <option value="PENDING">Beklemede</option>
                    <option value="RESERVED">Rezerve</option>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>İstenen Fiyat *</label>
                  <input {...register("askingPrice", { required: "Zorunlu alan" })} type="number" step="1" placeholder="ör. 2500000" className={inputCls} />
                  {errors.askingPrice && <p className="text-xs text-red-500">{errors.askingPrice.message}</p>}
                </div>
                {(listingType === "RENT" || listingType === "SHORT_RENT") && (
                  <div className="space-y-1">
                    <label className={labelCls}>Aylık Kira</label>
                    <input {...register("monthlyRent")} type="number" step="1" placeholder="ör. 15000" className={inputCls} />
                  </div>
                )}
                <div className="space-y-1">
                  <label className={labelCls}>Depozito</label>
                  <input {...register("deposit")} type="number" step="1" placeholder="ör. 30000" className={inputCls} />
                </div>
              </div>

              {editing && (
                <div className="space-y-1">
                  <label className={labelCls}>Danışman Adı</label>
                  <input {...register("agentName")} placeholder="Danışman adı" className={inputCls} />
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input {...register("isNegotiable")} type="checkbox" value="true" className="rounded" />
                  Pazarlık payı var
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input {...register("isPublic")} type="checkbox" value="true" className="rounded" />
                  Herkese açık
                </label>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Açıklama</label>
                <textarea {...register("description")} rows={3} placeholder="İlan açıklaması..." className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors">
                  {isSubmitting ? "Kaydediliyor..." : editing ? "Güncelle" : "İlan Oluştur"}
                </button>
                <button type="button" onClick={backToList} className="flex-1 sm:flex-none sm:w-28 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">
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
