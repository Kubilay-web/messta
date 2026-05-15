"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

import TextInput from "../../../../components/FormInputs/TextInput";
import TextArea from "../../../../components/FormInputs/TextAreaInput";
import PasswordInput from "../../../../components/FormInputs/PasswordInput";
import FormSelectInput from "../../../../components/FormInputs/FormSelectInput";
import SubmitButton from "../../../../components/FormInputs/SubmitButton";
import { Label } from "../../../../components/ui/label";

export type ClientFormData = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNo: string;
  gender: string;
  dob: string;
  nationality: string;
  NIN: string;
  address: string;
  contactMethod: string;
  occupation: string;
  password: string;
  isBuyer: boolean;
  isSeller: boolean;
  isTenant: boolean;
  isLandlord: boolean;
  minBudget: string;
  maxBudget: string;
  notes: string;
};

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => Promise<{ ok: boolean; error?: string }>;
  initialData?: Partial<ClientFormData>;
  editingId?: string;
}

const titles        = [{ label: "Bay", value: "Bay" }, { label: "Bayan", value: "Bayan" }, { label: "Dr.", value: "Dr." }, { label: "Prof.", value: "Prof." }];
const genders       = [{ label: "Male",   value: "MALE" }, { label: "Female", value: "FEMALE" }, { label: "Other", value: "OTHER" }];
const contactMethods= [{ label: "Phone", value: "phone" }, { label: "Email", value: "email" }, { label: "WhatsApp", value: "whatsapp" }];

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1 mb-3">
    {title}
  </h3>
);

const CheckField = ({
  id, label, register, name,
}: { id: string; label: string; register: any; name: any }) => (
  <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
      {...register(name)}
    />
    <span className="text-sm">{label}</span>
  </label>
);

export default function ClientForm({ onSubmit: submitAction, initialData, editingId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading]             = useState(false);
  const [selectedTitle, setTitle]         = useState(titles[0]);
  const [selectedGender, setGender]       = useState(genders[0]);
  const [selectedContact, setContact]     = useState(contactMethods[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      isBuyer: true, isSeller: false, isTenant: false, isLandlord: false,
      ...initialData,
    },
  });

  async function onSubmit(data: ClientFormData) {
    data.title         = selectedTitle.value;
    data.gender        = selectedGender.value;
    data.contactMethod = selectedContact.value;

    try {
      setLoading(true);
      const res = await submitAction(data);
      if (res.ok) {
        toast.success(editingId ? "Client updated!" : "Client created successfully!");
        if (!editingId) { reset(); router.push("/management/dashboard/students"); }
      } else {
        toast.error(res.error ?? "Operation failed. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── 1. Personal Information ──────────────────────────────── */}
      <div>
        <SectionTitle title="Personal Information" />
        <div className="grid gap-4">
          {/* Title + First + Last */}
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Title" options={titles} option={selectedTitle} setOption={setTitle} />
            <TextInput register={register} errors={errors} label="First Name *" name="firstName" placeholder="Jane" />
            <TextInput register={register} errors={errors} label="Last Name *"  name="lastName"  placeholder="Smith" />
          </div>

          {/* Email + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Email *"         name="email"      type="email" placeholder="jane@example.com" />
            <TextInput register={register} errors={errors} label="Phone *"          name="phone"      placeholder="+90 5XX XXX XX XX" />
          </div>

          {/* WhatsApp + Occupation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="WhatsApp No"      name="whatsappNo" placeholder="+90 5XX XXX XX XX" />
            <TextInput register={register} errors={errors} label="Occupation"       name="occupation" placeholder="Engineer, Lawyer..." />
          </div>

          {/* Gender + DOB + Nationality */}
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Gender *" options={genders} option={selectedGender} setOption={setGender} />
            <TextInput register={register} errors={errors} label="Date of Birth *"  name="dob"  type="date" placeholder="" />
            <TextInput register={register} errors={errors} label="Nationality *"    name="nationality" placeholder="Turkish" />
          </div>

          {/* NIN + Contact Method */}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="TC Kimlik No *"  name="NIN"  placeholder="12345678901" />
            <FormSelectInput label="Preferred Contact *" options={contactMethods} option={selectedContact} setOption={setContact} />
          </div>

          {/* Address */}
          <TextArea register={register} errors={errors} label="Address *" name="address" />
        </div>
      </div>

      {/* ── 2. Client Type ───────────────────────────────────────── */}
      <div>
        <SectionTitle title="Client Type" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-gray-50 border">
          <CheckField id="isBuyer"    label="Buyer (Alıcı)"       register={register} name="isBuyer" />
          <CheckField id="isSeller"   label="Seller (Satıcı)"     register={register} name="isSeller" />
          <CheckField id="isTenant"   label="Tenant (Kiracı)"     register={register} name="isTenant" />
          <CheckField id="isLandlord" label="Landlord (Ev sahibi)" register={register} name="isLandlord" />
        </div>
      </div>

      {/* ── 3. Budget & Notes ────────────────────────────────────── */}
      <div>
        <SectionTitle title="Budget & Notes" />
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Min Budget (TRY)" name="minBudget" placeholder="e.g. 500000" />
            <TextInput register={register} errors={errors} label="Max Budget (TRY)" name="maxBudget" placeholder="e.g. 2000000" />
          </div>
          <TextArea register={register} errors={errors} label="Notes" name="notes" />
        </div>
      </div>

      {/* ── 4. Portal Account ────────────────────────────────────── */}
      <div>
        <SectionTitle title="Portal Account" />
        <div className="max-w-sm">
          <PasswordInput
            register={register}
            errors={errors}
            label="Password *"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
          />
        </div>
      </div>

      <SubmitButton
        buttonIcon={UserPlus}
        title={editingId ? "Update Client" : "Register Client"}
        loading={loading}
        loadingTitle="Saving... please wait"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
