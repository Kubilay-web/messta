// "use client";

// import Image from "next/image";

// import DateColumn from "../../../../components/DataTableColumns/DateColumn";



// import { ColumnDef } from "@tanstack/react-table";
// import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
// import { Parent, Teacher } from "../../../../types/types";
// import { TeacherInfoModal } from "../../../../components/dashboard/modals/teacher-info-modal";
// export const columns: ColumnDef<Teacher>[] = [
//   {
//     accessorKey: "user",
//     header: "Name",
//     cell: ({ row }) => {
//       const teacher = row.original;
//       return (
//         <div className="flex items-center gap-1">
//           <Image
//             src={teacher.imageUrl}
//             alt={teacher.firstName}
//             width={512}
//             height={512}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <div className="">
//             <h2 className="font-medium capitalize">
//               {teacher.firstName.toLowerCase()} {teacher.lastName.toLowerCase()}
//             </h2>
//             <p className="text-xs text-muted-foreground">
//               {teacher.employeeId}
//             </p>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "email-phone",
//     header: "Contact",
//     cell: ({ row }) => {
//       const teacher = row.original;
//       return (
//         <div className="">
//           <h2 className="font-medium">{teacher.email.toLowerCase()}</h2>
//           <p className="text-xs text-muted-foreground">{teacher.phone}</p>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "nationality",
//     header: "Country",
//   },
//   {
//     accessorKey: "view",
//     header: "View",
//     cell: ({ row }) => <TeacherInfoModal teacher={row.original} />,
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Date Created",
//     cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
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

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
import { Teacher } from "../../../../types/types";
import { TeacherInfoModal } from "../../../../components/dashboard/modals/teacher-info-modal";
import DateColumn from "../../../../components/DataTableColumns/DateColumn";

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "user",
    header: "Name",
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <div className="flex items-center gap-2">
          <Image
            src={teacher.imageUrl}
            alt={teacher.firstName}
            width={512}
            height={512}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-medium text-sm capitalize">
              {teacher.firstName.toLowerCase()} {teacher.lastName.toLowerCase()}
            </h2>
            <p className="text-sm text-muted-foreground">
              {teacher.employeeId}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email-phone",
    header: "Contact",
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <div>
          <h2 className="font-medium text-sm">
            {teacher.email.toLowerCase()}
          </h2>
          <p className="text-sm text-muted-foreground">
            {teacher.phone}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "nationality",
    header: "Country",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.nationality}</span>
    ),
  },
  {
    accessorKey: "view",
    header: "View",
    cell: ({ row }) => <TeacherInfoModal teacher={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
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