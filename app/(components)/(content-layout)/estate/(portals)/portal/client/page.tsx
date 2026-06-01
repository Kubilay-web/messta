import { validateRequest } from "@/app/auth";
import {
  getClientFromUserId,
  getClientContracts,
  getClientVisits,
} from "../../../actions/client-portal";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ClientDashboard from "./ClientDashboard";

export const metadata: Metadata = { title: "Müşteri Portalı - EstatePro" };

export default async function ClientPortalPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/estate/login");

  const client = await getClientFromUserId(user.id);
  if (!client) redirect("/estate/login");

  const [contracts, visits] = await Promise.all([
    getClientContracts(client.id),
    getClientVisits(client.id),
  ]);

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <ClientDashboard
        client={client   as any}
        contracts={contracts as any[]}
        visits={visits   as any[]}
      />
    </div>
  );
}
