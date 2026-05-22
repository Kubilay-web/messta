import { columns } from "./columns";
import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import { validateRequest } from "@/app/auth";
import ResponsiveTable from "../../../../(back)/dashboard/admin/contacts/ResponsiveTable";
import db from "@/app/lib/db";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/realestate/onboarding");

  const agents = await db.agent.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <TableHeader
        title="Danışmanlar"
        linkTitle="Danışman Ekle"
        href="/realestate/portal/secretary/agents/new"
        data={agents}
        model="agent"
      />
      <div className="py-2">
        <ResponsiveTable data={agents} columns={columns} />
      </div>
    </div>
  );
}
