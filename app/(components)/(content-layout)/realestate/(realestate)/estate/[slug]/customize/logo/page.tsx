import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../../actions/auth";
import { getSectionByType } from "../../../../../actions/site";
import CustomizePageHeader from "../../../../../components/school/CustomizePageHeader";
import LogoNavigationForm from "../../../../../components/school/section-forms/logo-naviation-form";
import { SectionType } from "../../../../../lib/sectionTypes";

export default async function LogoNavigation() {
  // Get The section initial DATA
  // const school = await getServerSchool();



    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);



  const section = await getSectionByType(
    school?.id,
    SectionType.LOGO_NAVIGATION
  );
  // console.log(section);
  return (
    <main className="min-h-screen bg-background max-w-3xl ">
      <CustomizePageHeader
        subtitle=" Customize your school website's logo and navigation"
        title="Logo Customization"
        sectionId={section?.id}
        isComplete={section?.isComplete}
      />
      {section && section.id ? (
        <LogoNavigationForm section={section} />
      ) : (
        <div className="">
          <p>No Section Found</p>
        </div>
      )}
    </main>
  );
}
