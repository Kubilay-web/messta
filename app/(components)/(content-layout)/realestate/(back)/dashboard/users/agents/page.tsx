import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AgentListing from "./AgentListing";

const PATH = "/realestate/dashboard/users/agents";

export default async function AgentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true } } },
  });

  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/realestate/onboarding");

  const agents = await prisma.agent.findMany({
    where: { agencyId },
    select: {
      id: true, title: true, firstName: true, lastName: true,
      email: true, phone: true, imageUrl: true, gender: true,
      designation: true, departmentName: true, isActive: true,
      commissionRate: true, licenseNo: true, experience: true,
      employeeId: true,
    },
    orderBy: { firstName: "asc" },
  });

  async function deleteAgentAction(id: string): Promise<{ ok: boolean }> {
    "use server";
    try {
      const agent = await prisma.agent.findUnique({ where: { id }, select: { userId: true } });
      if (agent?.userId) {
        await prisma.user.delete({ where: { id: agent.userId } });
      } else {
        await prisma.agent.delete({ where: { id } });
      }
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("deleteAgent:", e);
      return { ok: false };
    }
  }

  async function toggleActiveAction(id: string, isActive: boolean): Promise<{ ok: boolean }> {
    "use server";
    try {
      await prisma.agent.update({ where: { id }, data: { isActive } });
      revalidatePath(PATH);
      return { ok: true };
    } catch (e) {
      console.error("toggleActive:", e);
      return { ok: false };
    }
  }

  return (
    <AgentListing
      agents={agents as any}
      onDelete={deleteAgentAction}
      onToggleActive={toggleActiveAction}
    />
  );
}
