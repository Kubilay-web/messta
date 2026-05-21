import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import VisitManagementUI from "./VisitManagementUI";

const PATH = "/realestate/dashboard/estates/exams";

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
export default async function VisitsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const agencyId = await getAgencyId(user.id);

  const [visits, properties, agents, clients] = await Promise.all([
    prisma.propertyVisit.findMany({
      where: { property: { agencyId } },
      select: {
        id: true, scheduledAt: true, completedAt: true,
        status: true, notes: true, feedback: true, rating: true,
        createdAt: true,
        property: { select: { title: true, city: true } },
        agent:    { select: { firstName: true, lastName: true } },
        client:   { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.propertyRealEstate.findMany({
      where: { agencyId },
      select: { id: true, title: true, city: true },
      orderBy: { title: "asc" },
    }),
    prisma.agent.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.propertyClient.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  // POST — Gezi oluştur
  async function createVisit(data: {
    propertyId: string; agentId: string; clientId: string;
    scheduledAt: string; status: string;
    notes: string; feedback: string; rating: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.propertyId) return { ok: false, error: "Mülk seçin." };
      if (!data.agentId)    return { ok: false, error: "Danışman seçin." };
      if (!data.clientId)   return { ok: false, error: "Müşteri seçin." };
      if (!data.scheduledAt) return { ok: false, error: "Tarih zorunlu." };

      await prisma.propertyVisit.create({
        data: {
          scheduledAt: new Date(data.scheduledAt),
          status: (data.status || "SCHEDULED") as any,
          notes:    data.notes?.trim()    || null,
          feedback: data.feedback?.trim() || null,
          rating:   data.rating ? parseInt(data.rating) : null,
          property: { connect: { id: data.propertyId } },
          agent:    { connect: { id: data.agentId } },
          client:   { connect: { id: data.clientId } },
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createVisit:", e);
      return { ok: false, error: "Gezi oluşturulamadı." };
    }
  }

  // PUT — Gezi güncelle
  async function updateVisit(id: string, data: {
    scheduledAt?: string; status?: string;
    notes?: string; feedback?: string; rating?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.propertyVisit.update({
        where: { id },
        data: {
          ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
          ...(data.status ? { status: data.status as any } : {}),
          notes:    data.notes?.trim()    || null,
          feedback: data.feedback?.trim() || null,
          rating:   data.rating ? parseInt(data.rating) : null,
          ...(data.status === "COMPLETED" ? { completedAt: new Date() } : {}),
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateVisit:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Gezi sil
  async function deleteVisit(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.propertyVisit.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteVisit:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <VisitManagementUI
      visits={visits as any}
      properties={properties}
      agents={agents}
      clients={clients}
      createVisit={createVisit}
      updateVisit={updateVisit}
      deleteVisit={deleteVisit}
    />
  );
}
