"use client";

// GET /api/portal/parent/visits → müşterinin tüm mülk gezileri

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Calendar, Clock, MapPin, Phone, User2,
  CheckCircle2, XCircle, Star,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

// ── Tipler ──────────────────────────────────────────────────────────────────
type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface Visit {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  status: VisitStatus;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
  property: { id: string; title: string; city: string; propertyType: string };
  listing: { id: string; title: string } | null;
  agent: { firstName: string; lastName: string; phone: string; imageUrl: string | null };
}

// ── Yardımcı ────────────────────────────────────────────────────────────────
const statusMeta: Record<VisitStatus, { label: string; cls: string }> = {
  SCHEDULED:  { label: "Planlandı",  cls: "bg-blue-50 text-blue-700" },
  COMPLETED:  { label: "Tamamlandı", cls: "bg-green-50 text-green-700" },
  CANCELLED:  { label: "İptal",      cls: "bg-red-50 text-red-700" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
        />
      ))}
    </div>
  );
}

// ── Sayfa ────────────────────────────────────────────────────────────────────
export default function ClientVisitsPage() {
  const [visits, setVisits]   = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/portal/parent/visits");
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits ?? []);
      }
      setLoading(false);
    })();
  }, []);

  async function cancelVisit(visitId: string, propertyId: string) {
    setCancelling(visitId);
    const res = await fetch(`/api/portal/parent/property/${propertyId}/visit?visitId=${visitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok) {
      setVisits((prev) =>
        prev.map((v) => v.id === visitId ? { ...v, status: "CANCELLED" } : v)
      );
    }
    setCancelling(null);
  }

  const upcoming   = visits.filter((v) => v.status === "SCHEDULED");
  const past       = visits.filter((v) => v.status !== "SCHEDULED");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Başlık */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Gezilerim</h1>
          <p className="text-sm text-gray-500">Planlanmış ve geçmiş mülk gezileriniz</p>
        </div>

        {/* Özet */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Planlandı",  val: upcoming.length,                              cls: "text-blue-600" },
              { label: "Tamamlandı", val: visits.filter((v) => v.status === "COMPLETED").length, cls: "text-green-600" },
              { label: "İptal",      val: visits.filter((v) => v.status === "CANCELLED").length, cls: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-4">
                <p className={cn("text-2xl font-bold", s.cls)}>{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* İçerik */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-gray-400">Yükleniyor…</div>
        ) : visits.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border bg-white text-gray-400">
            Henüz gezi kaydı yok
          </div>
        ) : (
          <div className="space-y-6">

            {/* Yaklaşan */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Yaklaşan Geziler
                </h2>
                <div className="flex flex-col gap-3">
                  {upcoming.map((v) => (
                    <VisitCard
                      key={v.id}
                      visit={v}
                      onCancel={() => cancelVisit(v.id, v.property.id)}
                      cancelling={cancelling === v.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Geçmiş */}
            {past.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Geçmiş Geziler
                </h2>
                <div className="flex flex-col gap-3">
                  {past.map((v) => (
                    <VisitCard key={v.id} visit={v} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// ── Gezi Kartı ───────────────────────────────────────────────────────────────
function VisitCard({
  visit: v,
  onCancel,
  cancelling,
}: {
  visit: Visit;
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const meta = statusMeta[v.status];

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{v.property.title}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", meta.cls)}>
              {meta.label}
            </span>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {v.property.city} · {v.property.propertyType}
          </p>

          {v.listing && (
            <p className="text-xs text-gray-400">İlan: {v.listing.title}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-500" />
              {format(new Date(v.scheduledAt), "d MMM yyyy HH:mm", { locale: tr })}
            </span>
            {v.completedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {format(new Date(v.completedAt), "d MMM yyyy", { locale: tr })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <User2 className="h-3 w-3" />
              {v.agent.firstName} {v.agent.lastName}
            </span>
            <a href={`tel:${v.agent.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
              <Phone className="h-3 w-3" />{v.agent.phone}
            </a>
          </div>

          {v.notes && (
            <p className="text-xs text-gray-400 italic">{v.notes}</p>
          )}

          {v.status === "COMPLETED" && (
            <div className="pt-1 space-y-1">
              {v.rating && <StarRating rating={v.rating} />}
              {v.feedback && (
                <p className="text-xs text-gray-500 italic">"{v.feedback}"</p>
              )}
            </div>
          )}
        </div>

        {v.status === "SCHEDULED" && onCancel && (
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
          >
            <XCircle className="h-3.5 w-3.5" />
            {cancelling ? "İptal ediliyor…" : "İptal Et"}
          </button>
        )}
      </div>
    </div>
  );
}
