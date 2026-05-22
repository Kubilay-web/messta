import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";
import { WelcomeBanner } from "../../components/dashboard/welcome-message";
import { getAgentPortalData, getClientPortalData } from "../../actions/analytics";
import AgentPortalDashboard from "../../components/portal/AgentPortalDashboard";
import ClientPortalDashboard from "../../components/portal/ClientPortalDashboard";
import prisma from "@/app/lib/db";

export default async function Portal() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const role = user.roleGayrimenkul;

  

  const agencyName = user.agencyName ?? "";
  const displayName = user.username ?? user.name ?? "";

  if (role === "AGENT") {
    const data = await getAgentPortalData(user.id);
    return (
      <div className="px-8 py-4 space-y-6">
        <WelcomeBanner
          userName={displayName}
          userRole="Emlak Danışmanı"
          userSchool={agencyName}
        />
        <AgentPortalDashboard data={data} />
      </div>
    );
  }

  if (role === "CLIENT") {
    const data = await getClientPortalData(user.id);
    const client = await prisma.propertyClient.findUnique({
      where: { userId: user.id },
      select: { firstName: true, lastName: true },
    });
    return (
      <div className="px-8 py-4 space-y-6">
        <WelcomeBanner
          userName={client ? `${client.firstName} ${client.lastName}` : displayName}
          userRole="Müşteri"
          userSchool={agencyName}
        />
        <ClientPortalDashboard data={data} />
      </div>
    );
  }

  if (role === "SECRETARY" || role === "ACCOUNTANT") {
    redirect("/realestate/portal/secretary/clients");
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    redirect("/realestate/dashboard");
  }

  return (
    <div className="px-8 py-8 text-muted-foreground">
      Portala hoş geldiniz.
    </div>
  );
}
