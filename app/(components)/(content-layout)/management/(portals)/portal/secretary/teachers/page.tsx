import React from "react";
import { columns } from "./columns";
import DataTable from "../../../../components/DataTableComponents/DataTable";

import TableHeader from "../../../../components/dashboard/Tables/TableHeader";

import { getAllTeachers } from "../../../../actions/teachers";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { validateRequest } from "@/app/auth";
import ResponsiveTable from "../../../../(back)/dashboard/admin/contacts/ResponsiveTable";

export default async function page() {
  // const school = await getServerSchool();

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  const teachers = (await getAllTeachers(school?.id ?? "")) || [];
  return (
    <div >
      <TableHeader
        title="Teachers"
        linkTitle="Add Teacher"
        href="/management/portal/secretary/teachers/new"
        data={teachers}
        model="teacher"
      />
      <div className="py-2">
        {/* <DataTable data={teachers} columns={columns} /> */}

          <ResponsiveTable data={teachers} columns={columns} />
      </div>
    </div>
  );
}
