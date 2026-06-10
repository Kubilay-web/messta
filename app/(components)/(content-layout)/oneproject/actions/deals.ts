"use server";

import db from "@/app/lib/db";
import { DealProps } from "../types/types";
import { revalidatePath } from "next/cache";

/**
 * CRM Satış Hunisi (Pipeline / Stage / Deal) aksiyonları — ERP estate üstünde.
 * ERP modelleri değiştirilmez; bağlar scalar ID ile kurulur.
 */

// Gayrimenkul satış hunisi varsayılan aşamaları
const DEFAULT_STAGES = [
  { name: "İlk Görüşme", order: 1, probability: 10 },
  { name: "İhtiyaç Analizi", order: 2, probability: 25 },
  { name: "Mülk Gösterimi", order: 3, probability: 45 },
  { name: "Teklif", order: 4, probability: 65 },
  { name: "Pazarlık", order: 5, probability: 80 },
  { name: "Sözleşme", order: 6, probability: 95 },
];

/** Acentenin varsayılan pipeline'ını döndürür; yoksa aşamalarıyla oluşturur. */
export async function ensureDefaultPipeline(agencyId: string) {
  let pipeline = await db.crmPipeline.findFirst({
    where: { agencyId },
    orderBy: { createdAt: "asc" },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!pipeline) {
    pipeline = await db.crmPipeline.create({
      data: {
        name: "Satış Hunisi",
        agencyId,
        isDefault: true,
        stages: { create: DEFAULT_STAGES },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });
  }

  return pipeline;
}

// Deal'leri ERP danışman/müşteri/ilan verisiyle zenginleştir
async function enrichDeals<
  T extends { agentId: string | null; clientId: string | null; listingId: string | null }
>(deals: T[]) {
  const agentIds = [...new Set(deals.map((d) => d.agentId).filter(Boolean))] as string[];
  const clientIds = [...new Set(deals.map((d) => d.clientId).filter(Boolean))] as string[];
  const listingIds = [...new Set(deals.map((d) => d.listingId).filter(Boolean))] as string[];

  const [agents, clients, listings] = await Promise.all([
    agentIds.length
      ? db.agent.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : Promise.resolve([]),
    clientIds.length
      ? db.propertyClient.findMany({
          where: { id: { in: clientIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : Promise.resolve([]),
    listingIds.length
      ? db.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, title: true, listingNo: true },
        })
      : Promise.resolve([]),
  ]);

  const aMap = new Map(agents.map((a) => [a.id, a]));
  const cMap = new Map(clients.map((c) => [c.id, c]));
  const lMap = new Map(listings.map((l) => [l.id, l]));

  return deals.map((d) => ({
    ...d,
    agent: d.agentId ? aMap.get(d.agentId) ?? null : null,
    client: d.clientId ? cMap.get(d.clientId) ?? null : null,
    listing: d.listingId ? lMap.get(d.listingId) ?? null : null,
  }));
}

/** Kanban panosu: pipeline + aşamalar + zenginleştirilmiş deal'ler. */
export async function getAgencyBoard(agencyId: string | undefined | null) {
  if (!agencyId) return null;
  try {
    const pipeline = await ensureDefaultPipeline(agencyId);
    const deals = await db.crmDeal.findMany({
      where: { agencyId, pipelineId: pipeline.id },
      orderBy: { updatedAt: "desc" },
    });
    const enriched = await enrichDeals(deals);
    return { pipeline, stages: pipeline.stages, deals: enriched };
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Bir ERP müşterisine bağlı fırsatlar (clientId scalar), zenginleştirilmiş. */
export async function getClientDeals(clientId: string) {
  if (!clientId) return [];
  try {
    const deals = await db.crmDeal.findMany({
      where: { clientId },
      orderBy: { updatedAt: "desc" },
    });
    return await enrichDeals(deals);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getDealById(id: string) {
  try {
    return await db.crmDeal.findUnique({ where: { id } });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createDeal(data: DealProps) {
  try {
    if (data.commissionRate && data.value) {
      data.commissionAmount = Number(
        ((Number(data.value) * Number(data.commissionRate)) / 100).toFixed(2)
      );
    }
    const deal = await db.crmDeal.create({ data });
    revalidatePath("/oneproject/dashboard/deals");
    return { status: 200, error: null, data: deal };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Fırsat oluşturulamadı", data: null };
  }
}

export async function updateDealById(id: string, data: DealProps) {
  try {
    if (data.commissionRate && data.value) {
      data.commissionAmount = Number(
        ((Number(data.value) * Number(data.commissionRate)) / 100).toFixed(2)
      );
    }
    const deal = await db.crmDeal.update({ where: { id }, data });
    revalidatePath("/oneproject/dashboard/deals");
    return { status: 200, error: null, data: deal };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Fırsat güncellenemedi", data: null };
  }
}

/** Deal'i başka bir aşamaya taşı (kanban sürükle-bırak) + geçmiş kaydı. */
export async function moveDeal(dealId: string, stageId: string) {
  try {
    const deal = await db.crmDeal.findUnique({
      where: { id: dealId },
      select: { stageId: true, agencyId: true },
    });
    await db.crmDeal.update({ where: { id: dealId }, data: { stageId } });

    // Aşama geçiş geçmişi (denetim izi)
    if (deal && deal.stageId !== stageId) {
      const [fromStage, toStage] = await Promise.all([
        db.crmStage.findUnique({
          where: { id: deal.stageId },
          select: { name: true },
        }),
        db.crmStage.findUnique({
          where: { id: stageId },
          select: { name: true },
        }),
      ]);
      await db.crmStageHistory.create({
        data: {
          dealId,
          agencyId: deal.agencyId,
          fromStageId: deal.stageId,
          fromStageName: fromStage?.name ?? null,
          toStageId: stageId,
          toStageName: toStage?.name ?? "",
        },
      });
    }

    revalidatePath("/oneproject/dashboard/deals");
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

/** Bir fırsatın aşama geçiş geçmişi. */
export async function getDealStageHistory(dealId: string) {
  try {
    return await db.crmStageHistory.findMany({
      where: { dealId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Fırsatı kazanıldı/kaybedildi/açık olarak işaretle. */
export async function setDealStatus(
  dealId: string,
  status: "OPEN" | "WON" | "LOST",
  lostReason?: string
) {
  try {
    await db.crmDeal.update({
      where: { id: dealId },
      data: {
        status,
        closedAt: status === "OPEN" ? null : new Date(),
        lostReason: status === "LOST" ? lostReason ?? null : null,
      },
    });
    revalidatePath("/oneproject/dashboard/deals");
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

export async function deleteDeal(id: string) {
  try {
    const deleted = await db.crmDeal.delete({ where: { id } });
    revalidatePath("/oneproject/dashboard/deals");
    return { ok: true, data: deleted };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

/** Lead'den fırsat oluştur (ilk aşamaya). */
export async function createDealFromLead(leadId: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false, error: "Lead bulunamadı", dealId: null };

    const pipeline = await ensureDefaultPipeline(lead.agencyId);
    const firstStage = pipeline.stages[0];

    const deal = await db.crmDeal.create({
      data: {
        title: `${lead.firstName} ${lead.lastName ?? ""} - Talep`.trim(),
        value: lead.budgetMax ?? lead.budgetMin ?? 0,
        currency: lead.currency,
        pipelineId: pipeline.id,
        stageId: firstStage.id,
        leadId: lead.id,
        agencyId: lead.agencyId,
        agentId: lead.agentId,
        listingId: lead.listingId,
        propertyId: lead.propertyId,
        ownerUserId: lead.ownerUserId,
      },
    });

    revalidatePath("/oneproject/dashboard/deals");
    return { ok: true, error: null, dealId: deal.id };
  } catch (error) {
    console.log(error);
    return { ok: false, error: "Fırsat oluşturulamadı", dealId: null };
  }
}
