import React from "react";
import { columns } from "./columns";

import DataTable from "../../components/DataTableComponents/DataTable";
import TableHeader from "../../components/dashboard/Tables/TableHeader";
import { getAgencyProjects } from "../../actions/projects";
import { validateRequest } from "@/app/auth";

export default async function page() {
  const { user } = await validateRequest();
  const projects = (await getAgencyProjects(user?.agencyId)) || [];

  return (
    <div className="p-8">
      <TableHeader
        title="Süreçler"
        linkTitle="Süreç Ekle"
        href="/oneproject/dashboard/projects/new"
        data={projects}
        model="project"
      />
      <div className="pb-8 pt-4">
        <DataTable model="project" data={projects} columns={columns} />
      </div>
    </div>
  );
}
