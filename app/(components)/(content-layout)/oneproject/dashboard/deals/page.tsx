import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getAgencyBoard } from "../../actions/deals";
import { getCrmAccess } from "../../lib/crm-access";
import DealKanban from "../../components/dashboard/crm/DealKanban";

export default async function page() {
  const { agencyId, canView, canManage } = await getCrmAccess();

  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim — CRM modülüne erişiminiz yok.
      </div>
    );
  }

  const board = await getAgencyBoard(agencyId);
  const stages = board?.stages ?? [];
  const deals = (board?.deals ?? []) as any[];

  const totalOpen = deals
    .filter((d) => d.status === "OPEN")
    .reduce((s, d) => s + (d.value || 0), 0);
  const wonCount = deals.filter((d) => d.status === "WON").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Satış Hunisi</h1>
          <p className="text-sm text-muted-foreground">
            Açık fırsat değeri:{" "}
            <span className="font-semibold text-emerald-700">
              {totalOpen.toLocaleString("tr-TR")} ₺
            </span>{" "}
            · Kazanılan: {wonCount}
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/oneproject/dashboard/deals/new">
              <Plus className="w-4 h-4 mr-1" /> Yeni Fırsat
            </Link>
          </Button>
        )}
      </div>

      {stages.length > 0 ? (
        <DealKanban stages={stages as any} deals={deals as any} />
      ) : (
        <p className="text-muted-foreground">Henüz huni aşaması yok.</p>
      )}
    </div>
  );
}
