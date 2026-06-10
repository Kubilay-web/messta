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
import { Link, Mail } from "lucide-react";
import { createSubscription } from "../../actions/subscribe";
export type SelectOptionProps = {
  label: string;
  value: string;
};
export type SubscriberProps = {
  email: string;
  userId: string;
};
export default function SubscribeForm({
  userId,
}: {
  userId: string | undefined;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriberProps>();
  const [loading, setLoading] = useState(false);
  async function subscribe(data: SubscriberProps) {
    data.userId = userId ?? "";
    try {
      setLoading(true);
      const res = await createSubscription(data);
      if (res?.status === 409) {
        setLoading(false);
        toast.error(res.error);
        reset();
        return;
      }
      setLoading(false);
      toast.success("Aboneliğiniz eklendi");
      reset();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(subscribe)}>
      <div className="flex items-center gap-3 pb-4">
        <TextInput
          register={register}
          errors={errors}
          label=""
          name="email"
          // icon={Mail}
          placeholder="ornek@eposta.com"
        />
        <SubmitButton
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-r-lg px-6 py-2 font-semibold"
          size={"sm"}
          title="Abone Ol"
          buttonIcon={Mail}
          loading={loading}
          loadingTitle="Kaydediliyor.."
        />
      </div>
    </form>
  );
}
