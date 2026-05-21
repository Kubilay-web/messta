import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import PaymentsUI from "./PaymentsUI";

const PATH = "/realestate/dashboard/finance/payments";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion:"2025-08-27.basil"
});

export default async function PaymentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET — tüm ödemeler
  const payments = await prisma.contractPayment.findMany({
    where: { contract: { agencyId } },
    select: {
      id: true, title: true, amount: true, dueDate: true,
      paidDate: true, status: true, paymentMethod: true, receiptNo: true, notes: true,
      contract: {
        select: {
          id: true, contractNo: true, contractType: true, currency: true,
          client: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  // POST — Stripe PaymentIntent oluştur
  async function createStripeIntent(paymentId: string): Promise<{ ok: boolean; clientSecret?: string; error?: string }> {
    "use server";
    try {
      const rec = await prisma.contractPayment.findFirst({
        where: { id: paymentId, contract: { agencyId } },
        include: { contract: { include: { client: true } } },
      });
      if (!rec) return { ok: false, error: "Ödeme bulunamadı." };
      if (rec.status === "PAID") return { ok: false, error: "Bu ödeme zaten tamamlandı." };

      const amountInCents = Math.round(rec.amount * 100);
      const intent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: (rec.contract.currency || "try").toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          contractPaymentId: rec.id,
          contractNo: rec.contract.contractNo,
          agencyId,
        },
        description: `${rec.contract.contractNo} — ${rec.title}`,
      });

      return { ok: true, clientSecret: intent.client_secret! };
    } catch (e: any) {
      console.error("createStripeIntent:", e);
      return { ok: false, error: e.message ?? "Stripe hatası." };
    }
  }

  // PUT — Stripe ödeme tamamlandıktan sonra kayıt güncelle
  async function confirmStripePayment(paymentId: string, intentId: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const intent = await stripe.paymentIntents.retrieve(intentId);
      if (intent.status !== "succeeded") return { ok: false, error: "Ödeme henüz tamamlanmadı." };

      const rec = await prisma.contractPayment.findFirst({ where: { id: paymentId, contract: { agencyId } } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };

      await prisma.contractPayment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidDate: new Date(),
          paymentMethod: "Stripe",
          receiptNo: intentId,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("confirmStripePayment:", e);
      return { ok: false, error: "Onaylama başarısız." };
    }
  }

  // PUT — Manuel ödeme işaretle
  async function markManualPayment(paymentId: string, data: {
    paymentMethod: string; receiptNo?: string; notes?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.contractPayment.findFirst({ where: { id: paymentId, contract: { agencyId } } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };

      await prisma.contractPayment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidDate: new Date(),
          paymentMethod: data.paymentMethod,
          receiptNo: data.receiptNo?.trim() || null,
          notes: data.notes?.trim() || rec.notes,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("markManualPayment:", e);
      return { ok: false, error: "İşaretleme başarısız." };
    }
  }

  // DELETE — ödeme silme
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Ödemeler</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Sözleşme ödemelerini Stripe veya manuel yöntemle tahsil edin.
      </p>
      <PaymentsUI
        payments={payments as any}
        stripePublicKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!}
        createStripeIntent={createStripeIntent}
        confirmStripePayment={confirmStripePayment}
        markManualPayment={markManualPayment}
        deletePayment={deletePayment}
      />
    </div>
  );
}
