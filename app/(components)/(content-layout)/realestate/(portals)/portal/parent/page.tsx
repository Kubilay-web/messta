"use client";

// GET /api/portal/parent/dashboard
// → client profili, aktif sözleşmeler, yaklaşan geziler, bekleyen ödemeler, favoriler

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Building2, Calendar, CreditCard, Heart,
  Phone, MapPin, ChevronRight, Clock, CheckCircle2,
  TrendingUp, Home, User2,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../lib/utils";

// ── Tipler ──────────────────────────────────────────────────────────────────
interface Client {
  id: string; firstName: string; lastName: string;
  email: string; phone: string; imageUrl: string | null;
  isBuyer: boolean; isSeller: boolean; isTenant: boolean; isLandlord: boolean;
  currency: string; minBudget: number | null; maxBudget: number | null;
  agencyName: string;
}

interface Stats {
  totalContracts: number; upcomingVisits: number;
  pendingPaymentCount: number; pendingPaymentTotal: number; favoriteCount: number;
}

interface Contract {
  id: string; contractNo: string; contractType: string; status: string;
  currency: string; rentalPrice: number | null; salePrice: number | null;
  property: { id: string; title: string; city: string; propertyType: string };
  payments: { id: string; title: string; amount: number; dueDate: string }[];
}

interface Visit {
  id: string; scheduledAt: string; notes: string | null;
  property: { title: string; city: string };
  agent: { firstName: string; lastName: string; phone: string };
}

interface Interest {
  id: string;
  listing: {
    id: string; title: string; listingType: string; askingPrice: number;
    monthlyRent: number | null; currency: string; status: string;
    property: {
      city: string; propertyType: string; roomCount: string | null;
      images: { url: string }[];
    };
  };
}

function money(n: number, cur: string) {
  return n.toLocaleString("tr-TR") + " " + cur;
}

const roleLabels: Record<string, string> = {
  isBuyer: "Alıcı", isSeller: "Satıcı", isTenant: "Kiracı", isLandlord: "Kiraya Veren",
};
const contractTypeColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT:  "bg-yellow-100 text-yellow-800",
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const [client, setClient]     = useState<Client | null>(null);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [visits, setVisits]     = useState<Visit[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/portal/parent/dashboard");
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setStats(data.stats);
        setContracts(data.contracts);
        setVisits(data.upcomingVisits);
        setInterests(data.interests);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center text-gray-400">Yükleniyor…</div>
  );

  if (!client) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-gray-400">
      <User2 className="h-10 w-10" />
      <p>Müşteri profili bulunamadı</p>
    </div>
  );

  const roles = (["isBuyer", "isSeller", "isTenant", "isLandlord"] as const)
    .filter((k) => (client as any)[k]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Profil Kartı ── */}
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {client.imageUrl ? (
              <img src={client.imageUrl} className="h-14 w-14 rounded-full object-cover" alt="" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                <User2 className="h-7 w-7 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold">{client.firstName} {client.lastName}</h1>
              <p className="text-sm text-gray-500">{client.email}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {roles.map((r) => (
                  <span key={r} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    {roleLabels[r]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 sm:text-right">
            <p className="flex items-center gap-1 sm:justify-end"><Phone className="h-3.5 w-3.5" />{client.phone}</p>
            <p className="mt-0.5 text-xs">{client.agencyName}</p>
            {(client.minBudget || client.maxBudget) && (
              <p className="mt-0.5 text-xs text-gray-400">
                Bütçe: {client.minBudget ? money(client.minBudget, client.currency) : "—"}
                {" – "}
                {client.maxBudget ? money(client.maxBudget, client.currency) : "—"}
              </p>
            )}
          </div>
        </div>

        {/* ── İstatistik Kartları ── */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: <Building2 className="h-5 w-5 text-blue-500" />,   label: "Sözleşme",        val: stats.totalContracts,       color: "text-blue-600" },
              { icon: <Calendar  className="h-5 w-5 text-purple-500" />, label: "Yaklaşan Gezi",   val: stats.upcomingVisits,       color: "text-purple-600" },
              { icon: <CreditCard className="h-5 w-5 text-yellow-500" />, label: "Bekleyen Ödeme", val: stats.pendingPaymentCount,  color: "text-yellow-600" },
              { icon: <Heart     className="h-5 w-5 text-red-400" />,    label: "Favori İlan",     val: stats.favoriteCount,        color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">{s.icon}</div>
                <p className={cn("mt-2 text-2xl font-bold", s.color)}>{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Bekleyen Ödeme Uyarısı ── */}
        {stats && stats.pendingPaymentTotal > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">{stats.pendingPaymentCount} ödeme</span> bekliyor —{" "}
                <span className="font-semibold">{money(stats.pendingPaymentTotal, client.currency)}</span>
              </p>
            </div>
            <Link href="/management/portal/parent/payments"
              className="flex items-center gap-1 text-xs font-medium text-yellow-700 hover:underline">
              Görüntüle <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Aktif Sözleşmeler ── */}
          <section className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /> Sözleşmeler</h2>
              <Link href="/management/portal/parent/payments"
                className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Tümü <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {contracts.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">Aktif sözleşme yok</p>
            ) : (
              <div className="flex flex-col gap-2">
                {contracts.map((c) => (
                  <div key={c.id} className="rounded-lg border px-3 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.property.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{c.property.city} · {c.property.propertyType}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge className={cn("text-[10px]", contractTypeColor[c.status] ?? "bg-gray-100 text-gray-700")}>
                          {c.status}
                        </Badge>
                        <p className="mt-0.5 text-xs font-semibold">
                          {c.rentalPrice ? money(c.rentalPrice, c.currency) + "/ay" : c.salePrice ? money(c.salePrice, c.currency) : "—"}
                        </p>
                      </div>
                    </div>
                    {c.payments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.payments.map((p) => (
                          <span key={p.id} className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] text-yellow-700">
                            <Clock className="h-3 w-3" />
                            {p.title} — {money(p.amount, c.currency)} · {format(new Date(p.dueDate), "d MMM", { locale: tr })}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Yaklaşan Geziler ── */}
          <section className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> Yaklaşan Geziler</h2>
            </div>
            {visits.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">Planlanmış gezi yok</p>
            ) : (
              <div className="flex flex-col gap-2">
                {visits.map((v) => (
                  <div key={v.id} className="rounded-lg border px-3 py-2.5 bg-blue-50/40">
                    <p className="text-sm font-medium truncate">{v.property.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{v.property.city}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        {format(new Date(v.scheduledAt), "d MMM yyyy HH:mm", { locale: tr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User2 className="h-3 w-3" />
                        {v.agent.firstName} {v.agent.lastName}
                      </span>
                      <a href={`tel:${v.agent.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="h-3 w-3" />{v.agent.phone}
                      </a>
                    </div>
                    {v.notes && <p className="mt-1 text-xs text-gray-400 italic">{v.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Favori İlanlar ── */}
        {interests.length > 0 && (
          <section className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-red-400" /> Favori İlanlar</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {interests.map(({ listing }) => {
                const cover = listing.property.images[0]?.url;
                return (
                  <Link
                    key={listing.id}
                    href={`/management/portal/parent/student/${listing.id}`}
                    className="group overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 overflow-hidden bg-gray-100">
                      {cover ? (
                        <img src={cover} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Home className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium">{listing.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{listing.property.city}
                        {listing.property.roomCount && ` · ${listing.property.roomCount}`}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-green-600">
                        {listing.monthlyRent
                          ? money(listing.monthlyRent, listing.currency) + "/ay"
                          : money(listing.askingPrice, listing.currency)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
