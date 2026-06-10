

import { validateRequest } from "@/app/auth";
import { getCategoryById } from "../../../../actions/categories";
import CategoryForm from "../../../../components/Forms/CategoryForm";
import React from "react";

export default async function page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { user } = await validateRequest();
  const category = await getCategoryById(id);
  return (
    <div className="p-8">
      <CategoryForm
        initialData={category}
        editingId={id}
        agencyId={user?.agencyId ?? (category as any)?.agencyId ?? ""}
      />
    </div>
  );
}
