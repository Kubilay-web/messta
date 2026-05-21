import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcrypt";
import AgentFormUI from "./AgentFormUI";

const PATH = "/realestate/dashboard/users/teachers";

export default async function NewAgentPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true, agencyName: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;
  const agencyName = dbUser.agencyName ?? "";

  const departments = await prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  async function createAgent(data: {
    title: string; firstName: string; lastName: string;
    email: string; phone: string; whatsappNo?: string;
    dateOfBirth?: string; gender: string; imageUrl?: string;
    NIN: string; password: string; contactMethod: string;
    employeeId: string; dateOfJoining: string; designation: string;
    departmentId: string;
    licenseNo?: string; qualification: string;
    experience?: string; bio?: string; skills?: string;
    commissionRate?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.firstName?.trim() || !data.lastName?.trim())
        return { ok: false, error: "Ad ve soyad zorunlu." };
      if (!data.email?.trim())
        return { ok: false, error: "E-posta zorunlu." };
      if (!data.NIN?.trim())
        return { ok: false, error: "TC Kimlik No zorunlu." };
      if (!data.employeeId?.trim())
        return { ok: false, error: "Personel ID zorunlu." };
      if (!data.password || data.password.length < 6)
        return { ok: false, error: "Şifre en az 6 karakter olmalı." };
      if (!data.dateOfJoining)
        return { ok: false, error: "İşe başlama tarihi zorunlu." };

      const dept = await prisma.agencyDepartment.findFirst({
        where: { id: data.departmentId, agencyId },
      });
      if (!dept) return { ok: false, error: "Departman bulunamadı." };

      const hashed = await hash(data.password, 10);

      await prisma.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          name: `${data.firstName.trim()} ${data.lastName.trim()}`,
          hashedPassword: hashed,
          agencyId,
          agencyName,
          roleGayrimenkul: "AGENT",
          agent: {
            create: {
              title: data.title.trim(),
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              email: data.email.trim().toLowerCase(),
              phone: data.phone.trim(),
              whatsappNo: data.whatsappNo?.trim() || null,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
              gender: data.gender as any,
              imageUrl: data.imageUrl?.trim() || null,
              NIN: data.NIN.trim(),
              password: hashed,
              contactMethod: data.contactMethod,
              employeeId: data.employeeId.trim(),
              dateOfJoining: new Date(data.dateOfJoining),
              designation: data.designation.trim(),
              departmentId: data.departmentId,
              departmentName: dept.name,
              licenseNo: data.licenseNo?.trim() || null,
              qualification: data.qualification.trim(),
              experience: data.experience ? parseInt(data.experience) : null,
              bio: data.bio?.trim() || null,
              skills: data.skills?.trim() || null,
              commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : 2.5,
              agencyId,
              agencyName,
            },
          },
        },
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createAgent:", e);
      if (e.code === "P2002") {
        const field = e.meta?.target?.[0];
        if (field === "email")      return { ok: false, error: "Bu e-posta zaten kayıtlı." };
        if (field === "phone")      return { ok: false, error: "Bu telefon zaten kayıtlı." };
        if (field === "NIN")        return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };
        if (field === "employeeId") return { ok: false, error: "Bu Personel ID zaten kullanılıyor." };
      }
      return { ok: false, error: "Oluşturma başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Yeni Danışman Ekle</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Ajansa yeni bir emlak danışmanı kaydı oluşturun.
      </p>
      <AgentFormUI
        departments={departments}
        createAgent={createAgent}
        redirectPath={PATH}
      />
    </div>
  );
}
