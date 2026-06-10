"use client";
import { Eye, EyeOff, Headset, Loader2, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserProps } from "../../types/types";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { createUser } from "@/actions/users";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { Button } from "../ui/button";
import { FaGithub, FaGitter, FaGoogle } from "react-icons/fa";
// import { createUser } from "@/actions/users";


export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<UserProps>();
  const router = useRouter();
  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";
    try {
      // const res = await createUser(data);
      // if (res.status === 409) {
      //   setLoading(false);
      //   setEmailErr(res.error);
      // } else if (res.status === 200) {
      //   setLoading(false);
      //   toast.success("Account Created successfully");
      //   router.push("/login");
      // } else {
      //   setLoading(false);
      //   toast.error("Something went wrong");
      // }
    } catch (error) {
      setLoading(false);
      console.error("Ağ Hatası:", error);
      toast.error("Bir şeyler ters gitti, lütfen tekrar deneyin");
    }
  }
  return (
    <div className="w-full py-5 lg:px-8 px-6">
      <div className="">
        <div className="py-4 text-gray-900">
          <h2 className="text-xl lg:text-2xl font-bold leading-9 tracking-tight  ">
            Hesap oluşturun
          </h2>
          <p className="text-xs">Aramıza katılın, bilgilerinizi girerek kaydolun</p>
        </div>
      </div>
      <div className="">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              register={register}
              errors={errors}
              label="Ad"
              name="firstName"
              icon={User}
              placeholder="Ad"
            />
            <TextInput
              register={register}
              errors={errors}
              label="Soyad"
              name="lastName"
              icon={User}
              placeholder="Soyad"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              register={register}
              errors={errors}
              label="Telefon"
              name="phone"
              icon={Headset}
              placeholder="telefon"
            />
            <div className="">
              <TextInput
                type="email"
                register={register}
                errors={errors}
                label="E-posta Adresi"
                name="email"
                icon={Mail}
                placeholder="e-posta"
              />
              {emailErr && (
                <p className="text-red-500 text-xs mt-2">{emailErr}</p>
              )}
            </div>
          </div>

          <PasswordInput
            register={register}
            errors={errors}
            label="Şifre"
            name="password"
            icon={Lock}
            placeholder="şifre"
            type="password"
          />
          <div>
            <SubmitButton
              title="Kayıt Ol"
              loadingTitle="Oluşturuluyor, lütfen bekleyin.."
              loading={loading}
              className="w-full"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </div>
        </form>

        <div className="flex items-center py-4 justify-center space-x-1 text-slate-900">
          <div className="h-[1px] w-full bg-slate-200"></div>
          <div className="uppercase">veya</div>
          <div className="h-[1px] w-full bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Button
            // onClick={() => signIn("google")}
            variant={"outline"}
            className="w-full"
          >
            <FaGoogle className="mr-2 w-6 h-6 text-red-500" />
            Google ile Kayıt Ol
          </Button>
          <Button
            // onClick={() => signIn("github")}
            variant={"outline"}
            className="w-full"
          >
            <FaGithub className="mr-2 w-6 h-6 text-slate-900 dark:text-white" />
            Github ile Kayıt Ol
          </Button>
        </div>

        <p className="mt-6 text-left text-sm text-gray-500">
          Zaten kayıtlı mısınız ?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
