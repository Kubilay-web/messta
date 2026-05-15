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
import ImageInput from "../../../../components/FormInputs/ImageInput";

export type AgentFormData = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNo: string;
  gender: string;
  dateOfBirth: string;
  NIN: string;
  contactMethod: string;
  designation: string;
  departmentId: string;
  dateOfJoining: string;
  licenseNo: string;
  qualification: string;
  experience: string;
  commissionRate: string;
  bio: string;
  skills: string;
  imageUrl: string;
  password: string;
};

interface AgentFormProps {
  onSubmit: (data: AgentFormData) => Promise<{ ok: boolean; error?: string }>;
  initialData?: Partial<AgentFormData>;
  editingId?: string;
  departments: { id: string; name: string }[];
  onSuccess?: () => void;
}

const titles        = [{ label: "Bay", value: "Bay" }, { label: "Bayan", value: "Bayan" }, { label: "Dr.", value: "Dr." }];
const genders       = [{ label: "Male", value: "MALE" }, { label: "Female", value: "FEMALE" }, { label: "Other", value: "OTHER" }];
const contactMethods= [{ label: "Phone", value: "phone" }, { label: "Email", value: "email" }, { label: "WhatsApp", value: "whatsapp" }];

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1 mb-3">
    {title}
  </h3>
);

export default function AgentForm({ onSubmit: submitAction, initialData, editingId, departments, onSuccess }: AgentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "/management/images/student.png");
  const [selectedTitle, setTitle]     = useState(titles[0]);
  const [selectedGender, setGender]   = useState(genders[0]);
  const [selectedContact, setContact] = useState(contactMethods[0]);

  const deptOptions = departments.map((d) => ({ label: d.name, value: d.id }));
  const [selectedDept, setDept] = useState(deptOptions[0] ?? { label: "", value: "" });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AgentFormData>({
    defaultValues: { commissionRate: "2.5", ...initialData },
  });

  async function onSubmit(data: AgentFormData) {
    data.title         = selectedTitle.value;
    data.gender        = selectedGender.value;
    data.contactMethod = selectedContact.value;
    data.departmentId  = selectedDept.value;
    data.imageUrl      = imageUrl;

    try {
      setLoading(true);
      const res = await submitAction(data);
      if (res.ok) {
        toast.success(editingId ? "Agent updated!" : "Agent registered successfully!");
        if (!editingId) {
          reset();
          setImageUrl("/management/images/student.png");
          router.push("/management/dashboard/users/parents");
        }
      } else {
        toast.error(res.error ?? "Operation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── 1. Personal Information ──────────────────────────────────── */}
      <div>
        <SectionTitle title="Personal Information" />
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Title" options={titles} option={selectedTitle} setOption={setTitle} />
            <TextInput register={register} errors={errors} label="First Name *" name="firstName" placeholder="Ali" />
            <TextInput register={register} errors={errors} label="Last Name *"  name="lastName"  placeholder="Yılmaz" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Email *" name="email" type="email" placeholder="ali@agency.com" />
            <TextInput register={register} errors={errors} label="Phone *" name="phone" placeholder="+90 5XX XXX XX XX" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="WhatsApp No"      name="whatsappNo" placeholder="+90 5XX XXX XX XX" />
            <TextInput register={register} errors={errors} label="TC Kimlik No *"   name="NIN"        placeholder="12345678901" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Gender *"         options={genders}        option={selectedGender}  setOption={setGender} />
            <TextInput register={register} errors={errors} label="Date of Birth" name="dateOfBirth" type="date" placeholder="" />
            <FormSelectInput label="Contact Method *" options={contactMethods} option={selectedContact} setOption={setContact} />
          </div>
        </div>
      </div>

      {/* ── 2. Employment Details ─────────────────────────────────────── */}
      <div>
        <SectionTitle title="Employment Details" />
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Designation *" name="designation" placeholder="Senior Consultant" />
            {deptOptions.length > 0
              ? <FormSelectInput label="Department *" options={deptOptions} option={selectedDept} setOption={setDept} />
              : (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Department</span>
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    No departments found. Please create a department first.
                  </p>
                </div>
              )
            }
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Date of Joining *" name="dateOfJoining" type="date" placeholder="" />
            <TextInput register={register} errors={errors} label="License No"        name="licenseNo"     placeholder="Emlak danışmanlığı belgesi no" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput register={register} errors={errors} label="Qualification *"     name="qualification"  placeholder="BSc Real Estate" />
            <TextInput register={register} errors={errors} label="Experience (years)"  name="experience"     placeholder="5" />
            <TextInput register={register} errors={errors} label="Commission Rate (%)" name="commissionRate" placeholder="2.5" />
          </div>
        </div>
      </div>

      {/* ── 3. Profile & Skills ───────────────────────────────────────── */}
      <div>
        <SectionTitle title="Profile & Skills" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <TextArea  register={register} errors={errors} label="Bio"                      name="bio"    />
            <TextInput register={register} errors={errors} label="Skills (comma-separated)" name="skills" placeholder="Negotiation, Valuation, Marketing..." />
          </div>
          <ImageInput
            title="Agent Profile Photo"
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            endpoint="parentProfileImage"
            className="object-contain"
          />
        </div>
      </div>

      {/* ── 4. Portal Account ─────────────────────────────────────────── */}
      {!editingId && (
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
      )}

      <SubmitButton
        buttonIcon={UserPlus}
        title={editingId ? "Update Agent" : "Register Agent"}
        loading={loading}
        loadingTitle="Saving... please wait"
        className="w-full sm:w-auto"
      />
    </form>
  );
}
