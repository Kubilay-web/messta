import { getSchoolById } from "../../../../actions/schools";
import { getAllSchoolSections, getSiteRecentActivities } from "../../../../actions/site";

import WelcomeSection from "../../../../components/school/section-forms/welcome-section";

import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolById(slug, "slug");


  
  // if (!school) {
  //   return <div>School not found.</div>;
  // }


  const activities = (await getSiteRecentActivities(school?.id ?? "")) || [];
  const allSections = (await getAllSchoolSections(school?.id ?? "")) || [];
  const incompleteSections =
    allSections.filter((section) => section.isComplete === false).slice(0, 2) ||
    [];
    
  return (
    <div>
      <WelcomeSection
        incompleteSections={incompleteSections}
        school={school}
        activities={activities}
        allSections={allSections}
      />
    </div>
  );
}
