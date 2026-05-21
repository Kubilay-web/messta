import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AgentView from "./components/agent-view";

const PATH = "/realestate/dashboard/attendance/client";

export default async function AgentAttendancePage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET — agents list
  const agents = await prisma.agent.findMany({
    where: { agencyId, isActive: true },
    select: { id: true, firstName: true, lastName: true, employeeId: true, designation: true },
    orderBy: { firstName: "asc" },
  });

  // GET — attendance records for an agent on a date
  async function getAttendanceForAgent(agentId: string, date: string) {
    "use server";
    const start = new Date(`${date}T00:00:00.000Z`);
    const end   = new Date(`${date}T23:59:59.999Z`);
    return prisma.agentAttendance.findMany({
      where: {
        agentId,
        agent: { agencyId },
        date: { gte: start, lte: end },
      },
      select: {
        id: true, agentId: true, status: true,
        checkIn: true, checkOut: true, note: true, date: true,
      },
    });
  }

  // POST/PUT — upsert attendance record
  async function upsertAttendance(data: {
    agentId: string;
    date: string;
    status: string;
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const agent = await prisma.agent.findFirst({ where: { id: data.agentId, agencyId } });
      if (!agent) return { ok: false, error: "Yetkisiz işlem." };

      const attendanceDate = new Date(`${data.date}T00:00:00.000Z`);
      const start = new Date(`${data.date}T00:00:00.000Z`);
      const end   = new Date(`${data.date}T23:59:59.999Z`);

      const existing = await prisma.agentAttendance.findFirst({
        where: { agentId: data.agentId, date: { gte: start, lte: end } },
      });

      const payload = {
        status:   data.status as any,
        checkIn:  data.checkIn  ? new Date(data.checkIn)  : null,
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
        note:     data.note || null,
      };

      if (existing) {
        await prisma.agentAttendance.update({ where: { id: existing.id }, data: payload });
      } else {
        await prisma.agentAttendance.create({
          data: { agentId: data.agentId, date: attendanceDate, ...payload },
        });
      }

      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("upsertAttendance:", e);
      return { ok: false, error: "Kayıt işlemi başarısız." };
    }
  }

  // DELETE — remove attendance record
  async function deleteAttendance(id: string): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const rec = await prisma.agentAttendance.findFirst({ where: { id, agent: { agencyId } } });
      if (!rec) return { ok: false, error: "Kayıt bulunamadı." };
      await prisma.agentAttendance.delete({ where: { id } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteAttendance:", e);
      return { ok: false, error: "Silme başarısız." };
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Danışman Devam Takibi</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Danışman bazlı günlük devam kayıtlarını görüntüleyin ve yönetin.
      </p>
      <AgentView
        agents={agents}
        getAttendanceForAgent={getAttendanceForAgent}
        upsertAttendance={upsertAttendance}
        deleteAttendance={deleteAttendance}
      />
    </div>
  );
}
