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

// import { generateSlug } from "@/lib/generateSlug";
import toast from "react-hot-toast";
import { User as PrismaUser } from "@prisma/client";
// import { CategoryProps, UserProps } from "@/types/types";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";
// import {
//   createUser,
//   updateUserById,
//   updateUserPassword,
// } from "@/actions/users";


import PasswordInput from "../FormInputs/PasswordInput";
import {
  Headset,
  Mail,
  User,
  Lock,
  Flag,
  MapPin,
  Pencil,
  Building,
  Headphones,
  LockOpen,
} from "lucide-react";


export type PasswordProps = {
  oldPassword: string;
  newPassword: string;
};
export type SelectOptionProps = {
  label: string;
  value: string;
};
type ClientFormProps = {
  editingId?: string | undefined;
  initialData?: PrismaUser | undefined | null;
};
export default function ChangePasswordForm({
  editingId,
  initialData,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordProps>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });
  const router = useRouter();
  const [passErr, setPassErr] = useState("");
  const [loading, setLoading] = useState(false);

  // async function onSubmit(data: PasswordProps) {
  //   setLoading(true);
  //   try {
  //     if (editingId) {
  //       const res = await updateUserPassword(editingId, data);
  //       if (res?.status === 403) {
  //         setPassErr(res?.error as string);
  //         setLoading(false);
  //         return;
  //       }
  //       if (res?.status === 200) {
  //         setLoading(false);
  //         toast.success("Password Updated Successfully!");
  //         reset();
  //         router.push("/");
  //       }
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("Network Error:", error);
  //     toast.error("Its seems something is wrong, try again");
  //   }
  // }

  return (
    <form className="" >
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-8 col-span-full space-y-3">
          <Card>
            <CardContent>
              <div className="grid gap-6 pt-6">
                <div className="space-y-4">
                  <TextInput
                    register={register}
                    errors={errors}
                    label="Eski Şifre"
                    name="oldPassword"
                    icon={LockOpen}
                    placeholder="Eski Şifre"
                  />
                  <PasswordInput
                    register={register}
                    errors={errors}
                    label="Yeni Şifre"
                    name="newPassword"
                    icon={Lock}
                    placeholder="şifre"
                  />
                  {passErr && <p className="text-red-500 text-xs">{passErr}</p>}
                </div>
              </div>
              <FormFooter
                href="/change-password"
                editingId={editingId}
                loading={loading}
                title="Şifre"
                parent=""
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
