import { validateRequest } from "@/app/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../../components/ui/avatar";
import { Separator } from "../../../../../../components/ui/separator";
import {
  Phone, Mail, Briefcase, Calendar, FileText,
  Home, TrendingUp, User, Award, Star,
} from "lucide-react";
import Link from "next/link";
import { DeleteAgentButton, ToggleActiveButton } from "./agent-actions";

const PATH = "/realestate/dashboard/users/agents";

const CONTRACT_COLOR: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-700",
  ACTIVE:    "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED:   "bg-yellow-100 text-yellow-700",
};

const LISTING_COLOR: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700",
  SOLD:      "bg-blue-100 text-blue-700",
  RENTED:    "bg-purple-100 text-purple-700",
  WITHDRAWN: "bg-gray-100 text-gray-600",
  PENDING:   "bg-yellow-100 text-yellow-700",
  RESERVED:  "bg-orange-100 text-orange-700",
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
  if (!dbUser?.agency?.id) redirect("/realestate/onboarding");
  return dbUser.agency;
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

async function deleteAgent(id: string) {
  "use server";
  const agent = await prisma.agent.findUnique({ where: { id }, select: { userId: true } });
  if (agent?.userId) {
    await prisma.user.delete({ where: { id: agent.userId } }); // cascades to agent
  } else {
    await prisma.agent.delete({ where: { id } });
  }
  revalidatePath(PATH);
}

// ── TOGGLE ACTIVE ──────────────────────────────────────────────────────────────

async function toggleActive(id: string, current: boolean) {
  "use server";
  await prisma.agent.update({ where: { id }, data: { isActive: !current } });
  revalidatePath(PATH);
}

// ── PAGE (GET) ─────────────────────────────────────────────────────────────────

export default async function AgentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/realestate/login");

  const { id } = await params;

  const [, agent] = await Promise.all([
    getAgencyCtx(user.id),
    prisma.agent.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        listings: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, title: true, listingType: true,
            status: true, askingPrice: true, currency: true,
            property: { select: { city: true } },
          },
        },
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true, contractNo: true, contractType: true,
            status: true, createdAt: true,
            property: { select: { title: true, city: true } },
            client: { select: { firstName: true, lastName: true } },
          },
        },
        visits: {
          orderBy: { scheduledAt: "desc" },
          take: 8,
          select: {
            id: true, scheduledAt: true, status: true,
            property: { select: { title: true, city: true } },
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
  ]);

  if (!agent) notFound();

  const deleteAction  = deleteAgent.bind(null, id);
  const toggleAction  = toggleActive.bind(null, id, agent.isActive);
  const fullName      = `${agent.title} ${agent.firstName} ${agent.lastName}`;
  const activeListings = agent.listings.filter((l) => l.status === "ACTIVE").length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* ── Profil Başlığı ── */}
      <Card className="overflow-hidden shadow-sm">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-slate-800 to-blue-700" />
        <CardContent className="relative pt-0 pb-5 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg shrink-0">
                {agent.imageUrl && (
                  <AvatarImage src={agent.imageUrl} alt={fullName} />
                )}
                <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                  {initials(agent.firstName, agent.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold text-white dark:text-white">
                    {fullName}
                  </h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    agent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {agent.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{agent.designation} · {agent.department.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{agent.employeeId} · {agent.NIN}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              <Link
                href={`${PATH}/edit/${id}`}
                className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                Düzenle
              </Link>
              <ToggleActiveButton action={toggleAction} isActive={agent.isActive} />
              <Link
                href={PATH}
                className="h-9 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
              >
                ← Geri
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Özet Kartlar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Home,      label: "Toplam İlan",   value: String(agent.listings.length) },
          { icon: Star,      label: "Aktif İlan",    value: String(activeListings) },
          { icon: FileText,  label: "Sözleşme",      value: String(agent.contracts.length) },
          { icon: Calendar,  label: "Gezi",          value: String(agent.visits.length) },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-t-2 border-t-blue-500 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md shrink-0">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Kişisel + İş Bilgileri ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" /> Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5 text-sm">
            {[
              { label: "E-posta",          value: agent.email },
              { label: "Telefon",          value: agent.phone },
              { label: "WhatsApp",         value: agent.whatsappNo ?? "—" },
              { label: "Cinsiyet",         value: agent.gender === "MALE" ? "Erkek" : agent.gender === "FEMALE" ? "Kadın" : "Diğer" },
              { label: "Doğum Tarihi",     value: agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString("tr-TR") : "—" },
              { label: "İletişim Yöntemi", value: agent.contactMethod },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-medium text-right truncate max-w-[55%]">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" /> İş Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5 text-sm">
            {[
              { label: "Unvan",           value: agent.designation },
              { label: "Departman",       value: agent.department.name },
              { label: "İşe Başlama",     value: new Date(agent.dateOfJoining).toLocaleDateString("tr-TR") },
              { label: "Lisans No",       value: agent.licenseNo ?? "—" },
              { label: "Eğitim",         value: agent.qualification },
              { label: "Deneyim",         value: agent.experience != null ? `${agent.experience} yıl` : "—" },
              { label: "Komisyon Oranı",  value: agent.commissionRate != null ? `%${agent.commissionRate}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-medium text-right truncate max-w-[55%]">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bio + Skills */}
      {(agent.bio || agent.skills) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agent.bio && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{agent.bio}</p>
              </CardContent>
            </Card>
          )}
          {agent.skills && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" /> Yetenekler
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── İlanlar ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-600" />
            İlanlar
            <span className="ml-auto text-xs font-normal text-gray-400">{agent.listings.length} kayıt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {agent.listings.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">İlan bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {agent.listings.map((l) => (
                <div key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.title}</p>
                    <p className="text-xs text-gray-500">{l.property.city}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {l.listingType === "SALE" ? "Satılık" : l.listingType === "RENT" ? "Kiralık" : "Kısa Dönem"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LISTING_COLOR[l.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {l.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {l.askingPrice.toLocaleString("tr-TR")} {l.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Sözleşmeler ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Sözleşmeler
            <span className="ml-auto text-xs font-normal text-gray-400">{agent.contracts.length} kayıt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {agent.contracts.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Sözleşme bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {agent.contracts.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.property.title}</p>
                    <p className="text-xs text-gray-500">
                      {c.property.city} · {c.client.firstName} {c.client.lastName} · {c.contractNo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACT_COLOR[c.status] ?? "bg-gray-100 text-gray-700"}`}>
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

      {/* ── Son Geziler ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Son Geziler
            <span className="ml-auto text-xs font-normal text-gray-400">{agent.visits.length} kayıt</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {agent.visits.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">Gezi kaydı bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {agent.visits.map((v) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{v.property.title}</p>
                    <p className="text-xs text-gray-500">
                      {v.property.city} · {v.client.firstName} {v.client.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      v.status === "COMPLETED" ? "bg-green-100 text-green-700"
                      : v.status === "CANCELLED" ? "bg-red-100 text-red-700"
                      : v.status === "NO_SHOW" ? "bg-gray-100 text-gray-600"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                      {v.status}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(v.scheduledAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tehlikeli Bölge ── */}
      <Card className="border border-red-200 dark:border-red-900 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-600">Tehlikeli Bölge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Danışmanı silerseniz portal hesabı ve tüm bağlı veriler kalıcı olarak silinir.
          </p>
          <DeleteAgentButton action={deleteAction} name={fullName} />
        </CardContent>
      </Card>
    </div>
  );
}
