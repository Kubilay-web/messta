"use client";

import { Card, CardContent } from "../../components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Lead } from "@prisma/client";
import { LeadProps } from "../../types/types";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import FormSelectInput from "../FormInputs/FormSelectInput";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import { createLead, updateLeadById } from "../../actions/leads";

export type SelectOptionProps = { label: string; value: string };

const statusOptions = [
  { label: "Yeni", value: "NEW" },
  { label: "İletişime Geçildi", value: "CONTACTED" },
  { label: "Nitelikli", value: "QUALIFIED" },
  { label: "Teklif Sunuldu", value: "PROPOSAL" },
  { label: "Pazarlık", value: "NEGOTIATION" },
  { label: "Kazanıldı", value: "WON" },
  { label: "Kaybedildi", value: "LOST" },
];

const sourceOptions = [
  { label: "Web Sitesi / Vitrin", value: "WEBSITE" },
  { label: "Telefon", value: "PHONE" },
  { label: "Referans", value: "REFERRAL" },
  { label: "Sosyal Medya", value: "SOCIAL_MEDIA" },
  { label: "Ofis Ziyareti", value: "WALK_IN" },
  { label: "İlan Portalı", value: "PORTAL" },
  { label: "Kampanya", value: "CAMPAIGN" },
  { label: "Diğer", value: "OTHER" },
];

const priorityOptions = [
  { label: "Düşük", value: "LOW" },
  { label: "Orta", value: "MEDIUM" },
  { label: "Yüksek", value: "HIGH" },
];

const interestTypeOptions = [
  { label: "Farketmez", value: "" },
  { label: "Satılık", value: "SALE" },
  { label: "Kiralık", value: "RENT" },
  { label: "Kısa Dönem Kiralık", value: "SHORT_RENT" },
];

const propertyTypeOptions = [
  { label: "Farketmez", value: "" },
  { label: "Daire", value: "APARTMENT" },
  { label: "Müstakil Ev", value: "HOUSE" },
  { label: "Villa", value: "VILLA" },
  { label: "Ofis", value: "OFFICE" },
  { label: "Dükkan", value: "SHOP" },
  { label: "Arsa", value: "LAND" },
  { label: "Depo", value: "WAREHOUSE" },
  { label: "Bina", value: "BUILDING" },
];

type LeadFormProps = {
  editingId?: string;
  initialData?: Lead | null;
  userId: string;
  agencyId: string;
  agents: SelectOptionProps[];
  listings: SelectOptionProps[];
};

export default function LeadForm({
  editingId,
  initialData,
  userId,
  agencyId,
  agents,
  listings,
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadProps>({
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      budgetMin: initialData?.budgetMin ?? undefined,
      budgetMax: initialData?.budgetMax ?? undefined,
      roomCount: initialData?.roomCount ?? "",
      description: initialData?.description ?? "",
      preferredCities: (initialData?.preferredCities ?? []) as any,
    },
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pick = <T extends SelectOptionProps>(opts: T[], v?: string | null) =>
    opts.find((o) => o.value === (v ?? "")) || opts[0];

  const [status, setStatus] = useState<any>(
    pick(statusOptions, initialData?.status)
  );
  const [source, setSource] = useState<any>(
    pick(sourceOptions, initialData?.source)
  );
  const [priority, setPriority] = useState<any>(
    pick(priorityOptions, initialData?.priority ?? "MEDIUM")
  );
  const [interestType, setInterestType] = useState<any>(
    pick(interestTypeOptions, (initialData as any)?.interestType)
  );
  const [propertyType, setPropertyType] = useState<any>(
    pick(propertyTypeOptions, (initialData as any)?.propertyType)
  );
  const [agent, setAgent] = useState<any>(
    agents.find((a) => a.value === (initialData as any)?.agentId) || null
  );
  const [listing, setListing] = useState<any>(
    listings.find((l) => l.value === (initialData as any)?.listingId) || null
  );

  const [cities, setCities] = useState(
    (initialData?.preferredCities ?? []).join(", ")
  );
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));

  async function onSubmit(data: LeadProps) {
    if (!data.phone) {
      toast.error("Telefon zorunludur.");
      return;
    }
    setLoading(true);
    try {
      data.agencyId = agencyId;
      data.ownerUserId = userId;
      data.status = status?.value;
      data.source = source?.value;
      data.priority = priority?.value;
      data.interestType = interestType?.value || undefined;
      data.propertyType = propertyType?.value || undefined;
      data.agentId = agent?.value || undefined;
      data.listingId = listing?.value || undefined;
      data.budgetMin = data.budgetMin ? Number(data.budgetMin) : undefined;
      data.budgetMax = data.budgetMax ? Number(data.budgetMax) : undefined;
      data.preferredCities = cities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      data.tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = editingId
        ? await updateLeadById(editingId, data)
        : await createLead(data);

      if (res?.status === 200) {
        toast.success(editingId ? "Lead güncellendi!" : "Lead oluşturuldu!");
        reset();
        router.push("/oneproject/dashboard/leads");
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
        href="/leads"
        parent=""
        title="Lead (Talep)"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4">
                {/* Kişi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Ad"
                    name="firstName"
                    placeholder="Ahmet"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Soyad"
                    name="lastName"
                    placeholder="Yılmaz"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Telefon"
                    name="phone"
                    placeholder="+90 5xx xxx xx xx"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="E-posta"
                    name="email"
                    placeholder="ornek@eposta.com"
                  />
                </div>

                {/* Talep kriterleri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelectInput
                    label="İlan Tipi (Talep)"
                    options={interestTypeOptions}
                    option={interestType}
                    setOption={setInterestType}
                  />
                  <FormSelectInput
                    label="Mülk Tipi (Talep)"
                    options={propertyTypeOptions}
                    option={propertyType}
                    setOption={setPropertyType}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Min Bütçe (₺)"
                    name="budgetMin"
                    type="number"
                    placeholder="1000000"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Max Bütçe (₺)"
                    name="budgetMax"
                    type="number"
                    placeholder="3000000"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Oda Sayısı"
                    name="roomCount"
                    placeholder="3+1"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Tercih Edilen Şehir/İlçeler (virgülle)
                  </label>
                  <input
                    value={cities}
                    onChange={(e) => setCities(e.target.value)}
                    placeholder="Kadıköy, Üsküdar, Ataşehir"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <TextArea
                  register={register}
                  errors={errors}
                  label="Açıklama / Notlar"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ kolon: yönetim */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6 grid gap-4">
              <FormSelectInput
                label="Durum"
                options={statusOptions}
                option={status}
                setOption={setStatus}
              />
              <FormSelectInput
                label="Kaynak"
                options={sourceOptions}
                option={source}
                setOption={setSource}
              />
              <FormSelectInput
                label="Öncelik"
                options={priorityOptions}
                option={priority}
                setOption={setPriority}
              />
              <FormSelectInput
                label="Sorumlu Danışman"
                options={agents}
                option={agent}
                setOption={setAgent}
              />
              <FormSelectInput
                label="İlgilenilen İlan"
                options={listings}
                option={listing}
                setOption={setListing}
                toolTipText="Yeni İlan Ekle"
                href="/estate/dashboard/listings"
              />
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Etiketler (virgülle)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Sıcak, VIP, Yatırımcı"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FormFooter
        href="/leads"
        editingId={editingId}
        loading={loading}
        title="Lead (Talep)"
        parent=""
      />
    </form>
  );
}
