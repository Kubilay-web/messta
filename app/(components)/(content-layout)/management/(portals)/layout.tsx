import { validateRequest } from "@/app/auth";
import { getServerUser } from "../actions/auth";
import AppSidebar from "../components/dashboard/sidebar/app-sidebar";
import SidebarHeader from "../components/dashboard/sidebar/sidebar-header";
import PortalHeader from "../components/portal/PortalHeader";
import PortalSidebar from "../components/portal/PortalSidebar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { UserRole } from "../types/types";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const user = await getServerUser();


  
  const {user} = await validateRequest();

  // if (!user) {
  //   redirect("/login");
  // }




  return (
    <div className="flex w-full">
       <PortalSidebar userRole={user?.roleschool as UserRole} /> 
      <div className="flex flex-col">
        <PortalHeader user={user} />
        <div className="flex min-h-screen w-full flex-col">{children}</div>
      </div>
    </div>
  );
}
