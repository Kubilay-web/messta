import React from "react";

import { getServerSchool, getServerUser, SchoolUser } from "../../../../actions/auth";
import { getAllClasses } from "../../../../actions/classes";
import StudentListingByClass from "../../../../components/dashboard/StudentListingByClass";
import { validateRequest } from "@/app/auth";
export default async function page() {
  // const school = await getServerSchool();

      const { user } = await validateRequest();
    
      if (!user) return null;
    
      const school = await SchoolUser(user.id);

  
  const classes = (await getAllClasses(school?.id ?? "")) || [];
  // const user = await getServerUser();
  const role = user?.roleschool ?? "STUDENT";
  return <StudentListingByClass role={role} classes={classes} />;
}
