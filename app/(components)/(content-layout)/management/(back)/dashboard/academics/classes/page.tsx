import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PropertyListing from "../../../../components/dashboard/class-listing";

const PATH = "/management/dashboard/academics/classes";

// ─── GET yardımcı: kullanıcının ajansını çek ─────────────────────────────────
async function getAgency(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      agencyId: true,
      agency: { select: { id: true, name: true } },
    },
  });
}

export default async function PropertiesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await getAgency(user.id);
  const agencyId = dbUser?.agency?.id;
  const agencyName = dbUser?.agency?.name ?? "";

  // Ajans oluşturulmamışsa onboarding'e yönlendir
  if (!agencyId) redirect("/management/school-onboarding");

  // GET — tüm mülkleri listelerle birlikte çek
  const [properties, agents] = await Promise.all([
    prisma.propertyRealEstate.findMany({
      where: { agencyId: agencyId! },
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
    }),
    prisma.agent.findMany({
      where: { agencyId: agencyId! },
      select: { id: true, firstName: true, lastName: true, designation: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  // POST — yeni mülk oluştur
  async function createPropertyAction(data: {
    title: string; address: string; city: string;
    district: string; propertyType: string; price?: string;
  }): Promise<{ ok: boolean }> {
    "use server";
    try {
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
    } catch (e) { console.error(e); return { ok: false }; }
  }

  // PUT — mülkü güncelle
  async function updatePropertyAction(
    id: string, data: { title: string }
  ): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.propertyRealEstate.update({ where: { id }, data });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) { console.error(e); return { ok: false }; }
  }

  // DELETE — mülkü sil
  async function deletePropertyAction(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.propertyRealEstate.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) { console.error(e); return { ok: false }; }
  }

  // POST — mülke ilan ekle
  async function createListingAction(data: {
    propertyId: string; title: string; listingType: string;
    askingPrice: string; agentId: string; agentName: string;
  }): Promise<{ ok: boolean }> {
    "use server";
    try {
      const listingNo = `LST-${Date.now()}`;
      await prisma.listing.create({
        data: {
          title: data.title,
          listingNo,
          listingType: data.listingType as any,
          askingPrice: parseFloat(data.askingPrice),
          agentId: data.agentId,
          agentName: data.agentName,
          propertyId: data.propertyId,
          agencyId, agencyName,
        } as any,
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) { console.error(e); return { ok: false }; }
  }

  // DELETE — ilanı sil
  async function deleteListingAction(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.listing.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) { console.error(e); return { ok: false }; }
  }

  return (
    <PropertyListing
      agencyId={agencyId}
      properties={properties as any}
      agents={agents}
      onCreateProperty={createPropertyAction}
      onUpdateProperty={updatePropertyAction}
      onDeleteProperty={deletePropertyAction}
      onCreateListing={createListingAction}
      onDeleteListing={deleteListingAction}
    />
  );
}
