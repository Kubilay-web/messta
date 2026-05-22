"use server";

import { Resend } from "resend";
import {
  MultipleMailPayload,
  SingleMailPayload,
} from "../components/emails/SendMailForm";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "noreply@mail.one-clone.com";

export async function sendSingleEmail(data: SingleMailPayload) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [data.email_address],
      subject: data.subject,
      html: data.message,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "E-posta başarıyla gönderildi." };
  } catch (err: any) {
    console.error("sendSingleEmail:", err);
    return { success: false, message: err.message ?? "Gönderilemedi." };
  }
}

export async function sendMultipleEmails(data: MultipleMailPayload) {
  try {
    const addresses = data.email_addresses
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (addresses.length === 0) {
      return { success: false, message: "Geçerli e-posta adresi bulunamadı." };
    }

    const batch = addresses.map((to) => ({
      from: FROM,
      to: [to],
      subject: data.subject,
      html: data.message,
    }));

    const { error } = await resend.batch.send(batch);
    if (error) return { success: false, message: error.message };
    return { success: true, message: `${addresses.length} adrese e-posta gönderildi.` };
  } catch (err: any) {
    console.error("sendMultipleEmails:", err);
    return { success: false, message: err.message ?? "Gönderilemedi." };
  }
}
