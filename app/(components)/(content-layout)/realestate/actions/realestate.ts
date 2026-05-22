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

export async function getClientsByAgency(agencyId: string) {
  return prisma.propertyClient.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
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

// ── POST — PropertyClient ─────────────────────────────────────────────────────

export async function createPropertyClient(data: {
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNo?: string;
  gender: string;
  dob: string;
  nationality: string;
  NIN: string;
  contactMethod: string;
  occupation?: string;
  address: string;
  password: string;
  isBuyer: boolean;
  isSeller: boolean;
  isTenant: boolean;
  isLandlord: boolean;
  minBudget?: string;
  maxBudget?: string;
  currency: string;
  preferredPropertyTypes: string[];
  preferredCities: string;
  notes?: string;
  imageUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { agencyId, agencyName } = await getCtx();
    await prisma.propertyClient.create({
      data: {
        user:        { connect: { id: data.userId } },
        agency:      { connect: { id: agencyId } },
        agencyName,
        title:       data.title,
        firstName:   data.firstName,
        lastName:    data.lastName,
        email:       data.email,
        phone:       data.phone,
        whatsappNo:  data.whatsappNo ?? null,
        gender:      data.gender,
        dob:         new Date(data.dob),
        nationality: data.nationality,
        NIN:         data.NIN,
        contactMethod: data.contactMethod,
        occupation:  data.occupation ?? null,
        address:     data.address,
        password:    data.password,
        isBuyer:     data.isBuyer,
        isSeller:    data.isSeller,
        isTenant:    data.isTenant,
        isLandlord:  data.isLandlord,
        minBudget:   data.minBudget ? parseFloat(data.minBudget) : null,
        maxBudget:   data.maxBudget ? parseFloat(data.maxBudget) : null,
        currency:    data.currency,
        preferredPropertyTypes: data.preferredPropertyTypes as any[],
        preferredCities: data.preferredCities
          ? data.preferredCities.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        notes:    data.notes ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e: any) {
    console.error("createPropertyClient:", e);
    if (e?.code === "P2002") {
      const field = e?.meta?.target?.[0];
      if (field === "email")  return { ok: false, error: "Bu e-posta zaten kayıtlı." };
      if (field === "phone")  return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (field === "NIN")    return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
      if (field === "userId") return { ok: false, error: "Bu kullanıcı zaten bir müşteri olarak kayıtlı." };
    }
    return { ok: false, error: "Bir hata oluştu." };
  }
}

// ── GET — Departments ─────────────────────────────────────────────────────────

export async function getDepartmentsByAgency(agencyId: string) {
  return prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

// ── POST — Agent ──────────────────────────────────────────────────────────────

export async function createAgent(data: {
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNo?: string;
  gender: string;
  dateOfBirth?: string;
  NIN: string;
  contactMethod: string;
  designation: string;
  departmentId: string;
  dateOfJoining: string;
  licenseNo?: string;
  qualification: string;
  experience?: string;
  commissionRate?: string;
  specializationTypes: string[];
  specializationCities?: string;
  bio?: string;
  skills?: string;
  imageUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { agencyId, agencyName } = await getCtx();

    const department = await prisma.agencyDepartment.findUnique({
      where: { id: data.departmentId },
      select: { name: true },
    });

    const employeeId = `AGT-${Date.now()}`;

    await prisma.agent.create({
      data: {
        user:          { connect: { id: data.userId } },
        agency:        { connect: { id: agencyId } },
        agencyName,
        department:    { connect: { id: data.departmentId } },
        departmentName: department?.name ?? "",
        employeeId,
        title:         data.title,
        firstName:     data.firstName,
        lastName:      data.lastName,
        email:         data.email,
        phone:         data.phone,
        whatsappNo:    data.whatsappNo ?? null,
        gender:        data.gender as any,
        dateOfBirth:   data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        NIN:           data.NIN,
        contactMethod: data.contactMethod,
        designation:   data.designation,
        dateOfJoining: new Date(data.dateOfJoining),
        licenseNo:     data.licenseNo ?? null,
        qualification: data.qualification,
        experience:    data.experience ? parseInt(data.experience) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
        specializationTypes: data.specializationTypes as any[],
        specializationCities: data.specializationCities
          ? data.specializationCities.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        bio:    data.bio ?? null,
        skills: data.skills ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e: any) {
    console.error("createAgent:", e);
    if (e?.code === "P2002") {
      const field = e?.meta?.target?.[0];
      if (field === "email")      return { ok: false, error: "Bu e-posta zaten kayıtlı." };
      if (field === "phone")      return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (field === "NIN")        return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
      if (field === "userId")     return { ok: false, error: "Bu kullanıcı zaten bir danışman olarak kayıtlı." };
      if (field === "employeeId") return { ok: false, error: "Çakışan çalışan ID, tekrar deneyin." };
    }
    return { ok: false, error: "Bir hata oluştu." };
  }
}
