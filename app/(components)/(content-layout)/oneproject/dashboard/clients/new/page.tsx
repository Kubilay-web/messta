import { validateRequest } from "@/app/auth";
import ClientForm from "../../../components/Forms/ClientForm";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();

  return (
    <div className="p-8">
      <ClientForm
        agencyId={user?.agencyId ?? ""}
        agencyName={user?.agencyName ?? ""}
      />
    </div>
  );
}
