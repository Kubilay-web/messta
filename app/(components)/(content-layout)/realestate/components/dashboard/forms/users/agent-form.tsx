"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

import TextInput from "../../../FormInputs/TextInput";
import TextArea from "../../../FormInputs/TextAreaInput";
import FormSelectInput from "../../../FormInputs/FormSelectInput";
import SubmitButton from "../../../FormInputs/SubmitButton";
import ImageInput from "../../../FormInputs/ImageInput";

export type AgentFormData = {
  userId: string;
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
  specializationTypes: string[];
  specializationCities: string;
  bio: string;
  skills: string;
  imageUrl: string;
};

type ExistingUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
};

interface AgentFormProps {
  onSubmit: (data: AgentFormData) => Promise<{ ok: boolean; error?: string }>;
  initialData?: Partial<AgentFormData>;
  editingId?: string;
  departments: { id: string; name: string }[];
  existingUsers?: ExistingUser[];
  onSuccess?: () => void;
}

const titles         = [{ label: "Bay", value: "Bay" }, { label: "Bayan", value: "Bayan" }, { label: "Dr.", value: "Dr." }];
const genders        = [{ label: "Erkek", value: "MALE" }, { label: "Kadın", value: "FEMALE" }, { label: "Diğer", value: "OTHER" }];
const contactMethods = [{ label: "Telefon", value: "phone" }, { label: "E-posta", value: "email" }, { label: "WhatsApp", value: "whatsapp" }];

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Daire" },
  { value: "HOUSE",     label: "Müstakil Ev" },
  { value: "VILLA",     label: "Villa" },
  { value: "OFFICE",    label: "Ofis" },
  { value: "SHOP",      label: "Dükkan / İşyeri" },
  { value: "LAND",      label: "Arsa" },
  { value: "WAREHOUSE", label: "Depo" },
  { value: "BUILDING",  label: "Bina / Apartman" },
];

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1 mb-3">
    {title}
  </h3>
);

export default function AgentForm({
  onSubmit: submitAction,
  initialData,
  editingId,
  departments,
  existingUsers = [],
  onSuccess,
}: AgentFormProps) {
  const [loading, setLoading]           = useState(false);
  const [imageUrl, setImageUrl]         = useState(initialData?.imageUrl ?? "/management/images/student.png");
  const [selectedTitle, setTitle]       = useState(titles[0]);
  const [selectedGender, setGender]     = useState(genders[0]);
  const [selectedContact, setContact]   = useState(contactMethods[0]);
  const [selectedSpecTypes, setSpecTypes] = useState<string[]>(
    initialData?.specializationTypes ?? []
  );
  const [userQuery, setUserQuery]       = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null);
  const dropdownRef                     = useRef<HTMLDivElement>(null);

  const deptOptions = departments.map((d) => ({ label: d.name, value: d.id }));
  const [selectedDept, setDept] = useState(deptOptions[0] ?? { label: "", value: "" });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = existingUsers.filter((u) => {
    const q = userQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<AgentFormData>({
      defaultValues: {
        commissionRate: "2.5",
        specializationTypes: [],
        specializationCities: "",
        ...initialData,
      },
    });

  function selectUser(u: ExistingUser) {
    setSelectedUser(u);
    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    setUserQuery(fullName || (u.email ?? ""));
    setShowDropdown(false);
    setValue("userId", u.id);
    if (u.email)     setValue("email", u.email);
    if (u.firstName) setValue("firstName", u.firstName);
    if (u.lastName)  setValue("lastName", u.lastName);
    if (u.phone)     setValue("phone", u.phone);
  }

  function clearUser() {
    setSelectedUser(null);
    setUserQuery("");
    setValue("userId", "");
    setValue("email", "");
    setValue("firstName", "");
    setValue("lastName", "");
    setValue("phone", "");
  }

  function toggleSpecType(type: string) {
    setSpecTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function onSubmit(data: AgentFormData) {
    data.title               = selectedTitle.value;
    data.gender              = selectedGender.value;
    data.contactMethod       = selectedContact.value;
    data.departmentId        = selectedDept.value;
    data.imageUrl            = imageUrl;
    data.specializationTypes = selectedSpecTypes;

    try {
      setLoading(true);
      const res = await submitAction(data);
      if (res.ok) {
        toast.success(editingId ? "Danışman güncellendi!" : "Danışman rolü atandı!");
        if (!editingId) {
          reset();
          setImageUrl("/management/images/student.png");
          setSpecTypes([]);
          onSuccess?.();
        }
      } else {
        toast.error(res.error ?? "İşlem başarısız.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── 1. Mevcut Kullanıcı Seç ─────────────────────────────── */}
      {!editingId && (
        <div>
          <SectionTitle title="Mevcut Kullanıcı Seç" />
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => { setUserQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Ad, soyad veya e-posta ile ara..."
              className="w-full h-10 px-3 pr-8 rounded-md border border-gray-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
            {selectedUser && (
              <button
                type="button"
                onClick={clearUser}
                aria-label="Temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            )}
            {showDropdown && filteredUsers.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(u)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 flex flex-col gap-0.5 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-900">{u.firstName} {u.lastName}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {showDropdown && userQuery.length > 0 && filteredUsers.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2.5 text-sm text-gray-500">
                Kullanıcı bulunamadı.
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <span className="shrink-0 font-bold text-blue-500">✓</span>
              <span>
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                {selectedUser.email && (
                  <span className="text-blue-500"> — {selectedUser.email}</span>
                )}
              </span>
            </div>
          )}

          {errors.userId && (
            <p className="mt-1 text-xs text-red-500">Lütfen mevcut bir kullanıcı seçin.</p>
          )}
          <input type="hidden" {...register("userId", { required: !editingId })} />
        </div>
      )}

      {/* ── 2. Kişisel Bilgiler ──────────────────────────────────── */}
      <div>
        <SectionTitle title="Kişisel Bilgiler" />
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Unvan" options={titles} option={selectedTitle} setOption={setTitle} />
            <TextInput register={register} errors={errors} label="Ad *" name="firstName" placeholder="Ali" />
            <TextInput register={register} errors={errors} label="Soyad *" name="lastName"  placeholder="Yılmaz" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="E-posta *" name="email" type="email" placeholder="ali@ajans.com" />
            <TextInput register={register} errors={errors} label="Telefon *" name="phone" placeholder="+90 5XX XXX XX XX" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="WhatsApp No" name="whatsappNo" placeholder="+90 5XX XXX XX XX" />
            <TextInput register={register} errors={errors} label="TC Kimlik No *" name="NIN" placeholder="12345678901" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelectInput label="Cinsiyet *" options={genders} option={selectedGender} setOption={setGender} />
            <TextInput register={register} errors={errors} label="Doğum Tarihi" name="dateOfBirth" type="date" placeholder="" />
            <FormSelectInput label="İletişim Tercihi *" options={contactMethods} option={selectedContact} setOption={setContact} />
          </div>
        </div>
      </div>

      {/* ── 3. İstihdam Bilgileri ────────────────────────────────── */}
      <div>
        <SectionTitle title="İstihdam Bilgileri" />
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="Ünvan / Pozisyon *" name="designation" placeholder="Kıdemli Danışman" />
            {deptOptions.length > 0
              ? <FormSelectInput label="Departman *" options={deptOptions} option={selectedDept} setOption={setDept} />
              : (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Departman</span>
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Önce bir departman oluşturun.
                  </p>
                </div>
              )
            }
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput register={register} errors={errors} label="İşe Giriş Tarihi *" name="dateOfJoining" type="date" placeholder="" />
            <TextInput register={register} errors={errors} label="Lisans No" name="licenseNo" placeholder="Emlak danışmanlığı belgesi" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput register={register} errors={errors} label="Eğitim / Sertifika *" name="qualification" placeholder="Lisans, Sertifika..." />
            <TextInput register={register} errors={errors} label="Deneyim (yıl)" name="experience" placeholder="5" />
            <TextInput register={register} errors={errors} label="Komisyon Oranı (%)" name="commissionRate" placeholder="2.5" />
          </div>
        </div>
      </div>

      {/* ── 4. Uzmanlık Alanları ─────────────────────────────────── */}
      <div>
        <SectionTitle title="Uzmanlık Alanları" />
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">Uzmanlaşılan Mülk Tipleri</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-gray-50 border">
              {PROPERTY_TYPES.map((pt) => (
                <label key={pt.value} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSpecTypes.includes(pt.value)}
                    onChange={() => toggleSpecType(pt.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                  />
                  <span className="text-sm">{pt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <TextInput
            register={register}
            errors={errors}
            label="Uzmanlaşılan Şehirler"
            name="specializationCities"
            placeholder="İstanbul, Ankara, İzmir"
          />
        </div>
      </div>

      {/* ── 5. Profil & Beceriler ────────────────────────────────── */}
      <div>
        <SectionTitle title="Profil & Beceriler" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <TextArea  register={register} errors={errors} label="Biyografi" name="bio" />
            <TextInput register={register} errors={errors} label="Beceriler (virgülle ayır)" name="skills" placeholder="Pazarlık, Değerleme, Pazarlama..." />
          </div>
          <ImageInput
            title="Danışman Profil Fotoğrafı"
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            endpoint="parentProfileImage"
            className="object-contain"
          />
        </div>
      </div>

      <SubmitButton
        buttonIcon={UserPlus}
        title={editingId ? "Danışmanı Güncelle" : "Danışman Rolü Ata"}
        loading={loading}
        loadingTitle="Kaydediliyor..."
        className="w-full sm:w-auto"
      />
    </form>
  );
}
