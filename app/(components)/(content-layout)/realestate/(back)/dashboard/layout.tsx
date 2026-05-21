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
  if (!user.agencyId) redirect("/realestate/onboarding");

  const [reminders, activities] = await Promise.all([
    prisma.agencyReminder.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, subject: true, message: true, createdAt: true },
    }),
    prisma.agencyActivity.findMany({
      where: { agencyId: user.agencyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, activity: true, description: true, createdAt: true },
    }),
  ]);

  const notifications = [
    ...activities.map((a) => ({
      id: a.id,
      title: a.activity,
      description: a.description,
      createdAt: a.createdAt?.toISOString() ?? "",
    })),
    ...reminders.map((r) => ({
      id: r.id,
      title: r.subject,
      description: r.message,
      createdAt: r.createdAt?.toISOString() ?? "",
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return (
    <SidebarProvider>
      {/* <AgencyAppSidebar />  */}
      <SidebarInset>
        <SidebarHeader notifications={notifications as any} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
