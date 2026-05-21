import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { getAllClasses } from "../../../../actions/classes";
import { getAllPeriods } from "../../../../actions/communications";
import { getExamsByAcademicYear } from "../../../../actions/exams";
import ReportCardsListing from "../../../../components/dashboard/academics/report-card-listing";
import React from "react";



export default async function page() {
  const { user } = await validateRequest();
  if (!user) return null;

  const school = await SchoolUser(user.id);
  const schoolId = school?.id ?? "";

  const currentYear = new Date().getFullYear();

  const [classes, allTerms, exams] = await Promise.all([
    getAllClasses(schoolId),
    getAllPeriods(schoolId),
    getExamsByAcademicYear(schoolId, currentYear.toString()),
  ]);

  const terms = (allTerms || []).filter(
    (item) => item.year === currentYear
  );

  return (
    <div className="p-2">
      <ReportCardsListing
        exams={exams || []}
        terms={terms}
        classes={classes || []}
      />
    </div>
  );
}
