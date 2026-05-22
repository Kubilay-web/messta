import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { Resend } from "resend";
import twilio from "twilio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import RemindersUI from "./RemindersUI";

const PATH = "/realestate/dashboard/communication/reminders";
const FROM = "noreply@mail.one-clone.com";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER!;

export default async function RemindersPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  const [reminders, agentsCount, clientsCount] = await Promise.all([
    prisma.agencyReminder.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agent.count({ where: { agencyId } }),
    prisma.propertyClient.count({ where: { agencyId } }),
  ]);

  // ── Reminder CRUD ────────────────────────────────────────────────────────

  async function createReminder(data: {
    subject: string; message: string;
    recipient: string; from: string;
    name?: string; email?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      if (!data.subject?.trim()) return { ok: false, error: "Konu zorunlu." };
      if (!data.message?.replace(/<[^>]*>/g, "").trim())
        return { ok: false, error: "Mesaj zorunlu." };
      await prisma.agencyReminder.create({
        data: {
          subject:   data.subject.trim(),
          message:   data.message.trim(),
          recipient: data.recipient as any,
          from:      data.from as any,
          name:      data.name?.trim()  || null,
          email:     data.email?.trim() || null,
          agency:    { connect: { id: agencyId } },
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("createReminder:", e);
      return { ok: false, error: "Oluşturma başarısız." };
    }
  }

  async function updateReminder(
    id: string,
    data: {
      subject?: string; message?: string;
      recipient?: string; from?: string;
      name?: string; email?: string;
    },
  ): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agencyReminder.update({
        where: { id },
        data: {
          ...(data.subject   ? { subject:   data.subject.trim() }   : {}),
          ...(data.message   ? { message:   data.message.trim() }   : {}),
          ...(data.recipient ? { recipient: data.recipient as any } : {}),
          ...(data.from      ? { from:      data.from as any }      : {}),
          name:  data.name?.trim()  || null,
          email: data.email?.trim() || null,
        },
      });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("updateReminder:", e);
      return { ok: false, error: "Güncelleme başarısız." };
    }
  }

  async function deleteReminder(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agencyReminder.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteReminder:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  // ── Hatırlatmayı e-posta olarak gönder ──────────────────────────────────
  async function sendReminderAsEmail(
    id: string,
  ): Promise<{ ok: boolean; error?: string; sent?: number }> {
    "use server";
    try {
      // agencyId'yi closure yerine auth'dan türet (module-level helper güvenli erişim için)
      const { user: u } = await validateRequest();
      if (!u) return { ok: false, error: "Yetkisiz." };
      const dbU = await prisma.user.findUnique({
        where: { id: u.id },
        select: { agencyId: true },
      });
      if (!dbU?.agencyId) return { ok: false, error: "Ajans bulunamadı." };
      const aid = dbU.agencyId;

      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId: aid } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };

      const emails = await collectEmails(aid, rec.recipient as string);
      if (emails.length === 0)
        return { ok: false, error: "Gönderilecek alıcı e-postası bulunamadı." };

      const resend = new Resend(process.env.RESEND_API_KEY);
      const batch = emails.map((to) => ({
        from: FROM,
        to: [to],
        subject: rec.subject,
        html: rec.message,
      }));
      const { error } = await resend.batch.send(batch);
      if (error) return { ok: false, error: error.message };
      return { ok: true, sent: emails.length };
    } catch (e: any) {
      console.error("sendReminderAsEmail:", e);
      return { ok: false, error: e.message ?? "Gönderilemedi." };
    }
  }

  // ── Grup e-postası (E-posta sekmesi) ────────────────────────────────────
  async function sendGroupEmailAction(data: {
    key: string; subject: string; message: string;
  }): Promise<{ ok: boolean; error?: string; sent?: number }> {
    "use server";
    try {
      const { user: u } = await validateRequest();
      if (!u) return { ok: false, error: "Yetkisiz." };
      const dbU = await prisma.user.findUnique({
        where: { id: u.id },
        select: { agencyId: true },
      });
      if (!dbU?.agencyId) return { ok: false, error: "Ajans bulunamadı." };
      const aid = dbU.agencyId;

      const emails = await collectEmails(aid, data.key);
      if (emails.length === 0)
        return { ok: false, error: "Gönderilecek alıcı e-postası bulunamadı." };

      const resend = new Resend(process.env.RESEND_API_KEY);
      const batch = emails.map((to) => ({
        from: FROM,
        to: [to],
        subject: data.subject,
        html: data.message,
      }));
      const { error } = await resend.batch.send(batch);
      if (error) return { ok: false, error: error.message };
      return { ok: true, sent: emails.length };
    } catch (e: any) {
      console.error("sendGroupEmailAction:", e);
      return { ok: false, error: e.message ?? "E-posta gönderilemedi." };
    }
  }

  // ── Hatırlatmayı SMS olarak gönder ───────────────────────────────────────
  async function sendReminderAsSMS(
    id: string,
  ): Promise<{ ok: boolean; error?: string; sent?: number; failed?: number }> {
    "use server";
    try {
      const { user: u } = await validateRequest();
      if (!u) return { ok: false, error: "Yetkisiz." };
      const dbU = await prisma.user.findUnique({
        where: { id: u.id },
        select: { agencyId: true },
      });
      if (!dbU?.agencyId) return { ok: false, error: "Ajans bulunamadı." };
      const aid = dbU.agencyId;

      const rec = await prisma.agencyReminder.findFirst({ where: { id, agencyId: aid } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };

      const phones = await collectPhones(aid, rec.recipient as string);
      if (phones.length === 0)
        return { ok: false, error: "Gönderilecek telefon numarası bulunamadı." };

      const body = `${rec.subject}\n\n${rec.message.replace(/<[^>]*>/g, "")}`;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const results = await Promise.allSettled(
        phones.map((to) => client.messages.create({ from: TWILIO_FROM, to, body })),
      );

      const sent   = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (sent === 0) return { ok: false, error: "Hiçbir SMS gönderilemedi.", failed };
      return { ok: true, sent, failed };
    } catch (e: any) {
      console.error("sendReminderAsSMS:", e);
      return { ok: false, error: e.message ?? "SMS gönderilemedi." };
    }
  }

  // ── Tek numara SMS (test amaçlı) ─────────────────────────────────────────
  async function sendSingleSMSAction(data: {
    phone: string; message: string;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const { user: u } = await validateRequest();
      if (!u) return { ok: false, error: "Yetkisiz." };

      // E.164 formatına dönüştür: 05xx → +905xx
      let to = data.phone.trim().replace(/\s+/g, "");
      if (to.startsWith("0") && !to.startsWith("+")) to = "+9" + to;
      if (!to.startsWith("+")) to = "+" + to;

      const body = data.message.trim();
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ from: TWILIO_FROM, to, body });
      return { ok: true };
    } catch (e: any) {
      console.error("sendSingleSMSAction:", e);
      return { ok: false, error: e.message ?? "SMS gönderilemedi." };
    }
  }

  // ── Grup SMS (SMS sekmesi) ────────────────────────────────────────────────
  async function sendGroupSMSAction(data: {
    key: string; message: string;
  }): Promise<{ ok: boolean; error?: string; sent?: number; failed?: number }> {
    "use server";
    try {
      const { user: u } = await validateRequest();
      if (!u) return { ok: false, error: "Yetkisiz." };
      const dbU = await prisma.user.findUnique({
        where: { id: u.id },
        select: { agencyId: true },
      });
      if (!dbU?.agencyId) return { ok: false, error: "Ajans bulunamadı." };
      const aid = dbU.agencyId;

      const phones = await collectPhones(aid, data.key);
      if (phones.length === 0)
        return { ok: false, error: "Gönderilecek telefon numarası bulunamadı." };

      const body = data.message.replace(/<[^>]*>/g, "").trim();
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const results = await Promise.allSettled(
        phones.map((to) => client.messages.create({ from: TWILIO_FROM, to, body })),
      );

      const sent   = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (sent === 0) return { ok: false, error: "Hiçbir SMS gönderilemedi.", failed };
      return { ok: true, sent, failed };
    } catch (e: any) {
      console.error("sendGroupSMSAction:", e);
      return { ok: false, error: e.message ?? "SMS gönderilemedi." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">İletişim Merkezi</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Müşteri, danışman ve yönetim için hatırlatma mesajları oluşturun ve e-posta gönderin.
      </p>
      <RemindersUI
        reminders={reminders as any}
        groupsData={{ agents: agentsCount, clients: clientsCount }}
        agencyId={agencyId}
        createReminder={createReminder}
        updateReminder={updateReminder}
        deleteReminder={deleteReminder}
        sendReminderAsEmail={sendReminderAsEmail}
        sendGroupEmail={sendGroupEmailAction}
        sendReminderAsSMS={sendReminderAsSMS}
        sendGroupSMS={sendGroupSMSAction}
        sendSingleSMS={sendSingleSMSAction}
      />
    </div>
  );
}

// ── Yardımcı: gruba göre e-posta adresi toplar ──────────────────────────────
async function collectEmails(agencyId: string, key: string): Promise<string[]> {
  const emails: string[] = [];

  if (key === "Agents" || key === "All") {
    const agents = await prisma.agent.findMany({
      where: { agencyId },
      select: { email: true },
    });
    emails.push(...agents.map((a) => a.email));
  }

  if (key === "Clients" || key === "All") {
    const clients = await prisma.propertyClient.findMany({
      where: { agencyId },
      select: { email: true },
    });
    emails.push(...clients.map((c) => c.email));
  }

  if (key === "Management") {
    const managers = await prisma.user.findMany({
      where: {
        agencyId,
        roleGayrimenkul: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
      select: { email: true },
    });
    emails.push(...managers.filter((u) => u.email).map((u) => u.email!));
  }

  // tekrar edenleri temizle
  return Array.from(new Set(emails));
}

// ── Yardımcı: gruba göre telefon numarası toplar ────────────────────────────
async function collectPhones(agencyId: string, key: string): Promise<string[]> {
  const phones: string[] = [];

  if (key === "Agents" || key === "All") {
    const agents = await prisma.agent.findMany({
      where: { agencyId },
      select: { phone: true },
    });
    phones.push(...agents.map((a) => a.phone));
  }

  if (key === "Clients" || key === "All") {
    const clients = await prisma.propertyClient.findMany({
      where: { agencyId },
      select: { phone: true },
    });
    phones.push(...clients.map((c) => c.phone));
  }

  if (key === "Management") {
    const managers = await prisma.user.findMany({
      where: {
        agencyId,
        roleGayrimenkul: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
      select: { phone: true },
    });
    phones.push(...managers.filter((u) => u.phone).map((u) => u.phone!));
  }

  return Array.from(new Set(phones)).filter(Boolean);
}
