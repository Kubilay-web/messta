"use client";

import Image from "next/image";

import DateColumn from "../../../../components/DataTableColumns/DateColumn";



import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
import { Student } from "../../../../types/types";
import { ParentInfoModal } from "../../../../components/dashboard/modals/parent-info-modal";
import { StudentInfoModal } from "../../../../components/dashboard/modals/student-info-modal";
import { SchoolFeeDTO } from "../../../../actions/school-fees";




export const columns: ColumnDef<SchoolFeeDTO>[] = [
  {
    accessorKey: "title",
    header: "Fee Title",
    cell: ({ row }) => {
      const fee = row.original;
      return <h2 className="font-medium text-sm capitalize">{fee.title}</h2>;
    },
  },
  {
    accessorKey: "fees",
    header: "Fee Total Amount",
    cell: ({ row }) => {
      const fee = row.original;
      return <h2 className="font-medium text-sm capitalize">{fee.totalFees}</h2>;
    },
  },
  {
    accessorKey: "term",
    header: "Term",
    cell: ({ row }) => {
      const fee = row.original;
      return <h2 className="font-medium text-sm capitalize">{fee.term}</h2>;
    },
  },
  {
    accessorKey: "className",
    header: "Class",
    cell: ({ row }) => {
      const fee = row.original;
      return <h2 className="font-medium text-sm capitalize">{fee.className}</h2>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => {
      const fee = row.original;
      return <h2 className="font-medium text-sm capitalize">{fee.year}</h2>;
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
