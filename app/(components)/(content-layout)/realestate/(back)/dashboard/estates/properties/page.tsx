import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PropertyManagementUI from "./PropertyManagementUI";

const PATH = "/realestate/dashboard/academics/classes";

async function getAgencyId(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true } } },
  });
  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/realestate/onboarding");
  return agencyId!;
}

// GET
export default async function PropertiesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const agencyId = await getAgencyId(user.id);

  const properties = await prisma.propertyRealEstate.findMany({
    where: { agencyId },
    select: {
      id: true, title: true, city: true, district: true, address: true,
      propertyType: true, status: true,
      price: true, currency: true,
      grossArea: true, netArea: true, roomCount: true,
      bathroomCount: true, floorNo: true, totalFloors: true, buildingAge: true,
      heatingType: true,
      hasElevator: true, hasParking: true, isFurnished: true,
      hasGarden: true, hasPool: true, hasBalcony: true, isFeatured: true,
      ownerName: true, ownerPhone: true, description: true, createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // POST — Mülk oluştur
  async function createProperty(data: {
    title: string; address: string; city: string; district: string;
    propertyType: string; status: string;
    price: string; currency: string;
    grossArea: string; netArea: string; roomCount: string;
    bathroomCount: string; floorNo: string; totalFloors: string; buildingAge: string;
    heatingType: string;
    hasElevator: boolean; hasParking: boolean; isFurnished: boolean;
    hasGarden: boolean; hasPool: boolean; hasBalcony: boolean; isFeatured: boolean;
    ownerName: string; ownerPhone: string; description: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const title = data.title?.trim();
      if (!title) return { ok: false, error: "Başlık zorunlu." };
      if (!data.city?.trim()) return { ok: false, error: "Şehir zorunlu." };
      if (!data.district?.trim()) return { ok: false, error: "İlçe zorunlu." };
      if (!data.address?.trim()) return { ok: false, error: "Adres zorunlu." };

      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

      const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true } });

      await prisma.propertyRealEstate.create({
        data: {
          title, slug,
          address: data.address.trim(),
          city: data.city.trim(),
          district: data.district.trim(),
          propertyType: data.propertyType as any,
          status: (data.status || "AVAILABLE") as any,
          price: data.price ? parseFloat(data.price) : null,
          currency: data.currency || "TRY",
          grossArea: data.grossArea ? parseFloat(data.grossArea) : null,
          netArea: data.netArea ? parseFloat(data.netArea) : null,
          roomCount: data.roomCount?.trim() || null,
          bathroomCount: data.bathroomCount ? parseInt(data.bathroomCount) : null,
          floorNo: data.floorNo ? parseInt(data.floorNo) : null,
          totalFloors: data.totalFloors ? parseInt(data.totalFloors) : null,
          buildingAge: data.buildingAge ? parseInt(data.buildingAge) : null,
          heatingType: data.heatingType?.trim() || null,
          hasElevator: !!data.hasElevator,
          hasParking: !!data.hasParking,
          isFurnished: !!data.isFurnished,
          hasGarden: !!data.hasGarden,
          hasPool: !!data.hasPool,
          hasBalcony: !!data.hasBalcony,
          isFeatured: !!data.isFeatured,
          ownerName: data.ownerName?.trim() || null,
          ownerPhone: data.ownerPhone?.trim() || null,
          description: data.description?.trim() || null,
          agencyId,
          agencyName: agency?.name ?? "",
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createProperty:", e);
      if (e?.code === "P2002") return { ok: false, error: "Bu başlıkla zaten bir mülk var." };
      return { ok: false, error: "Mülk oluşturulamadı." };
    }
  }

  // PUT — Mülk güncelle
  async function updateProperty(id: string, data: {
    title: string; address: string; city: string; district: string;
    propertyType: string; status: string;
    price: string; currency: string;
    grossArea: string; netArea: string; roomCount: string;
    bathroomCount: string; floorNo: string; totalFloors: string; buildingAge: string;
    heatingType: string;
    hasElevator: boolean; hasParking: boolean; isFurnished: boolean;
    hasGarden: boolean; hasPool: boolean; hasBalcony: boolean; isFeatured: boolean;
    ownerName: string; ownerPhone: string; description: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.title?.trim()) return { ok: false, error: "Başlık zorunlu." };
      await prisma.propertyRealEstate.update({
        where: { id },
        data: {
          title: data.title.trim(),
          address: data.address?.trim(),
          city: data.city?.trim(),
          district: data.district?.trim(),
          propertyType: data.propertyType as any,
          status: data.status as any,
          price: data.price ? parseFloat(data.price) : null,
          currency: data.currency || "TRY",
          grossArea: data.grossArea ? parseFloat(data.grossArea) : null,
          netArea: data.netArea ? parseFloat(data.netArea) : null,
          roomCount: data.roomCount?.trim() || null,
          bathroomCount: data.bathroomCount ? parseInt(data.bathroomCount) : null,
          floorNo: data.floorNo ? parseInt(data.floorNo) : null,
          totalFloors: data.totalFloors ? parseInt(data.totalFloors) : null,
          buildingAge: data.buildingAge ? parseInt(data.buildingAge) : null,
          heatingType: data.heatingType?.trim() || null,
          hasElevator: !!data.hasElevator,
          hasParking: !!data.hasParking,
          isFurnished: !!data.isFurnished,
          hasGarden: !!data.hasGarden,
          hasPool: !!data.hasPool,
          hasBalcony: !!data.hasBalcony,
          isFeatured: !!data.isFeatured,
          ownerName: data.ownerName?.trim() || null,
          ownerPhone: data.ownerPhone?.trim() || null,
          description: data.description?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateProperty:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Mülk sil (bağlı ilan varsa engelle)
  async function deleteProperty(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const count = await prisma.listing.count({ where: { propertyId: id } });
      if (count > 0) return { ok: false, error: "Bu mülke bağlı ilan var. Önce ilanları silin." };
      await prisma.propertyRealEstate.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteProperty:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <PropertyManagementUI
      properties={properties as any}
      createProperty={createProperty}
      updateProperty={updateProperty}
      deleteProperty={deleteProperty}
    />
  );
}
