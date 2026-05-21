import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";
import FooterSectionForm from "../../../../../components/school/section-forms/footer-section-form";
import HeroSectionForm from "../../../../../components/school/section-forms/hero-section-form";
import React from "react";

export default function page() {
  return (
    <main className="min-h-screen bg-background ">
      <CustomizePageHeader
        subtitle="Customize your school website's footer section"
        title="Footer Customization"
      />

      <FooterSectionForm />
    </main>
  );
}
