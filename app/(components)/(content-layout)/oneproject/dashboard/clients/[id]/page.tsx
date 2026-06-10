import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { getPropertyClientById } from "../../../actions/clients";
import { getClientDeals } from "../../../actions/deals";
import { getClientTimeline } from "../../../actions/crm";
import { getCrmAccess } from "../../../lib/crm-access";
import CrmTimeline from "../../../components/dashboard/crm/CrmTimeline";

const dealStatus: Record<string, string> = {
  OPEN: "Açık",
  WON: "Kazanıldı",
  LOST: "Kaybedildi",
};

function typeBadges(c: any) {
  const t: string[] = [];
  if (c.isBuyer) t.push("Alıcı");
  if (c.isSeller) t.push("Satıcı");
  if (c.isTenant) t.push("Kiracı");
  if (c.isLandlord) t.push("Kiraya Veren");
  return t;
}

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user, agencyId, canView } = await getCrmAccess();
  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim.
      </div>
    );
  }

  const client: any = await getPropertyClientById(id);
  if (!client) return notFound();
  const [deals, timeline] = await Promise.all([
    getClientDeals(id),
    getClientTimeline(id),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Müşteri başlığı */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {client.phone}
            {client.email ? ` · ${client.email}` : ""}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {typeBadges(client).map((t) => (
              <span
                key={t}
                className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/oneproject/dashboard/clients/update/${client.id}`}>
            Düzenle
          </Link>
        </Button>
      </div>

      {/* Müşterinin fırsatları */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Fırsatlar ({deals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bu müşteriye bağlı fırsat yok.
            </p>
          ) : (
            deals.map((d: any) => (
              <Link
                key={d.id}
                href={`/oneproject/dashboard/deals/${d.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(d.value ?? 0).toLocaleString("tr-TR")} {d.currency}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs">
                  {dealStatus[d.status] ?? d.status}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* CRM 360° timeline (müşteri bağlamı) */}
      <CrmTimeline
        ctx={{
          clientId: client.id,
          agencyId: agencyId || client.agencyId,
          userId: user?.id ?? "",
        }}
        initial={timeline}
      />
    </div>
  );
}
