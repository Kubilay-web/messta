import { Card, CardContent } from "../../../../../components/ui/card";
import TeacherForm from "../../../../../components/dashboard/forms/users/teacher-form";
import { getBriefClasses } from "../../../../../actions/classes";
import { getBriefSubjects } from "../../../../../actions/subjects";
import { getBriefDepartments } from "../../../../../actions/departments";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { validateRequest } from "@/app/auth";

export default async function AdmissionTabs() {
  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  // Response'ları al
  const classesResponse = await getBriefClasses(school?.id ?? "");
  const subjectsResponse = await getBriefSubjects(school?.id ?? "");
  const departmentsResponse = await getBriefDepartments(school?.id ?? "");

  // Debug için konsola yazdır
  console.log("classesResponse:", classesResponse);
  console.log("subjectsResponse:", subjectsResponse);
  console.log("departmentsResponse:", departmentsResponse);

  // Data'yı güvenli bir şekilde al - HER BİRİ İÇİN AYRI AYRI
  const classesData = Array.isArray(classesResponse) 
    ? classesResponse 
    : classesResponse?.data || [];
    
  const subjectsData = Array.isArray(subjectsResponse) 
    ? subjectsResponse 
    : subjectsResponse?.data || [];
    
  const departmentsData = Array.isArray(departmentsResponse) 
    ? departmentsResponse 
    : departmentsResponse?.data || [];

  console.log("classesData:", classesData);
  console.log("subjectsData:", subjectsData);
  console.log("departmentsData:", departmentsData);

  // Array kontrolü yap
  const classes = Array.isArray(classesData) && classesData.length > 0
    ? classesData.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    : [];

  const subjects = Array.isArray(subjectsData) && subjectsData.length > 0
    ? subjectsData.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : [];

  const departments = Array.isArray(departmentsData) && departmentsData.length > 0
    ? departmentsData.map((item) => ({
        label: item.name,
        value: item.id,
      }))
    : [];

  console.log("Formatted classes:", classes);
  console.log("Formatted subjects:", subjects);
  console.log("Formatted departments:", departments);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <TeacherForm
            classes={classes}
            departments={departments}
            subjects={subjects}
            schoolId={school?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}