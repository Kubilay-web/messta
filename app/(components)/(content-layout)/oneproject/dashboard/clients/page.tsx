import React from "react";
import { columns } from "./columns";

import DataTable from "../../components/DataTableComponents/DataTable";
import TableHeader from "../../components/dashboard/Tables/TableHeader";
import { getAgencyClients } from "../../actions/clients";
import { validateRequest } from "@/app/auth";

export default async function page() {
  const { user } = await validateRequest();
  const clients = (await getAgencyClients(user?.agencyId)) || [];

  return (
    <div className="p-3">
      <div className="w-full max-w-full px-5 sm:px-4 md:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="w-full mb-4 sm:mb-6">
          <TableHeader
            title="Müşteriler"
            linkTitle="Müşteri Ekle"
            href="/oneproject/dashboard/clients/new"
            data={clients}
            model="client"
          />
        </div>

        {/* Table wrapper */}
        <div className="w-full">
          <div className="relative w-full overflow-x-auto sm:overflow-x-auto lg:overflow-visible">
            <div className="min-w-[640px] sm:min-w-full lg:min-w-0">
              <DataTable data={clients} columns={columns} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
