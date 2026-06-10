import { getUserById } from "../../actions/users";
import BrandForm from "../../components/Forms/BrandForm";
import ChangePasswordForm from "../../components/Forms/ChangePasswordForm";

import { validateRequest } from "@/app/auth";

export default async function Brand() {
  const {user} = await validateRequest();
  const userDetails = await getUserById(user?.id ?? "");
  return (
    <div className="p-8">
      <ChangePasswordForm initialData={userDetails} editingId={user?.id} />
    </div>
  );
}
