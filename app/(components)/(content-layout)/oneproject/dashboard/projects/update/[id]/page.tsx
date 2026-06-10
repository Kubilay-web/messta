import ProjectForm from "../../../../components/Forms/ProjectForm";
import {
  getProjectById,
  getAgencyListingOptions,
  getAgencyClientOptions,
  getAgencyAgentOptions,
} from "../../../../actions/projects";

import React from "react";
import { validateRequest } from "@/app/auth";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const project = await getProjectById(id);
  const { user } = await validateRequest();
  const userId = user?.id ?? "";
  const agencyId = user?.agencyId ?? project?.agencyId ?? "";

  const [listings, clients, agents] = await Promise.all([
    getAgencyListingOptions(agencyId),
    getAgencyClientOptions(agencyId),
    getAgencyAgentOptions(agencyId),
  ]);

  return (
    <div className="p-8">
      <ProjectForm
        userId={userId}
        agencyId={agencyId}
        listings={listings}
        clients={clients}
        agents={agents}
        initialData={project}
        editingId={id}
      />
    </div>
  );
}
