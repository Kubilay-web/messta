import { validateRequest } from "@/app/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Separator } from "../../../../../components/ui/separator";
import Link from "next/link";
import { DeleteClientButton } from "./delete-button";

const PATH = "/realestate/dashboard/students";

const PROPERTY_TYPES = [
  "APARTMENT", "HOUSE", "VILLA", "OFFICE", "SHOP", "LAND", "WAREHOUSE", "BUILDING",
] as const;
type PT = (typeof PROPERTY_TYPES)[number];

const PT_LABELS: Record<PT, string> = {
  APARTMENT: "Daire", HOUSE: "Müstakil Ev", VILLA: "Villa", OFFICE: "Ofis",
  SHOP: "Dükkan", LAND: "Arsa", WAREHOUSE: "Depo", BUILDING: "Bina",
};

// ── Agency context ─────────────────────────────────────────────────────────────

async function getAgencyCtx(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true, name: true } } },
  });
  if (!dbUser?.agency?.id) redirect("/realestate/estate-onboarding");
  return dbUser.agency;
}

// ── PUT ────────────────────────────────────────────────────────────────────────

async function updateClient(id: string, fd: FormData) {
  "use server";
  const raw = Object.fromEntries(fd.entries());

  const preferredPropertyTypes = PROPERTY_TYPES.filter(
    (t) => raw[`pt_${t}`] === "on"
  ) as unknown as PT[];

  const preferredCities = (raw.preferredCities as string)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  await prisma.propertyClient.update({
    where: { id },
    data: {
      title:         raw.title         as string,
      firstName:     raw.firstName     as string,
      lastName:      raw.lastName      as string,
      phone:         raw.phone         as string,
      whatsappNo:    (raw.whatsappNo as string) || null,
      gender:        raw.gender        as string,
      dob:           new Date(raw.dob  as string),
      nationality:   raw.nationality   as string,
      NIN:           raw.NIN           as string,
      contactMethod: raw.contactMethod as string,
      occupation:    (raw.occupation   as string) || null,
      address:       raw.address       as string,
      isBuyer:       raw.isBuyer    === "on",
      isSeller:      raw.isSeller   === "on",
      isTenant:      raw.isTenant   === "on",
      isLandlord:    raw.isLandlord  === "on",
      minBudget:     raw.minBudget ? parseFloat(raw.minBudget as string) : null,
      maxBudget:     raw.maxBudget ? parseFloat(raw.maxBudget as string) : null,
      currency:      raw.currency   as string,
      preferredPropertyTypes,
      preferredCities,
      notes:         (raw.notes as string) || null,
    },
  });
  revalidatePath(PATH);
  redirect(PATH);
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

async function deleteClient(id: string) {
  "use server";
  await prisma.propertyClient.delete({ where: { id } });
  revalidatePath(PATH);
  redirect(PATH);
}

// ── PAGE ───────────────────────────────────────────────────────────────────────

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const { id } = await params;

  const [, client] = await Promise.all([
    getAgencyCtx(user.id),
    prisma.propertyClient.findUnique({
      where: { id },
      include: {
        contracts: {
          select: { id: true, contractNo: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        visits: {
          select: { id: true, scheduledAt: true, status: true },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
      },
    }),
  ]);

  if (!client) notFound();

  const dobStr = client.dob
    ? new Date(client.dob).toISOString().split("T")[0]
    : "";

  const updateAction = updateClient.bind(null, id);
  const deleteAction = deleteClient.bind(null, id);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Müşteri Düzenle
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {client.firstName} {client.lastName} · {client.NIN}
          </p>
        </div>
        <Link href={PATH} className="text-sm text-blue-600 hover:underline self-start sm:self-auto">
          ← Müşteri Listesi
        </Link>
      </div>

      {/* ── Edit Form ── */}
      <Card className="border-t-4 border-blue-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="space-y-5">

            {/* Ünvan / Ad / Soyad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Ünvan *</label>
                <select name="title" defaultValue={client.title}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["Bay", "Bayan", "Dr.", "Prof.", "Av."].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Ad *</label>
                <input name="firstName" required defaultValue={client.firstName}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Soyad *</label>
                <input name="lastName" required defaultValue={client.lastName}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Telefon / WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Telefon *</label>
                <input name="phone" required defaultValue={client.phone}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">WhatsApp</label>
                <input name="whatsappNo" defaultValue={client.whatsappNo ?? ""}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Cinsiyet / Doğum / Uyruk */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Cinsiyet *</label>
                <select name="gender" defaultValue={client.gender}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MALE">Erkek</option>
                  <option value="FEMALE">Kadın</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Doğum Tarihi *</label>
                <input name="dob" type="date" required defaultValue={dobStr}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Uyruk *</label>
                <input name="nationality" required defaultValue={client.nationality}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* TC / İletişim Yöntemi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">TC Kimlik No *</label>
                <input name="NIN" required defaultValue={client.NIN}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">İletişim Yöntemi *</label>
                <select name="contactMethod" defaultValue={client.contactMethod}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["Telefon", "WhatsApp", "E-posta", "Yüz Yüze"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meslek / Adres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Meslek</label>
                <input name="occupation" defaultValue={client.occupation ?? ""}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Adres *</label>
                <input name="address" required defaultValue={client.address}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <Separator />

            {/* Roller */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Müşteri Rolleri</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    { name: "isBuyer",    label: "Alıcı",        checked: client.isBuyer },
                    { name: "isSeller",   label: "Satıcı",       checked: client.isSeller },
                    { name: "isTenant",   label: "Kiracı",       checked: client.isTenant },
                    { name: "isLandlord", label: "Kiraya Veren", checked: client.isLandlord },
                  ] as const
                ).map(({ name, label, checked }) => (
                  <label key={name} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input type="checkbox" name={name} defaultChecked={checked}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Bütçe */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Bütçe</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Min. Bütçe</label>
                  <input name="minBudget" type="number" step="1000"
                    defaultValue={client.minBudget ?? ""}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Maks. Bütçe</label>
                  <input name="maxBudget" type="number" step="1000"
                    defaultValue={client.maxBudget ?? ""}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Para Birimi</label>
                  <select name="currency" defaultValue={client.currency}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["TRY", "USD", "EUR", "GBP"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tercih Edilen Mülk Tipleri */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Tercih Edilen Mülk Tipleri</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={`pt_${t}`}
                      defaultChecked={(client.preferredPropertyTypes as string[]).includes(t)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {PT_LABELS[t]}
                  </label>
                ))}
              </div>
            </div>

            {/* Tercih Edilen Şehirler */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tercih Edilen Şehirler</label>
              <input
                name="preferredCities"
                defaultValue={client.preferredCities.join(", ")}
                placeholder="İstanbul, Ankara, İzmir"
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400">Virgülle ayırın</p>
            </div>

            {/* Notlar */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Notlar</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={client.notes ?? ""}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Kaydet / İptal */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 sm:flex-none sm:w-36 h-10 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                Kaydet
              </button>
              <Link
                href={PATH}
                className="flex-1 sm:flex-none sm:w-24 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                İptal
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Sözleşmeler & Geziler ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sözleşmeler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {client.contracts.length === 0 ? (
              <p className="text-sm text-gray-400">Sözleşme bulunamadı</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {client.contracts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {c.contractNo}
                    </span>
                    <Badge variant="outline" className="text-xs">{c.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Son Geziler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {client.visits.length === 0 ? (
              <p className="text-sm text-gray-400">Gezi kaydı bulunamadı</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {client.visits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(v.scheduledAt).toLocaleDateString("tr-TR")}
                    </span>
                    <Badge variant="outline" className="text-xs">{v.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Tehlikeli Bölge — DELETE ── */}
      <Card className="border border-red-200 dark:border-red-900 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-600">Tehlikeli Bölge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Bu müşteriyi silerseniz geri alınamaz. Bağlı tüm kayıtlar etkilenebilir.
          </p>
          <DeleteClientButton action={deleteAction} />
        </CardContent>
      </Card>
    </div>
  );
}
