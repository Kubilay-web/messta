import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import FeesUI from "./FeesUI";

const PATH = "/realestate/dashboard/finance/fees";

export default async function FeesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  const [payments, contracts] = await Promise.all([
    // GET — tüm sözleşme ödemeleri
    prisma.contractPayment.findMany({
      where: { contract: { agencyId } },
      select: {
        id: true, title: true, amount: true, dueDate: true,
        paidDate: true, status: true, paymentMethod: true,
        receiptNo: true, notes: true, createdAt: true,
        contract: {
          select: {
            id: true, contractNo: true, contractType: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
    // GET — sözleşme listesi (form için)
    prisma.propertyContract.findMany({
      where: { agencyId },
      select: {
        id: true, contractNo: true, contractType: true,
        currency: true,
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: { contractNo: "asc" },
    }),
  ]);

  // POST — yeni ödeme kalemi oluştur
  async function createPayment(data: {
    contractId: string; title: string; amount: string;
    dueDate: string; paymentMethod?: string; notes?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const contract = await prisma.propertyContract.findFirst({ where: { id: data.contractId, agencyId } });
      if (!contract) return { ok: false, error: "Sözleşme bulunamadı." };
      if (!data.title?.trim()) return { ok: false, error: "Başlık zorunlu." };
      if (!data.amount || isNaN(Number(data.amount))) return { ok: false, error: "Geçerli tutar girin." };
      if (!data.dueDate) return { ok: false, error: "Vade tarihi zorunlu." };

      await prisma.contractPayment.create({
        data: {
          contractId: data.contractId,
          title: data.title.trim(),
          amount: parseFloat(data.amount),
          dueDate: new Date(data.dueDate),
          paymentMethod: data.paymentMethod?.trim() || null,
          notes: data.notes?.trim() || null,
          status: "PENDING",
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createPayment:", e);
      return { ok: false, error: "Oluşturma başarısız." };
    }
  }

  // PUT — güncelle (durum, ödeme yöntemi, notlar)
  async function updatePayment(id: string, data: {
    title?: string; amount?: string; dueDate?: string;
    status?: string; paymentMethod?: string; receiptNo?: string; notes?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.contractPayment.findFirst({ where: { id, contract: { agencyId } } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };

      await prisma.contractPayment.update({
        where: { id },
        data: {
          ...(data.title     ? { title: data.title.trim() }          : {}),
          ...(data.amount    ? { amount: parseFloat(data.amount) }    : {}),
          ...(data.dueDate   ? { dueDate: new Date(data.dueDate) }    : {}),
          ...(data.status    ? { status: data.status as any }         : {}),
          ...(data.status === "PAID" ? { paidDate: new Date() }       : {}),
          paymentMethod: data.paymentMethod?.trim() || rec.paymentMethod,
          receiptNo:     data.receiptNo?.trim()     || rec.receiptNo,
          notes:         data.notes?.trim()         || rec.notes,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updatePayment:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  // DELETE
  async function deletePayment(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.contractPayment.findFirst({ where: { id, contract: { agencyId } } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.contractPayment.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deletePayment:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Ödeme Planı</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Sözleşme bazlı ödeme kalemlerini oluşturun, takip edin ve yönetin.
      </p>
      <FeesUI
        payments={payments as any}
        contracts={contracts as any}
        createPayment={createPayment}
        updatePayment={updatePayment}
        deletePayment={deletePayment}
      />
    </div>
  );
}
