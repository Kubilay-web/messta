import { validateRequest } from "@/app/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import AgencyAppSidebar from "../../components/dashboard/sidebar/agency-app-sidebar";
import SidebarHeader from "../../components/dashboard/sidebar/sidebar-header";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import React, { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");
  if (!user.agencyId) redirect("/management/school-onboarding");

  const reminders = await prisma.agencyReminder.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, subject: true, message: true, createdAt: true },
  });

  // SidebarHeader expects RecentActivity shape: map reminders to it
  const notifications = reminders.map((r) => ({
    id: r.id,
    title: r.subject,
    description: r.message,
    createdAt: r.createdAt?.toISOString() ?? "",
  }));

  return (
    <div>
      <SidebarProvider>
        {/* <AgencyAppSidebar /> */}
        <SidebarInset>
          <SidebarHeader notifications={notifications as any} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
