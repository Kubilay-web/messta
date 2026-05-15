import React, { Suspense } from "react";
import { validateRequest } from "@/app/auth";
import { getSchoolById } from "../../../actions/schools";
import { getSectionByType, getSiteGalleryCategories, getSiteGalleryImages, getSiteRecentEvents, getSiteRecentNews } from "../../../actions/site";
import { SectionType } from "../../../lib/sectionTypes";

import EnableSite from "../../../components/dashboard/EnableSite";
import HeaderLoader from "../suspense-loaders/HeaderLoader";
import SchoolHeader from "../../../components/school/school-header";
import SchoolHeroSection from "../../../components/school/SchoolHeroSection";
import SchoolAboutSection from "../../../components/school/SchoolAboutSection";
import HeadmasterQuote from "../../../components/school/headmaster-quote";
import SchoolAdmissionSection from "../../../components/school/SchoolAdmissionSection";
import SchoolGallerySection from "../../../components/school/SchoolGallerySection";
import SchoolNews from "../../../components/school/SchoolNews";
import SchoolEvents from "../../../components/school/SchoolEvents";
import SchoolContactForm from "../../../components/school/SchoolContactForm";
import SchoolFooter from "../../../components/school/SchoolFooter";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) return <div>School not found.</div>;

  const school = await getSchoolById(slug, "slug");
  if (!school) return <div>School not found.</div>;

  const { user } = await validateRequest();

  if (!school.siteEnabled && user) {
    return <EnableSite schoolSlug={school.slug} schoolId={school.id} />;
  }

  // Parallel fetch tüm section'ları aynı anda çek
  const [
    headerSection,
    heroSection,
    aboutSection,
    headTeacherQuoteSection,
    admissionSection,
    contactSection,
    footerSection,
    gallerySection,
    newsSection,
    eventSection,
    recentNews,
    recentEvents,
    galleryCategories,
    galleryImages
  ] = await Promise.all([
    getSectionByType(school.id, SectionType.LOGO_NAVIGATION),
    getSectionByType(school.id, SectionType.HERO),
    getSectionByType(school.id, SectionType.ABOUT),
    getSectionByType(school.id, SectionType.HEADMASTER_QUOTE),
    getSectionByType(school.id, SectionType.ADMISSION),
    getSectionByType(school.id, SectionType.CONTACT),
    getSectionByType(school.id, SectionType.FOOTER),
    getSectionByType(school.id, SectionType.GALLERY),
    getSectionByType(school.id, SectionType.NEWS),
    getSectionByType(school.id, SectionType.EVENTS),
    getSiteRecentNews(school.id),
    getSiteRecentEvents(school.id),
    getSiteGalleryCategories(school.id),
    getSiteGalleryImages(school.id)
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<HeaderLoader />}>
        <SchoolHeader section={headerSection} />
      </Suspense>

      <main>
        <Suspense fallback={<HeaderLoader />}>
          <SchoolHeroSection section={heroSection} />
        </Suspense>

        <Suspense fallback={<HeaderLoader />}>
          <SchoolAboutSection section={aboutSection} />
        </Suspense>

        <Suspense fallback={<HeaderLoader />}>
          <HeadmasterQuote section={headTeacherQuoteSection} />
        </Suspense>

        <Suspense fallback={<HeaderLoader />}>
          <SchoolGallerySection
            section={gallerySection}
            galleryCategories={galleryCategories}
            galleryImages={galleryImages}
          />
        </Suspense>

        {recentNews.length > 0 && (
          <Suspense fallback={<HeaderLoader />}>
            <SchoolNews section={newsSection} recentNews={recentNews} />
          </Suspense>
        )}

        <Suspense fallback={<HeaderLoader />}>
          <SchoolAdmissionSection section={admissionSection} />
        </Suspense>

        {recentEvents.length > 0 && (
          <Suspense fallback={<HeaderLoader />}>
            <SchoolEvents section={eventSection} recentEvents={recentEvents} />
          </Suspense>
        )}

        <Suspense fallback={<HeaderLoader />}>
          <SchoolContactForm section={contactSection} />
        </Suspense>
      </main>

      {/* <Suspense fallback={<HeaderLoader />}>
        <SchoolFooter section={footerSection} />
      </Suspense> */}
    </div>
  );
}