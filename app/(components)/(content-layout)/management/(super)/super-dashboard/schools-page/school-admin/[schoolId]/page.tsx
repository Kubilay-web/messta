import { validateRequest } from "@/app/auth";
import SchoolAdminForm from "../../../../../components/dashboard/forms/school/school-admin-form";
import { Card, CardContent } from "../../../../../components/ui/card";
import { SchoolUser } from "@/app/(components)/(content-layout)/management/actions/auth";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const schoolId = (await params).schoolId;
  const name = (await searchParams).name;


  // if (!schoolId || !name) {
  //   return notFound();
  // }



    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);

  return (
    <div className="max-w-3xl mx-auto p-16">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <SchoolAdminForm schoolId={school.id} schoolName={school?.name} />
        </CardContent>
      </Card>
    </div>
  );
}
