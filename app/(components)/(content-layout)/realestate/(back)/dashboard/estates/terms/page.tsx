import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ContractManagementUI from "./ContractManagementUI";

const PATH = "/realestate/dashboard/estates/terms";

async function getAgencyId(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true } } },
  });
  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/realestate/onboarding");
  return agencyId!;
}

// GET
export default async function ContractsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const agencyId = await getAgencyId(user.id);

  const [contracts, properties, agents, clients] = await Promise.all([
    prisma.propertyContract.findMany({
      where: { agencyId },
      select: {
        id: true, contractNo: true, contractType: true, status: true,
        startDate: true, endDate: true, signedDate: true,
        salePrice: true, rentalPrice: true, deposit: true,
        commission: true, currency: true, notes: true,
        agentName: true, clientName: true, createdAt: true,
        property: { select: { title: true, city: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.propertyRealEstate.findMany({
      where: { agencyId },
      select: { id: true, title: true, city: true },
      orderBy: { title: "asc" },
    }),
    prisma.agent.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.propertyClient.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  // POST — Sözleşme oluştur
  async function createContract(data: {
    propertyId: string; agentId: string; clientId: string;
    contractType: string; status: string;
    startDate: string; endDate: string; signedDate: string;
    salePrice: string; rentalPrice: string; deposit: string;
    commission: string; currency: string; notes: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.propertyId)  return { ok: false, error: "Mülk seçin." };
      if (!data.agentId)     return { ok: false, error: "Danışman seçin." };
      if (!data.clientId)    return { ok: false, error: "Müşteri seçin." };
      if (!data.startDate)   return { ok: false, error: "Başlangıç tarihi zorunlu." };

      const agent  = await prisma.agent.findUnique({ where: { id: data.agentId }, select: { firstName: true, lastName: true } });
      const client = await prisma.propertyClient.findUnique({ where: { id: data.clientId }, select: { firstName: true, lastName: true } });

      await prisma.propertyContract.create({
        data: {
          contractNo:   `CNT-${Date.now()}`,
          contractType: data.contractType as any,
          status:       (data.status || "DRAFT") as any,
          startDate:    new Date(data.startDate),
          endDate:      data.endDate    ? new Date(data.endDate)    : null,
          signedDate:   data.signedDate ? new Date(data.signedDate) : null,
          salePrice:    data.salePrice    ? parseFloat(data.salePrice)    : null,
          rentalPrice:  data.rentalPrice  ? parseFloat(data.rentalPrice)  : null,
          deposit:      data.deposit      ? parseFloat(data.deposit)      : null,
          commission:   data.commission   ? parseFloat(data.commission)   : null,
          currency:     data.currency || "TRY",
          notes:        data.notes?.trim() || null,
          agentName:    agent  ? `${agent.firstName} ${agent.lastName}`   : "—",
          clientName:   client ? `${client.firstName} ${client.lastName}` : "—",
          property:     { connect: { id: data.propertyId } },
          agent:        { connect: { id: data.agentId } },
          client:       { connect: { id: data.clientId } },
          agency:       { connect: { id: agencyId } },
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createContract:", e);
      return { ok: false, error: "Sözleşme oluşturulamadı." };
    }
  }

  // PUT — Sözleşme güncelle
  async function updateContract(id: string, data: Partial<{
    contractType: string; status: string;
    startDate: string; endDate: string; signedDate: string;
    salePrice: string; rentalPrice: string; deposit: string;
    commission: string; currency: string; notes: string;
  }>): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.propertyContract.update({
        where: { id },
        data: {
          contractType: data.contractType as any,
          status:       data.status as any,
          startDate:    data.startDate  ? new Date(data.startDate)  : undefined,
          endDate:      data.endDate    ? new Date(data.endDate)    : null,
          signedDate:   data.signedDate ? new Date(data.signedDate) : null,
          salePrice:    data.salePrice   ? parseFloat(data.salePrice)   : null,
          rentalPrice:  data.rentalPrice ? parseFloat(data.rentalPrice) : null,
          deposit:      data.deposit     ? parseFloat(data.deposit)     : null,
          commission:   data.commission  ? parseFloat(data.commission)  : null,
          currency:     data.currency,
          notes:        data.notes?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateContract:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Sözleşme sil (ödemesi varsa engelle)
  async function deleteContract(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const count = await prisma.contractPayment.count({ where: { contractId: id } });
      if (count > 0) return { ok: false, error: "Ödemesi olan sözleşme silinemez." };
      await prisma.propertyContract.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteContract:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <ContractManagementUI
      contracts={contracts as any}
      properties={properties}
      agents={agents}
      clients={clients}
      createContract={createContract}
      updateContract={updateContract}
      deleteContract={deleteContract}
    />
  );
}
