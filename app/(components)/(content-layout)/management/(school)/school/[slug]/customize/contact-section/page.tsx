import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getSectionByType } from "../../../../../actions/site";
import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";
import ContactSectionForm from "../../../../../components/school/section-forms/contact-section-form";
import { SectionType } from "../../../../../lib/sectionTypes";
import React from "react";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  const section = await getSectionByType(school?.id, SectionType.CONTACT);
  return (
    <main className="min-h-screen bg-background ">
      <CustomizePageHeader
        subtitle="Customize your website's contact section"
        title="Contact Section Customization"
        sectionId={section?.id}
        isComplete={section?.isComplete}
      />
      {section && section.id ? (
        <ContactSectionForm section={section} />
      ) : (
        <div className="">
          <p>No Section Found</p>
        </div>
      )}
    </main>
  );
}
