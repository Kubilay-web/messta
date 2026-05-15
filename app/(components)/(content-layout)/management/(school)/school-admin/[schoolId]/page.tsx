import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../actions/auth";
import SchoolAdminForm from "../../../components/dashboard/forms/school/school-admin-form";
import { Card, CardContent } from "../../../components/ui/card";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  // if (!schoolId || !name) {
  //   return notFound();
  // }

  return (
    <div className="max-w-3xl mx-auto p-16">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-2">
          <SchoolAdminForm schoolId={school?.id} schoolName={school?.name} />
        </CardContent>
      </Card>
    </div>
  );
}
