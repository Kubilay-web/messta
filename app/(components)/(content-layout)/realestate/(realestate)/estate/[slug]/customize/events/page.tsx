import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getSectionByType, getSiteRecentEvents } from "../../../../../actions/site";
import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";
import EventsSectionForm from "../../../../../components/school/section-forms/events-section-form";
import HeroSectionForm from "../../../../../components/school/section-forms/hero-section-form";
import { SectionType } from "../../../../../lib/sectionTypes";
import React from "react";

export default async function page() {
  // const school = await getServerSchool();



      const { user } = await validateRequest();
    
      if (!user) return null;
    
      const school = await SchoolUser(user.id);

      
  const section = await getSectionByType(school?.id, SectionType.EVENTS);
  const recentEvents = (await getSiteRecentEvents(school?.id ?? "")) || [];
  return (
    <main className="min-h-screen bg-background ">
      <CustomizePageHeader
        subtitle="Customize your school's events section"
        title="Events Section Customization"
        sectionId={section?.id}
        isComplete={section?.isComplete}
      />
      {section && section.id ? (
        <EventsSectionForm recentEvents={recentEvents} section={section} schoolId={school.id} />
      ) : (
        <div className="">
          <p>No Section Found</p>
        </div>
      )}
    </main>
  );
}
