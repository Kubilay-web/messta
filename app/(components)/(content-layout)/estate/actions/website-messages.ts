"use server";

import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";

const PATH = "/estate/dashboard/communication/website-messages";

// ==================== GET ALL ====================
export async function getAllAgencyContactMessages(agencyId: string) {
  return db.agencyContactMessage.findMany({
    where:   { agencyId },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== DELETE ====================
export async function deleteAgencyContactMessage(id: string) {
  await db.agencyContactMessage.delete({ where: { id } });
  revalidatePath(PATH);
  return { ok: true };
}
