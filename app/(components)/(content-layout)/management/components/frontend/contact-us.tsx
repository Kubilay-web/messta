"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { Send, Building2, Mail, Phone } from "lucide-react";
import TextArea from "../FormInputs/TextAreaInput";
import PhoneInput from "../FormInputs/PhoneInput";
import FormSelectInput from "../FormInputs/FormSelectInput";
import { countries } from "../../countries";
import toast from "react-hot-toast";

export type ContactProps = {
  fullName: string;
  email: string;
  phone: string;
  school: string;     // agency / company adı (DB field: school)
  country: string;
  schoolPage: string; // website / linkedin (DB field: schoolPage)
  students: number;   // mülk / ilan sayısı (DB field: students)
  role: string;
  media: string;
  message: string;
};

interface ContactUsProps {
  onSubmit: (data: ContactProps) => Promise<{ ok: boolean; error?: string }>;
}

const removeLeadingZero = (phone: string) =>
  phone.startsWith("0") ? phone.substring(1) : phone;

const roles = [
  { label: "CEO / Founder", value: "ceo" },
  { label: "Property Manager", value: "property-manager" },
  { label: "Real Estate Agent", value: "agent" },
  { label: "Investor / Developer", value: "investor" },
  { label: "Consultant / Broker", value: "consultant" },
  { label: "Other", value: "other" },
];

const media = [
  { label: "Google", value: "google" },
  { label: "Social Media", value: "social-media" },
  { label: "Friend / Referral", value: "referral" },
  { label: "Blog / Article", value: "blog" },
  { label: "Other", value: "other" },
];

const ContactUs: React.FC<ContactUsProps> = ({ onSubmit: submitAction }) => {
  const [loading, setLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<any>(
    countries.find((c) => c.countryCode === "TR") ?? countries[0]
  );
  const [selectedRole, setSelectedRole] = useState<any>(roles[0]);
  const [selectedMedia, setMedia] = useState<any>(media[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactProps>();

  async function onSubmit(data: ContactProps) {
    data.phone = `${phoneCode}${removeLeadingZero(data.phone)}`;
    data.country = selectedCountry.label;
    data.role = selectedRole.value;
    data.media = selectedMedia.value;
    data.students = Number(data.students);
    try {
      setLoading(true);
      const res = await submitAction(data);
      if (res.ok) {
        toast.success("Your request has been submitted! We'll be in touch within 24 hours.");
        reset();
      } else {
        toast.error(res.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">

        {/* Form Card */}
        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-1 text-center text-xl font-semibold sm:text-2xl">
            Tell us about your agency
          </h3>
          <p className="mx-auto mb-6 max-w-lg px-2 text-center text-sm text-muted-foreground">
            Our team will reach out within 24 hours to schedule a personalized demo
            tailored to your real estate business needs.
          </p>

          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <TextInput
              label="Your Full Name"
              register={register}
              name="fullName"
              errors={errors}
              placeholder="Jane Smith"
            />

            {/* Email + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Email Address"
                register={register}
                name="email"
                type="email"
                errors={errors}
                placeholder="jane@agency.com"
              />
              <PhoneInput
                register={register}
                errors={errors}
                label="Phone Number"
                name="phone"
                toolTipText="Select country code then enter your number"
                placeholder="Phone number"
                setPhoneCode={setPhoneCode}
              />
            </div>

            {/* Agency Name + Country */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Agency / Company Name"
                register={register}
                name="school"
                errors={errors}
                placeholder="Sunrise Real Estate"
              />
              <FormSelectInput
                label="Country"
                options={countries}
                option={selectedCountry}
                setOption={setSelectedCountry}
              />
            </div>

            {/* Website + Property Count */}
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Company Website / LinkedIn"
                register={register}
                name="schoolPage"
                errors={errors}
                placeholder="https://yourcompany.com"
              />
              <TextInput
                label="Number of Active Listings"
                register={register}
                name="students"
                errors={errors}
                placeholder="e.g. 150"
              />
            </div>

            {/* Role + Media */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelectInput
                label="Your Role"
                options={roles}
                option={selectedRole}
                setOption={setSelectedRole}
              />
              <FormSelectInput
                label="How did you hear about us?"
                options={media}
                option={selectedMedia}
                setOption={setMedia}
              />
            </div>

            {/* Message */}
            <TextArea
              label="What challenges are you looking to solve?"
              register={register}
              name="message"
              errors={errors}
            />

            <SubmitButton
              buttonIcon={Send}
              title="Submit Request"
              loading={loading}
              loadingTitle="Sending... please wait"
            />
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-blue-800 p-6 text-white">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Talk to our sales team</h3>
            <p className="mb-5 text-sm leading-relaxed opacity-90">
              Get a personalized walkthrough of how Estate Pro can streamline your
              real estate operations and boost team productivity.
            </p>
            <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-gray-100">
              Book Appointment
            </button>
          </div>

          <div className="rounded-2xl bg-amber-400 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black/10">
              <Mail className="h-5 w-5 text-amber-900" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-amber-900">
              Contact our team
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-amber-900/80">
              Have a quick question? Reach out directly and our team will get back
              to you as soon as possible.
            </p>
            <button className="rounded-full bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Send a Mail
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactUs;
