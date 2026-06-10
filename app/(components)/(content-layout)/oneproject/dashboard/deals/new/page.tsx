import React from "react";
import { redirect } from "next/navigation";
import DealForm from "../../../components/Forms/DealForm";
import { getCrmAccess } from "../../../lib/crm-access";
import { ensureDefaultPipeline } from "../../../actions/deals";
import {
  getAgencyAgentOptions,
  getAgencyClientOptions,
  getAgencyListingOptions,
} from "../../../actions/projects";

export default async function page() {
  const { user, agencyId, canManage } = await getCrmAccess();
  if (!canManage) redirect("/oneproject/dashboard/deals");

  const [pipeline, agents, clients, listings] = await Promise.all([
    ensureDefaultPipeline(agencyId),
    getAgencyAgentOptions(agencyId),
    getAgencyClientOptions(agencyId),
    getAgencyListingOptions(agencyId),
  ]);

  const stages = pipeline.stages.map((s) => ({ label: s.name, value: s.id }));

  return (
    <div className="p-4">
      <DealForm
        userId={user?.id ?? ""}
        agencyId={agencyId}
        pipelineId={pipeline.id}
        stages={stages}
        agents={agents}
        clients={clients}
        listings={listings}
      />
    </div>
  );
}
