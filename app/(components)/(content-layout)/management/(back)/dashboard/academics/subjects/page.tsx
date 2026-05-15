// import { validateRequest } from "@/app/auth";
// import { getServerSchool, SchoolUser } from "../../../../actions/auth";
// // import { getAllClasses } from "../../../../actions/classes";
// import { getBriefDepartments } from "../../../../actions/communications";
// import { getAllSubjects } from "../../../../actions/subjects";
// import { getTeachersWithBriefInfo } from "../../../../actions/teachers";
// import SubjectListing from "../../../../components/dashboard/academics/SubjectListing";
// import ClassListing from "../../../../components/dashboard/class-listing";
// import React from "react";

// export default async function page() {
//   const { user } = await validateRequest();

//   if (!user) return null;

//   const school = await SchoolUser(user.id);

//   // getAllSubjects artık { data, error } döndürüyor
//   const subjectsResponse = await getAllSubjects(school?.id ?? "");
  
//   // Response'un data property'sinden subject'leri al
//   const subjects = subjectsResponse?.data || [];
//   const departments = (await getBriefDepartments(school?.id ?? "")) || [];

//   console.log("departments:", departments);
//   console.log("subjects response:", subjectsResponse);
//   console.log("subjects data:", subjects);

//   return (
//     <div className="p-8">
//       <SubjectListing 
//         subjects={subjects} 
//         departments={departments} 
//         schoolId={school?.id} 
//       />
//     </div>
//   );
// }



import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../../actions/auth";
import { getBriefDepartments } from "../../../../actions/communications";
import { getAllSubjects } from "../../../../actions/subjects";
import SubjectListing from "../../../../components/dashboard/academics/SubjectListing";
import React from "react";



export default async function Page() {
  const { user } = await validateRequest();
  if (!user) return null;

  

  const school = await SchoolUser(user.id);
  const schoolId = school?.id ?? "";

  const [subjectsResponse, departments] = await Promise.all([
    getAllSubjects(schoolId),
    getBriefDepartments(schoolId),
  ]);

  const subjects = Array.isArray(subjectsResponse)
    ? subjectsResponse
    : subjectsResponse?.data ?? [];

  return (
    <div>
      <SubjectListing
        subjects={subjects}
        departments={departments ?? []}
        schoolId={schoolId}
      />
    </div>
  );
}