"use client";

import {
  Card,
  CardContent,
} from "../../components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import toast from "react-hot-toast";
import { Agency } from "@prisma/client";
import TextInput from "../FormInputs/TextInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";
import {
  AgencyProps,
  updateAgency,
} from "@/app/(components)/(content-layout)/estate/actions/agencies";

type BrandFormProps = {
  editingId?: string | undefined;
  initialData?: Agency | undefined | null;
};

export default function BrandForm({ editingId, initialData }: BrandFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgencyProps>({
    defaultValues: {
      name: initialData?.name || "",
      primaryEmail: initialData?.primaryEmail || "",
      phone: initialData?.phone || "",
      city: initialData?.city || "",
      address: initialData?.address || "",
      taxNumber: initialData?.taxNumber || "",
      licenseNo: initialData?.licenseNo || "",
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage =
    initialData?.logo ||
    "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";
  const [imageUrl, setImageUrl] = useState(initialImage);

  async function onSubmit(data: AgencyProps) {
    if (!editingId) {
      toast.error("Acente bulunamadı. Lütfen önce bir acenteye bağlı olun.");
      return;
    }
    setLoading(true);
    data.logo = imageUrl;
    try {
      await updateAgency(editingId, data);
      toast.success("Acente marka ayarları güncellendi!");
      reset(data);
      router.refresh();
    } catch (error: any) {
      console.error("Hata:", error);
      toast.error(error?.message ?? "Bir şeyler ters gitti, tekrar deneyin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardContent>
              <div className="grid gap-6 pt-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Acente Adı"
                  name="name"
                  placeholder="Örnek Emlak"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="E-posta Adresi"
                    name="primaryEmail"
                    placeholder="info@ornekemlak.com"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Telefon"
                    name="phone"
                    placeholder="+90 212 000 00 00"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Şehir"
                    name="city"
                    placeholder="İstanbul"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Adres"
                    name="address"
                    placeholder="Mahalle, Cadde, No"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Vergi Numarası"
                    name="taxNumber"
                    placeholder="(opsiyonel)"
                  />
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Ticaret Ruhsatı No"
                    name="licenseNo"
                    placeholder="(opsiyonel)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <ImageInput
              title="Acente Logosu"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="#"
        editingId={editingId}
        loading={loading}
        title="Acente Marka Ayarları"
        parent=""
      />
    </form>
  );
}
