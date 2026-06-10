"use client";

import { Card, CardContent } from "../../components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { generateSlug } from "../../lib/generateSlug";
import toast from "react-hot-toast";
import { Project } from "@prisma/client";
import { ProjectProps } from "../../types/types";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";

import FormSelectInput from "../FormInputs/FormSelectInput";
import { createProject, updateProjectById } from "../../actions/projects";
import { convertDateToIso } from "../../lib/convertDateToIso";
import { convertIsoToDateString } from "../../lib/convertISODateToNorma";

export type SelectOptionProps = {
  label: string;
  value: string;
};
export type ListingOptionProps = SelectOptionProps & {
  propertyId?: string | null;
};

type ProjectFormProps = {
  editingId?: string | undefined;
  initialData?: Project | undefined | null;
  userId: string;
  agencyId: string;
  listings: ListingOptionProps[];
  clients: SelectOptionProps[];
  agents: SelectOptionProps[];
};

const statusOptions = [
  { label: "Devam Ediyor", value: "ONGOING" },
  { label: "Tamamlandı", value: "COMPLETE" },
];

export default function ProjectForm({
  editingId,
  initialData,
  userId,
  agencyId,
  listings,
  clients,
  agents,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectProps>({
    defaultValues: {
      name: initialData?.name,
      description: initialData?.description || "",
      notes: initialData?.notes || "",
      budgetLocal: initialData?.budgetLocal || 0,
      startDate: initialData
        ? convertIsoToDateString(initialData?.startDate)
        : null,
      endDate: initialData
        ? convertIsoToDateString(initialData?.endDate ?? "")
        : null,
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.thumbnail || "/oneproject/thumbnail.png";
  const [imageUrl, setImageUrl] = useState(initialImage);

  const [selectedListing, setSelectedListing] = useState<any>(
    listings.find((l) => l.value === (initialData as any)?.listingId) || null
  );
  const [selectedClient, setSelectedClient] = useState<any>(
    clients.find((c) => c.value === initialData?.clientId) || null
  );
  const [selectedAgent, setSelectedAgent] = useState<any>(
    agents.find((a) => a.value === (initialData as any)?.agentId) || null
  );
  const [selectedStatus, setSelectedStatus] = useState<any>(
    statusOptions.find((s) => s.value === initialData?.status) ||
      statusOptions[0]
  );

  async function saveProject(data: ProjectProps) {
    if (!selectedListing?.value) {
      toast.error("Lütfen bir ilan seçin.");
      return;
    }
    if (!selectedClient?.value) {
      toast.error("Lütfen bir müşteri seçin.");
      return;
    }
    try {
      setLoading(true);
      const myStartDate = new Date(data.startDate);
      const myEndDate = new Date(data.endDate);
      const differenceInTime = myEndDate.getTime() - myStartDate.getTime();
      const deadlineInDays = differenceInTime / (1000 * 60 * 60 * 24);
      data.deadline = Math.round(deadlineInDays) || 0;
      data.slug = generateSlug(data.name);
      data.thumbnail = imageUrl;
      data.userId = userId;
      data.agencyId = agencyId;
      data.clientId = selectedClient.value;
      data.agentId = selectedAgent?.value;
      data.listingId = selectedListing.value;
      data.propertyId = selectedListing.propertyId ?? undefined;
      data.status = selectedStatus?.value;
      data.startDate = convertDateToIso(data.startDate);
      data.endDate = convertDateToIso(data.endDate);
      data.budgetLocal = Number(data.budgetLocal) || 0;
      data.budget = Number(data.budgetLocal) || 0;

      if (editingId) {
        await updateProjectById(editingId, data);
        toast.success("Başarıyla güncellendi!");
        reset();
        router.push("/oneproject/dashboard/projects");
      } else {
        const res = await createProject(data);
        if (res?.status === 409) {
          toast.error(res.error);
        } else if (res?.status === 200) {
          toast.success("Başarıyla oluşturuldu!");
          reset();
          setImageUrl("/oneproject/thumbnail.png");
          router.push("/oneproject/dashboard/projects");
        } else {
          toast.error("Bir şeyler ters gitti");
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="w-full" onSubmit={handleSubmit(saveProject)}>
      <FormHeader
        href="/projects"
        parent=""
        title="Süreç"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 py-6 sm:py-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4 sm:gap-6">
                {/* Süreç Başlığı */}
                <TextInput
                  register={register}
                  errors={errors}
                  label="Süreç Başlığı"
                  name="name"
                  placeholder="Ör. Kadıköy 3+1 Satış Süreci"
                />

                {/* İlan + Müşteri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelectInput
                    label="İlan"
                    options={listings}
                    option={selectedListing}
                    setOption={setSelectedListing}
                    toolTipText="Yeni İlan Ekle"
                    href="/estate/dashboard/listings"
                  />
                  <FormSelectInput
                    label="Müşteri"
                    options={clients}
                    option={selectedClient}
                    setOption={setSelectedClient}
                    toolTipText="Yeni Müşteri Ekle"
                    href="/oneproject/dashboard/clients/new"
                  />
                </div>

                {/* Danışman + Durum */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelectInput
                    label="Sorumlu Danışman"
                    options={agents}
                    option={selectedAgent}
                    setOption={setSelectedAgent}
                  />
                  <FormSelectInput
                    label="Süreç Durumu"
                    options={statusOptions}
                    option={selectedStatus}
                    setOption={setSelectedStatus}
                  />
                </div>

                {/* Hedef Fiyat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Hedef / Anlaşma Fiyatı (₺)"
                    name="budgetLocal"
                    type="number"
                    placeholder="2500000"
                  />
                </div>

                {/* Tarihler */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    type="date"
                    label="Başlangıç Tarihi"
                    name="startDate"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    type="date"
                    label="Hedef Kapanış Tarihi"
                    name="endDate"
                  />
                </div>

                {/* Açıklama */}
                <TextArea
                  register={register}
                  errors={errors}
                  label="Süreç Açıklaması / Notlar"
                  name="description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE (IMAGE) */}
        <div className="lg:col-span-4">
          <div className="grid gap-4">
            <ImageInput
              title="Süreç Kapak Görseli"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>
        </div>
      </div>

      <FormFooter
        href="/projects"
        editingId={editingId}
        loading={loading}
        title="Süreç"
        parent=""
      />
    </form>
  );
}
