import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import LogsUI from "./LogsUI";

const PATH = "/realestate/dashboard/logs";

export default async function LogsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET — son 500 log, en yeni önce
  const logs = await prisma.agencyLog.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // DELETE — tek log sil
  async function deleteLog(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyLog.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agencyLog.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch {
      return { ok: false, error: "Silme başarısız." };
    }
  }

  // DELETE — tüm logları temizle
  async function clearAllLogs(): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.agencyLog.deleteMany({ where: { agencyId } });
      revalidatePath(PATH);
      return { ok: true };
    } catch {
      return { ok: false, error: "Temizleme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Aktivite Logları</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Sistem genelindeki tüm işlemler otomatik olarak kaydedilir.
      </p>
      <LogsUI
        logs={logs as any}
        deleteLog={deleteLog}
        clearAllLogs={clearAllLogs}
      />
    </div>
  );
}
