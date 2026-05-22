import { columns } from "./columns";
import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import { validateRequest } from "@/app/auth";
import ResponsiveTable from "../../../../(back)/dashboard/admin/contacts/ResponsiveTable";
import db from "@/app/lib/db";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/realestate/onboarding");

  const clients = await db.propertyClient.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <TableHeader
        title="Müşteriler"
        linkTitle="Müşteri Ekle"
        href="/realestate/portal/secretary/clients/new"
        data={clients}
        model="propertyClient"
      />
      <div className="py-2">
        <ResponsiveTable data={clients} columns={columns} />
      </div>
    </div>
  );
}
