import React from "react";
import PortalAnalytics from "../../components/portal/PortalAnalytics";
import { getServerUser, SchoolUser } from "../../actions/auth";
import { WelcomeBanner } from "../../components/dashboard/welcome-message";
import { redirect } from "next/navigation";
import TeacherAnalytics from "../../components/portal/TeacherAnalytics";
import { getTeacherAnalytics } from "../../actions/analytics";
import { validateRequest } from "@/app/auth";

export default async function Portal() {


  

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  // if (!user) {
  //   redirect("/login");
  // }



  const schoolId = school?.id ?? "";
  const data = await getTeacherAnalytics(schoolId);



  return (
    <div className="px-8 py-4">
      <WelcomeBanner
        userName={user?.username}
        userRole={user.roleschool}
        userSchool={school?.name ?? ""}
      />
      <TeacherAnalytics data={data} />
    </div>
  );
}
