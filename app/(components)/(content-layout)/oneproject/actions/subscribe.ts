"use server";

import { SubscriberProps } from "../components/Forms/SubscribeForm";

import { isEmailBlacklisted } from "../lib/isEmailBlackListed";
import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";
export async function createSubscription(data: SubscriberProps) {
  const { userId, email } = data;
  if (userId) {
    if (isEmailBlacklisted(email)) {
      return {
        error: `Lütfen geçerli, geçici olmayan bir e-posta adresi kullanın.`,
        status: 409,
        data: null,
      };
    }
    const existingSub = await db.subscriber.findFirst({
      where: {
        email,
        userId,
      },
    });
    if (existingSub) {
      return {
        error: `Zaten abone oldunuz`,
        status: 409,
        data: null,
      };
    }
    try {
      // Acente + danışman kapsamını vitrin sahibinin (userId) ERP kaydından türet
      const [owner, ownerAgent] = await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          select: { agencyId: true },
        }),
        db.agent.findUnique({
          where: { userId },
          select: { id: true },
        }),
      ]);
      const subscriber = await db.subscriber.create({
        data: {
          ...data,
          agencyId: owner?.agencyId ?? null,
          agentId: ownerAgent?.id ?? null,
        },
      });
      revalidatePath("/oneproject/dashboard/subscribers");
      return {
        error: null,
        status: 200,
        data: subscriber,
      };
    } catch (error) {
      console.log(error);
      return {
        error: `Bir şeyler ters gitti`,
        status: 500,
        data: null,
      };
    }
  }
}

export async function getUserSubscribers(userId: string) {
  try {
    const data = await db.subscriber.findMany({
      where: {
        userId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

/** Acentenin tüm aboneleri (talep/bülten). */
export async function getAgencySubscribers(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    return await db.subscriber.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function deleteSubscriber(id: string) {
  try {
    const deletedSub = await db.subscriber.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedSub,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      data: null,
    };
  }
}
