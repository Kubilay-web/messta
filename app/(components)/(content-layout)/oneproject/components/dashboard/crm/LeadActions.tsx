"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import { UserCheck, TrendingUp } from "lucide-react";
import { convertLeadToClient } from "../../../actions/leads";
import { createDealFromLead } from "../../../actions/deals";

export default function LeadActions({
  leadId,
  status,
}: {
  leadId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toClient() {
    setLoading(true);
    const res = await convertLeadToClient(leadId);
    setLoading(false);
    if (res.ok) {
      toast.success(
        res.needsClientForm
          ? "Lead kazanıldı. Müşteri kaydını ERP'den oluşturun."
          : "Mevcut müşteriye bağlandı."
      );
      router.refresh();
    } else toast.error(res.error ?? "Dönüştürülemedi");
  }

  async function toDeal() {
    setLoading(true);
    const res = await createDealFromLead(leadId);
    setLoading(false);
    if (res.ok && res.dealId) {
      toast.success("Fırsat oluşturuldu");
      router.push(`/oneproject/dashboard/deals/update/${res.dealId}`);
    } else toast.error(res.error ?? "Oluşturulamadı");
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={toDeal} disabled={loading}>
        <TrendingUp className="w-4 h-4 mr-1" /> Fırsata Çevir
      </Button>
      {status !== "WON" && (
        <Button size="sm" onClick={toClient} disabled={loading}>
          <UserCheck className="w-4 h-4 mr-1" /> Müşteriye Dönüştür
        </Button>
      )}
    </div>
  );
}
