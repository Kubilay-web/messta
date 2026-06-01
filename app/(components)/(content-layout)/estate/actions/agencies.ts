"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/app/auth";
import { generateSlug } from "./generateSlug";
import { Agency } from "../types/types";
import prisma from "../../../../lib/db";

export type AgencyProps = {
  name: string;
  logo: string;
  primaryEmail: string;
  phone: string;
  address: string;
  city: string;
  taxNumber: string;
  licenseNo: string;
};

// ==================== CREATE AGENCY ====================
export async function createAgency(data: AgencyProps) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Yetkisiz erişim.");

    const slug = generateSlug(data.name);

    const agency = await prisma.agency.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        primaryEmail: data.primaryEmail || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        taxNumber: data.taxNumber || null,
        licenseNo: data.licenseNo || null,
        slug,
      },
    });

    // Kullanıcıyı bu ofise bağla
    await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyId: agency.id,
        agencyName: agency.name,
        roleGayrimenkul:"SUPER_ADMIN"
      },
    });

    revalidatePath("/estate/dashboard/admin");
    return agency;
  } catch (error: any) {
    console.error("createAgency error:", error);
    if (error?.code === "P2002") {
      throw new Error(
        "Bu ofis adı veya slug zaten kullanımda. Farklı bir isim deneyin."
      );
    }
    throw new Error(error?.message || "Ofis oluşturulamadı.");
  }
}

// ==================== GET AGENCY BY SLUG ====================
export async function getAgencyBySlug(slug: string) {
  if (!slug) return null;
  try {
    const agency = await prisma.agency.findUnique({ where: { slug } });
    return agency;
  } catch (error) {
    console.error("getAgencyBySlug error:", error);
    return null;
  }
}

// ==================== GET AGENCY BY ID ====================
export async function getAgencyById(id: string) {
  if (!id) return null;
  try {
    const agency = await prisma.agency.findUnique({ where: { id } });
    return agency;
  } catch (error) {
    console.error("getAgencyById error:", error);
    return null;
  }
}

// ==================== GET AGENCY BY ID VEYA SLUG ====================
export async function getAgencyByIdOrSlug(idOrSlug: string) {
  if (!idOrSlug) return null;
  try {
    return await prisma.agency.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
  } catch (error) {
    console.error("getAgencyByIdOrSlug error:", error);
    return null;
  }
}

// ==================== GET ALL AGENCIES ====================
export async function getAllAgencies() {
  try {
    const agencies = await prisma.agency.findMany({
      orderBy: { createdAt: "desc" },
    });
    return agencies;
  } catch (error) {
    console.error("getAllAgencies error:", error);
    return [];
  }
}

// ==================== DELETE AGENCY ====================
export async function deleteAgencyById(id: string) {
  if (!id) return null;
  try {
    const agency = await prisma.agency.delete({ where: { id } });
    revalidatePath("/estate/dashboard/admin");
    return agency;
  } catch (error) {
    console.error("deleteAgencyById error:", error);
    return null;
  }
}
