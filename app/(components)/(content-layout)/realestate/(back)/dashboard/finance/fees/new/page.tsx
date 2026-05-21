import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getAllClasses } from "../../../../../actions/classes";
import { getAllPeriods } from "../../../../../actions/periods";
import SchoolFeeForm from "../../../../../components/dashboard/forms/finance/schoo-fee-form";
import React from "react";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);



  const classes = (await getAllClasses(school?.id ?? "")) || [];
  const terms = (await getAllPeriods(school?.id ?? "")) || [];
  return (
    <div className="p-8">
      <SchoolFeeForm classes={classes} terms={terms} schoolId={school.id} schoolName={school?.name} />
    </div>
  );
}
