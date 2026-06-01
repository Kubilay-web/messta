import { validateRequest } from "@/app/auth";
import { AgencyUser } from "../../../../../../actions/auth";
import { getPropertyById } from "../../../../../../actions/properties";
import { Card, CardContent } from "../../../../../../components/ui/card";
import PropertyForm from "../../../../../../components/dashboard/forms/properties/property-form";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Mülkü Düzenle - EstatePro" };

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect("/estate/login");

  const [agency, property] = await Promise.all([
    AgencyUser(user.id),
    getPropertyById(params.id),
  ]);

  if (!property) notFound();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-4 sm:p-6">
          <PropertyForm
            agencyId={agency?.id ?? ""}
            agencyName={agency?.name ?? ""}
            editingId={params.id}
            initialData={property as any}
          />
        </CardContent>
      </Card>
    </div>
  );
}
