import React from "react";
import { redirect } from "next/navigation";
import LeadForm from "../../../../components/Forms/LeadForm";
import { getCrmAccess } from "../../../../lib/crm-access";
import { getLeadById } from "../../../../actions/leads";
import {
  getAgencyAgentOptions,
  getAgencyListingOptions,
} from "../../../../actions/projects";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user, agencyId, canManage } = await getCrmAccess();
  if (!canManage) redirect("/oneproject/dashboard/leads");

  const [lead, agents, listings] = await Promise.all([
    getLeadById(id),
    getAgencyAgentOptions(agencyId),
    getAgencyListingOptions(agencyId),
  ]);

  return (
    <div className="p-4">
      <LeadForm
        editingId={id}
        initialData={lead}
        userId={user?.id ?? ""}
        agencyId={agencyId || (lead as any)?.agencyId || ""}
        agents={agents}
        listings={listings}
      />
    </div>
  );
}
