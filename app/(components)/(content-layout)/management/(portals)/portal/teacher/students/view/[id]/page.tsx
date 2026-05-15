import { getServerSchool } from "../../../../../../actions/auth";
import { getAllPeriods } from "../../../../../../actions/periods";
import { getStudentById } from "../../../../../../actions/students";
import StudentDetailPage from "../../../../../../components/dashboard/StudentDetailPage";
import { notFound } from "next/navigation";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  if (!id) {
    return notFound();
  }
  const student = await getStudentById(id);
  if (!student) {
    return notFound();
  }
  const school = await getServerSchool();
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
