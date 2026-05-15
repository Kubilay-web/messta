// import React from "react";
// import { columns } from "./columns";
// import DataTable from "../../../components/DataTableComponents/DataTable";
// import TableHeader from "../../../components/dashboard/Tables/TableHeader";
// import { getAllParents } from "../../../actions/parents";
// import { getServerSchool, SchoolUser } from "../../../actions/auth";
// import { getStaffMembers } from "../../../actions/users";
// import { validateRequest } from "@/app/auth";

// export default async function page() {
//   // const school = await getServerSchool();


//   const { user } = await validateRequest();

//   if (!user) return null;

//   const school = await SchoolUser(user.id);


//   const staffMembers = (await getStaffMembers(school?.id ?? "")) || [];

//   console.log("staff",staffMembers)


//   return (
//     <div className="p-8">
//       <TableHeader
//         title="Staff Members"
//         linkTitle="Add New Staff"
//         href="/management/dashboard/users/new"
//         data={staffMembers}
//         model="staff"
//       />
//       <div className="py-8">
//         <DataTable data={staffMembers} columns={columns} />
//       </div>
//     </div>
//   );
// }











import React from "react";
import { columns } from "./columns";
import DataTable from "../../../components/DataTableComponents/DataTable";
import TableHeader from "../../../components/dashboard/Tables/TableHeader";
import { getStaffMembers } from "../../../actions/users";
import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../actions/auth";
import ResponsiveTable from "../admin/contacts/ResponsiveTable";

export default async function StaffPage() {
  const { user } = await validateRequest();
  if (!user) return null;

  const school = await SchoolUser(user.id);
  const schoolId = school?.id ?? "";

  if (!schoolId) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          School not found.
        </div>
      </div>
    );
  }

  const staffMembers = await getStaffMembers(schoolId);

  console.log("Staff members:", staffMembers);

  return (
    <div>
      <TableHeader
        title="Staff Members"
        linkTitle="Add New Staff"
        href="/management/dashboard/users/new"
        data={staffMembers}
        model="staff"
      />
      <div className="py-2">
        {/* <DataTable data={staffMembers} columns={columns} /> */}


           <ResponsiveTable data={staffMembers} columns={columns} />
      </div>
    </div>
  );
}