"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Check, X, Pencil } from "lucide-react";
import { moveDeal, setDealStatus } from "../../../actions/deals";

type Stage = { id: string; name: string; probability: number };
type Deal = {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  stageId: string;
  commissionAmount: number | null;
  agent?: { firstName: string; lastName: string } | null;
  client?: { firstName: string; lastName: string } | null;
  listing?: { title: string; listingNo: string } | null;
};

const fmt = (n: number, c: string) =>
  `${Number(n || 0).toLocaleString("tr-TR")} ${c}`;

function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const statusBadge =
    deal.status === "WON"
      ? "bg-emerald-100 text-emerald-700"
      : deal.status === "LOST"
      ? "bg-red-100 text-red-700"
      : "bg-blue-50 text-blue-700";

  async function changeStatus(s: "WON" | "LOST" | "OPEN") {
    const res = await setDealStatus(deal.id, s);
    if (res.ok) {
      toast.success(
        s === "WON" ? "Kazanıldı" : s === "LOST" ? "Kaybedildi" : "Yeniden açıldı"
      );
      router.refresh();
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white p-3 shadow-sm ${
        isDragging ? "opacity-60 ring-2 ring-blue-400" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm line-clamp-2">{deal.title}</p>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${statusBadge}`}>
            {deal.status === "WON"
              ? "Kazanıldı"
              : deal.status === "LOST"
              ? "Kaybedildi"
              : "Açık"}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-emerald-700">
          {fmt(deal.value, deal.currency)}
        </p>
        {deal.commissionAmount != null && (
          <p className="text-[11px] text-muted-foreground">
            Komisyon: {fmt(deal.commissionAmount, deal.currency)}
          </p>
        )}
        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
          {deal.client && (
            <p>
              Müşteri: {deal.client.firstName} {deal.client.lastName}
            </p>
          )}
          {deal.listing && <p>İlan: {deal.listing.title}</p>}
          {deal.agent && (
            <p>
              Danışman: {deal.agent.firstName} {deal.agent.lastName}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t pt-2">
        {deal.status !== "WON" && (
          <button
            onClick={() => changeStatus("WON")}
            title="Kazanıldı"
            className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        {deal.status !== "LOST" && (
          <button
            onClick={() => changeStatus("LOST")}
            title="Kaybedildi"
            className="rounded p-1 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Link
          href={`/oneproject/dashboard/deals/${deal.id}`}
          title="Detay"
          className="ml-auto text-[11px] text-blue-600 hover:underline"
        >
          Detay
        </Link>
        <Link
          href={`/oneproject/dashboard/deals/update/${deal.id}`}
          title="Düzenle"
          className="rounded p-1 text-gray-600 hover:bg-gray-100"
        >
          <Pencil className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  deals,
}: {
  stage: Stage;
  deals: Deal[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((s, d) => s + (d.value || 0), 0);
  const currency = deals[0]?.currency ?? "TRY";

  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-semibold">{stage.name}</p>
          <p className="text-[11px] text-muted-foreground">
            %{stage.probability} · {deals.length} fırsat
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-700">
          {fmt(total, currency)}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors ${
          isOver ? "border-blue-400 bg-blue-50/50" : "border-gray-200 bg-gray-50/50"
        }`}
      >
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
        {deals.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            Fırsat yok
          </p>
        )}
      </div>
    </div>
  );
}

export default function DealKanban({
  stages,
  deals: initialDeals,
}: {
  stages: Stage[];
  deals: Deal[];
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const dealId = String(active.id);
    const newStageId = String(over.id);
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stageId === newStageId) return;

    // Optimistik güncelle
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageId: newStageId } : d))
    );
    const res = await moveDeal(dealId, newStageId);
    if (!res.ok) {
      toast.error("Taşıma başarısız");
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stageId: deal.stageId } : d))
      );
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter((d) => d.stageId === stage.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}
