import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import MessagesTable from "./messages-table";

const PATH = "/realestate/dashboard/communication/website-messages";

export default async function WebsiteMessagesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET
  const messages = await prisma.agencyContactMessage.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, fullName: true, email: true,
      phone: true, subject: true, message: true,
      createdAt: true,
    },
  });

  // DELETE
  async function deleteMessage(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyContactMessage.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Mesaj bulunamadı." };
      await prisma.agencyContactMessage.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteMessage:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Website Mesajları</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Web sitesi iletişim formundan gelen mesajları görüntüleyin ve yönetin.
      </p>
      <MessagesTable messages={messages as any} deleteMessage={deleteMessage} />
    </div>
  );
}
