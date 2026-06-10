"use client";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { generateSlug } from "../../lib/generateSlug";
import toast from "react-hot-toast";
import { CategoryProject } from "@prisma/client";
import { CategoryProps } from "../../types/types";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormSelectInput from "../FormInputs/FormSelectInput";
import FormFooter from "./FormFooter";
import { createCategory, updateCategoryById } from "../../actions/categories";

// ERP PropertyType enum karşılıkları
const propertyTypeOptions = [
  { label: "Daire", value: "APARTMENT" },
  { label: "Müstakil Ev", value: "HOUSE" },
  { label: "Villa", value: "VILLA" },
  { label: "Ofis", value: "OFFICE" },
  { label: "Dükkan", value: "SHOP" },
  { label: "Arsa", value: "LAND" },
  { label: "Depo", value: "WAREHOUSE" },
  { label: "Bina", value: "BUILDING" },
];

// ERP ListingType enum karşılıkları (opsiyonel — "Tümü" seçilirse kategori ilan tipinden bağımsızdır)
const listingTypeOptions = [
  { label: "Tümü (İlan tipi farketmez)", value: "" },
  { label: "Satılık", value: "SALE" },
  { label: "Kiralık", value: "RENT" },
  { label: "Kısa Dönem Kiralık", value: "SHORT_RENT" },
];

export type SelectOptionProps = {
  label: string;
  value: string;
};
type CategoryFormProps = {
  editingId?: string | undefined;
  initialData?: CategoryProject | undefined | null;
  agencyId?: string;
};
export default function CategoryForm({
  editingId,
  initialData,
  agencyId,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryProps>({
    defaultValues: {
      title: initialData?.title,
      description: initialData?.description || "",
    },
  });
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const initialImage = initialData?.imageUrl || "/oneproject/placeholder.svg";
  const [imageUrl, setImageUrl] = useState(initialImage);

  const [selectedPropertyType, setSelectedPropertyType] = useState<any>(
    propertyTypeOptions.find(
      (o) => o.value === (initialData as any)?.propertyType
    ) || propertyTypeOptions[0]
  );

  const [selectedListingType, setSelectedListingType] = useState<any>(
    listingTypeOptions.find(
      (o) => o.value === ((initialData as any)?.listingType ?? "")
    ) || listingTypeOptions[0]
  );

  async function saveCategory(data: CategoryProps) {
    try {
      setLoading(true);
      data.slug = generateSlug(data.title);
      data.imageUrl = imageUrl;
      data.agencyId = agencyId;
      data.propertyType = selectedPropertyType?.value;
      data.listingType = selectedListingType?.value || undefined;

      if (editingId) {
        await updateCategoryById(editingId, data);
        setLoading(false);
        // Toast
        toast.success("Başarıyla güncellendi!");
        //reset
        reset();
        //route
        router.push("/oneproject/dashboard/categories");
        setImageUrl("/placeholder.svg");
      } else {
        await createCategory(data);
        setLoading(false);
        // Toast
        toast.success("Başarıyla oluşturuldu!");
        //reset
        reset();
        setImageUrl("/placeholder.svg");
        //route
        router.push("/oneproject/dashboard/categories");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(saveCategory)}>
      <FormHeader
        href="/categories"
        parent=""
        title="Kategori"
        editingId={editingId}
        loading={loading}
      />

      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Başlığı</CardTitle>
              <CardDescription>
                Mülk kategorisi bilgilerini girin (örn. Daire, Villa, Arsa)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3 ">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Kategori Başlığı"
                    name="title"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelectInput
                    label="Mülk Tipi (ERP)"
                    options={propertyTypeOptions}
                    option={selectedPropertyType}
                    setOption={setSelectedPropertyType}
                  />
                  <FormSelectInput
                    label="İlan Tipi (ERP)"
                    options={listingTypeOptions}
                    option={selectedListingType}
                    setOption={setSelectedListingType}
                  />
                </div>
                <div className="grid gap-3">
                  <TextArea
                    register={register}
                    errors={errors}
                    label="Açıklama"
                    name="description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 col-span-full ">
          <div className="grid auto-rows-max items-start gap-4 ">
            <ImageInput
              title="Kategori Görseli"
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />
          </div>
        </div>
      </div>
      <FormFooter
        href="/categories"
        editingId={editingId}
        loading={loading}
        title="Kategori"
        parent=""
      />
    </form>
  );
}
