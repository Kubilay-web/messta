import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import { getAgencyAnalytics } from "../../actions/analytics";
import AgencyDashboardDetails from "../../components/dashboard/agency-dashboard-details";
import { WelcomeBanner } from "../../components/dashboard/welcome-message";
import prisma from "@/app/lib/db";

export default async function Dashboard() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/management/school-onboarding");

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    select: { name: true, slug: true },
  });

  if (!agency) redirect("/management/school-onboarding");

  const analytics = await getAgencyAnalytics(user.agencyId);

  return (
    <div className="flex-1 space-y-4 p-8">
      <WelcomeBanner
        userName={user.username ?? user.name ?? ""}
        userRole={user.roleGayrimenkul ?? ""}
        userSchool={agency.name}
      />
      <AgencyDashboardDetails analytics={analytics} agencySlug={agency.slug} />
    </div>
  );
}
