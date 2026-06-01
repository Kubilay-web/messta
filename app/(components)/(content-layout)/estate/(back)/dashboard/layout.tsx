import { validateRequest } from "@/app/auth";
import { AgencyUser } from "../../actions/auth";
import { getAgencyActivities } from "../../actions/agency-logs";
import AppSidebar from "../../components/dashboard/sidebar/app-sidebar";
import SidebarHeader from "../../components/dashboard/sidebar/sidebar-header";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const DASHBOARD_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const userRole = (user as any).roleGayrimenkul as string;
  if (!DASHBOARD_ROLES.includes(userRole)) redirect("/estate/portal");

  const agency        = await AgencyUser(user.id);
  const notifications = await getAgencyActivities(agency?.id ?? "");

  return (
    <SidebarProvider>
      {/* <AppSidebar agencySlug={agency?.slug ?? ""} agencyName={agency?.name ?? "EstatePro"} /> */}
      <SidebarInset>
        <SidebarHeader notifications={notifications as any[]} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
