"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PropertyClient } from "@prisma/client";
import Link from "next/link";

import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import DateColumn from "../../components/DataTableColumns/DateColumn";
import ImageColumn from "../../components/DataTableColumns/ImageColumn";
import SortableColumn from "../../components/DataTableColumns/SortableColumn";
import ActionColumn from "../../components/DataTableColumns/ActionColumn";

function clientTypeBadges(c: PropertyClient) {
  const tags: string[] = [];
  if (c.isBuyer) tags.push("Alıcı");
  if (c.isSeller) tags.push("Satıcı");
  if (c.isTenant) tags.push("Kiracı");
  if (c.isLandlord) tags.push("Kiraya Veren");
  return tags.length ? tags.join(", ") : "-";
}

export const columns: ColumnDef<PropertyClient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Satırı seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Görsel",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="imageUrl" />,
  },
  {
    id: "fullName",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <SortableColumn column={column} title="Ad Soyad" />,
  },
  {
    id: "clientType",
    header: "Müşteri Tipi",
    cell: ({ row }) => <span>{clientTypeBadges(row.original)}</span>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <SortableColumn column={column} title="Telefon" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableColumn column={column} title="E-posta" />,
  },
  {
    accessorKey: "createdAt",
    header: "Kayıt Tarihi",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "crm",
    header: "CRM",
    cell: ({ row }) => (
      <Button size="sm" variant="outline" asChild>
        <Link href={`/oneproject/dashboard/clients/${row.original.id}`}>
          360° Görünüm
        </Link>
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <ActionColumn
          row={row}
          model="client"
          editEndpoint={`/oneproject/dashboard/clients/update/${client.id}`}
          id={client.id}
        />
      );
    },
  },
];
