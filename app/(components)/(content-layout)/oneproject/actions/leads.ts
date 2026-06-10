"use server";

import db from "@/app/lib/db";
import { LeadProps } from "../types/types";
import { revalidatePath } from "next/cache";

/**
 * Lead puanı (0-100): iletişim bilgisi tamlığı, talep netliği, kaynak kalitesi,
 * öncelik ve huni durumuna göre otomatik hesaplanır.
 */
export function computeLeadScore(data: Partial<LeadProps>): number {
  let s = 0;
  if (data.phone) s += 10;
  if (data.email) s += 10;
  if (data.budgetMax || data.budgetMin) s += 15;
  if (data.interestType) s += 10;
  if (data.propertyType) s += 10;
  if (data.preferredCities && data.preferredCities.length > 0) s += 10;

  const sourceScore: Record<string, number> = {
    REFERRAL: 20,
    WALK_IN: 15,
    PORTAL: 10,
    WEBSITE: 10,
    PHONE: 10,
    SOCIAL_MEDIA: 5,
    CAMPAIGN: 5,
    OTHER: 0,
  };
  s += sourceScore[data.source ?? "OTHER"] ?? 0;

  if (data.priority === "HIGH") s += 15;
  else if (data.priority === "MEDIUM") s += 5;

  const statusScore: Record<string, number> = {
    NEW: 0,
    CONTACTED: 5,
    QUALIFIED: 10,
    PROPOSAL: 15,
    NEGOTIATION: 20,
    WON: 25,
    LOST: 0,
  };
  s += statusScore[data.status ?? "NEW"] ?? 0;

  return Math.max(0, Math.min(100, s));
}

/**
 * CRM Lead (talep havuzu) aksiyonları. ERP estate üstünde çalışır:
 * ERP modelleri değiştirilmez, bağlar scalar ID ile kurulur. Lead WON olunca
 * eşleşen bir ERP PropertyClient varsa `convertedClientId` ile bağlanır.
 */

// Lead'leri ERP danışman/ilan verisiyle zenginleştir (liste gösterimi için)
async function enrichLeads<T extends { agentId: string | null; listingId: string | null }>(
  leads: T[]
) {
  const agentIds = [...new Set(leads.map((l) => l.agentId).filter(Boolean))] as string[];
  const listingIds = [...new Set(leads.map((l) => l.listingId).filter(Boolean))] as string[];

  const [agents, listings] = await Promise.all([
    agentIds.length
      ? db.agent.findMany({
          where: { id: { in: agentIds } },
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
  const lMap = new Map(listings.map((l) => [l.id, l]));

  return leads.map((l) => ({
    ...l,
    agent: l.agentId ? aMap.get(l.agentId) ?? null : null,
    listing: l.listingId ? lMap.get(l.listingId) ?? null : null,
  }));
}

export async function createLead(data: LeadProps) {
  try {
    const lead = await db.lead.create({
      data: { ...data, score: computeLeadScore(data) },
    });
    revalidatePath("/oneproject/dashboard/leads");
    return { status: 200, error: null, data: lead };
  } catch (error: any) {
    console.log(error);
    return { status: 500, error: "Lead oluşturulamadı", data: null };
  }
}

export async function updateLeadById(id: string, data: LeadProps) {
  try {
    const lead = await db.lead.update({
      where: { id },
      data: { ...data, score: computeLeadScore(data) },
    });
    revalidatePath("/oneproject/dashboard/leads");
    return { status: 200, error: null, data: lead };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Lead güncellenemedi", data: null };
  }
}

/**
 * Talep abonesini (web bülten/talep) CRM Lead'ine dönüştürür.
 * Abonenin yalnızca e-postası vardır; telefon danışman tarafından sonra doldurulur.
 */
export async function convertSubscriberToLead(subscriberId: string) {
  try {
    const sub = await db.subscriber.findUnique({ where: { id: subscriberId } });
    if (!sub) return { ok: false, error: "Abone bulunamadı", leadId: null };

    const namePart = sub.email.split("@")[0];
    const base = {
      email: sub.email,
      phone: "",
      source: "WEBSITE" as any,
    };
    const lead = await db.lead.create({
      data: {
        firstName: namePart,
        email: sub.email,
        phone: "",
        source: "WEBSITE",
        agencyId: sub.agencyId ?? "",
        agentId: sub.agentId ?? undefined,
        ownerUserId: sub.userId ?? undefined,
        score: computeLeadScore(base),
      },
    });

    revalidatePath("/oneproject/dashboard/leads");
    revalidatePath("/oneproject/dashboard/subscribers");
    return { ok: true, error: null, leadId: lead.id };
  } catch (error) {
    console.log(error);
    return { ok: false, error: "Lead'e dönüştürülemedi", leadId: null };
  }
}

/**
 * Mülk eşleştirme: Lead'in talep kriterlerine uyan ERP ilanlarını bulur ve
 * her birine bir eşleşme skoru (%) verir. ERP `Listing` + `PropertyRealEstate`
 * okunur, hiçbir şey değiştirilmez.
 */
export async function getLeadMatches(leadId: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return [];

    const where: any = { agencyId: lead.agencyId, status: "ACTIVE" };
    if (lead.interestType) where.listingType = lead.interestType;

    const propAnd: any[] = [];
    if (lead.propertyType) propAnd.push({ propertyType: lead.propertyType });
    if (lead.preferredCities && lead.preferredCities.length > 0) {
      propAnd.push({
        OR: [
          { city: { in: lead.preferredCities } },
          { district: { in: lead.preferredCities } },
        ],
      });
    }
    if (propAnd.length) where.property = { is: { AND: propAnd } };
    if (lead.budgetMax) where.askingPrice = { lte: lead.budgetMax * 1.1 };

    const listings = await db.listing.findMany({
      where,
      include: { property: true },
      take: 30,
      orderBy: { createdAt: "desc" },
    });

    // Eşleşme skoru hesapla
    const scored = listings.map((l: any) => {
      let score = 0;
      let max = 0;
      // mülk tipi
      max += 30;
      if (!lead.propertyType || l.property?.propertyType === lead.propertyType)
        score += 30;
      // ilan tipi
      max += 20;
      if (!lead.interestType || l.listingType === lead.interestType) score += 20;
      // şehir/ilçe
      max += 25;
      if (
        !lead.preferredCities?.length ||
        lead.preferredCities.includes(l.property?.city) ||
        lead.preferredCities.includes(l.property?.district)
      )
        score += 25;
      // bütçe
      max += 15;
      if (
        (!lead.budgetMax || l.askingPrice <= lead.budgetMax) &&
        (!lead.budgetMin || l.askingPrice >= lead.budgetMin)
      )
        score += 15;
      // oda
      max += 10;
      if (!lead.roomCount || l.property?.roomCount === lead.roomCount)
        score += 10;

      return {
        id: l.id,
        title: l.title,
        listingNo: l.listingNo,
        listingType: l.listingType,
        askingPrice: l.askingPrice,
        currency: l.currency,
        propertyTitle: l.property?.title ?? "",
        city: l.property?.city ?? "",
        district: l.property?.district ?? "",
        roomCount: l.property?.roomCount ?? "",
        matchScore: Math.round((score / max) * 100),
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getLeadById(id: string) {
  try {
    return await db.lead.findUnique({ where: { id } });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Acentenin tüm lead'leri (acente bazlı, ERP danışman/ilan ile zenginleştirilmiş). */
export async function getAgencyLeads(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const leads = await db.lead.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });
    return await enrichLeads(leads);
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Hızlı durum güncelleme (kanban / satır içi). */
export async function updateLeadStatus(id: string, status: string) {
  try {
    const lead = await db.lead.update({
      where: { id },
      data: {
        status: status as any,
        lastContactedAt: new Date(),
      },
    });
    revalidatePath("/oneproject/dashboard/leads");
    return { ok: true, data: lead };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function deleteLead(id: string) {
  try {
    const deleted = await db.lead.delete({ where: { id } });
    revalidatePath("/oneproject/dashboard/leads");
    return { ok: true, data: deleted };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

/**
 * Lead'i müşteriye dönüştür: durumu WON yapar; aynı acentede telefon/e-posta ile
 * eşleşen bir ERP PropertyClient varsa `convertedClientId` ile bağlar. Yoksa
 * müşteri kaydının ERP formundan oluşturulması gerekir (needsClientForm=true).
 */
export async function convertLeadToClient(id: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { ok: false, error: "Lead bulunamadı", needsClientForm: false };

    const existing = await db.propertyClient.findFirst({
      where: {
        agencyId: lead.agencyId,
        OR: [
          ...(lead.phone ? [{ phone: lead.phone }] : []),
          ...(lead.email ? [{ email: lead.email }] : []),
        ],
      },
      select: { id: true },
    });

    await db.lead.update({
      where: { id },
      data: {
        status: "WON",
        convertedClientId: existing?.id ?? null,
        lastContactedAt: new Date(),
      },
    });

    revalidatePath("/oneproject/dashboard/leads");
    return {
      ok: true,
      error: null,
      clientId: existing?.id ?? null,
      needsClientForm: !existing,
    };
  } catch (error) {
    console.log(error);
    return { ok: false, error: "Dönüştürme başarısız", needsClientForm: false };
  }
}
