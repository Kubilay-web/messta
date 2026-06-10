import React from "react";
import { redirect } from "next/navigation";
import LeadForm from "../../../components/Forms/LeadForm";
import { getCrmAccess } from "../../../lib/crm-access";
import {
  getAgencyAgentOptions,
  getAgencyListingOptions,
} from "../../../actions/projects";

export default async function page() {
  const { user, agencyId, canManage } = await getCrmAccess();
  if (!canManage) redirect("/oneproject/dashboard/leads");

  const [agents, listings] = await Promise.all([
    getAgencyAgentOptions(agencyId),
    getAgencyListingOptions(agencyId),
  ]);

  return (
    <div className="p-4">
      <LeadForm
        userId={user?.id ?? ""}
        agencyId={agencyId}
        agents={agents}
        listings={listings}
      />
    </div>
  );
}
