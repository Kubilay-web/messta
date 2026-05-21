import React, { ReactNode } from "react";
import SchoolCustomSidebar from "../../../../components/school/school-custom-sidebar";
import SchoolCustomHeader from "../../../../components/school/SchoolCustomHeader";
import { getServerUser, SchoolUser } from "../../../../actions/auth";
import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";

export default async function CustomizationLayout({
  children,
}: {
  children: ReactNode;
}) {



  const {user} = await validateRequest();



  // if (!user) {
  //   redirect("/login");
  // }



const school = await SchoolUser(user.id);


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <SchoolCustomSidebar school={school} schoolSlug={school?.slug} />
      <div className="flex flex-col">
        <SchoolCustomHeader user={user} />
        <div className="flex min-h-screen w-full flex-col p-6">{children}</div>
      </div>
    </div>
  );
}
