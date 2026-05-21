import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import DeptManagementUI from "./DeptManagementUI";

const PATH = "/realestate/dashboard/estates/departments";

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
export default async function DepartmentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const agencyId = await getAgencyId(user.id);

  const departments = await prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: {
      id: true, name: true, slug: true,
      managerName: true, budget: true, budgetYear: true,
      createdAt: true,
      _count: { select: { agents: true } },
    },
    orderBy: { name: "asc" },
  });

  // POST — Departman oluştur
  async function createDept(data: {
    name: string; managerName: string; budget: string; budgetYear: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const name = data.name?.trim();
      if (!name) return { ok: false, error: "Departman adı zorunlu." };
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
      await prisma.agencyDepartment.create({
        data: {
          name, slug, agencyId,
          managerName: data.managerName?.trim() || null,
          budget: data.budget ? parseFloat(data.budget) : null,
          budgetYear: data.budgetYear?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createDept:", e);
      return { ok: false, error: "Departman oluşturulamadı." };
    }
  }

  // PUT — Departman güncelle
  async function updateDept(id: string, data: {
    name: string; managerName: string; budget: string; budgetYear: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const name = data.name?.trim();
      if (!name) return { ok: false, error: "Departman adı zorunlu." };
      await prisma.agencyDepartment.update({
        where: { id },
        data: {
          name,
          managerName: data.managerName?.trim() || null,
          budget: data.budget ? parseFloat(data.budget) : null,
          budgetYear: data.budgetYear?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateDept:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Departman sil (danışmanı varsa engelle)
  async function deleteDept(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const count = await prisma.agent.count({ where: { departmentId: id } });
      if (count > 0) return { ok: false, error: "Bu departmanda danışman var, önce danışmanları taşıyın." };
      await prisma.agencyDepartment.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteDept:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <DeptManagementUI
      departments={departments as any}
      createDept={createDept}
      updateDept={updateDept}
      deleteDept={deleteDept}
    />
  );
}
