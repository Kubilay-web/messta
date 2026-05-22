import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import db from "@/app/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { MapPin, Clock, User2, Phone, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { cn } from "../../../../lib/utils";

type VisitStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

const statusMeta: Record<VisitStatus, { label: string; cls: string }> = {
  SCHEDULED:  { label: "Planlandı",  cls: "bg-blue-50 text-blue-700" },
  COMPLETED:  { label: "Tamamlandı", cls: "bg-green-50 text-green-700" },
  CANCELLED:  { label: "İptal",      cls: "bg-red-50 text-red-700" },
};

export default async function AgentVisitsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const agent = await db.agent.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!agent) redirect("/realestate/onboarding");

  const visits = await db.propertyVisit.findMany({
    where: { agentId: agent.id },
    include: {
      property: { select: { id: true, title: true, city: true, propertyType: true } },
      listing:  { select: { id: true, title: true } },
      client:   { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming  = visits.filter((v) => v.status === "SCHEDULED");
  const completed = visits.filter((v) => v.status === "COMPLETED");
  const cancelled = visits.filter((v) => v.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Gezilerim</h1>
          <p className="text-sm text-gray-500">Planlanmış ve geçmiş mülk gezileri</p>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Planlandı",  val: upcoming.length,  cls: "text-blue-600" },
            { label: "Tamamlandı", val: completed.length, cls: "text-green-600" },
            { label: "İptal",      val: cancelled.length, cls: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-white p-4">
              <p className={cn("text-2xl font-bold", s.cls)}>{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {visits.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border bg-white text-gray-400">
            Henüz gezi kaydı yok
          </div>
        ) : (
          <div className="space-y-6">

            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Yaklaşan Geziler
                </h2>
                <div className="flex flex-col gap-3">
                  {upcoming.map((v) => <VisitRow key={v.id} v={v} />)}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Tamamlanan Geziler
                </h2>
                <div className="flex flex-col gap-3">
                  {completed.map((v) => <VisitRow key={v.id} v={v} />)}
                </div>
              </section>
            )}

            {cancelled.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  İptal Edilen Geziler
                </h2>
                <div className="flex flex-col gap-3">
                  {cancelled.map((v) => <VisitRow key={v.id} v={v} />)}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function VisitRow({ v }: { v: any }) {
  const meta = statusMeta[v.status as VisitStatus];
  return (
    <div className="rounded-xl border bg-white p-4 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-semibold text-sm truncate">{v.property.title}</p>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", meta.cls)}>
          {meta.label}
        </span>
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <MapPin className="h-3 w-3 shrink-0" />{v.property.city} · {v.property.propertyType}
      </p>
      {v.listing && (
        <p className="text-xs text-gray-400">İlan: {v.listing.title}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
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
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <User2 className="h-3 w-3" />
          {v.client.firstName} {v.client.lastName}
        </span>
        <a href={`tel:${v.client.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
          <Phone className="h-3 w-3" />{v.client.phone}
        </a>
      </div>
      {v.notes && <p className="text-xs text-gray-400 italic">{v.notes}</p>}
      {v.status === "COMPLETED" && v.feedback && (
        <p className="text-xs text-gray-500 italic">"{v.feedback}"</p>
      )}
    </div>
  );
}
