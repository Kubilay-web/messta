import React from "react";
import SchoolContactMessagesTable from "./messages-table";
import { getSchoolWebsiteMessages } from "../../../../actions/site";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { validateRequest } from "@/app/auth";

export default async function ContactMessagesPage() {
  // const school = await getServerSchool();

    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);


  const messages = (await getSchoolWebsiteMessages(school?.id ?? "")) || [];

  console.log("messages",messages)


  return (
    <div className="container mx-auto py-4 max-w-xl">
      <SchoolContactMessagesTable data={messages} schoolId={school.id} />
    </div>
  );
}
