import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import UsersUI from "./UsersUI";

const PATH = "/realestate/dashboard/users";

export default async function UsersPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET — tüm ajans kullanıcıları
  const users = await prisma.user.findMany({
    where: { agencyId },
    select: {
      id: true, name: true, email: true, phone: true,
      roleGayrimenkul: true, createdAt: true,
      agent: { select: { id: true, designation: true, departmentName: true, isActive: true, employeeId: true, imageUrl: true } },
      propertyClient: { select: { id: true, isBuyer: true, isSeller: true, isTenant: true, isLandlord: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // PUT — rol güncelle
  async function updateRole(id: string, role: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.user.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kullanıcı bulunamadı." };
      await prisma.user.update({ where: { id }, data: { roleGayrimenkul: role as any } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateRole:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // PUT — agent aktif/pasif
  async function toggleAgentActive(agentId: string, isActive: boolean): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, agencyId },
      });
      if (!agent) return { ok: false, error: "Danışman bulunamadı." };
      await prisma.agent.update({ where: { id: agentId }, data: { isActive } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("toggleAgentActive:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — kullanıcı sil
  async function deleteUser(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.user.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kullanıcı bulunamadı." };
      await prisma.user.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("deleteUser:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Kullanıcılar</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Ajansa bağlı tüm kullanıcıları yönetin.
      </p>
      <UsersUI
        users={users as any}
        updateRole={updateRole}
        toggleAgentActive={toggleAgentActive}
        deleteUser={deleteUser}
      />
    </div>
  );
}
