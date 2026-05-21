import { validateRequest } from "@/app/auth";
import PortalHeader from "../components/portal/PortalHeader";
import PortalSidebar from "../components/portal/PortalSidebar";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import { UserRoleGayrimenkul } from "../types/types";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { user } = await validateRequest();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full">
      {/* <PortalSidebar userRole={user.roleGayrimenkul as UserRoleGayrimenkul} /> */}
      <div className="flex flex-col flex-1">
        <PortalHeader user={user as any} />
        <div className="flex min-h-screen w-full flex-col">{children}</div>
      </div>
    </div>
  );
}
