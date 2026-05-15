import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import DataTable from "../../../../components/DataTableComponents/DataTable";
import React from "react";
import { columns } from "./columns";
import { getFeesForCurrentYear } from "../../../../actions/school-fees";
import { getServerSchool, SchoolUser } from "../../../../actions/auth";
import { validateRequest } from "@/app/auth";
import ResponsiveTable from "../../admin/contacts/ResponsiveTable";

export default async function page() {
  // const school = await getServerSchool();

    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);
  
  const fees = (await getFeesForCurrentYear(school?.id ?? "")) || [];




  return (
    <div className="p-2">
      <TableHeader
        title={`School Fees for year ${new Date().getFullYear()}`}
        linkTitle="Add New School Fee"
        href="/management/dashboard/finance/fees/new"
        data={fees}
        model="schoolFee"
      />
      <div className="py-2">
        {/* <DataTable data={fees} columns={columns} /> */}

        <ResponsiveTable data={fees} columns={columns}/>
      </div>
    </div>
  );
}
