import { revalidatePath } from "next/cache";
import prisma from "../../../../../../../lib/db";
import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import { columns } from "./columns";
import ResponsiveTable from "./ResponsiveTable";

const PATH = "/management/dashboard/admin/contacts";

// DELETE — iletişim kaydını sil
async function deleteContactAction(id: string): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    console.error("deleteContact:", error);
    return { ok: false };
  }
}

// PUT — iletişim kaydını güncelle
async function updateContactAction(
  id: string,
  data: Record<string, unknown>
): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.contact.update({ where: { id }, data });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    console.error("updateContact:", error);
    return { ok: false };
  }
}

// POST — yeni lead ekle (manuel, admin tarafından)
async function createContactAction(
  data: Record<string, unknown>
): Promise<{ ok: boolean }> {
  "use server";
  try {
    await prisma.contact.create({ data: data as any });
    revalidatePath(PATH);
    return { ok: true };
  } catch (error) {
    console.error("createContact:", error);
    return { ok: false };
  }
}

export default async function ContactsPage() {
  // GET — tüm leads/talepleri çek
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full min-w-0 px-3 sm:px-4 md:px-0">
      <TableHeader
        title="Demo Requests & Leads"
        linkTitle="Add Lead"
        href="/management/contact-us"
        data={contacts}
        model="contact"
      />
      <ResponsiveTable data={contacts} columns={columns} />
    </div>
  );
}
