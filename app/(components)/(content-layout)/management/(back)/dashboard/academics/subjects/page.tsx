import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ListingManagementUI from "./ListingManagementUI";

const PATH = "/management/dashboard/academics/subjects";

async function getAgencyId(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true } } },
  });
  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/management/school-onboarding");
  return agencyId!;
}

export default async function ListingsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const agencyId = await getAgencyId(user.id);

  // GET — ilanlar + mülk & danışman seçenekleri
  const [listings, properties, agents] = await Promise.all([
    prisma.listing.findMany({
      where: { agencyId },
      select: {
        id: true, title: true, listingNo: true, listingType: true, status: true,
        askingPrice: true, currency: true, monthlyRent: true, isNegotiable: true,
        agentName: true, description: true, isPublic: true, views: true, createdAt: true,
        property: { select: { title: true, city: true, propertyType: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.propertyRealEstate.findMany({
      where: { agencyId },
      select: { id: true, title: true, city: true, propertyType: true },
      orderBy: { title: "asc" },
    }),
    prisma.agent.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  // POST — İlan oluştur
  async function createListing(data: {
    title: string; propertyId: string; agentId: string; agentName: string;
    listingType: string; status: string; askingPrice: string;
    currency: string; monthlyRent: string; deposit: string;
    isNegotiable: string; isPublic: string; description: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.propertyId) return { ok: false, error: "Mülk seçin." };
      if (!data.askingPrice) return { ok: false, error: "Fiyat zorunlu." };

      let agentName = data.agentName?.trim();
      if (data.agentId) {
        const agent = await prisma.agent.findUnique({ where: { id: data.agentId }, select: { firstName: true, lastName: true } });
        if (agent) agentName = `${agent.firstName} ${agent.lastName}`;
      }

      await prisma.listing.create({
        data: {
          title: data.title.trim(),
          listingNo: `LST-${Date.now()}`,
          listingType: data.listingType as any,
          status: (data.status || "ACTIVE") as any,
          askingPrice: parseFloat(data.askingPrice),
          currency: data.currency || "TRY",
          monthlyRent: data.monthlyRent ? parseFloat(data.monthlyRent) : null,
          deposit: data.deposit ? parseFloat(data.deposit) : null,
          isNegotiable: data.isNegotiable === "true",
          isPublic: data.isPublic !== "false",
          description: data.description?.trim() || null,
          agentName: agentName || "—",
          ...(data.agentId ? { agent: { connect: { id: data.agentId } } } : {}),
          property: { connect: { id: data.propertyId } },
          agency: { connect: { id: agencyId } },
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createListing:", e);
      return { ok: false, error: "İlan oluşturulamadı." };
    }
  }

  // PUT — İlan güncelle
  async function updateListing(id: string, data: Partial<{
    title: string; listingType: string; status: string; askingPrice: string;
    currency: string; monthlyRent: string; deposit: string;
    isNegotiable: string; isPublic: string; description: string; agentName: string;
  }>): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.listing.update({
        where: { id },
        data: {
          title: data.title?.trim(),
          listingType: data.listingType as any,
          status: data.status as any,
          askingPrice: data.askingPrice ? parseFloat(data.askingPrice) : undefined,
          currency: data.currency,
          monthlyRent: data.monthlyRent ? parseFloat(data.monthlyRent) : null,
          deposit: data.deposit ? parseFloat(data.deposit) : null,
          isNegotiable: data.isNegotiable === "true",
          isPublic: data.isPublic !== "false",
          description: data.description?.trim() || null,
          agentName: data.agentName?.trim() || undefined,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateListing:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — İlan sil
  async function deleteListing(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.listing.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("deleteListing:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <ListingManagementUI
      listings={listings as any}
      properties={properties as any}
      agents={agents}
      createListing={createListing}
      updateListing={updateListing}
      deleteListing={deleteListing}
    />
  );
}
