import { Card, CardContent } from "../../../../../components/ui/card";
import PropertyClientForm from "../../../../../components/dashboard/forms/users/PropertyClientForm";
import { createPropertyClient } from "@/app/(components)/(content-layout)/realestate/actions/realestate";
import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import db from "@/app/lib/db";

export default async function NewClientPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/realestate/onboarding");

  const existingUsers = await db.user.findMany({
    where: {
      agencyId: user.agencyId,
      propertyClient: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <PropertyClientForm
            onSubmit={createPropertyClient}
            existingUsers={existingUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
