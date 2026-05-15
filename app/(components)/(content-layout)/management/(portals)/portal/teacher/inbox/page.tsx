import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { getRemindersByKey } from "../../../../actions/communications";
import { ReminderInbox } from "../../../../components/portal/Inbox";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  
  const schoolId = school?.id ?? "";
  const key = "Teachers";
  const reminders = await getRemindersByKey(schoolId, key);
  return (
    <div className="p-2">
      <ReminderInbox reminders={reminders} />
    </div>
  );
}
