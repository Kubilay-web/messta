import { validateRequest } from "@/app/auth";
import CategoryForm from "../../../components/Forms/CategoryForm";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  return (
    <div className="p-8">
      <CategoryForm agencyId={user?.agencyId ?? ""} />
    </div>
  );
}
