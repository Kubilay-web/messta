import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getLeadById, getLeadMatches } from "../../../actions/leads";
import { getTimeline } from "../../../actions/crm";
import { getCrmAccess } from "../../../lib/crm-access";
import CrmTimeline from "../../../components/dashboard/crm/CrmTimeline";
import LeadActions from "../../../components/dashboard/crm/LeadActions";

const statusLabels: Record<string, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişimde",
  QUALIFIED: "Nitelikli",
  PROPOSAL: "Teklif",
  NEGOTIATION: "Pazarlık",
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

  const lead = await getLeadById(id);
  if (!lead) return notFound();
  const [timeline, matches] = await Promise.all([
    getTimeline({ leadId: id }),
    getLeadMatches(id),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {lead.firstName} {lead.lastName ?? ""}
            </h1>
            <span className="rounded bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
              {statusLabels[lead.status] ?? lead.status}
            </span>
            <span
              className={`rounded text-xs px-2 py-0.5 font-semibold ${
                lead.score >= 70
                  ? "bg-emerald-100 text-emerald-700"
                  : lead.score >= 40
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Puan: {lead.score}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {lead.phone}
            {lead.email ? ` · ${lead.email}` : ""}
          </p>
          {lead.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {lead.tags.map((t) => (
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
          {canManage && (
            <>
              <Button asChild variant="outline">
                <Link href={`/oneproject/dashboard/leads/update/${lead.id}`}>
                  Düzenle
                </Link>
              </Button>
              <LeadActions leadId={lead.id} status={lead.status} />
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talep Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Bütçe</p>
            <p className="font-medium">
              {lead.budgetMin || lead.budgetMax
                ? `${(lead.budgetMin ?? 0).toLocaleString("tr-TR")} - ${(
                    lead.budgetMax ?? 0
                  ).toLocaleString("tr-TR")} ₺`
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Oda</p>
            <p className="font-medium">{lead.roomCount ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Şehirler</p>
            <p className="font-medium">
              {lead.preferredCities?.length
                ? lead.preferredCities.join(", ")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Kaynak</p>
            <p className="font-medium">{lead.source}</p>
          </div>
          {lead.description && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-muted-foreground">Açıklama</p>
              <p>{lead.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MÜLK EŞLEŞTİRME */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Eşleşen İlanlar ({matches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Talebe uygun aktif ilan bulunamadı.
            </p>
          ) : (
            <div className="space-y-2">
              {matches.slice(0, 8).map((m) => (
                <Link
                  key={m.id}
                  href={`/estate/dashboard/listings`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {m.title}{" "}
                      <span className="text-xs text-muted-foreground">
                        (#{m.listingNo})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.district}/{m.city}
                      {m.roomCount ? ` · ${m.roomCount}` : ""} ·{" "}
                      {Number(m.askingPrice).toLocaleString("tr-TR")} {m.currency}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                      m.matchScore >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : m.matchScore >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    %{m.matchScore} uyum
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CrmTimeline
        ctx={{
          leadId: lead.id,
          agencyId: agencyId || lead.agencyId,
          agentId: lead.agentId,
          userId: user?.id ?? "",
        }}
        initial={timeline}
      />
    </div>
  );
}
