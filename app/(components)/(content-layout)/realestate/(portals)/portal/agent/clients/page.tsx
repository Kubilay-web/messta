import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import db from "@/app/lib/db";
import { Phone, MapPin } from "lucide-react";

export default async function AgentClientsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const agent = await db.agent.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!agent) redirect("/realestate/onboarding");

  // Distinct clients who have had a visit with this agent
  const visitRows = await db.propertyVisit.findMany({
    where: { agentId: agent.id },
    select: {
      client: {
        select: {
          id: true, firstName: true, lastName: true,
          email: true, phone: true, nationality: true,
          isBuyer: true, isSeller: true, isTenant: true, isLandlord: true,
          minBudget: true, maxBudget: true, currency: true,
        },
      },
    },
    distinct: ["clientId"],
    orderBy: { scheduledAt: "desc" },
  });

  const clients = visitRows.map((r) => r.client);

  const typeLabels: Record<string, string> = {
    isBuyer: "Alıcı", isSeller: "Satıcı", isTenant: "Kiracı", isLandlord: "Kiraya Veren",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Müşterilerim</h1>
          <p className="text-sm text-gray-500">Gezi yaptığınız müşteriler</p>
        </div>

        {clients.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border bg-white text-gray-400">
            Henüz müşteri yok
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {clients.map((c) => {
              const types = (["isBuyer", "isSeller", "isTenant", "isLandlord"] as const)
                .filter((k) => c[k])
                .map((k) => typeLabels[k]);

              return (
                <div key={c.id} className="rounded-xl border bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Phone className="h-3 w-3" />{c.phone}
                      </a>
                      {c.nationality && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />{c.nationality}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 sm:text-right">
                      <div className="flex flex-wrap gap-1 sm:justify-end">
                        {types.map((t) => (
                          <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {t}
                          </span>
                        ))}
                      </div>
                      {(c.minBudget || c.maxBudget) && (
                        <p className="text-xs text-gray-400">
                          Bütçe: {c.minBudget ? c.minBudget.toLocaleString("tr-TR") : "—"}
                          {" – "}
                          {c.maxBudget ? c.maxBudget.toLocaleString("tr-TR") : "—"}
                          {" "}{c.currency}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
