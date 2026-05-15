"use client";

import { ColumnDef } from "@tanstack/react-table";
import DateColumn from "../../../../components/DataTableColumns/DateColumn";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
import { Contact } from "../../../../types/types";
import ContactInfoModal from "../../../../components/DataTableColumns/ContactCard";

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "user",
    header: "Name",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="min-w-0">
          <p className="font-medium text-sm text-black truncate">
            {contact.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{contact.school}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "email-phone",
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="min-w-0">
          <p className="font-medium text-sm text-black truncate">
            {contact.email}
          </p>
          <p className="text-xs text-gray-500 truncate">{contact.phone}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "school",
    header: "Agency",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm text-gray-800 truncate">{row.original.school}</p>
        <p className="text-xs text-gray-400 truncate">{row.original.country}</p>
      </div>
    ),
  },
  {
    accessorKey: "students",
    header: "Listings",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">
        {row.original.students ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 capitalize">
        {row.original.role || "—"}
      </span>
    ),
  },
  {
    accessorKey: "view",
    header: "Details",
    cell: ({ row }) => <ContactInfoModal contact={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn
        row={row}
        model="contact"
        editEndpoint="#"
        id={row.original.id}
      />
    ),
  },
];
