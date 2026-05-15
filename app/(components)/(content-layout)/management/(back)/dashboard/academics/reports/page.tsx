import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { getAllClasses, getBriefClasses } from "../../../../actions/classes";
import { getAllPeriods } from "../../../../actions/communications";
import { getExamsByAcademicYear } from "../../../../actions/exams";
import ReportCardsListing from "../../../../components/dashboard/academics/report-card-listing";
import React from "react";


export default async function page() {
  const { user } = await validateRequest();
  const school = await SchoolUser(user?.id);

  const currentYear = new Date().getFullYear();

  const [classes, allTerms, exams] = await Promise.all([
    getAllClasses(school?.id ?? ""),
    getAllPeriods(school?.id ?? ""),
    getExamsByAcademicYear(school?.id ?? "", currentYear.toString()),
  ]);

  const terms = (allTerms || []).filter(
    (item) => item.year === currentYear
  );

  return (
    <div>
      <ReportCardsListing
        exams={exams || []}
        terms={terms}
        classes={classes || []}
      />
    </div>
  );
}
