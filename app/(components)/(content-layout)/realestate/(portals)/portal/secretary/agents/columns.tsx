"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Agent } from "@prisma/client";
import DateColumn from "../../../../components/DataTableColumns/DateColumn";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";

export const columns: ColumnDef<Agent>[] = [
  {
    accessorKey: "name",
    header: "Danışman",
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div className="flex items-center gap-2">
          {a.imageUrl ? (
            <Image
              src={a.imageUrl}
              alt={a.firstName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
              {a.firstName[0]}{a.lastName[0]}
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{a.firstName} {a.lastName}</p>
            <p className="text-xs text-muted-foreground">{a.employeeId}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "İletişim",
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div>
          <p className="text-sm font-medium">{a.email}</p>
          <p className="text-xs text-muted-foreground">{a.phone}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "designation",
    header: "Pozisyon",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.designation}</p>
        <p className="text-xs text-muted-foreground">{row.original.departmentName}</p>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Durum",
    cell: ({ row }) => (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        row.original.isActive
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}>
        {row.original.isActive ? "Aktif" : "Pasif"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Kayıt Tarihi",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn
        row={row}
        model="agent"
        editEndpoint={`/realestate/portal/secretary/agents/${row.original.id}/edit`}
        id={row.original.id}
      />
    ),
  },
];
