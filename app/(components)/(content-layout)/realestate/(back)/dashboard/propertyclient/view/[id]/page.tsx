import { validateRequest } from "@/app/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/app/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../components/ui/avatar";
import { Separator } from "../../../../../components/ui/separator";
import {
  Phone, Mail, MapPin, User, Briefcase, Calendar,
  Home, FileText, Eye, TrendingUp,
} from "lucide-react";
import Link from "next/link";

const PT_LABELS: Record<string, string> = {
  APARTMENT: "Daire", HOUSE: "Müstakil Ev", VILLA: "Villa", OFFICE: "Ofis",
  SHOP: "Dükkan", LAND: "Arsa", WAREHOUSE: "Depo", BUILDING: "Bina",
};

const CONTRACT_STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-yellow-100 text-yellow-700",
};

const VISIT_STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-600",
};

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// ── Agency guard ───────────────────────────────────────────────────────────────

async function getAgencyCtx(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { agency: { select: { id: true } } },
  });
  if (!dbUser?.agency?.id) redirect("/realestate/estate-onboarding");
  return dbUser.agency;
}

// ── PAGE (GET) ─────────────────────────────────────────────────────────────────

export default async function ClientViewPage({
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
          orderBy: { createdAt: "desc" },
          include: {
            property: { select: { title: true, city: true } },
            agent: { select: { firstName: true, lastName: true } },
          },
        },
        visits: {
          orderBy: { scheduledAt: "desc" },
          include: {
            property: { select: { title: true, city: true } },
            agent: { select: { firstName: true, lastName: true } },
          },
        },
        interests: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            listing: {
              select: {
                title: true, listingType: true, askingPrice: true, currency: true,
                property: { select: { city: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!client) notFound();

  const roles = [
    { key: "isBuyer",    label: "Alıcı",        active: client.isBuyer },
    { key: "isSeller",   label: "Satıcı",        active: client.isSeller },
    { key: "isTenant",   label: "Kiracı",        active: client.isTenant },
    { key: "isLandlord", label: "Kiraya Veren",  active: client.isLandlord },
  ].filter((r) => r.active);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* ── Profil Başlığı ── */}
      <Card className="overflow-hidden shadow-sm">
        <div
          className="relative h-36 sm:h-44"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          }}
        />
        <CardContent className="relative pt-0 pb-5 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg shrink-0">
                {client.imageUrl && (
                  <AvatarImage src={client.imageUrl} alt={`${client.firstName} ${client.lastName}`} />
                )}
                <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700">
                  {initials(client.firstName, client.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white leading-tight">
                  {client.title} {client.firstName} {client.lastName}
                </h1>
                <p className="text-sm text-gray-500">{client.NIN}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {roles.map((r) => (
                    <span key={r.key} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {r.label}
                    </span>
                  ))}
                  {roles.length === 0 && (
                    <span className="text-xs text-gray-400">Rol atanmamış</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              <Link
                href={`/realestate/dashboard/students/edit/${id}`}
                className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                Düzenle
              </Link>
              <Link
                href="/realestate/dashboard/students"
                className="h-9 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
              >
                ← Geri
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Hızlı Bilgi Kartları ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Phone,     label: "Telefon",    value: client.phone },
          { icon: Mail,      label: "E-posta",    value: client.email },
          { icon: MapPin,    label: "Şehir",      value: client.address.split(",").pop()?.trim() ?? client.address },
          { icon: Briefcase, label: "Meslek",     value: client.occupation ?? "—" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-t-2 border-t-blue-500 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Detaylar + Bütçe ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Kişisel Bilgiler */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5 text-sm">
            {[
              { label: "Cinsiyet",         value: client.gender === "MALE" ? "Erkek" : client.gender === "FEMALE" ? "Kadın" : "Diğer" },
              { label: "Doğum Tarihi",     value: new Date(client.dob).toLocaleDateString("tr-TR") },
              { label: "Uyruk",            value: client.nationality },
              { label: "İletişim Yöntemi", value: client.contactMethod },
              { label: "WhatsApp",         value: client.whatsappNo ?? "—" },
              { label: "Adres",            value: client.address },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bütçe & Tercihler */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Bütçe & Tercihler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Min. Bütçe</span>
              <span className="font-medium">
                {client.minBudget
                  ? `${client.minBudget.toLocaleString("tr-TR")} ${client.currency}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Maks. Bütçe</span>
              <span className="font-medium">
                {client.maxBudget
                  ? `${client.maxBudget.toLocaleString("tr-TR")} ${client.currency}`
                  : "—"}
              </span>
            </div>
            <Separator />
            <div>
              <p className="text-gray-500 mb-1.5">Tercih Edilen Mülk Tipleri</p>
              <div className="flex flex-wrap gap-1.5">
                {client.preferredPropertyTypes.length > 0
                  ? client.preferredPropertyTypes.map((t) => (
                      <span key={t} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {PT_LABELS[t] ?? t}
                      </span>
                    ))
                  : <span className="text-gray-400">—</span>}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1.5">Tercih Edilen Şehirler</p>
              <div className="flex flex-wrap gap-1.5">
                {client.preferredCities.length > 0
                  ? client.preferredCities.map((c) => (
                      <span key={c} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{c}</span>
                    ))
                  : <span className="text-gray-400">—</span>}
              </div>
            </div>
            {client.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-gray-500 mb-1">Notlar</p>
                  <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{client.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Sözleşmeler ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Sözleşmeler
            <span className="ml-auto text-xs font-normal text-gray-400">{client.contracts.length} kayıt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {client.contracts.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Sözleşme bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {client.contracts.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.property.title}</p>
                    <p className="text-xs text-gray-500">{c.property.city} · {c.contractNo} · {c.agent.firstName} {c.agent.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACT_STATUS_COLOR[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {c.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Geziler ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Mülk Gezileri
            <span className="ml-auto text-xs font-normal text-gray-400">{client.visits.length} kayıt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {client.visits.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Gezi kaydı bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {client.visits.map((v) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{v.property.title}</p>
                    <p className="text-xs text-gray-500">{v.property.city} · {v.agent.firstName} {v.agent.lastName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${VISIT_STATUS_COLOR[v.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {v.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(v.scheduledAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── İlgi Alanları (Listings) ── */}
      {client.interests.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              İlgi Gösterilen İlanlar
              <span className="ml-auto text-xs font-normal text-gray-400">{client.interests.length} kayıt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {client.interests.map((i) => (
                <div key={i.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{i.listing.title}</p>
                    <p className="text-xs text-gray-500">{i.listing.property.city}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {i.listing.listingType === "SALE" ? "Satılık" : i.listing.listingType === "RENT" ? "Kiralık" : "Kısa Dönem"}
                    </span>
                    <span className="text-xs font-medium">
                      {i.listing.askingPrice.toLocaleString("tr-TR")} {i.listing.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
