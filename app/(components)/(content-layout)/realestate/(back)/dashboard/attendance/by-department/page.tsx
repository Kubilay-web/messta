import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import AgentAttendanceListing from "./components/ClassAttendanceListing";

const PATH = "/realestate/dashboard/attendance/by-department";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          designation: true,
        },
        orderBy: { firstName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // GET — attendance records for a department on a date
  async function getAttendanceForDept(deptId: string, date: string) {
    "use server";
    const start = new Date(`${date}T00:00:00.000Z`);
    const end   = new Date(`${date}T23:59:59.999Z`);
    return prisma.agentAttendance.findMany({
      where: {
        agent: { departmentId: deptId, agencyId },
        date:  { gte: start, lte: end },
      },
      select: {
        id: true, agentId: true, status: true,
        checkIn: true, checkOut: true, note: true, date: true,
      },
    });
  }

  // POST / PUT — upsert a single attendance record
  async function upsertAttendance(data: {
    agentId: string;
    date: string;
    status: string;
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string | null;
  }) {
    "use server";
    const agent = await prisma.agent.findFirst({
      where: { id: data.agentId, agencyId },
    });
    if (!agent) return { ok: false, error: "Yetkisiz" };

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
  }

  // DELETE — remove an attendance record
  async function deleteAttendance(id: string) {
    "use server";
    const rec = await prisma.agentAttendance.findFirst({
      where: { id, agent: { agencyId } },
    });
    if (!rec) return { ok: false, error: "Kayıt bulunamadı" };
    await prisma.agentAttendance.delete({ where: { id } });
    revalidatePath(PATH);
    return { ok: true };
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Departmana Göre Devam Takibi</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Danışmanların departman bazlı devam durumunu görüntüleyin ve yönetin.
      </p>
      <AgentAttendanceListing
        departments={departments}
        getAttendanceForDept={getAttendanceForDept}
        upsertAttendance={upsertAttendance}
        deleteAttendance={deleteAttendance}
      />
    </div>
  );
}
