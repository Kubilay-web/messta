"use client";

// GET    /api/portal/parent/property/[id]               → ilan + mülk + sözleşme + geziler
// POST   /api/portal/parent/property/[id]/visit          → gezi talebi oluştur
// PUT    /api/portal/parent/property/[id]/visit?vid=     → gezi güncelle / iptal
// DELETE /api/portal/parent/property/[id]/visit?vid=     → gezi sil
// POST   /api/portal/parent/property/[id]/interest       → favoriye ekle
// DELETE /api/portal/parent/property/[id]/interest       → favoriden çıkar

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Heart, HeartOff, MapPin, Calendar, User2, Phone, Mail,
  Building2, CheckCircle2, Clock, XCircle, Star, ArrowLeft,
  Maximize2, BedDouble, Bath, Home, FileText, Image as ImageIcon,
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../../../../components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "../../../../../components/ui/tabs";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { cn } from "../../../../../lib/utils";
import Link from "next/link";

// ── Tipler ──────────────────────────────────────────────────────────────────
type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface PropertyImage { id: string; url: string; title: string | null; isCover: boolean; }
interface PropertyDoc   { id: string; title: string; url: string; type: string; }
interface Property {
  id: string; title: string; address: string; city: string; district: string;
  propertyType: string; status: string; grossArea: number | null; netArea: number | null;
  roomCount: string | null; bathroomCount: number | null; floorNo: number | null;
  totalFloors: number | null; buildingAge: number | null; heatingType: string | null;
  hasElevator: boolean; hasParking: boolean; isFurnished: boolean;
  hasGarden: boolean; hasPool: boolean; hasBalcony: boolean;
  description: string | null; images: PropertyImage[]; documents: PropertyDoc[];
}
interface Agent {
  id: string; firstName: string; lastName: string;
  phone: string; email: string; imageUrl: string | null; designation: string;
}
interface Listing {
  id: string; title: string; listingNo: string; listingType: string;
  status: string; askingPrice: number; currency: string;
  monthlyRent: number | null; deposit: number | null; isNegotiable: boolean;
  description: string | null; highlights: string[];
  property: Property; agent: Agent;
}
interface Visit {
  id: string; scheduledAt: string; completedAt: string | null;
  status: VisitStatus; notes: string | null; feedback: string | null; rating: number | null;
}
interface ContractPayment { id: string; title: string; amount: number; status: string; dueDate: string; }
interface Contract {
  id: string; contractNo: string; contractType: string; status: string;
  startDate: string; endDate: string | null; salePrice: number | null;
  rentalPrice: number | null; deposit: number | null; currency: string;
  payments: ContractPayment[];
}

const visitMeta: Record<VisitStatus, { label: string; color: string }> = {
  SCHEDULED:  { label: "Planlandı",  color: "bg-blue-100 text-blue-800" },
  COMPLETED:  { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
  CANCELLED:  { label: "İptal",      color: "bg-red-100 text-red-800" },
  NO_SHOW:    { label: "Gelmedi",    color: "bg-gray-100 text-gray-700" },
};

function money(n: number, cur: string) {
  return n.toLocaleString("tr-TR") + " " + cur;
}
function fmt(d: string) {
  return format(new Date(d), "d MMM yyyy HH:mm", { locale: tr });
}

// ── Sayfa ────────────────────────────────────────────────────────────────────
export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const BASE = `/api/portal/parent/property/${id}`;

  const [listing, setListing]     = useState<Listing | null>(null);
  const [contract, setContract]   = useState<Contract | null>(null);
  const [visits, setVisits]       = useState<Visit[]>([]);
  const [isFav, setIsFav]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [coverIdx, setCoverIdx]   = useState(0);

  // Gezi dialog
  const [visitOpen, setVisitOpen]   = useState(false);
  const [visitDate, setVisitDate]   = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [saving, setSaving]         = useState(false);

  // Feedback dialog
  const [fbVisit, setFbVisit]       = useState<Visit | null>(null);
  const [fbText, setFbText]         = useState("");
  const [fbRating, setFbRating]     = useState(5);

  // GET
  useEffect(() => {
    (async () => {
      const res = await fetch(BASE);
      if (res.ok) {
        const data = await res.json();
        setListing(data.listing);
        setContract(data.contract);
        setVisits(data.visits);
        setIsFav(data.isFavorite);
        // cover image
        const coverI = data.listing?.property?.images?.findIndex((i: PropertyImage) => i.isCover);
        if (coverI > -1) setCoverIdx(coverI);
      }
      setLoading(false);
    })();
  }, [BASE]);

  // POST visit
  async function requestVisit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${BASE}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: visitDate, notes: visitNotes }),
    });
    if (res.ok) {
      const v: Visit = await res.json();
      setVisits((prev) => [v, ...prev]);
      setVisitOpen(false);
      setVisitDate(""); setVisitNotes("");
    }
    setSaving(false);
  }

  // PUT visit (iptal)
  async function cancelVisit(vid: string) {
    const res = await fetch(`${BASE}/visit?vid=${vid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok) {
      const updated: Visit = await res.json();
      setVisits((prev) => prev.map((v) => (v.id === vid ? updated : v)));
    }
  }

  // PUT visit (feedback)
  async function submitFeedback() {
    if (!fbVisit) return;
    setSaving(true);
    const res = await fetch(`${BASE}/visit?vid=${fbVisit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: fbText, rating: fbRating }),
    });
    if (res.ok) {
      const updated: Visit = await res.json();
      setVisits((prev) => prev.map((v) => (v.id === fbVisit.id ? updated : v)));
      setFbVisit(null);
    }
    setSaving(false);
  }

  // DELETE visit
  async function deleteVisit(vid: string) {
    const res = await fetch(`${BASE}/visit?vid=${vid}`, { method: "DELETE" });
    if (res.ok) setVisits((prev) => prev.filter((v) => v.id !== vid));
  }

  // POST/DELETE interest (favori)
  async function toggleFav() {
    const method = isFav ? "DELETE" : "POST";
    const res = await fetch(`${BASE}/interest`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ priority: "HIGH" }) : undefined,
    });
    if (res.ok) setIsFav(!isFav);
  }

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center text-gray-400">Yükleniyor…</div>
  );
  if (!listing) return (
    <div className="flex h-[60vh] items-center justify-center text-gray-400">İlan bulunamadı</div>
  );

  const images = listing.property.images;
  const docs   = listing.property.documents;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Geri butonu */}
        <Link
          href="/management/portal/parent/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </Link>

        {/* ── Üst alan: Görsel + Başlık ── */}
        <div className="mb-6 overflow-hidden rounded-xl bg-white border shadow-sm">
          {/* Görsel */}
          {images.length > 0 ? (
            <div className="relative">
              <img
                src={images[coverIdx]?.url}
                alt={images[coverIdx]?.title ?? listing.property.title}
                className="h-56 w-full object-cover sm:h-80"
              />
              {images.length > 1 && (
                <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[calc(100%-1rem)]">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setCoverIdx(i)}
                      className={cn(
                        "h-10 w-14 overflow-hidden rounded border-2 transition",
                        i === coverIdx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={toggleFav}
                className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow"
              >
                {isFav
                  ? <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  : <HeartOff className="h-5 w-5 text-gray-500" />
                }
              </button>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-100">
              <ImageIcon className="h-10 w-10 text-gray-300" />
            </div>
          )}

          {/* Başlık bilgileri */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{listing.listingType}</Badge>
                  <Badge className={cn("text-xs", listing.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700")}>
                    {listing.status}
                  </Badge>
                  <span className="text-xs text-gray-400">#{listing.listingNo}</span>
                </div>
                <h1 className="text-lg font-bold sm:text-xl">{listing.title}</h1>
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.property.address}, {listing.property.district}, {listing.property.city}
                </p>
              </div>
              <div className="text-right">
                {listing.monthlyRent ? (
                  <p className="text-xl font-bold text-green-600">{money(listing.monthlyRent, listing.currency)}<span className="text-sm font-normal text-gray-500">/ay</span></p>
                ) : (
                  <p className="text-xl font-bold">{money(listing.askingPrice, listing.currency)}</p>
                )}
                {listing.deposit && <p className="text-xs text-gray-500">Depozito: {money(listing.deposit, listing.currency)}</p>}
                {listing.isNegotiable && <p className="text-xs text-green-600">Pazarlık payı var</p>}
              </div>
            </div>

            {/* Mülk özellikleri */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {listing.property.roomCount && (
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <BedDouble className="h-4 w-4 text-gray-400" />{listing.property.roomCount}
                </div>
              )}
              {listing.property.bathroomCount && (
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <Bath className="h-4 w-4 text-gray-400" />{listing.property.bathroomCount} Banyo
                </div>
              )}
              {listing.property.netArea && (
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <Maximize2 className="h-4 w-4 text-gray-400" />{listing.property.netArea} m²
                </div>
              )}
              {listing.property.floorNo != null && (
                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <Home className="h-4 w-4 text-gray-400" />{listing.property.floorNo}. Kat
                  {listing.property.totalFloors ? ` / ${listing.property.totalFloors}` : ""}
                </div>
              )}
            </div>

            {/* Özellikler */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {listing.property.hasElevator  && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Asansör</span>}
              {listing.property.hasParking   && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Otopark</span>}
              {listing.property.isFurnished  && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Eşyalı</span>}
              {listing.property.hasBalcony   && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Balkon</span>}
              {listing.property.hasGarden    && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Bahçe</span>}
              {listing.property.hasPool      && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Havuz</span>}
              {listing.property.heatingType  && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{listing.property.heatingType}</span>}
              {listing.property.buildingAge != null && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{listing.property.buildingAge} yaşında</span>}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="details">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="visits">
              Geziler {visits.length > 0 && <span className="ml-1 rounded-full bg-blue-100 px-1.5 text-xs text-blue-700">{visits.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="contract">Sözleşme</TabsTrigger>
            <TabsTrigger value="docs">Belgeler</TabsTrigger>
          </TabsList>

          {/* Detaylar */}
          <TabsContent value="details">
            <div className="grid gap-4 sm:grid-cols-2">
              {listing.description && (
                <div className="sm:col-span-2 rounded-xl border bg-white p-4">
                  <h3 className="mb-2 font-semibold text-sm">Açıklama</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{listing.description}</p>
                </div>
              )}
              {listing.highlights.length > 0 && (
                <div className="sm:col-span-2 rounded-xl border bg-white p-4">
                  <h3 className="mb-2 font-semibold text-sm">Öne Çıkanlar</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {listing.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}
              {/* Danışman kartı */}
              <div className="rounded-xl border bg-white p-4">
                <h3 className="mb-3 font-semibold text-sm">Danışman</h3>
                <div className="flex items-center gap-3">
                  {listing.agent.imageUrl ? (
                    <img src={listing.agent.imageUrl} className="h-12 w-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      <User2 className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{listing.agent.firstName} {listing.agent.lastName}</p>
                    <p className="text-xs text-gray-500">{listing.agent.designation}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <a href={`tel:${listing.agent.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Phone className="h-3.5 w-3.5" />{listing.agent.phone}
                  </a>
                  <a href={`mailto:${listing.agent.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Mail className="h-3.5 w-3.5" />{listing.agent.email}
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Geziler */}
          <TabsContent value="visits">
            <div className="rounded-xl border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm">Gezi Talepleri</h3>
                <Button size="sm" className="h-8 text-xs" onClick={() => setVisitOpen(true)}>
                  <Calendar className="mr-1 h-3.5 w-3.5" /> Gezi Talep Et
                </Button>
              </div>
              {visits.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Henüz gezi talebi yok</p>
              ) : (
                <ScrollArea className="max-h-80">
                  <div className="flex flex-col gap-2">
                    {visits.map((v) => {
                      const meta = visitMeta[v.status];
                      return (
                        <div key={v.id} className="rounded-lg border px-3 py-3 bg-gray-50">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", meta.color)}>{meta.label}</span>
                                <span className="text-sm font-medium">{fmt(v.scheduledAt)}</span>
                              </div>
                              {v.notes && <p className="mt-1 text-xs text-gray-500">{v.notes}</p>}
                              {v.feedback && (
                                <div className="mt-1 flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-3.5 w-3.5", i < (v.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">{v.feedback}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {v.status === "COMPLETED" && !v.feedback && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                                  onClick={() => { setFbVisit(v); setFbText(""); setFbRating(5); }}>
                                  Değerlendir
                                </Button>
                              )}
                              {v.status === "SCHEDULED" && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-red-500 hover:bg-red-50"
                                  onClick={() => cancelVisit(v.id)}>
                                  İptal
                                </Button>
                              )}
                              {v.status === "CANCELLED" && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:bg-red-50"
                                  onClick={() => deleteVisit(v.id)}>
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          {/* Sözleşme */}
          <TabsContent value="contract">
            <div className="rounded-xl border bg-white p-4">
              {!contract ? (
                <p className="py-6 text-center text-sm text-gray-400">Aktif sözleşme bulunamadı</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div>
                      <p className="font-semibold">#{contract.contractNo}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{contract.contractType}</Badge>
                        <Badge className={cn("text-xs", contract.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700")}>
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{format(new Date(contract.startDate), "d MMM yyyy", { locale: tr })}</p>
                      {contract.endDate && <p>→ {format(new Date(contract.endDate), "d MMM yyyy", { locale: tr })}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                    {contract.salePrice   && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">Satış Bedeli</p><p className="font-semibold">{money(contract.salePrice, contract.currency)}</p></div>}
                    {contract.rentalPrice && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">Aylık Kira</p><p className="font-semibold">{money(contract.rentalPrice, contract.currency)}</p></div>}
                    {contract.deposit     && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-400">Depozito</p><p className="font-semibold">{money(contract.deposit, contract.currency)}</p></div>}
                  </div>
                  {contract.payments.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Ödeme Planı</p>
                      <div className="flex flex-col gap-1.5">
                        {contract.payments.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                            {p.status === "PAID"
                              ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              : <Clock className="h-4 w-4 text-yellow-500 shrink-0" />}
                            <span className="flex-1 truncate">{p.title}</span>
                            <span className="text-gray-500 text-xs">{format(new Date(p.dueDate), "d MMM yyyy", { locale: tr })}</span>
                            <span className="font-medium">{money(p.amount, contract.currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Belgeler */}
          <TabsContent value="docs">
            <div className="rounded-xl border bg-white p-4">
              {docs.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Belge yok</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {docs.map((d) => (
                    <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-gray-400">{d.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Gezi Talebi Dialog ── */}
      <Dialog open={visitOpen} onOpenChange={(o) => { setVisitOpen(o); }}>
        <DialogContent className="sm:max-w-sm bg-white text-black">
          <form onSubmit={requestVisit}>
            <DialogHeader><DialogTitle>Gezi Talep Et</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Tarih ve Saat</label>
                <Input type="datetime-local" value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)} required />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Not</label>
                <Textarea placeholder="İsteğiniz, sorunuz…" className="resize-none text-sm min-h-[70px]"
                  value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVisitOpen(false)}>İptal</Button>
              <Button type="submit" disabled={saving}>{saving ? "Gönderiliyor…" : "Talep Et"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Feedback Dialog ── */}
      <Dialog open={!!fbVisit} onOpenChange={(o) => { if (!o) setFbVisit(null); }}>
        <DialogContent className="sm:max-w-sm bg-white text-black">
          <DialogHeader><DialogTitle>Gezi Değerlendirmesi</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setFbRating(i + 1)}>
                  <Star className={cn("h-7 w-7", i < fbRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Gezi hakkında düşünceleriniz…" className="resize-none text-sm"
              value={fbText} onChange={(e) => setFbText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFbVisit(null)}>İptal</Button>
            <Button onClick={submitFeedback} disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
