"use client";

import { Card, CardContent } from "../../components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CrmDeal } from "@prisma/client";
import { DealProps } from "../../types/types";
import TextInput from "../FormInputs/TextInput";
import FormSelectInput from "../FormInputs/FormSelectInput";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import { createDeal, updateDealById } from "../../actions/deals";
import { convertIsoToDateString } from "../../lib/convertISODateToNorma";
import { convertDateToIso } from "../../lib/convertDateToIso";

export type SelectOptionProps = { label: string; value: string };

const statusOptions = [
  { label: "Açık", value: "OPEN" },
  { label: "Kazanıldı", value: "WON" },
  { label: "Kaybedildi", value: "LOST" },
];

type DealFormProps = {
  editingId?: string;
  initialData?: CrmDeal | null;
  userId: string;
  agencyId: string;
  pipelineId: string;
  stages: SelectOptionProps[];
  agents: SelectOptionProps[];
  clients: SelectOptionProps[];
  listings: SelectOptionProps[];
};

export default function DealForm({
  editingId,
  initialData,
  userId,
  agencyId,
  pipelineId,
  stages,
  agents,
  clients,
  listings,
}: DealFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealProps>({
    defaultValues: {
      title: initialData?.title ?? "",
      value: initialData?.value ?? 0,
      commissionRate: initialData?.commissionRate ?? undefined,
      expectedCloseDate: initialData?.expectedCloseDate
        ? convertIsoToDateString(initialData.expectedCloseDate)
        : null,
    },
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [stage, setStage] = useState<any>(
    stages.find((s) => s.value === (initialData as any)?.stageId) || stages[0]
  );
  const [status, setStatus] = useState<any>(
    statusOptions.find((s) => s.value === initialData?.status) || statusOptions[0]
  );
  const [agent, setAgent] = useState<any>(
    agents.find((a) => a.value === (initialData as any)?.agentId) || null
  );
  const [client, setClient] = useState<any>(
    clients.find((c) => c.value === (initialData as any)?.clientId) || null
  );
  const [listing, setListing] = useState<any>(
    listings.find((l) => l.value === (initialData as any)?.listingId) || null
  );
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));

  async function onSubmit(data: DealProps) {
    if (!stage?.value) {
      toast.error("Lütfen bir aşama seçin.");
      return;
    }
    setLoading(true);
    try {
      data.agencyId = agencyId;
      data.ownerUserId = userId;
      data.pipelineId = pipelineId;
      data.stageId = stage.value;
      data.status = status?.value;
      data.value = Number(data.value) || 0;
      data.commissionRate = data.commissionRate
        ? Number(data.commissionRate)
        : undefined;
      data.currency = "TRY";
      data.agentId = agent?.value || undefined;
      data.clientId = client?.value || undefined;
      data.listingId = listing?.value || undefined;
      data.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      data.expectedCloseDate = data.expectedCloseDate
        ? convertDateToIso(data.expectedCloseDate)
        : undefined;

      const res = editingId
        ? await updateDealById(editingId, data)
        : await createDeal(data);

      if (res?.status === 200) {
        toast.success(editingId ? "Fırsat güncellendi!" : "Fırsat oluşturuldu!");
        reset();
        router.push("/oneproject/dashboard/deals");
      } else {
        toast.error(res?.error ?? "Bir şeyler ters gitti");
      }
    } catch (error) {
      console.log(error);
      toast.error("Bir şeyler ters gitti");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        href="/deals"
        parent=""
        title="Fırsat"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6 grid gap-4">
              <TextInput
                register={register}
                errors={errors}
                label="Fırsat Başlığı"
                name="title"
                placeholder="Ör. Kadıköy 3+1 Satış Fırsatı"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Değer (₺)"
                  name="value"
                  type="number"
                  placeholder="2500000"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Komisyon Oranı (%)"
                  name="commissionRate"
                  type="number"
                  placeholder="2"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Beklenen Kapanış"
                  name="expectedCloseDate"
                  type="date"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelectInput
                  label="Müşteri"
                  options={clients}
                  option={client}
                  setOption={setClient}
                  toolTipText="Yeni Müşteri Ekle"
                  href="/oneproject/dashboard/clients/new"
                />
                <FormSelectInput
                  label="İlgili İlan"
                  options={listings}
                  option={listing}
                  setOption={setListing}
                  toolTipText="Yeni İlan Ekle"
                  href="/estate/dashboard/listings"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6 grid gap-4">
              <FormSelectInput
                label="Aşama"
                options={stages}
                option={stage}
                setOption={setStage}
              />
              <FormSelectInput
                label="Durum"
                options={statusOptions}
                option={status}
                setOption={setStatus}
              />
              <FormSelectInput
                label="Sorumlu Danışman"
                options={agents}
                option={agent}
                setOption={setAgent}
              />
              <div className="grid gap-2">
                <label className="text-sm font-medium">Etiketler (virgülle)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Sıcak, Acil, Yatırım"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/deals"
        editingId={editingId}
        loading={loading}
        title="Fırsat"
        parent=""
      />
    </form>
  );
}
