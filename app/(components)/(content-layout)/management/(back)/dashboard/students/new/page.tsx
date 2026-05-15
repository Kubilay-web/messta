import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Card, CardContent } from "../../../../components/ui/card";
import { UserPlus, Users } from "lucide-react";
import ClientForm, { ClientFormData } from "../../../../components/dashboard/forms/clients/client-form";

const PATH = "/management/dashboard/students";

export default async function NewClientPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true, agency: { select: { id: true, name: true } } },
  });

  const agencyId = dbUser?.agency?.id;
  const agencyName = dbUser?.agency?.name ?? "";

  if (!agencyId) redirect("/management/school-onboarding");

  // GET — ajanstaki ajanlar (atama için)
  const agents = await prisma.agent.findMany({
    where: { agencyId },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  // POST — yeni müşteri oluştur (User + PropertyClient transaction)
  async function createClientAction(
    data: ClientFormData
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      // Duplicate kontrolleri
      const [emailClient, phoneClient, ninClient, emailUser] = await Promise.all([
        prisma.propertyClient.findUnique({ where: { email: data.email } }),
        prisma.propertyClient.findUnique({ where: { phone: data.phone } }),
        prisma.propertyClient.findUnique({ where: { NIN: data.NIN } }),
        prisma.user.findUnique({ where: { email: data.email } }),
      ]);
      if (emailClient || emailUser) return { ok: false, error: "Bu e-posta adresi zaten kullanımda." };
      if (phoneClient)             return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (ninClient)               return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };

      const hashedPassword = await hash(data.password);

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
            roleGayrimenkul: "CLIENT" as any,
            agencyId: agencyId!,
            agencyName,
            role: "USER",
          },
        });

        await tx.propertyClient.create({
          data: {
            userId: newUser.id,
            title: data.title,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            whatsappNo: data.whatsappNo || null,
            gender: data.gender,
            dob: new Date(data.dob),
            nationality: data.nationality,
            NIN: data.NIN,
            contactMethod: data.contactMethod,
            address: data.address,
            occupation: data.occupation || null,
            password: data.password,
            isBuyer:    data.isBuyer    ?? true,
            isSeller:   data.isSeller   ?? false,
            isTenant:   data.isTenant   ?? false,
            isLandlord: data.isLandlord ?? false,
            minBudget: data.minBudget ? parseFloat(data.minBudget) : null,
            maxBudget: data.maxBudget ? parseFloat(data.maxBudget) : null,
            notes: data.notes || null,
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
      console.error("createClient:", error);
      return { ok: false, error: "Müşteri oluşturulamadı. Lütfen tekrar deneyin." };
    }
  }

  // PUT — müşteri güncelle
  async function updateClientAction(
    id: string,
    data: Partial<ClientFormData>
  ): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.propertyClient.update({ where: { id }, data: data as any });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("updateClient:", e);
      return { ok: false };
    }
  }

  // DELETE — müşteri sil (User cascade ile silinir)
  async function deleteClientAction(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.propertyClient.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteClient:", e);
      return { ok: false };
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger
            value="single"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">New Client</span>
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">Bulk Import</span>
          </TabsTrigger>
        </TabsList>

        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <TabsContent value="single" className="mt-0">
              <ClientForm onSubmit={createClientAction} />
            </TabsContent>
            <TabsContent value="bulk" className="mt-0">
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-sm text-muted-foreground gap-2">
                <Users className="h-10 w-10 text-gray-300" />
                <p className="font-medium">Bulk Client Import</p>
                <p className="text-xs max-w-xs">
                  CSV/Excel import feature coming soon. Use the "New Client" tab to add clients one by one.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
