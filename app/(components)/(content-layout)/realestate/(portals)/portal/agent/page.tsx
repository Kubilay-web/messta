import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import db from "@/app/lib/db";
import Link from "next/link";
import { Building2, Calendar, Users, ChevronRight, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function AgentDashboard() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const agent = await db.agent.findUnique({
    where: { userId: user.id },
    select: { id: true, firstName: true, lastName: true, designation: true, agencyName: true },
  });
  if (!agent) redirect("/realestate/onboarding");

  const now = new Date();

  const [listingCount, upcomingVisits, recentClients] = await Promise.all([
    db.listing.count({ where: { agentId: agent.id, status: { not: "SOLD" } } }),
    db.propertyVisit.findMany({
      where: { agentId: agent.id, status: "SCHEDULED", scheduledAt: { gte: now } },
      include: {
        property: { select: { title: true, city: true } },
        client:   { select: { firstName: true, lastName: true, phone: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    db.propertyVisit.findMany({
      where: { agentId: agent.id },
      select: { client: { select: { id: true, firstName: true, lastName: true, phone: true } } },
      distinct: ["clientId"],
      orderBy: { scheduledAt: "desc" },
      take: 5,
    }),
  ]);

  const completedCount = await db.propertyVisit.count({
    where: { agentId: agent.id, status: "COMPLETED" },
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Profil */}
        <div className="rounded-xl border bg-white p-5">
          <h1 className="text-xl font-bold text-gray-900">
            Hoş geldiniz, {agent.firstName} {agent.lastName}
          </h1>
          <p className="text-sm text-gray-500">{agent.designation} · {agent.agencyName}</p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { icon: <Building2 className="h-5 w-5 text-blue-500" />,   label: "Aktif İlan",       val: listingCount,      color: "text-blue-600",  href: "/realestate/portal/agent/listings" },
            { icon: <Calendar   className="h-5 w-5 text-purple-500" />, label: "Yaklaşan Gezi",    val: upcomingVisits.length, color: "text-purple-600", href: "/realestate/portal/agent/visits" },
            { icon: <Users      className="h-5 w-5 text-green-500" />,  label: "Tamamlanan Gezi",  val: completedCount,    color: "text-green-600", href: "/realestate/portal/agent/visits" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">{s.icon}<ChevronRight className="h-3.5 w-3.5 text-gray-300" /></div>
              <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Yaklaşan Geziler */}
          <section className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Yaklaşan Geziler
              </h2>
              <Link href="/realestate/portal/agent/visits" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Tümü <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {upcomingVisits.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">Planlanmış gezi yok</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingVisits.map((v) => (
                  <div key={v.id} className="rounded-lg border px-3 py-2.5 bg-blue-50/40">
                    <p className="text-sm font-medium truncate">{v.property.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{v.property.city}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        {format(new Date(v.scheduledAt), "d MMM HH:mm", { locale: tr })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {v.client.firstName} {v.client.lastName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Son Müşteriler */}
          <section className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" /> Son Müşteriler
              </h2>
              <Link href="/realestate/portal/agent/clients" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Tümü <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentClients.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">Henüz müşteri yok</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentClients.map(({ client: c }) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
