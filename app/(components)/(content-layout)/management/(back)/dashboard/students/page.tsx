import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ClientListing from "../../../components/dashboard/ClientListing";

const PATH = "/management/dashboard/students";

export default async function ClientsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true, name: true } } },
  });

  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/management/school-onboarding");

  // GET — tüm müşterileri çek
  const clients = await prisma.propertyClient.findMany({
    where: { agencyId },
    select: {
      id: true, title: true, firstName: true, lastName: true,
      email: true, phone: true, imageUrl: true, gender: true,
      nationality: true, occupation: true, address: true,
      isBuyer: true, isSeller: true, isTenant: true, isLandlord: true,
      minBudget: true, maxBudget: true, currency: true, notes: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // DELETE — müşteriyi ve kullanıcı hesabını sil
  async function deleteClientAction(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      const client = await prisma.propertyClient.findUnique({
        where: { id },
        select: { userId: true },
      });
      // User'ı silince PropertyClient cascade ile silinir
      if (client?.userId) {
        await prisma.user.delete({ where: { id: client.userId } });
      } else {
        await prisma.propertyClient.delete({ where: { id } });
      }
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteClient:", e);
      return { ok: false };
    }
  }

  // PUT — hızlı not güncelleme (satır içi)
  async function updateNotesAction(
    id: string, notes: string
  ): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.propertyClient.update({ where: { id }, data: { notes } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("updateNotes:", e);
      return { ok: false };
    }
  }

  return (
    <ClientListing
      clients={clients as any}
      onDelete={deleteClientAction}
      onUpdateNotes={updateNotesAction}
    />
  );
}
