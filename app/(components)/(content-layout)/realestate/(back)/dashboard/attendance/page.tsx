import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AgentBulkAttendance from "./components/StudentListingByStream";

const PATH = "/realestate/dashboard/attendance";

export default async function AttendancePage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });
  if (!dbUser?.agencyId) redirect("/realestate/onboarding");
  const agencyId = dbUser.agencyId;

  // GET — departments with active agents
  const departments = await prisma.agencyDepartment.findMany({
    where: { agencyId },
    select: {
      id: true,
      name: true,
      agents: {
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, employeeId: true, designation: true },
        orderBy: { firstName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // GET — fetch existing attendance for a department on a date
  async function getAttendanceForDept(deptId: string, date: string) {
    "use server";
    const start = new Date(`${date}T00:00:00.000Z`);
    const end   = new Date(`${date}T23:59:59.999Z`);
    return prisma.agentAttendance.findMany({
      where: {
        agent: { departmentId: deptId, agencyId },
        date: { gte: start, lte: end },
      },
      select: { id: true, agentId: true, status: true, checkIn: true, checkOut: true, note: true },
    });
  }

  // POST/PUT — upsert single attendance record
  async function upsertAttendance(data: {
    agentId: string; date: string; status: string;
    checkIn?: string | null; checkOut?: string | null; note?: string | null;
  }): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      const agent = await prisma.agent.findFirst({ where: { id: data.agentId, agencyId } });
      if (!agent) return { ok: false, error: "Yetkisiz." };

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
      return { ok: false, error: "Kayıt başarısız." };
    }
  }

  // POST — bulk save all agents' attendance at once
  async function saveBulkAttendance(records: {
    agentId: string; date: string; status: string;
  }[]): Promise<{ ok: boolean; error?: string }> {
    "use server";
    try {
      for (const rec of records) {
        const agent = await prisma.agent.findFirst({ where: { id: rec.agentId, agencyId } });
        if (!agent) continue;

        const attendanceDate = new Date(`${rec.date}T00:00:00.000Z`);
        const start = new Date(`${rec.date}T00:00:00.000Z`);
        const end   = new Date(`${rec.date}T23:59:59.999Z`);

        const existing = await prisma.agentAttendance.findFirst({
          where: { agentId: rec.agentId, date: { gte: start, lte: end } },
        });

        if (existing) {
          await prisma.agentAttendance.update({
            where: { id: existing.id },
            data: { status: rec.status as any },
          });
        } else {
          await prisma.agentAttendance.create({
            data: { agentId: rec.agentId, date: attendanceDate, status: rec.status as any },
          });
        }
      }
      revalidatePath(PATH);
      return { ok: true };
    } catch (e: any) {
      console.error("saveBulkAttendance:", e);
      return { ok: false, error: "Toplu kayıt başarısız." };
    }
  }

  // DELETE — remove a single attendance record
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Devam Takibi</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Departman bazlı danışman devam durumunu toplu olarak işaretleyin ve kaydedin.
      </p>
      <AgentBulkAttendance
        departments={departments}
        getAttendanceForDept={getAttendanceForDept}
        upsertAttendance={upsertAttendance}
        saveBulkAttendance={saveBulkAttendance}
        deleteAttendance={deleteAttendance}
      />
    </div>
  );
}
