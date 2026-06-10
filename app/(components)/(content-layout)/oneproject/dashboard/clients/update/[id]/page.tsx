import { validateRequest } from "@/app/auth";
import { getPropertyClientById } from "../../../../actions/clients";
import ClientForm from "../../../../components/Forms/ClientForm";
import React from "react";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();
  const client = await getPropertyClientById(id);

  return (
    <div className="p-8">
      <ClientForm
        agencyId={user?.agencyId ?? client?.agencyId ?? ""}
        agencyName={user?.agencyName ?? client?.agencyName ?? ""}
        initialData={client}
        editingId={id}
      />
    </div>
  );
}
