"use client";

import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CategoryProps, ProjectProps } from "../../types/types";

import TextArea from "../FormInputs/TextAreaInput";
import { updateProjectById } from "../../actions/projects";
import SubmitButton from "../FormInputs/SubmitButton";
import TextInput from "../FormInputs/TextInput";
import { Link } from "lucide-react";
export type SelectOptionProps = {
  label: string;
  value: string;
};
export default function CustomDomainForm({
  editingId,
  initialDomain,
}: {
  editingId?: string | undefined;
  initialDomain?: string | undefined | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectProps>({
    defaultValues: {
      customDomain: initialDomain || "",
    },
  });
  const [loading, setLoading] = useState(false);
  async function updateDescription(data: ProjectProps) {
    try {
      setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
        setLoading(false);
        toast.success("Özel alan adı güncellendi!");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(updateDescription)}>
      <div className="grid gap-3">
        <TextInput
          register={register}
          errors={errors}
          label=""
          name="customDomain"
          icon={Link}
          placeholder="https://test.com"
        />
        <SubmitButton size={"sm"} title="Güncelle" loading={loading} />
      </div>
    </form>
  );
}
