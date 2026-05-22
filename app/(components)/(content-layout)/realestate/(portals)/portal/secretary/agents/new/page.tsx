import { Card, CardContent } from "../../../../../components/ui/card";
import AgentForm from "../../../../../components/dashboard/forms/users/agent-form";
import { createAgent } from "@/app/(components)/(content-layout)/realestate/actions/realestate";
import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import db from "@/app/lib/db";

export default async function NewAgentPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/realestate/onboarding");

  const [departments, existingUsers] = await Promise.all([
    db.agencyDepartment.findMany({
      where: { agencyId: user.agencyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: {
        agencyId: user.agencyId,
        agent: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <AgentForm
            onSubmit={createAgent}
            departments={departments}
            existingUsers={existingUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
