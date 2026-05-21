import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "../../../../../lib/db";
import AgencyOnboardingForm, { AgencyProps } from "../../components/dashboard/forms/school/school-onboarding-form";
import { Card, CardContent } from "../../components/ui/card";

// POST — yeni ajans oluştur ve kullanıcıya bağla
async function createAgencyAction(
  data: AgencyProps
): Promise<{ ok: boolean; id?: string; slug?: string; error?: string }> {
  "use server";
  try {
    const { user } = await validateRequest();
    if (!user) return { ok: false, error: "Unauthorized" };

    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now()}`;

    const agency = await prisma.agency.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        primaryEmail: data.primaryEmail || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        taxNumber: data.taxNumber || null,
        licenseNo: data.licenseNo || null,
        slug,
      },
    });

    // Kullanıcıyı ajansa bağla ve ADMIN rolü ata
    await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyId: agency.id,
        agencyName: agency.name,
        roleGayrimenkul: "SUPER_ADMIN",
      },
    });

    revalidatePath("/management/school-onboarding");
    return { ok: true, id: agency.id, slug: agency.slug };
  } catch (error: any) {
    console.error("createAgency:", error);
    return { ok: false, error: "Failed to create agency. Please try again." };
  }
}

// PUT — mevcut ajansı güncelle
async function updateAgencyAction(
  id: string,
  data: Partial<AgencyProps>
): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.agency.update({ where: { id }, data });
    revalidatePath("/management/school-onboarding");
    return { ok: true };
  } catch (error) {
    console.error("updateAgency:", error);
    return { ok: false };
  }
}

// DELETE — ajansı sil (super admin kullanımı)
async function deleteAgencyAction(id: string): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.agency.delete({ where: { id } });
    revalidatePath("/management/school-onboarding");
    return { ok: true };
  } catch (error) {
    console.error("deleteAgency:", error);
    return { ok: false };
  }
}

export default async function AgencyOnboardingPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  // GET — kullanıcı zaten bir ajansa bağlıysa dashboard'a yönlendir
  if (user.agencyId) {
    redirect("/management/dashboard");
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl">
        <Card className="border-t-4 border-blue-600 shadow-md">
          <CardContent className="p-6 sm:p-8">
            <AgencyOnboardingForm onSubmit={createAgencyAction} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
