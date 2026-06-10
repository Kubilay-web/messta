import React from "react";
import { columns } from "./columns";
import DataTable from "../../components/DataTableComponents/DataTable";
import TableHeader from "../../components/dashboard/Tables/TableHeader";
import { getAgencyLeads } from "../../actions/leads";
import { getCrmAccess } from "../../lib/crm-access";

export default async function page() {
  const { agencyId, canView } = await getCrmAccess();

  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim — CRM modülüne erişiminiz yok.
      </div>
    );
  }

  const leads = (await getAgencyLeads(agencyId)) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TableHeader
        title="Lead / Talepler"
        linkTitle="Lead Ekle"
        href="/oneproject/dashboard/leads/new"
        data={leads}
        model="lead"
        showImport={false}
      />
      <div className="pb-8 pt-4">
        <DataTable data={leads} columns={columns} />
      </div>
    </div>
  );
}
