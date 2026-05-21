"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "../../../../components/ui/card";

type Dept = { id: string; name: string };

interface Props {
  departments: Dept[];
  createAgent: (data: any) => Promise<{ ok: boolean; error?: string }>;
  redirectPath: string;
}

type FormData = {
  title: string; firstName: string; lastName: string;
  email: string; phone: string; whatsappNo?: string;
  dateOfBirth?: string; gender: string; imageUrl?: string;
  NIN: string; password: string; contactMethod: string;
  employeeId: string; dateOfJoining: string; designation: string;
  departmentId: string;
  licenseNo?: string; qualification: string;
  experience?: string; bio?: string; skills?: string;
  commissionRate?: string;
};

const inp = "w-full h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const lbl = "block text-xs text-gray-500 mb-1";

function Divider({ title }: { title: string }) {
  return (
    <div className="col-span-full mt-2 mb-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b pb-1">{title}</p>
    </div>
  );
}

export default function AgentFormUI({ departments, createAgent, redirectPath }: Props) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: { title: "Bay", gender: "MALE", contactMethod: "Telefon", commissionRate: "2.5" },
  });

  async function onSubmit(data: FormData) {
    const res = await createAgent(data);
    if (res.ok) {
      toast.success("Danışman oluşturuldu.");
      router.push(redirectPath);
    } else {
      toast.error(res.error ?? "Hata.");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <Divider title="Kişisel Bilgiler" />

          <div>
            <label className={lbl}>Unvan</label>
            <select {...register("title")} className={inp}>
              <option value="Bay">Bay</option>
              <option value="Bayan">Bayan</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Cinsiyet *</label>
            <select {...register("gender", { required: true })} className={inp}>
              <option value="MALE">Erkek</option>
              <option value="FEMALE">Kadın</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Ad *</label>
            <input {...register("firstName", { required: true })} className={inp} placeholder="Ad" />
            {errors.firstName && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Soyad *</label>
            <input {...register("lastName", { required: true })} className={inp} placeholder="Soyad" />
            {errors.lastName && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>TC Kimlik No *</label>
            <input {...register("NIN", { required: true })} className={inp} placeholder="11 haneli TC kimlik" />
            {errors.NIN && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Doğum Tarihi</label>
            <input type="date" {...register("dateOfBirth")} className={inp} />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl}>Fotoğraf URL</label>
            <input {...register("imageUrl")} className={inp} placeholder="https://..." />
          </div>

          <Divider title="İletişim" />

          <div>
            <label className={lbl}>E-posta *</label>
            <input type="email" {...register("email", { required: true })} className={inp} placeholder="ornek@ajans.com" />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Telefon *</label>
            <input {...register("phone", { required: true })} className={inp} placeholder="05XX XXX XX XX" />
            {errors.phone && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>WhatsApp No</label>
            <input {...register("whatsappNo")} className={inp} placeholder="05XX XXX XX XX" />
          </div>

          <div>
            <label className={lbl}>İletişim Tercihi *</label>
            <select {...register("contactMethod", { required: true })} className={inp}>
              <option value="Telefon">Telefon</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="E-posta">E-posta</option>
            </select>
          </div>

          <Divider title="İş Bilgileri" />

          <div>
            <label className={lbl}>Personel ID *</label>
            <input {...register("employeeId", { required: true })} className={inp} placeholder="EMP-001" />
            {errors.employeeId && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>İşe Başlama Tarihi *</label>
            <input type="date" {...register("dateOfJoining", { required: true })} className={inp} />
            {errors.dateOfJoining && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Pozisyon *</label>
            <input {...register("designation", { required: true })} className={inp} placeholder="Kıdemli Danışman" />
            {errors.designation && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Departman *</label>
            <select {...register("departmentId", { required: true })} className={inp}>
              <option value="">Seçin...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.departmentId && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Lisans No</label>
            <input {...register("licenseNo")} className={inp} placeholder="Emlak danışmanlığı belgesi" />
          </div>

          <div>
            <label className={lbl}>Eğitim *</label>
            <input {...register("qualification", { required: true })} className={inp} placeholder="Üniversite mezunu" />
            {errors.qualification && <p className="text-xs text-red-500 mt-0.5">Zorunlu</p>}
          </div>

          <div>
            <label className={lbl}>Tecrübe (Yıl)</label>
            <input type="number" min="0" {...register("experience")} className={inp} placeholder="3" />
          </div>

          <div>
            <label className={lbl}>Komisyon Oranı (%)</label>
            <input type="number" step="0.1" min="0" max="100" {...register("commissionRate")} className={inp} placeholder="2.5" />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl}>Uzmanlık / Yetenekler</label>
            <input {...register("skills")} className={inp} placeholder="Konut, Ofis, Kiralık..." />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl}>Biyografi</label>
            <textarea {...register("bio")} rows={3} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Kısa tanıtım..." />
          </div>

          <Divider title="Hesap Bilgileri" />

          <div className="sm:col-span-2">
            <label className={lbl}>Şifre * (en az 6 karakter)</label>
            <input type="password" {...register("password", { required: true, minLength: 6 })} className={inp} placeholder="••••••" />
            {errors.password && <p className="text-xs text-red-500 mt-0.5">En az 6 karakter zorunlu</p>}
          </div>

          <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-9 px-5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Danışman Oluştur"}
            </button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
