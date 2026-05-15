import { Card, CardContent } from "../../../../components/ui/card";
// import ParentForm from "../../../../components/dashboard/forms/users/parent-form";
import StaffForm from "../../../../components/dashboard/forms/users/staff-form";
import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../../actions/auth";

export default async function AdmissionTabs() {



  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);


  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <StaffForm schoolId={school?.id} schoolName={school?.name}  />
        </CardContent>
      </Card>
    </div>
  );
}
