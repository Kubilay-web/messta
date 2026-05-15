import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import {
  getSectionByType,
  getSiteGalleryCategories,
  getSiteGalleryImages,
} from "../../../../../actions/site";
import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";
import GallerySectionForm from "../../../../../components/school/section-forms/gallery-section";
import { SectionType } from "../../../../../lib/sectionTypes";

import React from "react";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  const section = await getSectionByType(school?.id, SectionType.GALLERY);
  const categories = (await getSiteGalleryCategories(school?.id ?? "")) || [];
  const galleryImages = (await getSiteGalleryImages(school?.id ?? "")) || [];

  return (
    <main className="min-h-screen bg-background ">
      <CustomizePageHeader
        subtitle="Customize your school's image gallery section"
        title="Gallery Section Customization"
        sectionId={section?.id}
        isComplete={section?.isComplete}
      />
      {section && section.id ? (
        <GallerySectionForm
          galleryImages={galleryImages}
          initialCategories={categories}
          section={section}
        />
      ) : (
        <div className="">
          <p>No Section Found</p>
        </div>
      )}
    </main>
  );
}
