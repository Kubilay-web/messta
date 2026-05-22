import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import { getAgencyAnalytics } from "../../actions/analytics";
import AgencyDashboardDetails from "../../components/dashboard/agency-dashboard-details";
import prisma from "@/app/lib/db";
import Link from "next/link";
import { Building2, Users, ScrollText, UserCog } from "lucide-react";

const BASE = "/realestate/dashboard";

const PROPERTY_TYPE_TR: Record<string, string> = {
  APARTMENT: "Daire", HOUSE: "Müstakil Ev", VILLA: "Villa",
  OFFICE: "Ofis", SHOP: "Dükkan", LAND: "Arsa",
  WAREHOUSE: "Depo", BUILDING: "Bina",
};
const LISTING_TYPE_TR: Record<string, string> = {
  SALE: "Satılık", RENT: "Kiralık", SHORT_RENT: "Kısa Kiralık",
};

async function searchAgency(agencyId: string, q: string) {
  const like = { contains: q, mode: "insensitive" as const };
  const [properties, clients, agents, listings] = await Promise.all([
    prisma.propertyRealEstate.findMany({
      where: { agencyId, OR: [{ title: like }, { city: like }, { address: like }, { district: like }] },
      select: { id: true, title: true, city: true, district: true, propertyType: true },
      take: 5,
    }),
    prisma.propertyClient.findMany({
      where: { agencyId, OR: [{ firstName: like }, { lastName: like }, { email: like }, { phone: like }] },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      take: 5,
    }),
    prisma.agent.findMany({
      where: { agencyId, OR: [{ firstName: like }, { lastName: like }, { email: like }] },
      select: { id: true, firstName: true, lastName: true, email: true, designation: true },
      take: 5,
    }),
    prisma.listing.findMany({
      where: { agencyId, OR: [{ title: like }, { listingNo: like }] },
      select: { id: true, title: true, listingNo: true, listingType: true, askingPrice: true, currency: true },
      take: 5,
    }),
  ]);
  return { properties, clients, agents, listings };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/realestate/onboarding");

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    select: { name: true, slug: true },
  });
  if (!agency) redirect("/realestate/onboarding");

  const { q: rawQ } = await searchParams;
  const q = rawQ?.trim() ?? "";

  if (q) {
    const results = await searchAgency(user.agencyId, q);
    const total = results.properties.length + results.clients.length +
      results.agents.length + results.listings.length;

    return (
      <div className="flex-1 space-y-6 p-4 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold">"{q}" için arama sonuçları</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} sonuç bulundu</p>
          <Link href={BASE} className="text-xs text-blue-600 hover:underline mt-1 inline-block">← Panele dön</Link>
        </div>

        {results.properties.length > 0 && (
          <Section icon={<Building2 className="h-4 w-4" />} title="Mülkler">
            {results.properties.map((p) => (
              <ResultRow
                key={p.id}
                href={`${BASE}/estates/properties`}
                primary={p.title}
                secondary={`${PROPERTY_TYPE_TR[p.propertyType] ?? p.propertyType} · ${p.city}, ${p.district}`}
              />
            ))}
          </Section>
        )}

        {results.clients.length > 0 && (
          <Section icon={<Users className="h-4 w-4" />} title="Müşteriler">
            {results.clients.map((c) => (
              <ResultRow
                key={c.id}
                href={`${BASE}/propertyclient`}
                primary={`${c.firstName} ${c.lastName}`}
                secondary={`${c.email} · ${c.phone}`}
              />
            ))}
          </Section>
        )}

        {results.agents.length > 0 && (
          <Section icon={<UserCog className="h-4 w-4" />} title="Danışmanlar">
            {results.agents.map((a) => (
              <ResultRow
                key={a.id}
                href={`${BASE}/users/agents/view/${a.id}`}
                primary={`${a.firstName} ${a.lastName}`}
                secondary={`${a.designation} · ${a.email}`}
              />
            ))}
          </Section>
        )}

        {results.listings.length > 0 && (
          <Section icon={<ScrollText className="h-4 w-4" />} title="İlanlar">
            {results.listings.map((l) => (
              <ResultRow
                key={l.id}
                href={`${BASE}/estates/listings`}
                primary={l.title}
                secondary={`${LISTING_TYPE_TR[l.listingType] ?? l.listingType} · ${l.askingPrice.toLocaleString("tr-TR")} ${l.currency} · #${l.listingNo}`}
              />
            ))}
          </Section>
        )}

        {total === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">Sonuç bulunamadı.</div>
        )}
      </div>
    );
  }

  const analytics = await getAgencyAnalytics(user.agencyId);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Hoş geldiniz</h1>
        <p className="text-gray-500 text-sm mt-1">
          {agency.name} · {user.username ?? user.email}
        </p>
      </div>
      <AgencyDashboardDetails analytics={analytics} agencySlug={agency.slug} />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/40">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function ResultRow({ href, primary, secondary }: { href: string; primary: string; secondary: string }) {
  return (
    <Link href={href} className="flex flex-col px-4 py-3 hover:bg-muted/50 transition-colors">
      <span className="text-sm font-medium text-foreground">{primary}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{secondary}</span>
    </Link>
  );
}
