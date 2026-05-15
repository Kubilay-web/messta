import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../../actions/auth";
import { getBriefClasses } from "../../../../actions/classes";
import { getExamsByAcademicYear } from "../../../../actions/exams";
import { getAllPeriods } from "../../../../actions/periods";
import { getBriefSubjects } from "../../../../actions/subjects";
import ExamManager from "../../../../components/dashboard/exams/ExamManager";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  if (!user) return null;

  const school = await SchoolUser(user.id);
  if (!school) return null;

  // Parallel fetch
  const [classes, subjects, allTerms, exams] = await Promise.all([
    getBriefClasses(school.id),
    getBriefSubjects(school.id),
    getAllPeriods(school.id),
    getExamsByAcademicYear(school.id, new Date().getFullYear().toString()),
  ]);

  const currentYear = new Date().getFullYear();
  const terms = allTerms.filter((item) => item.year === currentYear);

  return (
    <div className="p-8">
      <ExamManager
        exams={exams || []}
        terms={terms || []}
        subjects={subjects || []}
        classes={classes || []}
        schoolId={school.id}
      />
    </div>
  );
}