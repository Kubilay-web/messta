"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import SortableColumn from "../../components/DataTableColumns/SortableColumn";
import ActionColumn from "../../components/DataTableColumns/ActionColumn";
import DateColumn from "../../components/DataTableColumns/DateColumn";
import { UserCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { convertLeadToClient } from "../../actions/leads";

const statusMeta: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Yeni", cls: "bg-slate-100 text-slate-700" },
  CONTACTED: { label: "İletişimde", cls: "bg-blue-100 text-blue-700" },
  QUALIFIED: { label: "Nitelikli", cls: "bg-indigo-100 text-indigo-700" },
  PROPOSAL: { label: "Teklif", cls: "bg-amber-100 text-amber-700" },
  NEGOTIATION: { label: "Pazarlık", cls: "bg-orange-100 text-orange-700" },
  WON: { label: "Kazanıldı", cls: "bg-emerald-100 text-emerald-700" },
  LOST: { label: "Kaybedildi", cls: "bg-red-100 text-red-700" },
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "Web Sitesi",
  PHONE: "Telefon",
  REFERRAL: "Referans",
  SOCIAL_MEDIA: "Sosyal Medya",
  WALK_IN: "Ofis Ziyareti",
  PORTAL: "İlan Portalı",
  CAMPAIGN: "Kampanya",
  OTHER: "Diğer",
};

const priorityMeta: Record<string, { label: string; cls: string }> = {
  LOW: { label: "Düşük", cls: "text-gray-500" },
  MEDIUM: { label: "Orta", cls: "text-amber-600" },
  HIGH: { label: "Yüksek", cls: "text-red-600 font-semibold" },
};

const interestLabels: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
  SHORT_RENT: "Kısa Dönem",
};

type LeadRow = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  status: string;
  source: string;
  priority: string;
  score: number;
  tags: string[];
  interestType: string | null;
  propertyType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  convertedClientId: string | null;
  agent?: { firstName: string; lastName: string } | null;
  createdAt: Date;
};

function scoreColor(s: number) {
  if (s >= 70) return "bg-emerald-100 text-emerald-700";
  if (s >= 40) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function ConvertButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  if (status === "WON") {
    return <span className="text-xs text-emerald-600">Dönüştürüldü</span>;
  }
  async function handle() {
    setLoading(true);
    try {
      const res = await convertLeadToClient(id);
      if (res.ok) {
        if (res.needsClientForm) {
          toast.success(
            "Lead kazanıldı. Müşteri kaydını ERP'den oluşturun."
          );
        } else {
          toast.success("Mevcut müşteriye bağlandı.");
        }
        router.refresh();
      } else {
        toast.error(res.error ?? "Dönüştürülemedi");
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={handle} disabled={loading}>
      <UserCheck className="w-4 h-4 mr-1" />
      Dönüştür
    </Button>
  );
}

export const columns: ColumnDef<LeadRow>[] = [
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
    accessorKey: "firstName",
    header: ({ column }) => <SortableColumn column={column} title="Ad Soyad" />,
    cell: ({ row }) => {
      const l = row.original;
      return (
        <div>
          <Link
            href={`/oneproject/dashboard/leads/${l.id}`}
            className="font-medium hover:underline"
          >
            {l.firstName} {l.lastName ?? ""}
          </Link>
          <div className="text-xs text-muted-foreground">{l.phone}</div>
          {l.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {l.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-violet-100 text-violet-700 px-1.5 py-0.5 text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Durum",
    cell: ({ row }) => {
      const m = statusMeta[row.original.status] ?? {
        label: row.original.status,
        cls: "bg-slate-100 text-slate-700",
      };
      return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs ${m.cls}`}>
          {m.label}
        </span>
      );
    },
  },
  {
    id: "score",
    header: "Puan",
    cell: ({ row }) => (
      <span
        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${scoreColor(
          row.original.score
        )}`}
      >
        {row.original.score}
      </span>
    ),
  },
  {
    id: "interest",
    header: "Talep",
    cell: ({ row }) => {
      const l = row.original;
      const parts = [
        l.interestType ? interestLabels[l.interestType] ?? l.interestType : null,
        l.propertyType
          ? ({
              APARTMENT: "Daire",
              HOUSE: "Müstakil Ev",
              VILLA: "Villa",
              OFFICE: "Ofis",
              SHOP: "Dükkan",
              LAND: "Arsa",
              WAREHOUSE: "Depo",
              BUILDING: "Bina",
            } as Record<string, string>)[l.propertyType] ?? l.propertyType
          : null,
      ].filter(Boolean);
      return <span>{parts.join(" · ") || "-"}</span>;
    },
  },
  {
    id: "budget",
    header: "Bütçe",
    cell: ({ row }) => {
      const { budgetMin, budgetMax } = row.original;
      if (!budgetMin && !budgetMax) return <span>-</span>;
      const fmt = (n?: number | null) =>
        n ? Number(n).toLocaleString("tr-TR") : "…";
      return (
        <span className="text-sm">
          {fmt(budgetMin)} - {fmt(budgetMax)} ₺
        </span>
      );
    },
  },
  {
    id: "source",
    header: "Kaynak",
    cell: ({ row }) => (
      <span className="text-sm">
        {sourceLabels[row.original.source] ?? row.original.source}
      </span>
    ),
  },
  {
    id: "priority",
    header: "Öncelik",
    cell: ({ row }) => {
      const m = priorityMeta[row.original.priority] ?? {
        label: row.original.priority,
        cls: "",
      };
      return <span className={`text-sm ${m.cls}`}>{m.label}</span>;
    },
  },
  {
    id: "agent",
    header: "Danışman",
    cell: ({ row }) => {
      const a = row.original.agent;
      return <span>{a ? `${a.firstName} ${a.lastName}` : "-"}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tarih",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "convert",
    header: "Dönüştür",
    cell: ({ row }) => (
      <ConvertButton id={row.original.id} status={row.original.status} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionColumn
        row={row}
        model="lead"
        editEndpoint={`/oneproject/dashboard/leads/update/${row.original.id}`}
        id={row.original.id}
      />
    ),
  },
];
