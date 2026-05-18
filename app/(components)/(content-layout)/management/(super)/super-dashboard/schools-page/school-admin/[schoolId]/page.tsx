import { validateRequest } from "@/app/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/db";
import { hash } from "@node-rs/argon2";
import AgencyAdminForm, {
  AgencyAdminProps,
} from "../../../../../components/dashboard/forms/school/agency-admin-form";
import { Card, CardContent } from "../../../../../components/ui/card";

export default async function Page({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const agencyId = (await params).schoolId;

  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, name: true },
  });

  if (!agency) return notFound();

  const aid = agency.id;
  const aname = agency.name;

  async function createAgencyAdminAction(
    data: AgencyAdminProps
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const passwordHash = await hash(data.password);
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          passwordHash,
          agencyId: aid,
          agencyName: aname,
          roleGayrimenkul: "ADMIN",
        },
      });
      revalidatePath("/management/super-dashboard/schools-page");
      return { ok: true };
    } catch (error: any) {
      console.error("createAgencyAdmin:", error);
      if (error?.code === "P2002")
        return { ok: false, error: "This email is already in use." };
      return { ok: false, error: "Failed to create admin." };
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-16">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <AgencyAdminForm
            agencyId={agency.id}
            agencyName={agency.name}
            onSubmit={createAgencyAdminAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
