import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Card, CardContent } from "../../../../components/ui/card";
import { UserPlus, Users } from "lucide-react";
import ClientForm, { ClientFormData } from "../../../../components/dashboard/forms/clients/client-form";

const PATH = "/realestate/dashboard/students";

export default async function NewClientPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true, agency: { select: { id: true, name: true } } },
  });

  const agencyId   = dbUser?.agency?.id;
  const agencyName = dbUser?.agency?.name ?? "";

  if (!agencyId) redirect("/realestate/state-onboarding");

  // Ajans üyeleri + henüz ajansa eklenmemiş kullanıcılar — müşteri profili olmayanlar
  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [{ agencyId }, { agencyId: null }],
      propertyClient: { is: null },
    },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    orderBy: { firstName: "asc" },
    take: 200,
  });

  async function createClientAction(
    data: ClientFormData
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.userId) return { ok: false, error: "Lütfen mevcut bir kullanıcı seçin." };

      const [existingClient, emailConflict, phoneConflict, ninConflict] = await Promise.all([
        prisma.propertyClient.findUnique({ where: { userId: data.userId } }),
        data.email ? prisma.propertyClient.findUnique({ where: { email: data.email } }) : null,
        data.phone ? prisma.propertyClient.findUnique({ where: { phone: data.phone } }) : null,
        data.NIN   ? prisma.propertyClient.findUnique({ where: { NIN:   data.NIN   } }) : null,
      ]);

      if (existingClient) return { ok: false, error: "Bu kullanıcının zaten müşteri kaydı var." };
      if (emailConflict)  return { ok: false, error: "Bu e-posta adresi zaten kayıtlı." };
      if (phoneConflict)  return { ok: false, error: "Bu telefon numarası zaten kayıtlı." };
      if (ninConflict)    return { ok: false, error: "Bu TC Kimlik No zaten kayıtlı." };

      const preferredCities = data.preferredCities
        ? data.preferredCities.split(",").map((c) => c.trim()).filter(Boolean)
        : [];

      await prisma.$transaction(async (tx) => {
        // Kullanıcıya CLIENT rolü ata ve ajana bağla
        await tx.user.update({
          where: { id: data.userId },
          data: {
            firstName:          data.firstName,
            lastName:           data.lastName,
            name:               `${data.firstName} ${data.lastName}`,
            phone:              data.phone || null,
            roleGayrimenkul:    "CLIENT" as any,
            agencyId:           agencyId!,
            agencyName,
          },
        });

        // PropertyClient kaydı oluştur (DB.md → Real Estate ERP şemasına göre)
        await tx.propertyClient.create({
          data: {
            userId:                 data.userId,
            title:                  data.title,
            firstName:              data.firstName,
            lastName:               data.lastName,
            email:                  data.email,
            phone:                  data.phone,
            whatsappNo:             data.whatsappNo  || null,
            gender:                 data.gender,
            dob:                    new Date(data.dob),
            nationality:            data.nationality,
            NIN:                    data.NIN,
            imageUrl:               data.imageUrl    || null,
            contactMethod:          data.contactMethod,
            address:                data.address,
            occupation:             data.occupation  || null,
            password:               "",
            isBuyer:                data.isBuyer    ?? true,
            isSeller:               data.isSeller   ?? false,
            isTenant:               data.isTenant   ?? false,
            isLandlord:             data.isLandlord ?? false,
            minBudget:              data.minBudget ? parseFloat(data.minBudget) : null,
            maxBudget:              data.maxBudget ? parseFloat(data.maxBudget) : null,
            currency:               data.currency   || "TRY",
            preferredPropertyTypes: (data.preferredPropertyTypes ?? []) as any,
            preferredCities,
            notes:                  data.notes       || null,
            agencyId:               agencyId!,
            agencyName,
          } as any,
        });
      });

      revalidatePath(PATH);
      return { ok: true };
    } catch (error: any) {
      if (error?.code === "P2002") {
        const field = error?.meta?.target?.[0] ?? "alan";
        return { ok: false, error: `${field} zaten kayıtlı.` };
      }
      console.error("createClient:", error);
      return { ok: false, error: "Müşteri oluşturulamadı. Lütfen tekrar deneyin." };
    }
  }

  async function updateClientAction(
    id: string,
    data: Partial<ClientFormData>
  ): Promise<{ ok: boolean }> {
    "use server";
    try {
      const preferredCities =
        data.preferredCities !== undefined
          ? data.preferredCities.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined;

      await prisma.propertyClient.update({
        where: { id },
        data: {
          title:                  data.title,
          firstName:              data.firstName,
          lastName:               data.lastName,
          phone:                  data.phone,
          whatsappNo:             data.whatsappNo             || null,
          gender:                 data.gender,
          dob:                    data.dob                    ? new Date(data.dob) : undefined,
          nationality:            data.nationality,
          imageUrl:               data.imageUrl               || null,
          NIN:                    data.NIN,
          contactMethod:          data.contactMethod,
          address:                data.address,
          occupation:             data.occupation             || null,
          isBuyer:                data.isBuyer,
          isSeller:               data.isSeller,
          isTenant:               data.isTenant,
          isLandlord:             data.isLandlord,
          minBudget:              data.minBudget              ? parseFloat(data.minBudget) : null,
          maxBudget:              data.maxBudget              ? parseFloat(data.maxBudget) : null,
          currency:               data.currency               || "TRY",
          preferredPropertyTypes: (data.preferredPropertyTypes ?? []) as any,
          preferredCities,
          notes:                  data.notes                  || null,
        } as any,
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("updateClient:", e);
      return { ok: false };
    }
  }

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
            <span className="font-semibold text-sm sm:text-base">Müşteri Rolü Ata</span>
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">Toplu İçe Aktar</span>
          </TabsTrigger>
        </TabsList>

        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <TabsContent value="single" className="mt-0">
              <ClientForm onSubmit={createClientAction} existingUsers={existingUsers} />
            </TabsContent>
            <TabsContent value="bulk" className="mt-0">
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-sm text-muted-foreground gap-2">
                <Users className="h-10 w-10 text-gray-300" />
                <p className="font-medium">Toplu Müşteri İçe Aktarma</p>
                <p className="text-xs max-w-xs">
                  CSV/Excel içe aktarma özelliği yakında gelecek. Şimdilik &quot;Müşteri Rolü Ata&quot; sekmesini kullanabilirsiniz.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
