"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "../../../FormInputs/TextInput";
import PasswordInput from "../../../FormInputs/PasswordInput";
import SubmitButton from "../../../FormInputs/SubmitButton";
import toast from "react-hot-toast";
import { Send, UserCog } from "lucide-react";

export type AgencyAdminProps = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

interface AgencyAdminFormProps {
  agencyId: string;
  agencyName: string;
  onSubmit: (
    data: AgencyAdminProps
  ) => Promise<{ ok: boolean; error?: string }>;
}

export default function AgencyAdminForm({
  agencyId,
  agencyName,
  onSubmit: submitAction,
}: AgencyAdminFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgencyAdminProps>({ defaultValues: { name: "" } });

  async function handleSave(data: AgencyAdminProps) {
    try {
      setLoading(true);
      const res = await submitAction(data);
      if (res.ok) {
        toast.success("Agency admin created successfully!");
        reset();
        router.push("/management/super-dashboard/schools-page");
      } else {
        toast.error(res.error ?? "Failed to create admin.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <UserCog className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {agencyName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the Admin account for this agency.
          </p>
        </div>
      </div>

      <hr />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          register={register}
          errors={errors}
          label="Full Name"
          name="name"
          placeholder="John Doe"
        />
        <TextInput
          register={register}
          errors={errors}
          label="Email"
          name="email"
          type="email"
          placeholder="admin@agency.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          register={register}
          errors={errors}
          label="Phone Number"
          name="phone"
          placeholder="+90 212 000 00 00"
        />
        <PasswordInput
          register={register}
          errors={errors}
          label="Password"
          name="password"
        />
      </div>

      <SubmitButton
        buttonIcon={Send}
        title="Create Agency Admin"
        loading={loading}
        loadingTitle="Creating... please wait"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
