// "use client";

// import Image from "next/image";

// import DateColumn from "../../../../components/DataTableColumns/DateColumn";


// import { ColumnDef } from "@tanstack/react-table";
// import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
// import { Payment, Student } from "../../../../types/types";
// import { ParentInfoModal } from "../../../../components/dashboard/modals/parent-info-modal";
// import { StudentInfoModal } from "../../../../components/dashboard/modals/student-info-modal";
// import { Button } from "../../../../components/ui/button";
// export const columns: ColumnDef<Payment>[] = [
//   {
//     accessorKey: "studentName",
//     header: "Student Name",
//     cell: ({ row }) => {
//       const payment = row.original;
//       return (
//         <div className="">
//           <h2 className="font-medium capitalize">
//             {payment.studentName.toLowerCase()}
//           </h2>
//           <p className="text-xs text-muted-foreground">
//             {payment.studentUserId}
//           </p>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "PRN",
//     header: "Details",
//     cell: ({ row }) => {
//       const payment = row.original;
//       return (
//         <div className="">
//           <h2 className="font-medium">{payment.PRN}</h2>
//           <div className="flex gap-3 items-center">
//             <p className="text-sm text-muted-foreground">
//               UGX {payment.paidFeeAmount.toLocaleString("en-US")}
//             </p>
//             (
//             <div className="text-xs flex items-center text-muted-foreground gap-2">
//               {payment.paidFees.map((item) => {
//                 const arr = item.split("*");
//                 return (
//                   <span className="" key={arr[2]}>
//                     {arr[0]}({Number(arr[1]).toLocaleString("en-US")}),
//                   </span>
//                 );
//               })}
//             </div>
//             )
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "className",
//     header: "Class",
//     cell: ({ row }) => {
//       const payment = row.original;
//       return (
//         <div className="">
//           <h2 className="font-medium">{payment.className ?? ""}</h2>
//           <p className="text-xs text-muted-foreground">{payment.term ?? ""}</p>
//         </div>
//       );
//     },
//   },

//   {
//     accessorKey: "view",
//     header: "View",
//     cell: ({ row }) => {
//       const payment = row.original;
//       return (
//         <div className="">
//           <Button>{payment.paymentStatus}</Button>
//         </div>
//       );
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const contact = row.original;
//       return (
//         <ActionColumn
//           row={row}
//           model="contact"
//           editEndpoint={`#`}
//           id={contact.id}
//         />
//       );
//     },
//   },
// ];












"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "../../../../types/types";
import { Button } from "../../../../components/ui/button";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "studentName",
    header: "Student Name",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="">
          <h2 className="font-medium text-sm capitalize">
            {payment.studentName.toLowerCase()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {payment.studentUserId}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "PRN",
    header: "Details",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="">
          <h2 className="font-medium text-sm">{payment.PRN}</h2>
          <div className="flex gap-3 items-center text-sm text-muted-foreground">
            <p>UGX {payment.paidFeeAmount.toLocaleString("en-US")}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {payment.paidFees.map((item) => {
                const arr = item.split("*");
                return (
                  <span key={arr[2]}>
                    {arr[0]}({Number(arr[1]).toLocaleString("en-US")}),
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "className",
    header: "Class",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="">
          <h2 className="font-medium text-sm">{payment.className ?? ""}</h2>
          <p className="text-sm text-muted-foreground">{payment.term ?? ""}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "view",
    header: "View",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <div className="">
          <Button size="sm">{payment.paymentStatus}</Button>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <ActionColumn
          row={row}
          model="contact"
          editEndpoint={`#`}
          id={contact.id}
        />
      );
    },
  },
];