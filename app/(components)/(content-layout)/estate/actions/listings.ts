"use server";

import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";

export type ListingProps = {
  title:       string;
  listingNo:   string;
  listingType: "SALE" | "RENT" | "SHORT_RENT";
  status:      "ACTIVE" | "SOLD" | "RENTED" | "WITHDRAWN" | "PENDING" | "RESERVED";
  askingPrice: number;
  currency:    string;
  monthlyRent?: number;
  deposit?:    number;
  isNegotiable: boolean;
  publishedAt?: string;
  expiresAt?:  string;
  isPublic:    boolean;
  description?: string;
  highlights:  string[];
  propertyId:  string;
  agentId?:    string;
  agentName:   string;
  agencyId:    string;
};

const PATH = "/estate/dashboard/academics/listings";

function toFloat(v: any) { return v ? parseFloat(String(v)) : null; }
function toDate(s?: string) { return s ? new Date(s) : null; }
function toArr(v: any): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

// ==================== CREATE ====================
export async function createListing(data: ListingProps) {
  const exists = await db.listing.findUnique({ where: { listingNo: data.listingNo } });
  if (exists) throw new Error("Bu ilan numarası zaten kullanılıyor.");

  const listing = await db.listing.create({
    data: {
      title:       data.title,
      listingNo:   data.listingNo,
      listingType: data.listingType,
      status:      data.status,
      askingPrice: parseFloat(String(data.askingPrice)),
      currency:    data.currency,
      monthlyRent: toFloat(data.monthlyRent),
      deposit:     toFloat(data.deposit),
      isNegotiable: data.isNegotiable,
      publishedAt: toDate(data.publishedAt),
      expiresAt:   toDate(data.expiresAt),
      isPublic:    data.isPublic,
      description: data.description ?? null,
      highlights:  toArr(data.highlights),
      propertyId:  data.propertyId,
      agentId:     data.agentId   || null,
      agentName:   data.agentName,
      agencyId:    data.agencyId,
    },
  });

  revalidatePath(PATH);
  return listing;
}

// ==================== UPDATE ====================
export async function updateListing(id: string, data: Partial<ListingProps>) {
  const listing = await db.listing.update({
    where: { id },
    data: {
      ...(data.title       && { title: data.title }),
      ...(data.listingType && { listingType: data.listingType }),
      ...(data.status      && { status: data.status }),
      ...(data.askingPrice !== undefined && { askingPrice: parseFloat(String(data.askingPrice)) }),
      ...(data.currency    && { currency: data.currency }),
      ...(data.monthlyRent !== undefined && { monthlyRent: toFloat(data.monthlyRent) }),
      ...(data.deposit     !== undefined && { deposit:     toFloat(data.deposit) }),
      ...(data.isNegotiable !== undefined && { isNegotiable: data.isNegotiable }),
      ...(data.publishedAt !== undefined && { publishedAt: toDate(data.publishedAt) }),
      ...(data.expiresAt   !== undefined && { expiresAt:   toDate(data.expiresAt) }),
      ...(data.isPublic    !== undefined && { isPublic: data.isPublic }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.highlights  !== undefined && { highlights: toArr(data.highlights) }),
      ...(data.propertyId  && { propertyId: data.propertyId }),
      ...(data.agentId     !== undefined && { agentId: data.agentId || null }),
      ...(data.agentName   && { agentName: data.agentName }),
    },
  });

  revalidatePath(PATH);
  return listing;
}

// ==================== DELETE ====================
export async function deleteListing(id: string) {
  await db.$transaction([
    db.clientInterest.deleteMany({ where: { listingId: id } }),
    db.propertyVisit.deleteMany({ where: { listingId: id } }),
    db.listing.delete({ where: { id } }),
  ]);

  revalidatePath(PATH);
  return { ok: true };
}

// ==================== GET ALL ====================
export async function getAllListings(agencyId: string) {
  // Önce mülk olmadan çek, sonra mevcut mülkleri ayrıca getir
  const listings = await db.listing.findMany({
    where: { agencyId },
    include: {
      agent:  { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { contracts: true, visits: true, interests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Geçerli propertyId'leri topla
  const propertyIds = [...new Set(listings.map((l) => l.propertyId).filter(Boolean))];

  const properties =
    propertyIds.length > 0
      ? await db.propertyRealEstate.findMany({
          where: { id: { in: propertyIds } },
          select: { id: true, title: true, city: true, propertyType: true },
        })
      : [];

  const propMap = Object.fromEntries(properties.map((p) => [p.id, p]));

  return listings.map((l) => ({
    ...l,
    property: propMap[l.propertyId] ?? null,
  }));
}

// ==================== GET BY ID ====================
export async function getListingById(id: string) {
  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      agent:     { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      contracts: { select: { id: true, contractNo: true, status: true, contractType: true } },
      visits:    { select: { id: true, scheduledAt: true, status: true } },
      interests: { select: { id: true, clientId: true } },
      _count:    { select: { contracts: true, visits: true, interests: true } },
    },
  });

  if (!listing) return null;

  const property = listing.propertyId
    ? await db.propertyRealEstate
        .findUnique({
          where: { id: listing.propertyId },
          select: { id: true, title: true, city: true, district: true, propertyType: true, grossArea: true },
        })
        .catch(() => null)
    : null;

  return { ...listing, property };
}

// ==================== GET PROPERTIES (for selector) ====================
export async function getAgencyProperties(agencyId: string) {
  return db.propertyRealEstate.findMany({
    where: { agencyId },
    select: { id: true, title: true, city: true, propertyType: true },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== GENERATE LISTING NO ====================
export async function generateListingNo(agencyId: string): Promise<string> {
  const count = await db.listing.count({ where: { agencyId } });
  const year  = new Date().getFullYear();
  return `LN-${year}-${String(count + 1).padStart(4, "0")}`;
}
