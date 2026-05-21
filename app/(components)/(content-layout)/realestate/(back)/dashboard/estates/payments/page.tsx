import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PaymentManagementUI from "./PaymentManagementUI";

const PATH = "/realestate/dashboard/estates/reports";

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
export default async function PaymentsReportPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const agencyId = await getAgencyId(user.id);

  const [payments, contracts] = await Promise.all([
    prisma.contractPayment.findMany({
      where: { contract: { agencyId } },
      select: {
        id: true, title: true, amount: true,
        dueDate: true, paidDate: true, status: true,
        paymentMethod: true, receiptNo: true, notes: true,
        createdAt: true,
        contract: { select: { contractNo: true, contractType: true, currency: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.propertyContract.findMany({
      where: { agencyId },
      select: { id: true, contractNo: true, contractType: true, currency: true },
      orderBy: { contractNo: "asc" },
    }),
  ]);

  // POST — Ödeme oluştur
  async function createPayment(data: {
    contractId: string; title: string; amount: string;
    dueDate: string; paidDate: string; status: string;
    paymentMethod: string; receiptNo: string; notes: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.contractId) return { ok: false, error: "Sözleşme seçin." };
      if (!data.title?.trim()) return { ok: false, error: "Ödeme kalemi zorunlu." };
      if (!data.amount) return { ok: false, error: "Tutar zorunlu." };
      if (!data.dueDate) return { ok: false, error: "Vade tarihi zorunlu." };

      await prisma.contractPayment.create({
        data: {
          contractId: data.contractId,
          title: data.title.trim(),
          amount: parseFloat(data.amount),
          dueDate: new Date(data.dueDate),
          paidDate: data.paidDate ? new Date(data.paidDate) : null,
          status: (data.status || "PENDING") as any,
          paymentMethod: data.paymentMethod?.trim() || null,
          receiptNo: data.receiptNo?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createPayment:", e);
      return { ok: false, error: "Ödeme oluşturulamadı." };
    }
  }

  // PUT — Ödeme güncelle
  async function updatePayment(id: string, data: {
    title?: string; amount?: string;
    dueDate?: string; paidDate?: string; status?: string;
    paymentMethod?: string; receiptNo?: string; notes?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.contractPayment.update({
        where: { id },
        data: {
          title: data.title?.trim(),
          amount: data.amount ? parseFloat(data.amount) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          paidDate: data.paidDate ? new Date(data.paidDate) : null,
          status: data.status as any,
          paymentMethod: data.paymentMethod?.trim() || null,
          receiptNo: data.receiptNo?.trim() || null,
          notes: data.notes?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updatePayment:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE — Ödeme sil
  async function deletePayment(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      await prisma.contractPayment.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deletePayment:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <PaymentManagementUI
      payments={payments as any}
      contracts={contracts}
      createPayment={createPayment}
      updatePayment={updatePayment}
      deletePayment={deletePayment}
    />
  );
}
