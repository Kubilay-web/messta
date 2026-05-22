"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { PropertyClient } from "@prisma/client";
import DateColumn from "../../../../components/DataTableColumns/DateColumn";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";

export const columns: ColumnDef<PropertyClient>[] = [
  {
    accessorKey: "name",
    header: "Müşteri",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-2">
          {c.imageUrl ? (
            <Image
              src={c.imageUrl}
              alt={c.firstName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
              {c.firstName[0]}{c.lastName[0]}
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
            <p className="text-xs text-muted-foreground">{c.title}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "İletişim",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div>
          <p className="text-sm font-medium">{c.email}</p>
          <p className="text-xs text-muted-foreground">{c.phone}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Müşteri Tipi",
    cell: ({ row }) => {
      const c = row.original;
      const types = [
        c.isBuyer    && "Alıcı",
        c.isSeller   && "Satıcı",
        c.isTenant   && "Kiracı",
        c.isLandlord && "Kiraya Veren",
      ].filter(Boolean) as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {types.length > 0 ? types.map((t) => (
            <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {t}
            </span>
          )) : <span className="text-xs text-gray-400">—</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "budget",
    header: "Bütçe",
    cell: ({ row }) => {
      const c = row.original;
      if (!c.minBudget && !c.maxBudget) {
        return <span className="text-xs text-gray-400">—</span>;
      }
      return (
        <p className="text-xs whitespace-nowrap">
          {c.minBudget ? c.minBudget.toLocaleString("tr-TR") : "—"}
          {" – "}
          {c.maxBudget ? c.maxBudget.toLocaleString("tr-TR") : "—"}
          {" "}{c.currency}
        </p>
      );
    },
  },
  {
    accessorKey: "nationality",
    header: "Uyruk",
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
        model="propertyClient"
        editEndpoint={`/realestate/portal/secretary/clients/${row.original.id}/edit`}
        id={row.original.id}
      />
    ),
  },
];
