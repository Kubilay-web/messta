import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import AgentManagementUI from "./AgentManagementUI";
import type { AgentFormData } from "../../../../components/dashboard/forms/users/agent-form";

const PATH = "/management/dashboard/users/teachers";

async function getCtx(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true, name: true } } },
  });
  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/management/school-onboarding");
  return { agencyId: agencyId!, agencyName: dbUser?.agency?.name ?? "" };
}

export default async function AgentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { agencyId, agencyName } = await getCtx(user.id);

  // GET — danışmanlar + departmanlar
  const [agents, departments] = await Promise.all([
    prisma.agent.findMany({
      where: { agencyId },
      select: {
        id: true, title: true, firstName: true, lastName: true,
        email: true, phone: true, whatsappNo: true, designation: true,
        departmentName: true, departmentId: true, imageUrl: true,
        isActive: true, gender: true, NIN: true, contactMethod: true,
        dateOfBirth: true, dateOfJoining: true, licenseNo: true,
        qualification: true, experience: true, commissionRate: true,
        bio: true, skills: true,
      },
      orderBy: { firstName: "asc" },
    }),
    prisma.agencyDepartment.findMany({
      where: { agencyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // POST — Danışman oluştur
  async function createAgent(data: AgentFormData): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const [emailConflict, phoneConflict, ninConflict] = await Promise.all([
        prisma.agent.findUnique({ where: { email: data.email } }),
        prisma.agent.findUnique({ where: { phone: data.phone } }),
        prisma.agent.findUnique({ where: { NIN: data.NIN } }),
      ]);
      if (emailConflict) return { ok: false, error: "Bu e-posta zaten kullanımda." };
      if (phoneConflict) return { ok: false, error: "Bu telefon zaten kayıtlı." };
      if (ninConflict)   return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
      if (!data.departmentId) return { ok: false, error: "Departman seçin." };

      const [hashedPassword, dept] = await Promise.all([
        hash(data.password),
        prisma.agencyDepartment.findUnique({ where: { id: data.departmentId }, select: { name: true } }),
      ]);

      await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username: data.email, email: data.email,
            name: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName, lastName: data.lastName,
            phone: data.phone || null, passwordHash: hashedPassword,
            roleGayrimenkul: "AGENT" as any,
            agencyId, agencyName, role: "USER",
          },
        });
        await tx.agent.create({
          data: {
            userId: newUser.id, title: data.title,
            firstName: data.firstName, lastName: data.lastName,
            email: data.email, phone: data.phone,
            whatsappNo: data.whatsappNo || null,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender as any, imageUrl: data.imageUrl || null,
            NIN: data.NIN, password: data.password,
            contactMethod: data.contactMethod,
            employeeId: `AGT-${Date.now()}`,
            dateOfJoining: new Date(data.dateOfJoining),
            designation: data.designation, departmentId: data.departmentId,
            departmentName: dept?.name ?? "", licenseNo: data.licenseNo || null,
            qualification: data.qualification,
            experience: data.experience ? parseInt(data.experience) : null,
            bio: data.bio || null, skills: data.skills || null,
            commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
            agencyId, agencyName,
          } as any,
        });
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      if (e?.code === "P2002") return { ok: false, error: `${e?.meta?.target?.[0] ?? "Alan"} zaten mevcut.` };
      console.error("createAgent:", e);
      return { ok: false, error: "Danışman oluşturulamadı." };
    }
  }

  // PUT — Danışman güncelle
  async function updateAgent(id: string, data: Partial<AgentFormData>): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const dept = data.departmentId
        ? await prisma.agencyDepartment.findUnique({ where: { id: data.departmentId }, select: { name: true } })
        : null;

      await prisma.agent.update({
        where: { id },
        data: {
          title: data.title, firstName: data.firstName, lastName: data.lastName,
          phone: data.phone, whatsappNo: data.whatsappNo || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender as any, imageUrl: data.imageUrl || null,
          contactMethod: data.contactMethod, designation: data.designation,
          ...(data.departmentId ? { departmentId: data.departmentId, departmentName: dept?.name ?? "" } : {}),
          dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
          licenseNo: data.licenseNo || null, qualification: data.qualification,
          experience: data.experience ? parseInt(data.experience) : null,
          bio: data.bio || null, skills: data.skills || null,
          commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
        } as any,
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateAgent:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Danışman sil (User cascade → Agent da silinir)
  async function deleteAgent(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      const agent = await prisma.agent.findUnique({ where: { id }, select: { userId: true } });
      if (agent?.userId) await prisma.user.delete({ where: { id: agent.userId } });
      else await prisma.agent.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteAgent:", e);
      return { ok: false };
    }
  }

  // POST — Hızlı departman oluştur
  async function createDepartment(fd: FormData) {
    "use server";
    const name = (fd.get("deptName") as string)?.trim();
    if (!name) return;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    await prisma.agencyDepartment.create({ data: { name, slug, agencyId } });
    revalidatePath(PATH);
  }

  return (
    <AgentManagementUI
      agents={agents as any}
      departments={departments}
      createAgent={createAgent}
      updateAgent={updateAgent}
      deleteAgent={deleteAgent}
      createDepartment={createDepartment}
    />
  );
}
