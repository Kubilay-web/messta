"use server";

import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";

const PATH = "/management/dashboard/academics/classes";

async function getCtx() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true, name: true } } },
  });
  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/management/school-onboarding");
  return { agencyId: agencyId!, agencyName: dbUser?.agency?.name ?? "" };
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function getPropertiesWithListings(agencyId: string) {
  return prisma.propertyRealEstate.findMany({
    where: { agencyId },
    include: {
      listings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, listingNo: true,
          listingType: true, status: true,
          askingPrice: true, currency: true, agentName: true,
        },
      },
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAgentsByAgency(agencyId: string) {
  return prisma.agent.findMany({
    where: { agencyId },
    select: { id: true, firstName: true, lastName: true, designation: true },
    orderBy: { firstName: "asc" },
  });
}

// ── POST — Property ───────────────────────────────────────────────────────────

export async function createProperty(data: {
  title: string; address: string; city: string;
  district: string; propertyType: string; price?: string;
}): Promise<{ ok: boolean }> {
  try {
    const { agencyId, agencyName } = await getCtx();
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    await prisma.propertyRealEstate.create({
      data: {
        title: data.title, address: data.address,
        city: data.city, district: data.district,
        propertyType: data.propertyType as any,
        price: data.price ? parseFloat(data.price) : null,
        agencyId, agencyName, slug,
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) { console.error("createProperty:", e); return { ok: false }; }
}

// ── PUT — Property ────────────────────────────────────────────────────────────

export async function updateProperty(
  id: string,
  data: { title: string; address: string; city: string; district: string; propertyType: string; price?: string; }
): Promise<{ ok: boolean }> {
  try {
    await prisma.propertyRealEstate.update({
      where: { id },
      data: {
        title: data.title, address: data.address,
        city: data.city, district: data.district,
        propertyType: data.propertyType as any,
        price: data.price ? parseFloat(data.price) : null,
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) { console.error("updateProperty:", e); return { ok: false }; }
}

// ── DELETE — Property ─────────────────────────────────────────────────────────

export async function deleteProperty(id: string): Promise<{ ok: boolean }> {
  try {
    await prisma.propertyRealEstate.delete({ where: { id } });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) { console.error("deleteProperty:", e); return { ok: false }; }
}

// ── POST — Listing ────────────────────────────────────────────────────────────

export async function createListing(data: {
  propertyId: string; title: string; listingType: string;
  askingPrice: string; agentId?: string; agentName: string;
}): Promise<{ ok: boolean }> {
  try {
    const { agencyId } = await getCtx();
    await prisma.listing.create({
      data: {
        title: data.title,
        listingNo: `LST-${Date.now()}`,
        listingType: data.listingType as any,
        askingPrice: parseFloat(data.askingPrice),
        agentName: data.agentName,
        ...(data.agentId ? { agent: { connect: { id: data.agentId } } } : {}),
        property: { connect: { id: data.propertyId } },
        agency: { connect: { id: agencyId } },
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) { console.error("createListing:", e); return { ok: false }; }
}

// ── DELETE — Listing ──────────────────────────────────────────────────────────

export async function deleteListing(id: string): Promise<{ ok: boolean }> {
  try {
    await prisma.listing.delete({ where: { id } });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) { console.error("deleteListing:", e); return { ok: false }; }
}
