import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { getMessageGroups } from "../../../../actions/communications";
import { getAllParents } from "../../../../actions/parents";
import MessageComposer from "../../../../components/dashboard/message-composer";
import SendMailForm from "../../../../components/emails/SendMailForm";

export default async function AdminMessagePage() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  const parents = (await getAllParents(school?.id ?? "")) || [];
  const groups = await getMessageGroups(school?.id ?? "");

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Messaging Center</h1>
      <SendMailForm groupsData={groups} schoolId={school.id} />
      {/* <MessageComposer parents={parents} />  */}
    </div>
  );
}
