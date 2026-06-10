import { validateRequest } from "@/app/auth";
import { getAgencyFolders } from "../../actions/fileManager";
import FileManager from "../../components/dashboard/FileManger";

import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  const userId = user?.id ?? "";
  const agencyId = user?.agencyId ?? "";
  const userFolders = (await getAgencyFolders(agencyId)) || [];
  return (
    <div>
      <FileManager
        userFolders={userFolders}
        userId={userId}
        agencyId={agencyId}
      />
    </div>
  );
}
