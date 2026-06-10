"use server";

import db from "@/app/lib/db";
import { revalidatePath } from "next/cache";

/**
 * CRM etkileşim katmanı: Activity (etkileşim), Task (görev/follow-up), Note (not).
 * Lead veya Deal'e bağlı çalışır. ERP modelleri değiştirilmez; scalar ID bağları.
 */

function revalidateCrm() {
  revalidatePath("/oneproject/dashboard/leads");
  revalidatePath("/oneproject/dashboard/deals");
  revalidatePath("/oneproject/dashboard/tasks");
  revalidatePath("/oneproject/dashboard/crm");
  revalidatePath("/oneproject/dashboard/clients");
}

// ---------------- Activity ----------------
export type ActivityInput = {
  type: string;
  direction?: string;
  subject: string;
  description?: string;
  occurredAt?: string | Date;
  durationMin?: number;
  leadId?: string;
  dealId?: string;
  agencyId: string;
  agentId?: string;
  clientId?: string;
  userId?: string;
};

export async function createActivity(data: ActivityInput) {
  try {
    const activity = await db.crmActivity.create({
      data: {
        type: data.type as any,
        direction: (data.direction ?? "OUTBOUND") as any,
        subject: data.subject,
        description: data.description,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
        durationMin: data.durationMin,
        leadId: data.leadId,
        dealId: data.dealId,
        agencyId: data.agencyId,
        agentId: data.agentId,
        clientId: data.clientId,
        userId: data.userId,
      },
    });
    // Lead'e bağlıysa son temas tarihini güncelle
    if (data.leadId) {
      await db.lead.update({
        where: { id: data.leadId },
        data: { lastContactedAt: new Date() },
      });
    }
    revalidateCrm();
    return { ok: true, data: activity };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function deleteActivity(id: string) {
  try {
    await db.crmActivity.delete({ where: { id } });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

// ---------------- Task ----------------
export type TaskInput = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | Date;
  leadId?: string;
  dealId?: string;
  agencyId: string;
  agentId?: string;
  clientId?: string;
  assignedUserId?: string;
  createdByUserId?: string;
};

export async function createTask(data: TaskInput) {
  try {
    const task = await db.crmTask.create({
      data: {
        title: data.title,
        description: data.description,
        status: (data.status ?? "TODO") as any,
        priority: (data.priority ?? "MEDIUM") as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        leadId: data.leadId,
        dealId: data.dealId,
        agencyId: data.agencyId,
        agentId: data.agentId,
        clientId: data.clientId,
        assignedUserId: data.assignedUserId,
        createdByUserId: data.createdByUserId,
      },
    });
    revalidateCrm();
    return { ok: true, data: task };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function setTaskStatus(id: string, status: string) {
  try {
    await db.crmTask.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: status === "DONE" ? new Date() : null,
      },
    });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

export async function deleteTask(id: string) {
  try {
    await db.crmTask.delete({ where: { id } });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

/** Acentenin tüm görevleri (vade sırasına göre, ERP danışman adıyla). */
export async function getAgencyTasks(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const tasks = await db.crmTask.findMany({
      where: { agencyId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });
    const agentIds = [...new Set(tasks.map((t) => t.agentId).filter(Boolean))] as string[];
    const agents = agentIds.length
      ? await db.agent.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
    const aMap = new Map(agents.map((a) => [a.id, a]));
    return tasks.map((t) => ({
      ...t,
      agent: t.agentId ? aMap.get(t.agentId) ?? null : null,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ---------------- Note ----------------
export type NoteInput = {
  content: string;
  leadId?: string;
  dealId?: string;
  agencyId: string;
  clientId?: string;
  authorUserId?: string;
};

export async function createNote(data: NoteInput) {
  try {
    const note = await db.crmNote.create({ data });
    revalidateCrm();
    return { ok: true, data: note };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function deleteNote(id: string) {
  try {
    await db.crmNote.delete({ where: { id } });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

// ---------------- Reminder ----------------
export type ReminderInput = {
  title: string;
  note?: string;
  remindAt: string | Date;
  leadId?: string;
  dealId?: string;
  taskId?: string;
  agencyId: string;
  targetUserId?: string;
  createdByUserId?: string;
};

export async function createReminder(data: ReminderInput) {
  try {
    const reminder = await db.crmReminder.create({
      data: {
        title: data.title,
        note: data.note,
        remindAt: new Date(data.remindAt),
        leadId: data.leadId,
        dealId: data.dealId,
        taskId: data.taskId,
        agencyId: data.agencyId,
        targetUserId: data.targetUserId,
        createdByUserId: data.createdByUserId,
      },
    });
    revalidateCrm();
    return { ok: true, data: reminder };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function setReminderDone(id: string, isDone: boolean) {
  try {
    await db.crmReminder.update({ where: { id }, data: { isDone } });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

export async function deleteReminder(id: string) {
  try {
    await db.crmReminder.delete({ where: { id } });
    revalidateCrm();
    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}

export async function getRemindersFor(ctx: { leadId?: string; dealId?: string }) {
  if (!ctx.leadId && !ctx.dealId) return [];
  const where = ctx.leadId ? { leadId: ctx.leadId } : { dealId: ctx.dealId };
  try {
    return await db.crmReminder.findMany({
      where,
      orderBy: { remindAt: "asc" },
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Acentenin yaklaşan (tamamlanmamış) hatırlatmaları. */
export async function getUpcomingReminders(
  agencyId: string | undefined | null,
  take = 10
) {
  if (!agencyId) return [];
  try {
    return await db.crmReminder.findMany({
      where: { agencyId, isDone: false },
      orderBy: { remindAt: "asc" },
      take,
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ---------------- Müşteri (ERP PropertyClient) bağlamı ----------------
/** Bir ERP müşterisine bağlı tüm CRM etkileşim/görev/notları (clientId scalar). */
export async function getClientTimeline(clientId: string) {
  if (!clientId) return { activities: [], tasks: [], notes: [], reminders: [] };
  try {
    const [activities, tasks, notes] = await Promise.all([
      db.crmActivity.findMany({
        where: { clientId },
        orderBy: { occurredAt: "desc" },
      }),
      db.crmTask.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
      db.crmNote.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
    ]);
    return { activities, tasks, notes, reminders: [] as any[] };
  } catch (error) {
    console.log(error);
    return { activities: [], tasks: [], notes: [], reminders: [] };
  }
}

// ---------------- Aggregate ----------------
/** Bir lead veya deal için tüm timeline (aktivite + görev + not). */
export async function getTimeline(ctx: { leadId?: string; dealId?: string }) {
  const where = ctx.leadId ? { leadId: ctx.leadId } : { dealId: ctx.dealId };
  if (!ctx.leadId && !ctx.dealId) {
    return { activities: [], tasks: [], notes: [], reminders: [] };
  }
  try {
    const [activities, tasks, notes, reminders] = await Promise.all([
      db.crmActivity.findMany({ where, orderBy: { occurredAt: "desc" } }),
      db.crmTask.findMany({ where, orderBy: { createdAt: "desc" } }),
      db.crmNote.findMany({ where, orderBy: { createdAt: "desc" } }),
      db.crmReminder.findMany({ where, orderBy: { remindAt: "asc" } }),
    ]);
    return { activities, tasks, notes, reminders };
  } catch (error) {
    console.log(error);
    return { activities: [], tasks: [], notes: [], reminders: [] };
  }
}
