import { validateRequest } from "@/app/auth";
import {
  getAgencyListingOptions,
  getAgencyClientOptions,
  getAgencyAgentOptions,
} from "../../../actions/projects";
import ProjectForm from "../../../components/Forms/ProjectForm";

import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  const userId = user?.id ?? "";
  const agencyId = user?.agencyId ?? "";

  const [listings, clients, agents] = await Promise.all([
    getAgencyListingOptions(agencyId),
    getAgencyClientOptions(agencyId),
    getAgencyAgentOptions(agencyId),
  ]);

  return (
    <div className="p-4">
      <ProjectForm
        userId={userId}
        agencyId={agencyId}
        listings={listings}
        clients={clients}
        agents={agents}
      />
    </div>
  );
}
