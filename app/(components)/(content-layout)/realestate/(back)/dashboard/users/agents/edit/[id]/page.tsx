import { validateRequest } from "@/app/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import AgentForm, { AgentFormData } from "../../../../../../components/dashboard/forms/users/agent-form";
import Link from "next/link";

const PATH = "/realestate/dashboard/users/agents";

// ── Agency guard ───────────────────────────────────────────────────────────────

async function getAgencyCtx(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true, name: true } } },
  });
  if (!dbUser?.agency?.id) redirect("/realestate/onboarding");
  return dbUser.agency!;
}

// ── PUT ────────────────────────────────────────────────────────────────────────

async function updateAgent(
  id: string,
  data: AgentFormData
): Promise<{ ok: boolean; error?: string }> {
  "use server";
  try {
    const dept = data.departmentId
      ? await prisma.agencyDepartment.findUnique({
          where: { id: data.departmentId },
          select: { name: true },
        })
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.agent.update({
        where: { id },
        data: {
          title:          data.title,
          firstName:      data.firstName,
          lastName:       data.lastName,
          phone:          data.phone,
          whatsappNo:     data.whatsappNo || null,
          dateOfBirth:    data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender:         data.gender as any,
          imageUrl:       data.imageUrl || null,
          NIN:            data.NIN,
          contactMethod:  data.contactMethod,
          dateOfJoining:  new Date(data.dateOfJoining),
          designation:    data.designation,
          ...(data.departmentId && {
            departmentId:   data.departmentId,
            departmentName: dept?.name ?? "",
          }),
          licenseNo:      data.licenseNo || null,
          qualification:  data.qualification,
          experience:     data.experience ? parseInt(data.experience) : null,
          bio:            data.bio || null,
          skills:         data.skills || null,
          commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
        },
      });

      // Sync User display fields
      const agent = await tx.agent.findUnique({ where: { id }, select: { userId: true } });
      if (agent?.userId) {
        await tx.user.update({
          where: { id: agent.userId },
          data: {
            name:      `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName:  data.lastName,
            phone:     data.phone || null,
          },
        });
      }
    });

    revalidatePath(PATH);
    return { ok: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0] ?? "alan";
      return { ok: false, error: `${field} zaten mevcut.` };
    }
    console.error("updateAgent:", error);
    return { ok: false, error: "Güncelleme başarısız. Lütfen tekrar deneyin." };
  }
}

// ── PAGE (GET) ─────────────────────────────────────────────────────────────────

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const { id } = await params;

  const agency = await getAgencyCtx(user.id);

  const [agent, departments] = await Promise.all([
    prisma.agent.findUnique({
      where: { id },
      select: {
        title: true, firstName: true, lastName: true,
        email: true, phone: true, whatsappNo: true,
        gender: true, dateOfBirth: true, NIN: true,
        contactMethod: true, designation: true,
        departmentId: true, dateOfJoining: true,
        licenseNo: true, qualification: true,
        experience: true, commissionRate: true,
        bio: true, skills: true, imageUrl: true,
        isActive: true, employeeId: true,
      },
    }),
    prisma.agencyDepartment.findMany({
      where: { agencyId: agency.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!agent) notFound();

  const updateAction = updateAgent.bind(null, id);

  const initialData: Partial<AgentFormData> = {
    title:          agent.title,
    firstName:      agent.firstName,
    lastName:       agent.lastName,
    email:          agent.email,
    phone:          agent.phone,
    whatsappNo:     agent.whatsappNo ?? "",
    gender:         agent.gender,
    dateOfBirth:    agent.dateOfBirth
      ? new Date(agent.dateOfBirth).toISOString().split("T")[0]
      : "",
    NIN:            agent.NIN,
    contactMethod:  agent.contactMethod,
    designation:    agent.designation,
    departmentId:   agent.departmentId,
    dateOfJoining:  new Date(agent.dateOfJoining).toISOString().split("T")[0],
    licenseNo:      agent.licenseNo ?? "",
    qualification:  agent.qualification,
    experience:     agent.experience != null ? String(agent.experience) : "",
    commissionRate: agent.commissionRate != null ? String(agent.commissionRate) : "2.5",
    bio:            agent.bio ?? "",
    skills:         agent.skills ?? "",
    imageUrl:       agent.imageUrl ?? "",
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={PATH} className="hover:text-blue-600 transition-colors">Danışmanlar</Link>
        <span>/</span>
        <Link href={`${PATH}/view/${id}`} className="hover:text-blue-600 transition-colors">
          {agent.firstName} {agent.lastName}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Düzenle</span>
      </div>

      {/* Status banner */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Danışman Düzenle</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {agent.title} {agent.firstName} {agent.lastName} · {agent.employeeId}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          agent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {agent.isActive ? "Aktif" : "Pasif"}
        </span>
      </div>

      {/* Form */}
      <Card className="border-t-4 border-blue-600 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <AgentForm
            onSubmit={updateAction}
            initialData={initialData}
            editingId={id}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
