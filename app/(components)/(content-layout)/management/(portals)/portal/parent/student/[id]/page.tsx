import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getAllPeriods } from "../../../../../actions/periods";
import { getStudentById } from "../../../../../actions/students";
import StudentDetailPage from "../../../../../components/dashboard/StudentDetailPage";
import { notFound } from "next/navigation";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  // if (!id) {
  //   return notFound();
  // }

  // if (!student) {
  //   return notFound();
  // }

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  // const school = await getServerSchool();

  const student = await getStudentById(id);

  const terms = (await getAllPeriods(school?.id ?? "")) || [];
  const currentYear = new Date().getFullYear();
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
