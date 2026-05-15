import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { redirect } from "next/navigation";
import PropertyListing from "../../../../components/dashboard/class-listing";

// GET — server-side data fetch (direct DB)
export default async function PropertiesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agency: { select: { id: true, name: true } } },
  });

  const agencyId = dbUser?.agency?.id;
  if (!agencyId) redirect("/management/school-onboarding");

  const [properties, agents] = await Promise.all([
    prisma.propertyRealEstate.findMany({
      where: { agencyId },
      include: {
        listings: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, title: true, listingNo: true,
            listingType: true, status: true,
            askingPrice: true, currency: true, agentName: true,
          },
        },
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agent.findMany({
      where: { agencyId },
      select: { id: true, firstName: true, lastName: true, designation: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  return (
    <div className="p-2 sm:p-4 h-[calc(100dvh-2rem)]">
      <PropertyListing
        agencyId={agencyId}
        properties={properties as any}
        agents={agents}
      />
    </div>
  );
}
