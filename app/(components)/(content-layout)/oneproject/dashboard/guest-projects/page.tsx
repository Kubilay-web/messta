import { validateRequest } from "@/app/auth";
import { getAgencyGuestProjects } from "../../actions/projects";
import GuestProjects from "../../components/dashboard/GuestProjects";

import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  const projects = (await getAgencyGuestProjects(user?.agencyId)) || [];
  return (
    <>
      {projects.length > 0 ? (
        <div className="max-w-3xl p-8">
          <GuestProjects projects={projects} />
        </div>
      ) : (
        // <div className="min-h-screen flex items-center justify-center text-lg">
        //   <h2>You dont Have any Guest Projects Yet</h2>
        // </div>

        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-lg font-medium">
            Henüz paylaşılan süreciniz yok
          </h2>
        </div>
      )}
    </>
  );
}
