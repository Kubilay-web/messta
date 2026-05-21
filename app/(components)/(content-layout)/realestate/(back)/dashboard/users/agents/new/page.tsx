import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import AgentForm, { AgentFormData } from "../../../../../components/dashboard/forms/users/agent-form";
import Link from "next/link";
import { AlertTriangle, Building2 } from "lucide-react";

const PATH = "/realestate/dashboard/users/agents";

export default async function NewAgentPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true, name: true } } },
  });

  const agencyId   = dbUser?.agency?.id;
  const agencyName = dbUser?.agency?.name ?? "";
  if (!agencyId) redirect("/realestate/onboarding");

  const departments = await prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // ── POST — Hızlı departman oluştur ────────────────────────────────────────

  async function createDepartment(fd: FormData) {
    "use server";
    const name = (fd.get("deptName") as string)?.trim();
    if (!name) return;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    await prisma.agencyDepartment.create({
      data: { name, slug, agencyId: agencyId! },
    });
    revalidatePath(PATH + "/new");
  }

  // ── POST — Danışman oluştur ───────────────────────────────────────────────

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
      if (phoneAgent)              return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (ninAgent)                return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
      if (!data.departmentId)      return { ok: false, error: "Lütfen bir departman seçin." };

      const hashedPassword = await hash(data.password);
      const employeeId     = `AGT-${Date.now()}`;

      const dept = await prisma.agencyDepartment.findUnique({
        where: { id: data.departmentId },
        select: { name: true },
      });

      await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username:     data.email,
            email:        data.email,
            name:         `${data.firstName} ${data.lastName}`,
            firstName:    data.firstName,
            lastName:     data.lastName,
            phone:        data.phone || null,
            passwordHash: hashedPassword,
            roleGayrimenkul: "AGENT" as any,
            agencyId:     agencyId!,
            agencyName,
            role:         "USER",
          },
        });

        await tx.agent.create({
          data: {
            userId:         newUser.id,
            title:          data.title,
            firstName:      data.firstName,
            lastName:       data.lastName,
            email:          data.email,
            phone:          data.phone,
            whatsappNo:     data.whatsappNo || null,
            dateOfBirth:    data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender:         data.gender as any,
            imageUrl:       data.imageUrl || null,
            NIN:            data.NIN,
            password:       data.password,
            contactMethod:  data.contactMethod,
            employeeId,
            dateOfJoining:  new Date(data.dateOfJoining),
            designation:    data.designation,
            departmentId:   data.departmentId,
            departmentName: dept?.name ?? "",
            licenseNo:      data.licenseNo || null,
            qualification:  data.qualification,
            experience:     data.experience ? parseInt(data.experience) : null,
            bio:            data.bio || null,
            skills:         data.skills || null,
            commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
            agencyId:       agencyId!,
            agencyName,
          } as any,
        });
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (error: any) {
      if (error?.code === "P2002") {
        const field = error?.meta?.target?.[0] ?? "alan";
        return { ok: false, error: `${field} zaten mevcut.` };
      }
      console.error("createAgent:", error);
      return { ok: false, error: "Danışman oluşturulamadı. Lütfen tekrar deneyin." };
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={PATH} className="hover:text-blue-600 transition-colors">Danışmanlar</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Yeni Danışman</span>
      </div>

      {/* Departman uyarısı + hızlı oluştur */}
      {departments.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Departman Bulunamadı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Danışman oluşturmadan önce en az bir departman tanımlamanız gerekiyor.
              Aşağıdan hızlıca oluşturabilirsiniz.
            </p>
            <form action={createDepartment} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <input
                  name="deptName"
                  required
                  placeholder="Departman adı (ör. Satış, Kiralama)"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-amber-300 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors shrink-0"
              >
                Departman Oluştur
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Departman listesi — varsa küçük özet */}
      {departments.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
          <span className="font-medium text-gray-700 dark:text-gray-300">Departmanlar:</span>
          {departments.map((d) => (
            <span key={d.id} className="bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-xs">
              {d.name}
            </span>
          ))}
        </div>
      )}

      {/* Agent Form */}
      <Card className="border-t-4 border-blue-600 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {departments.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Departman oluşturduktan sonra bu form aktif olacak.
            </div>
          ) : (
            <AgentForm
              onSubmit={createAgentAction}
              departments={departments}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
