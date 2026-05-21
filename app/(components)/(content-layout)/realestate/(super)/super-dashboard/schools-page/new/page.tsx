import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/db";
import AgencyOnboardingForm, {
  AgencyProps,
} from "../../../../components/dashboard/forms/school/school-onboarding-form";
import { Card, CardContent } from "../../../../components/ui/card";

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        agencyId: agency.id,
        agencyName: agency.name,
        roleGayrimenkul: "SUPER_ADMIN",
      },
    });

    revalidatePath("/management/super-dashboard/schools-page");
    return { ok: true, id: agency.id, slug: agency.slug };
  } catch (error: any) {
    console.error("createAgency:", error);
    return { ok: false, error: "Failed to create agency. Please try again." };
  }
}

export default async function page() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (user.roleGayrimenkul !== "SUPER_ADMIN") redirect("/management/dashboard");

  return (
    <Card className="border-t-4 border-blue-600 shadow">
      <CardContent className="p-6">
        <AgencyOnboardingForm onSubmit={createAgencyAction} />
      </CardContent>
    </Card>
  );
}
