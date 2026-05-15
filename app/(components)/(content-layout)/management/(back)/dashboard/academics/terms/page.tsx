import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import {
  getAllGroupedPeriods,
  getAllPeriods,
} from "../../../../actions/periods";
import PeriodsPage from "../../../../components/dashboard/academics/periods-page";
import React from "react";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  const school = await SchoolUser(user?.id);

  const terms = (await getAllPeriods(school?.id ?? "")) || [];


  return (
    <div>
      <PeriodsPage periods={terms} schoolId={school.id} />
    </div>
  );
}
