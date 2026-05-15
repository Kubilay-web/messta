import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { Card, CardContent } from "../../../../../components/ui/card";
import AgentForm, { AgentFormData } from "../../../../../components/dashboard/forms/users/agent-form";

const PATH = "/management/dashboard/users/parents";

export default async function NewAgentPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true, name: true } } },
  });

  const agencyId = dbUser?.agency?.id;
  const agencyName = dbUser?.agency?.name ?? "";

  if (!agencyId) redirect("/management/school-onboarding");

  const departments = await prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function createAgentAction(data: AgentFormData): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const [emailAgent, phoneAgent, ninAgent, emailUser] = await Promise.all([
        prisma.agent.findUnique({ where: { email: data.email } }),
        prisma.agent.findUnique({ where: { phone: data.phone } }),
        prisma.agent.findUnique({ where: { NIN: data.NIN } }),
        prisma.user.findUnique({ where: { email: data.email } }),
      ]);

      if (emailAgent || emailUser) return { ok: false, error: "Bu e-posta adresi zaten kullanımda." };
      if (phoneAgent) return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (ninAgent) return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
      if (!data.departmentId) return { ok: false, error: "Lütfen bir departman seçin." };

      const hashedPassword = await hash(data.password);
      const employeeId = `AGT-${Date.now()}`;

      const dept = await prisma.agencyDepartment.findUnique({
        where: { id: data.departmentId },
        select: { name: true },
      });

      await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username: data.email,
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
            passwordHash: hashedPassword,
            roleGayrimenkul: "AGENT" as any,
            agencyId: agencyId!,
            agencyName,
            role: "USER",
          },
        });

        await tx.agent.create({
          data: {
            userId: newUser.id,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            whatsappNo: data.whatsappNo || null,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender as any,
            imageUrl: data.imageUrl || null,
            NIN: data.NIN,
            password: data.password,
            contactMethod: data.contactMethod,
            employeeId,
            dateOfJoining: new Date(data.dateOfJoining),
            designation: data.designation,
            departmentId: data.departmentId,
            departmentName: dept?.name ?? "",
            licenseNo: data.licenseNo || null,
            qualification: data.qualification,
            experience: data.experience ? parseInt(data.experience) : null,
            bio: data.bio || null,
            skills: data.skills || null,
            commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
            agencyId: agencyId!,
            agencyName,
          } as any,
        });
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (error: any) {
      if (error?.code === "P2002") {
        const field = error?.meta?.target?.[0] ?? "field";
        return { ok: false, error: `${field} already exists.` };
      }
      console.error("createAgent:", error);
      return { ok: false, error: "Danışman oluşturulamadı. Lütfen tekrar deneyin." };
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <Card className="border-t-4 border-blue-600 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <AgentForm
            onSubmit={createAgentAction}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
