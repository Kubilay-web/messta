"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "../../../FormInputs/TextInput";
import ImageInput from "../../../FormInputs/ImageInput";
import SubmitButton from "../../../FormInputs/SubmitButton";
import toast from "react-hot-toast";
import { Building2, SaveAll } from "lucide-react";

export type AgencyProps = {
  name: string;
  logo: string;
  primaryEmail: string;
  phone: string;
  address: string;
  city: string;
  taxNumber: string;
  licenseNo: string;
};

interface AgencyOnboardingFormProps {
  onSubmit: (
    data: AgencyProps
  ) => Promise<{ ok: boolean; id?: string; slug?: string; error?: string }>;
}

export default function AgencyOnboardingForm({
  onSubmit: submitAction,
}: AgencyOnboardingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("/management/empty.png");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgencyProps>({ defaultValues: { name: "" } });

  async function handleSave(data: AgencyProps) {
    try {
      setLoading(true);
      data.logo = imageUrl;
      const res = await submitAction(data);
      if (res.ok && res.id) {
        toast.success("Agency registered successfully!");
        reset();
        router.push(
          `/management/super-dashboard/schools-page/school-admin/${res.id}?name=${encodeURIComponent(data.name)}`
        );
      } else {
        toast.error(res.error ?? "Failed to register agency.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Welcome to Estate Pro
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your agency profile to get started with your Real Estate ERP.
          </p>
        </div>
      </div>

      <hr />

      {/* Agency Name */}
      <TextInput
        register={register}
        errors={errors}
        label="Agency / Company Name"
        name="name"
        placeholder="e.g. Sunrise Real Estate"
      />

      {/* Email + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          register={register}
          errors={errors}
          label="Primary Email"
          name="primaryEmail"
          type="email"
          placeholder="info@yourcompany.com"
        />
        <TextInput
          register={register}
          errors={errors}
          label="Phone Number"
          name="phone"
          placeholder="+90 212 000 00 00"
        />
      </div>

      {/* City + Address */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          register={register}
          errors={errors}
          label="City"
          name="city"
          placeholder="Istanbul"
        />
        <TextInput
          register={register}
          errors={errors}
          label="Address"
          name="address"
          placeholder="123 Property St, District"
        />
      </div>

      {/* Tax + License */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          register={register}
          errors={errors}
          label="Tax Number"
          name="taxNumber"
          placeholder="1234567890"
        />
        <TextInput
          register={register}
          errors={errors}
          label="Trade License No"
          name="licenseNo"
          placeholder="LIC-2024-XXXXX"
        />
      </div>

      {/* Logo Upload */}
      <ImageInput
        title="Agency Logo (500px × 150px recommended)"
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        className="object-contain"
        size="sm"
      />

      {/* Submit */}
      <SubmitButton
        buttonIcon={SaveAll}
        title="Register Agency"
        loading={loading}
        loadingTitle="Registering... please wait"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
