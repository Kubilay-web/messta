

// import React from "react";

// import GuestProjects from "../../components/dashboard/GuestProjects";
// import { getUserMembers,getUserGuestProjects } from "../../actions/projects";
// import { validateRequest } from "@/app/auth";

// export default async function page() {
//   const {user} = await validateRequest();
//   const projects = (await getUserMembers(user?.id)) || [];
//   return (
//     <>
//       {projects.length > 0 ? (
//         <div className=" max-w-3xl p-8">
//           <GuestProjects isOwner={true} projects={projects} />
//         </div>
//       ) : (
//         <div className="min-h-screen flex items-center justify-center text-xl">
//           <h2>You don't Have any Members</h2>
//         </div>
//       )}
//     </>
//   );
// }




import React from "react";

import GuestProjects from "../../components/dashboard/GuestProjects";
import { getAgencyGuestProjects } from "../../actions/projects";
import { validateRequest } from "@/app/auth";

export default async function page() {
  const { user } = await validateRequest();
  const projects = (await getAgencyGuestProjects(user?.agencyId)) || [];

  return (
    <>
      {projects.length > 0 ? (
        <div className="max-w-3xl p-8">
          <GuestProjects isOwner={true} projects={projects} />
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-lg font-medium">
            Henüz hiç danışmanınız yok
          </h2>
        </div>
      )}
    </>
  );
}