import React from "react";
import { columns } from "./columns";
import DataTable from "../../components/DataTableComponents/DataTable";
import TableHeader from "../../components/dashboard/Tables/TableHeader";
import { getAllCategories } from "../../actions/categories";
import { validateRequest } from "@/app/auth";

export default async function page() {
  const { user } = await validateRequest();
  const categories = (await getAllCategories(user?.agencyId)) || [];

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-4 gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Acentenizin ilan ve mülklerini mülk tipi (Daire, Villa, Arsa…) ve
          ilan tipine (Satılık / Kiralık) göre gruplayan kategoriler. Her
          kategori bağlı ERP mülk ve ilan sayısını canlı gösterir.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TableHeader
          title="Mülk Kategorileri"
          linkTitle="Kategori Ekle"
          href="/oneproject/dashboard/categories/new"
          data={categories}
          model="category"
          agencyId={user?.agencyId ?? ""}
        />
      </div>

      {/* Table Section */}
      <div className="flex w-full">
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <DataTable data={categories} columns={columns} />
          </div>
        </div>
      </div>

    </div>
  );
}