"use client";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import ImageColumn from "../../components/DataTableColumns/ImageColumn";
import SortableColumn from "../../components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../components/DataTableColumns/ActionColumn";
import Link from "next/link";
import PublicityBtn from "../../components/DataTableColumns/PublicityBtn";

// Zenginleştirilmiş süreç (ERP ilan/mülk/müşteri verisiyle)
type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  isPublic: boolean;
  budget: number | null;
  budgetLocal: number | null;
  listing?: any | null;
  property?: any | null;
  client?: any | null;
};

const listingTypeLabel = (v?: string | null) =>
  v === "RENT" || v === "KIRALIK"
    ? "Kiralık"
    : v === "SALE" || v === "SATILIK"
    ? "Satılık"
    : "-";

export const columns: ColumnDef<ProjectRow>[] = [
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
    accessorKey: "thumbnail",
    header: "Görsel",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="thumbnail" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Süreç" />,
  },
  {
    id: "listingTitle",
    header: "İlan",
    cell: ({ row }) => <span>{row.original.listing?.title ?? "-"}</span>,
  },
  {
    id: "listingType",
    header: "İlan Tipi",
    cell: ({ row }) => (
      <span>{listingTypeLabel(row.original.listing?.listingType)}</span>
    ),
  },
  {
    id: "location",
    header: "Konum",
    cell: ({ row }) => {
      const p = row.original.property;
      const loc = [p?.district, p?.city].filter(Boolean).join(", ");
      return <span>{loc || "-"}</span>;
    },
  },
  {
    id: "client",
    header: "Müşteri",
    cell: ({ row }) => {
      const c = row.original.client;
      return <span>{c ? `${c.firstName} ${c.lastName}` : "-"}</span>;
    },
  },
  {
    id: "price",
    header: "Fiyat",
    cell: ({ row }) => {
      const price =
        row.original.budgetLocal ||
        row.original.budget ||
        row.original.listing?.askingPrice ||
        0;
      const currency = row.original.listing?.currency ?? "TRY";
      return (
        <span>
          {Number(price).toLocaleString("tr-TR")} {currency}
        </span>
      );
    },
  },
  {
    accessorKey: "isPublic",
    header: "Portföy",
    cell: ({ row }) => {
      const project = row.original;
      return <PublicityBtn id={project.id} status={project.isPublic} />;
    },
  },
  {
    id: "view",
    header: "Görüntüle",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <Button size={"sm"} asChild>
          <Link href={`/oneproject/dashboard/projects/view/${project.slug}`}>
            Görüntüle
          </Link>
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <ActionColumn
          row={row}
          model="project"
          editEndpoint={`/oneproject/dashboard/projects/update/${project.id}`}
          id={project.id}
        />
      );
    },
  },
];
