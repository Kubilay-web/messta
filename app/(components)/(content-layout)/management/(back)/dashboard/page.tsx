import { WelcomeBanner } from "../../components/dashboard/welcome-message";
import { getServerSchool, getServerUser, SchoolUser } from "../../actions/auth";
import { redirect } from "next/navigation";
import DashboardDetails from "../../components/dashboard/dashboard-details";
import { getAllAnalytics } from "../../actions/analytics";
import { validateRequest } from "@/app/auth";

export default async function Dashboard() {

  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);



  const analytics = await getAllAnalytics(school?.id ?? "");



  // if (!user) {
  //   redirect("/login");
  // }

  console.log(analytics);


  return (
    <div className="flex-1 space-y-4 p-8">
      <WelcomeBanner
        userName={user?.username}
        userRole={user.roleschool}
        userSchool={school?.name ?? ""}
      />
      <DashboardDetails analytics={analytics} schoolslug={school.slug} />
    </div>
  );
}