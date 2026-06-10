"use server";

import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { assertAgencyAccess } from "../lib/auth";
import { createPropertyClient } from "@/app/(components)/(content-layout)/estate/actions/clients";

/** CRM müşteri listesi (filtreli) + özet sayaçlar */
export async function getCrmClients(
  agencyId: string,
  filter?: { q?: string; role?: "buyer" | "seller" | "tenant" | "landlord" }
) {
  const clients = await db.propertyClient.findMany({
    where: {
      agencyId,
      ...(filter?.q
        ? {
            OR: [
              { firstName: { contains: filter.q, mode: "insensitive" } },
              { lastName: { contains: filter.q, mode: "insensitive" } },
              { phone: { contains: filter.q } },
              { email: { contains: filter.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filter?.role === "buyer" ? { isBuyer: true } : {}),
      ...(filter?.role === "seller" ? { isSeller: true } : {}),
      ...(filter?.role === "tenant" ? { isTenant: true } : {}),
      ...(filter?.role === "landlord" ? { isLandlord: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      imageUrl: true,
      isBuyer: true,
      isSeller: true,
      isTenant: true,
      isLandlord: true,
      minBudget: true,
      maxBudget: true,
      currency: true,
      preferredCities: true,
      createdAt: true,
      _count: {
        select: { crmLeads: true, contracts: true, visits: true, interests: true },
      },
    },
  });

  return clients;
}

/** Müşteri 360 görünümü — tüm CRM/ERP ilişkileri */
export async function getClient360(clientId: string) {
  return db.propertyClient.findUnique({
    where: { id: clientId },
    include: {
      crmLeads: {
        orderBy: { lastActivityAt: "desc" },
        include: {
          stage: { select: { name: true, color: true } },
          pipeline: { select: { name: true } },
        },
      },
      contracts: {
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { id: true, title: true, city: true, district: true } },
        },
      },
      visits: {
        orderBy: { scheduledAt: "desc" },
        take: 30,
        include: {
          property: { select: { id: true, title: true, city: true } },
        },
      },
      interests: {
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: { id: true, title: true, listingNo: true, askingPrice: true, currency: true, status: true },
          },
        },
      },
      savedSearches: { orderBy: { createdAt: "desc" } },
    },
  });
}

/** PUT: müşterinin CRM ile ilgili alanlarını güncelle */
export async function updateCrmClient(
  id: string,
  data: {
    notes?: string;
    minBudget?: number | null;
    maxBudget?: number | null;
    currency?: string;
    preferredCities?: string[];
    preferredPropertyTypes?: string[];
    isBuyer?: boolean;
    isSeller?: boolean;
    isTenant?: boolean;
    isLandlord?: boolean;
  }
) {
  const existing = await db.propertyClient.findUnique({ where: { id }, select: { agencyId: true } });
  if (!existing) throw new Error("Müşteri bulunamadı.");
  await assertAgencyAccess(existing.agencyId);

  const client = await db.propertyClient.update({
    where: { id },
    data: {
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.minBudget !== undefined && { minBudget: data.minBudget }),
      ...(data.maxBudget !== undefined && { maxBudget: data.maxBudget }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.preferredCities !== undefined && { preferredCities: data.preferredCities }),
      ...(data.preferredPropertyTypes !== undefined && { preferredPropertyTypes: data.preferredPropertyTypes as any }),
      ...(data.isBuyer !== undefined && { isBuyer: data.isBuyer }),
      ...(data.isSeller !== undefined && { isSeller: data.isSeller }),
      ...(data.isTenant !== undefined && { isTenant: data.isTenant }),
      ...(data.isLandlord !== undefined && { isLandlord: data.isLandlord }),
    },
  });

  revalidatePath(`/crm/agency/${existing.agencyId}/clients`);
  revalidatePath(`/crm/agency/${existing.agencyId}/clients/${id}`);
  return client;
}

/** DELETE: müşteriyi (ve kullanıcı hesabını) sil, fırsat bağlarını çöz */
export async function deleteCrmClient(id: string) {
  const existing = await db.propertyClient.findUnique({
    where: { id },
    select: { agencyId: true, userId: true },
  });
  if (!existing) return;
  await assertAgencyAccess(existing.agencyId);

  // CRM fırsatlarındaki bağı çöz (fırsatları silmeden)
  await db.lead.updateMany({ where: { clientId: id }, data: { clientId: null } });

  await db.propertyClient.delete({ where: { id } });
  if (existing.userId) {
    await db.user.delete({ where: { id: existing.userId } }).catch(() => {});
  }

  revalidatePath(`/crm/agency/${existing.agencyId}/clients`);
}

/** Bir CRM lead'ini mevcut müşteriye bağla */
export async function linkLeadToClient(leadId: string, clientId: string) {
  const existing = await db.lead.findUnique({ where: { id: leadId }, select: { agencyId: true } });
  if (!existing) throw new Error("Fırsat bulunamadı.");
  await assertAgencyAccess(existing.agencyId);

  // Müşteri aynı ofise mi ait?
  const client = await db.propertyClient.findUnique({
    where: { id: clientId },
    select: { agencyId: true },
  });
  if (!client || client.agencyId !== existing.agencyId)
    throw new Error("Müşteri bu ofise ait değil.");

  return db.lead.update({ where: { id: leadId }, data: { clientId } });
}

/* ------------------------------------------------------------------ */
/*  Fırsatı kalıcı müşteriye (PropertyClient + User) dönüştür          */
/* ------------------------------------------------------------------ */

export type ConvertLeadInput = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNo?: string;
  gender: string; // MALE | FEMALE | OTHER veya serbest
  dob: string; // YYYY-MM-DD
  nationality: string;
  NIN: string; // TC Kimlik No
  contactMethod: string;
  occupation?: string;
  address: string;
  password: string;
  isBuyer: boolean;
  isSeller: boolean;
  isTenant: boolean;
  isLandlord: boolean;
  minBudget?: number | null;
  maxBudget?: number | null;
  currency: string;
  preferredPropertyTypes: string[];
  preferredCities: string[];
  notes?: string;
};

/** POST: CRM'den yeni müşteri (PropertyClient + kullanıcı) oluştur */
export async function createCrmClient(agencyId: string, data: ConvertLeadInput) {
  await assertAgencyAccess(agencyId);
  const agency = await db.agency.findUnique({ where: { id: agencyId }, select: { name: true } });

  const client = await createPropertyClient({
    title: data.title,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    whatsappNo: data.whatsappNo,
    gender: data.gender,
    dob: data.dob,
    nationality: data.nationality,
    imageUrl: "",
    NIN: data.NIN,
    contactMethod: data.contactMethod,
    occupation: data.occupation,
    address: data.address,
    password: data.password,
    isBuyer: data.isBuyer,
    isSeller: data.isSeller,
    isTenant: data.isTenant,
    isLandlord: data.isLandlord,
    minBudget: data.minBudget ?? undefined,
    maxBudget: data.maxBudget ?? undefined,
    currency: data.currency,
    preferredPropertyTypes: data.preferredPropertyTypes,
    preferredCities: data.preferredCities,
    notes: data.notes,
    agencyId,
    agencyName: agency?.name ?? agencyId,
  });

  revalidatePath(`/crm/agency/${agencyId}/clients`);
  return client;
}

export async function convertLeadToClient(leadId: string, data: ConvertLeadInput) {
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Fırsat bulunamadı.");
  await assertAgencyAccess(lead.agencyId);

  if (lead.clientId) throw new Error("Bu fırsat zaten bir müşteriye bağlı.");

  const agency = await db.agency.findUnique({
    where: { id: lead.agencyId },
    select: { name: true },
  });

  // estate ERP'nin müşteri oluşturma action'ını yeniden kullan
  const client = await createPropertyClient({
    title: data.title,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    whatsappNo: data.whatsappNo,
    gender: data.gender,
    dob: data.dob,
    nationality: data.nationality,
    imageUrl: "",
    NIN: data.NIN,
    contactMethod: data.contactMethod,
    occupation: data.occupation,
    address: data.address,
    password: data.password,
    isBuyer: data.isBuyer,
    isSeller: data.isSeller,
    isTenant: data.isTenant,
    isLandlord: data.isLandlord,
    minBudget: data.minBudget ?? undefined,
    maxBudget: data.maxBudget ?? undefined,
    currency: data.currency,
    preferredPropertyTypes: data.preferredPropertyTypes,
    preferredCities: data.preferredCities,
    notes: data.notes,
    agencyId: lead.agencyId,
    agencyName: agency?.name ?? lead.agencyId,
  });

  // Fırsatı yeni müşteriye bağla
  await db.lead.update({
    where: { id: leadId },
    data: { clientId: client.id, lastActivityAt: new Date() },
  });

  await db.crmActivity.create({
    data: {
      type: "NOTE",
      title: "Fırsat müşteriye dönüştürüldü",
      content: `${data.firstName} ${data.lastName} müşteri kaydı oluşturuldu.`,
      leadId,
      agencyId: lead.agencyId,
      agentId: lead.agentId,
      agentName: lead.agentName,
    },
  });

  revalidatePath(`/crm/agency/${lead.agencyId}/leads/${leadId}`);
  revalidatePath(`/crm/agency/${lead.agencyId}/clients`);
  return client;
}
