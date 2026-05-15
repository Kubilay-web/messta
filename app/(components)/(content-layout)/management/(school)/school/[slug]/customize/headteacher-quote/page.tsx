import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getSectionByType } from "../../../../../actions/site";
import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";

import HeadmasterQuoteForm from "../../../../../components/school/section-forms/headmaster-quote-form";
import { SectionType } from "../../../../../lib/sectionTypes";

import React from "react";

export default async function page() {
  // const school = await getServerSchool();


    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);



  const section = await getSectionByType(
    school?.id,
    SectionType.HEADMASTER_QUOTE
  );
  return (
    <main className="min-h-screen bg-background ">
      <CustomizePageHeader
        subtitle="Customize your school website's headmaster quote section"
        title="Headmaster Quote Customization"
        sectionId={section?.id}
        isComplete={section?.isComplete}
      />

      {section && section.id ? (
        <HeadmasterQuoteForm section={section} />
      ) : (
        <div className="">
          <p>No Section Found</p>
        </div>
      )}
    </main>
  );
}
