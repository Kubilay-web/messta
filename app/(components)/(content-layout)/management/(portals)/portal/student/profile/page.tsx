import { validateRequest } from "@/app/auth";
import { getServerSchool, getServerUser, SchoolUser } from "../../../../actions/auth";
import { getAllPeriods } from "../../../../actions/periods";
import { getStudentById, getStudentByUserId } from "../../../../actions/students";
import StudentDetailPage from "../../../../components/dashboard/StudentDetailPage";
import { notFound } from "next/navigation";
import React from "react";

export default async function page() {



  const {user} = await validateRequest();




  // if (!user) {
  //   return notFound();
  // }


  // const student = await getStudentByUserId(user?.id);



   const school = await SchoolUser(user?.id);


  // if (!student) {
  //   return notFound();
  // }


  // const school = await getServerSchool();

  
  const terms = (await getAllPeriods(school?.id ?? "")) || [];
  const currentYear = new Date().getFullYear();



  const student = (await getStudentByUserId(user?.id))?.[0];

  
  console.log("student",student)




  return (
    <div>
      <StudentDetailPage
        terms={terms.filter((item) => item.year === currentYear)}
        student={student}
        schoolId={school.id}
      />
    </div>
  );
}
