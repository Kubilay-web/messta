import { validateRequest } from "@/app/auth";
import { getAgencyClients } from "../../actions/clients";
import { getAgencySubscribers } from "../../actions/subscribe";
import EmailCompose from "../../components/dashboard/EmailCompose";

import React from "react";


export default async function page() {
  const {user} = await validateRequest();
  // clients and Subs
  const clients = (await getAgencyClients(user?.agencyId)) || [];
  const subscribers = (await getAgencySubscribers(user?.agencyId)) || [];
  return (
    <div>
      <EmailCompose clients={clients} subscribers={subscribers} />
    </div>
  );
}
