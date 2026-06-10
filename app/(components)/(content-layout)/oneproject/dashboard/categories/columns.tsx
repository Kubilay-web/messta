"use client";

import Image from "next/image";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";


import { Button } from "../../components/ui/button";


import { Checkbox } from "../../components/ui/checkbox";

import DateColumn from "../../components/DataTableColumns/DateColumn";
import ImageColumn from "../../components/DataTableColumns/ImageColumn";
import SortableColumn from "../../components/DataTableColumns/SortableColumn";


import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../components/DataTableColumns/ActionColumn";

const propertyTypeLabels: Record<string, string> = {
  APARTMENT: "Daire",
  HOUSE: "Müstakil Ev",
  VILLA: "Villa",
  OFFICE: "Ofis",
  SHOP: "Dükkan",
  LAND: "Arsa",
  WAREHOUSE: "Depo",
  BUILDING: "Bina",
};

const listingTypeLabels: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
  SHORT_RENT: "Kısa Dönem",
};

// ERP mülk sayımıyla zenginleştirilmiş kategori satırı
type CategoryRow = {
  id: string;
  title: string;
  imageUrl: string | null;
  propertyType: string | null;
  listingType: string | null;
  propertyCount?: number;
  listingCount?: number;
  createdAt: Date;
};

export const columns: ColumnDef<CategoryRow>[] = [
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
    accessorKey: "title",
    header: ({ column }) => <SortableColumn column={column} title="Başlık" />,
  },
  {
    accessorKey: "imageUrl",
    header: "Kategori Görseli",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="imageUrl" />,
  },
  {
    id: "propertyType",
    header: "Mülk Tipi (ERP)",
    cell: ({ row }) => {
      const t = row.original.propertyType;
      return <span>{t ? propertyTypeLabels[t] ?? t : "-"}</span>;
    },
  },
  {
    id: "listingType",
    header: "İlan Tipi (ERP)",
    cell: ({ row }) => {
      const t = row.original.listingType;
      return <span>{t ? listingTypeLabels[t] ?? t : "Tümü"}</span>;
    },
  },
  {
    id: "propertyCount",
    header: "ERP Mülk",
    cell: ({ row }) => <span>{row.original.propertyCount ?? 0}</span>,
  },
  {
    id: "listingCount",
    header: "ERP İlan",
    cell: ({ row }) => <span>{row.original.listingCount ?? 0}</span>,
  },

  {
    accessorKey: "createdAt",
    header: "Oluşturma Tarihi",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <ActionColumn
          row={row}
          model="category"
          editEndpoint={`/oneproject/dashboard/categories/update/${category.id}`}
          id={category.id}
        />
      );
    },
  },
];
