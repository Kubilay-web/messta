"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Home, MapPin, CheckSquare } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Property = {
  id: string;
  title: string;
  city: string;
  district: string;
  address: string;
  propertyType: string;
  status: string;
  price: number | null;
  currency: string;
  grossArea: number | null;
  netArea: number | null;
  roomCount: string | null;
  bathroomCount: number | null;
  floorNo: number | null;
  totalFloors: number | null;
  buildingAge: number | null;
  heatingType: string | null;
  hasElevator: boolean;
  hasParking: boolean;
  isFurnished: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasBalcony: boolean;
  isFeatured: boolean;
  ownerName: string | null;
  ownerPhone: string | null;
  description: string | null;
  createdAt: Date;
  _count: { listings: number };
};

type FormVals = {
  title: string; address: string; city: string; district: string;
  propertyType: string; status: string;
  price: string; currency: string;
  grossArea: string; netArea: string; roomCount: string;
  bathroomCount: string; floorNo: string; totalFloors: string; buildingAge: string;
  heatingType: string;
  hasElevator: boolean; hasParking: boolean; isFurnished: boolean;
  hasGarden: boolean; hasPool: boolean; hasBalcony: boolean; isFeatured: boolean;
  ownerName: string; ownerPhone: string; description: string;
};

interface Props {
  properties: Property[];
  createProperty: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateProperty: (id: string, data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  deleteProperty: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const PROP_TYPE_LABEL: Record<string, string> = {
  APARTMENT: "Daire", HOUSE: "Müstakil", VILLA: "Villa",
  OFFICE: "Ofis", SHOP: "Dükkan", LAND: "Arsa",
  WAREHOUSE: "Depo", BUILDING: "Bina",
};
const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Müsait", SOLD: "Satıldı", RENTED: "Kiralandı",
  UNDER_CONTRACT: "Sözleşmede", UNDER_MAINTENANCE: "Bakımda",
};
const STATUS_COLOR: Record<string, string> = {
  AVAILABLE:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SOLD:             "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RENTED:           "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  UNDER_CONTRACT:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  UNDER_MAINTENANCE:"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function fmt(n: number, cur = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
}

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium";

export default function PropertyManagementUI({ properties, createProperty, updateProperty, deleteProperty }: Props) {
  const [view, setView]         = useState<"list" | "form">("list");
  const [editing, setEditing]   = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  function openCreate() {
    reset({ propertyType: "APARTMENT", status: "AVAILABLE", currency: "TRY",
            hasElevator: false, hasParking: false, isFurnished: false,
            hasGarden: false, hasPool: false, hasBalcony: false, isFeatured: false });
    setEditing(null); setView("form");
  }

  function openEdit(p: Property) {
    reset({
      title: p.title, address: p.address, city: p.city, district: p.district,
      propertyType: p.propertyType, status: p.status,
      price: p.price?.toString() ?? "", currency: p.currency,
      grossArea: p.grossArea?.toString() ?? "", netArea: p.netArea?.toString() ?? "",
      roomCount: p.roomCount ?? "", bathroomCount: p.bathroomCount?.toString() ?? "",
      floorNo: p.floorNo?.toString() ?? "", totalFloors: p.totalFloors?.toString() ?? "",
      buildingAge: p.buildingAge?.toString() ?? "", heatingType: p.heatingType ?? "",
      hasElevator: p.hasElevator, hasParking: p.hasParking, isFurnished: p.isFurnished,
      hasGarden: p.hasGarden, hasPool: p.hasPool, hasBalcony: p.hasBalcony, isFeatured: p.isFeatured,
      ownerName: p.ownerName ?? "", ownerPhone: p.ownerPhone ?? "",
      description: p.description ?? "",
    });
    setEditing(p); setView("form");
  }

  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing
      ? await updateProperty(editing.id, data)
      : await createProperty(data);
    if (res.ok) {
      toast.success(editing ? "Mülk güncellendi." : "Mülk oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string, listingCount: number) {
    if (listingCount > 0) {
      toast.error("Bu mülke bağlı ilan var. Önce ilanları silin.");
      return;
    }
    setDeleting(id);
    const res = await deleteProperty(id);
    setDeleting(null);
    if (res.ok) toast.success("Mülk silindi.");
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
              {view === "form" ? (editing ? "Mülk Düzenle" : "Yeni Mülk") : "Mülk Yönetimi"}
            </h1>
            <p className="text-xs text-gray-500">{properties.length} mülk</p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni Mülk
          </button>
        )}
      </div>

      {/* ── LİSTE ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Home className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz mülk eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                  İlk mülkü ekle
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
                        <th className="text-left px-4 py-3">Tip / Oda</th>
                        <th className="text-left px-4 py-3">Durum</th>
                        <th className="text-left px-4 py-3">Fiyat</th>
                        <th className="text-left px-4 py-3">Alan</th>
                        <th className="text-left px-4 py-3">İlan</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {properties.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                <Home className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                              </div>
                              <div>
                                <p className="font-medium">{p.title}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />{p.city}, {p.district}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium">{PROP_TYPE_LABEL[p.propertyType] ?? p.propertyType}</p>
                            {p.roomCount && <p className="text-xs text-gray-400">{p.roomCount}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {p.price ? fmt(p.price, p.currency) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                            {p.grossArea ? `${p.grossArea} m²` : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                              {p._count.listings}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(p)}
                                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                                title="Düzenle"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p._count.listings)}
                                disabled={deleting === p.id}
                                title={p._count.listings > 0 ? "İlanı olan mülk silinemez" : "Sil"}
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

                {/* Mobil kart listesi */}
                <div className="md:hidden divide-y">
                  {properties.map((p) => (
                    <div key={p.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{p.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />{p.city}, {p.district}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p._count.listings)}
                            disabled={deleting === p.id}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                        <span className="text-gray-500">{PROP_TYPE_LABEL[p.propertyType]}</span>
                        {p.roomCount && <span className="text-gray-500">{p.roomCount}</span>}
                        {p.price && <span className="font-medium">{fmt(p.price, p.currency)}</span>}
                        {p.grossArea && <span className="text-gray-400">{p.grossArea} m²</span>}
                      </div>
                      <p className="text-xs text-gray-400">{p._count.listings} ilan</p>
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

              {/* Temel Bilgiler */}
              <div className="space-y-1">
                <label className={labelCls}>Mülk Başlığı *</label>
                <input
                  {...register("title", { required: "Zorunlu alan" })}
                  placeholder="ör. Merkezi Konumda 3+1 Daire"
                  className={inputCls}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Şehir *</label>
                  <input
                    {...register("city", { required: "Zorunlu alan" })}
                    placeholder="ör. İstanbul"
                    className={inputCls}
                  />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>İlçe *</label>
                  <input
                    {...register("district", { required: "Zorunlu alan" })}
                    placeholder="ör. Kadıköy"
                    className={inputCls}
                  />
                  {errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Adres *</label>
                <input
                  {...register("address", { required: "Zorunlu alan" })}
                  placeholder="ör. Bağdat Cad. No:42"
                  className={inputCls}
                />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>

              {/* Tip & Durum */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Mülk Tipi *</label>
                  <select {...register("propertyType", { required: true })} className={inputCls}>
                    <option value="APARTMENT">Daire</option>
                    <option value="HOUSE">Müstakil Ev</option>
                    <option value="VILLA">Villa</option>
                    <option value="OFFICE">Ofis</option>
                    <option value="SHOP">Dükkan</option>
                    <option value="LAND">Arsa</option>
                    <option value="WAREHOUSE">Depo</option>
                    <option value="BUILDING">Bina / Apartman</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Durum</label>
                  <select {...register("status")} className={inputCls}>
                    <option value="AVAILABLE">Müsait</option>
                    <option value="SOLD">Satıldı</option>
                    <option value="RENTED">Kiralandı</option>
                    <option value="UNDER_CONTRACT">Sözleşmede</option>
                    <option value="UNDER_MAINTENANCE">Bakımda</option>
                  </select>
                </div>
              </div>

              {/* Fiyat */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Fiyat</label>
                  <input {...register("price")} type="number" step="1" placeholder="ör. 2500000" className={inputCls} />
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

              {/* Alan & Detaylar */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className={labelCls}>Brüt Alan (m²)</label>
                  <input {...register("grossArea")} type="number" step="0.01" placeholder="ör. 120" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Net Alan (m²)</label>
                  <input {...register("netArea")} type="number" step="0.01" placeholder="ör. 105" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Oda Sayısı</label>
                  <input {...register("roomCount")} placeholder="ör. 3+1" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Banyo</label>
                  <input {...register("bathroomCount")} type="number" placeholder="ör. 2" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Bulunduğu Kat</label>
                  <input {...register("floorNo")} type="number" placeholder="ör. 4" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Toplam Kat</label>
                  <input {...register("totalFloors")} type="number" placeholder="ör. 8" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Bina Yaşı</label>
                  <input {...register("buildingAge")} type="number" placeholder="ör. 5" className={inputCls} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className={labelCls}>Isıtma Tipi</label>
                  <input {...register("heatingType")} placeholder="ör. Kombi, Merkezi, Yerden" className={inputCls} />
                </div>
              </div>

              {/* Özellikler */}
              <div>
                <p className={labelCls + " mb-2"}>Özellikler</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(["hasElevator", "hasParking", "isFurnished", "hasGarden", "hasPool", "hasBalcony", "isFeatured"] as const).map((key) => {
                    const labels: Record<string, string> = {
                      hasElevator: "Asansör", hasParking: "Otopark",
                      isFurnished: "Eşyalı", hasGarden: "Bahçe",
                      hasPool: "Yüzme Havuzu", hasBalcony: "Balkon", isFeatured: "Öne Çıkan",
                    };
                    return (
                      <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input {...register(key)} type="checkbox" className="rounded border-gray-300" />
                        <span>{labels[key]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sahip Bilgileri */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelCls}>Sahip Adı</label>
                  <input {...register("ownerName")} placeholder="ör. Mehmet Yılmaz" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Sahip Telefonu</label>
                  <input {...register("ownerPhone")} placeholder="ör. 0532 000 0000" className={inputCls} />
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-1">
                <label className={labelCls}>Açıklama</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Mülk hakkında ek bilgi..."
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                  type="button"
                  onClick={backToList}
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
