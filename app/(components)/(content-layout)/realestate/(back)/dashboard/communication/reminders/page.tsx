import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import RemindersUI from "./RemindersUI";

const PATH = "/realestate/dashboard/communication/reminders";

export default async function RemindersPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET
  const reminders = await prisma.agencyReminder.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
  });

  // POST
  async function createReminder(data: {
    subject: string; message: string;
    recipient: string; from: string;
    name?: string; email?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.subject?.trim()) return { ok: false, error: "Konu zorunlu." };
      if (!data.message?.trim()) return { ok: false, error: "Mesaj zorunlu." };
      await prisma.agencyReminder.create({
        data: {
          subject:   data.subject.trim(),
          message:   data.message.trim(),
          recipient: data.recipient as any,
          from:      data.from as any,
          name:      data.name?.trim()  || null,
          email:     data.email?.trim() || null,
          agency:    { connect: { id: agencyId } },
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createReminder:", e);
      return { ok: false, error: "Oluşturma başarısız." };
    }
  }

  // PUT
  async function updateReminder(id: string, data: {
    subject?: string; message?: string;
    recipient?: string; from?: string;
    name?: string; email?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agencyReminder.update({
        where: { id },
        data: {
          ...(data.subject   ? { subject:   data.subject.trim() }   : {}),
          ...(data.message   ? { message:   data.message.trim() }   : {}),
          ...(data.recipient ? { recipient: data.recipient as any } : {}),
          ...(data.from      ? { from:      data.from as any }      : {}),
          name:  data.name?.trim()  || null,
          email: data.email?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateReminder:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE
  async function deleteReminder(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agencyReminder.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteReminder:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Hatırlatmalar</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Müşteri, danışman ve yönetim için hatırlatma mesajları oluşturun ve yönetin.
      </p>
      <RemindersUI
        reminders={reminders as any}
        createReminder={createReminder}
        updateReminder={updateReminder}
        deleteReminder={deleteReminder}
      />
    </div>
  );
}
