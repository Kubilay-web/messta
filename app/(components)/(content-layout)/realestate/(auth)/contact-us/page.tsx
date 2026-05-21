import Logo from "../../components/logo";
import SectionHeader from "../../components/frontend/section-header";
import ContactUs, { ContactProps } from "../../components/frontend/contact-us";
import prisma from "../../../../../lib/db";
import { revalidatePath } from "next/cache";

// POST — yeni demo/iletişim talebi oluştur
async function createContactAction(
  data: ContactProps
): Promise<{ ok: boolean; error?: string }> {
  "use server";
  try {
    await prisma.contact.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        school: data.school,       // agency / company adı
        country: data.country,
        schoolPage: data.schoolPage, // website / linkedin
        students: data.students,   // mülk / ilan sayısı
        role: data.role,
        media: data.media,
        message: data.message,
      },
    });
    revalidatePath("/realestate/contact-us");
    return { ok: true };
  } catch (error: any) {
    // Unique constraint: aynı e-posta veya şirket zaten kayıtlı
    if (error?.code === "P2002") {
      return { ok: false, error: "This email or company is already registered." };
    }
    console.error("createContact:", error);
    return { ok: false, error: "Submission failed. Please try again." };
  }
}

// DELETE — iletişim kaydını sil (admin kullanımı)
async function deleteContactAction(
  id: string
): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/management/contact-us");
    return { ok: true };
  } catch (error) {
    console.error("deleteContact:", error);
    return { ok: false };
  }
}

// PUT — iletişim kaydını güncelle (admin kullanımı)
async function updateContactAction(
  id: string,
  data: Partial<ContactProps>
): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.contact.update({ where: { id }, data });
    revalidatePath("/management/contact-us");
    return { ok: true };
  } catch (error) {
    console.error("updateContact:", error);
    return { ok: false };
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10 px-4">
        <div className="flex items-center justify-center pb-8">
          {/* <Logo size="lg" /> */}
        </div>
        <SectionHeader
          title=""
          heading="Get Your Real Estate ERP System"
          description="Ready to transform your agency's operations? Fill out the form and we'll set up a personalized demo tailored to your business."
        />
      </div>
      <ContactUs onSubmit={createContactAction} />
    </div>
  );
}
