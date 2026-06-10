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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { generateSlug } from "../../lib/generateSlug";
import toast from "react-hot-toast";
import { User as PrismaUser } from "@prisma/client";
import { CategoryProps, UserProps } from "../../types/types";
import FormHeader from "./FormHeader";
import TextInput from "../FormInputs/TextInput";
import TextArea from "../FormInputs/TextAreaInput";
import ImageInput from "../FormInputs/ImageInput";
import FormFooter from "./FormFooter";
import {
  updateLocalCurrency,
  updateUserById,
} from "../../actions/users";

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
import FormSelectInput from "../FormInputs/FormSelectInput";
import currencyCodes from "../../coutries";

import { getCurrentExchangeRate } from "../../actions/exchange";


export type CurrencyProps = {
  localCurrency: string;
  defaultCurrency: string;
};
export type SelectOptionProps = {
  label: string;
  value: string;
};
type ClientFormProps = {
  editingId?: string | undefined;
  initialCode?: string;
  initialDefault?: string;
  exchangeRate: number;
};
export default function ChangeLocalCurrencyForm({
  editingId,
  initialCode = "TRY",
  initialDefault = "TRY",
  exchangeRate,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyProps>();
  const router = useRouter();
  const [passErr, setPassErr] = useState("");
  const [loading, setLoading] = useState(false);
  const initialCurrencyCode = initialCode;
  const initialCountry = currencyCodes.find(
    (item) => item.value === initialCurrencyCode
  );
  const [selectedCountry, setSelectedCountry] = useState<any>(initialCountry);
  const defaultOptions = [
    {
      label: "ABD Doları",
      value: "USD",
    },
    {
      label: `Yerel Para Birimi - ${selectedCountry.label}`,
      value: selectedCountry.value,
    },
  ];
  const initial =
    defaultOptions.find((item) => item.value === initialDefault) ||
    defaultOptions[0];
  const [selectedDefault, setSelectedDefault] = useState<any>(initial);

  async function onSubmit(data: CurrencyProps) {
    setLoading(true);
    data.localCurrency = selectedCountry.value;
    data.defaultCurrency = selectedDefault.value;
    try {
      if (editingId) {
        const res = await updateLocalCurrency(editingId, data);
        const ex = await getCurrentExchangeRate(data.localCurrency);
        if (res?.status === 403) {
          setPassErr(res?.error as string);
          setLoading(false);
          return;
        }
        if (res?.status === 200) {
          // Update localStorage
          localStorage.setItem("localCurrency", data.localCurrency);
          localStorage.setItem("defaultCurrency", data.defaultCurrency);
          localStorage.setItem("exchangeRate", ex.toString());

          setLoading(false);
          toast.success("Para birimi başarıyla güncellendi!");
          reset();
          // Optionally refresh the page or update the UI
          // window.location.reload();
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Ağ Hatası:", error);
      toast.error("Bir şeyler ters gitti, lütfen tekrar deneyin");
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-12 gap-6 py-8">
        <div className="lg:col-span-5 col-span-full space-y-3">
          <Card>
            <CardContent>
              <div className="grid gap-6 pt-6">
                <div className="space-y-4">
                  <FormSelectInput
                    label="Yerel Para Birimi"
                    options={currencyCodes}
                    option={selectedCountry}
                    setOption={setSelectedCountry}
                  />
                  <FormSelectInput
                    label="Varsayılan Para Birimi"
                    options={defaultOptions}
                    option={selectedDefault}
                    setOption={setSelectedDefault}
                  />

                  {passErr && <p className="text-red-500 text-xs">{passErr}</p>}
                </div>
              </div>
              <FormFooter
                href="/currency"
                editingId={editingId}
                loading={loading}
                title="Para Birimi"
                parent=""
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
