import { validateRequest } from "@/app/auth";
import { getServerSchool, SchoolUser } from "../../../actions/auth";
import { getAllLogs } from "../../../actions/user-logs";
import UserLogs, { UserLog } from "../../../components/dashboard/UserLogs";
import React from "react";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  const logs: UserLog[] = (await getAllLogs(school?.id ?? "")) || [];


  console.log("logs",logs)
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        User Activity Dashboard
      </h1>
      <UserLogs logs={logs} />
    </div>
  );
}
