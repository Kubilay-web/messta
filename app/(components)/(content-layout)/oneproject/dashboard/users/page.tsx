import { columns } from "./columns";
import DataTable from "../../components/DataTableComponents/DataTable";

import TableHeader from "../../components/dashboard/Tables/TableHeader";
import { getAgencyUsers } from "../../actions/users";
import { validateRequest } from "@/app/auth";

export default async function ReviewPage() {
  const { user } = await validateRequest();
  const role = user?.roleGayrimenkul;

  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return (
      <div className="flex justify-center text-2xl w-full h-full pt-5">
        Yetkisiz erişim — yalnızca yöneticiler.
      </div>
    );
  }

  const actualUsers = (await getAgencyUsers(user?.agencyId)) || [];
  return (
    <div className="p-8">
      <TableHeader
        title="Kullanıcılar"
        linkTitle="Kullanıcı Ekle"
        href={`/oneproject/projects/${user?.id}`}
        data={actualUsers}
        model="user"
      />
      <div className="py-8">
        {actualUsers && actualUsers.length > 0 ? (
          <DataTable data={actualUsers} columns={columns} />
        ) : (
          <p>Kullanıcı bulunamadı</p>
        )}
      </div>
    </div>
  );
}
