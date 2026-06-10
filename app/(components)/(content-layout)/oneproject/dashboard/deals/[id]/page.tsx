import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getDealById, getDealStageHistory } from "../../../actions/deals";
import { getTimeline } from "../../../actions/crm";
import { getCrmAccess } from "../../../lib/crm-access";
import CrmTimeline from "../../../components/dashboard/crm/CrmTimeline";

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  WON: "Kazanıldı",
  LOST: "Kaybedildi",
};

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user, agencyId, canView, canManage } = await getCrmAccess();
  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim.
      </div>
    );
  }

  const deal = await getDealById(id);
  if (!deal) return notFound();
  const [timeline, stageHistory] = await Promise.all([
    getTimeline({ dealId: id }),
    getDealStageHistory(id),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{deal.title}</h1>
            <span className="rounded bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
              {statusLabels[deal.status] ?? deal.status}
            </span>
          </div>
          <p className="text-sm font-semibold text-emerald-700">
            {(deal.value ?? 0).toLocaleString("tr-TR")} {deal.currency}
            {deal.commissionAmount != null
              ? ` · Komisyon: ${deal.commissionAmount.toLocaleString("tr-TR")} ${deal.currency}`
              : ""}
          </p>
          {deal.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {deal.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/oneproject/dashboard/deals">Panoya Dön</Link>
          </Button>
          {canManage && (
            <Button asChild>
              <Link href={`/oneproject/dashboard/deals/update/${deal.id}`}>
                Düzenle
              </Link>
            </Button>
          )}
        </div>
      </div>

      {stageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aşama Geçmişi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stageHistory.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground text-xs w-36 shrink-0">
                  {new Date(h.createdAt).toLocaleString("tr-TR")}
                </span>
                <span>
                  {h.fromStageName ? `${h.fromStageName} → ` : ""}
                  <span className="font-medium">{h.toStageName}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <CrmTimeline
        ctx={{
          dealId: deal.id,
          agencyId: agencyId || deal.agencyId,
          agentId: deal.agentId,
          clientId: deal.clientId,
          userId: user?.id ?? "",
        }}
        initial={timeline}
      />
    </div>
  );
}
