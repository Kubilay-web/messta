import { Card, CardContent } from "../../../../../../components/ui/card";
import ParentForm from "../../../../../../components/dashboard/forms/users/parent-form";
import { validateRequest } from "@/app/auth";
import { SchoolUser } from "@/app/(components)/(content-layout)/management/actions/auth";
import { notFound } from "next/navigation";
import db from "@/app/lib/db";

export default async function EditParentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) return null;

  const { id } = await params;

  const [school, parent] = await Promise.all([
    SchoolUser(user.id),
    db.parent.findUnique({ where: { id } }),
  ]);

  if (!parent) notFound();

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <ParentForm
            editingId={id}
            initialData={parent}
            schoolId={school?.id ?? ""}
            schoolName={school?.name ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
