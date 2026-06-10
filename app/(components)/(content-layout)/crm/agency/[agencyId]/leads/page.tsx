import Link from "next/link";
import { getAllLeads, getLeadFormOptions, deleteLead } from "../../../actions/leads";
import { getPipelines } from "../../../actions/pipelines";
import { requireAgencyAccess } from "../../../lib/auth";
import { LeadsFilter } from "../../../components/lead/leads-filter";
import { NewLeadButton } from "../../../components/lead/new-lead-button";
import { RowDelete } from "../../../components/row-delete";
import { Card, CardContent, Badge } from "../../../components/ui";
import {
  formatCurrency,
  leadStatusLabel,
  temperatureColor,
  temperatureLabel,
  timeAgo,
} from "../../../lib/labels";

export const dynamic = "force-dynamic";

export default async function LeadsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ agencyId: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { agencyId } = await params;
  await requireAgencyAccess(agencyId);
  const { status, q } = await searchParams;

  const [leads, pipelines, options] = await Promise.all([
    getAllLeads(agencyId, { status: status as any, q }),
    getPipelines(agencyId),
    getLeadFormOptions(agencyId),
  ]);

  const defaultPipelineId =
    (pipelines.find((p) => p.isDefault) ?? pipelines[0])?.id ?? "";

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fırsatlar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{leads.length} kayıt</p>
        </div>
        <NewLeadButton agencyId={agencyId} pipelineId={defaultPipelineId} options={options} />
      </div>

      <LeadsFilter agencyId={agencyId} status={status} q={q} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Fırsat</th>
                  <th className="px-4 py-3 font-medium">Kişi</th>
                  <th className="px-4 py-3 font-medium">Aşama</th>
                  <th className="px-4 py-3 font-medium">Danışman</th>
                  <th className="px-4 py-3 font-medium text-right">Değer</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Son Aktivite</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/crm/agency/${agencyId}/leads/${l.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {l.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground">{l.pipeline.name}</span>
                          <span
                            className={`text-[10px] px-1.5 rounded-full ${temperatureColor[l.temperature]}`}
                          >
                            {temperatureLabel[l.temperature]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p>{l.contactName}</p>
                        <p className="text-xs text-muted-foreground">{l.contactPhone ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: l.stage.color }}
                          />
                          {l.stage.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{l.agentName ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(l.value, l.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            l.status === "WON"
                              ? "default"
                              : l.status === "LOST"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {leadStatusLabel[l.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {timeAgo(l.lastActivityAt)}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <RowDelete action={deleteLead} id={l.id} message="Bu fırsat silinsin mi?" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
