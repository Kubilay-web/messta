// import { validateRequest } from "@/app/auth";
// import {
//   SchoolUser,
// } from "../../../../actions/auth";
// import { getStudentsByParentId, getParentIdFromUserId } from "../../../../actions/parents";
// import { getAllPeriods } from "../../../../actions/periods";
// import PaymentListing from "../../../../components/dashboard/forms/finance/payment-listing";

// import React from "react";

// export default async function Page() {
//   const { user } = await validateRequest();

//   if (!user) return null;

//   const school = await SchoolUser(user.id);

//   console.log("========== PARENT PAYMENTS ==========");
//   console.log("👤 User ID:", user.id);
//   console.log("👤 User email:", user.email);
//   console.log("👤 User role:", user.roleschool);

//   // TEK SATIR: user.id'den parentId'yi al
//   const parentId = await getParentIdFromUserId(user.id);
  
//   console.log("📋 Parent ID:", parentId);

//   if (!parentId) {
//     console.error("❌ Parent not found for user:", user.id);
//     return (
//       <div className="p-8">
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//           Parent not found. Please contact support.
//         </div>
//       </div>
//     );
//   }

//   // Parent ID ile öğrencileri getir
//   const students = await getStudentsByParentId(parentId);
//   console.log("👨‍👩‍👧‍👦 Students:", students);

//   const terms = await getAllPeriods(school?.id ?? "");
//   const currentYear = new Date().getFullYear();

//   const parentData = {
//     parentProfileId: parentId,
//     parentUserId: user.id,
//     parentName: user.username || user.name || "Parent",
//   };

//   return (
//     <div className="">
//       <PaymentListing
       
//         terms={terms.filter((item) => item.year === currentYear)}
//         students={students}
//         parentData={parentData}
//         schoolId={school.id}
//         schoolName={school?.name}
//       />
//     </div>
//   );
// }




import { validateRequest } from "@/app/auth";
import { SchoolUser } from "../../../../actions/auth";
import {
  getStudentsByParentId,
  getParentIdFromUserId,
} from "../../../../actions/parents";
import { getAllPeriods } from "../../../../actions/periods";
import PaymentListing from "../../../../components/dashboard/forms/finance/payment-listing";

import React from "react";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);

  console.log("========== PARENT PAYMENTS ==========");
  console.log("👤 User ID:", user.id);
  console.log("👤 User email:", user.email);
  console.log("👤 User role:", user.roleschool);

  const parentId = await getParentIdFromUserId(user.id);

  console.log("📋 Parent ID:", parentId);

  if (!parentId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg text-center">
          Parent not found. Please contact support.
        </div>
      </div>
    );
  }

  const students = await getStudentsByParentId(parentId);
  const terms = await getAllPeriods(school?.id ?? "");
  const currentYear = new Date().getFullYear();

  const parentData = {
    parentProfileId: parentId,
    parentUserId: user.id,
    parentName: user.username || user.name || "Parent",
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Payments
          </h1>
          <p className="text-sm text-gray-500">
            {school?.name}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white w-full rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <PaymentListing
            terms={terms.filter((item) => item.year === currentYear)}
            students={students}
            parentData={parentData}
            schoolId={school.id}
            schoolName={school?.name}
          />
        </div>
      </div>
    </div>
  );
}