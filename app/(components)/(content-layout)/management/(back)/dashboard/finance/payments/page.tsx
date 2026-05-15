// import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
// import DataTable from "../../../../components/DataTableComponents/DataTable";
// import React from "react";
// import { columns } from "./columns";
// import { getFeesForCurrentYear } from "../../../../actions/school-fees";
// import { getServerSchool, SchoolUser } from "../../../../actions/auth";
// import { getAllPayments } from "../../../../actions/payments";
// import { validateRequest } from "@/app/auth";

// export default async function page() {
//   // const school = await getServerSchool();

//   const { user } = await validateRequest();

//   if (!user) return null;

//   const school = await SchoolUser(user.id);

//   const payments = (await getAllPayments(school?.id ?? "")) || [];

//   return (
//     <div className="p-8">
//       <TableHeader
//         title={`School Fees Payments ${new Date().getFullYear()}`}
//         linkTitle="Add New Payment"
//         href="/management/dashboard/finance/fees/new"
//         data={payments}
//         model="payments"
//       />
//       <div className="py-8">
//         <DataTable data={payments} columns={columns} />
//       </div>
//     </div>
//   );
// }

import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../../actions/auth";
import { getAllPayments } from "../../../../actions/payments";
import TableHeader from "../../../../components/dashboard/Tables/TableHeader";
import DataTable from "../../../../components/DataTableComponents/DataTable";
import { columns } from "./columns";
import ResponsiveTable from "../../admin/contacts/ResponsiveTable";

export default async function PaymentsPage() {
  const { user } = await validateRequest();
  if (!user) return null;

  const school = await SchoolUser(user.id);
  const schoolId = school?.id ?? "";

  if (!schoolId) {
    return (
      <div >
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          School not found. Please contact support.
        </div>
      </div>
    );
  }

  const payments = await getAllPayments(schoolId);

  console.log("Payments:", payments);

  return (
    <div >
      <TableHeader
        title="Fee Payments"
        linkTitle="Record New Payment"
        href="/management/dashboard/finance/fees/new"
        data={payments}
        model="payment"
      />
      <div>
        {/* <DataTable data={payments} columns={columns} /> */}

        <ResponsiveTable data={payments} columns={columns} /> 
      </div>
    </div>
  );
}
