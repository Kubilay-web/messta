

// import ProjectPayments from "../../components/dashboard/ProjectPayments";
// import { getDetailedUserProjects,getUserProjects } from "../../actions/projects";

// import React from "react";
// import { validateRequest } from "@/app/auth";

// export default async function page() {
//   const {user} = await validateRequest();
//   const userProjects = (await getDetailedUserProjects(user?.id)) || [];
//   return (
//     <div>
//       {userProjects.length > 0 ? (
//         <ProjectPayments userProjects={userProjects} />
//       ) : (
//         <div className="min-h-screen flex items-center justify-center text-lg">
//           <h2>No Projects Yet</h2>
//         </div>
//       )}
//     </div>
//   );
// }




import ProjectPayments from "../../components/dashboard/ProjectPayments";
import { getAgencyDetailedProjects } from "../../actions/projects";

import React from "react";
import { validateRequest } from "@/app/auth";

export default async function page() {
  const { user } = await validateRequest();
  const userProjects = (await getAgencyDetailedProjects(user?.agencyId)) || [];

  return (
    <div>
      {userProjects.length > 0 ? (
        <ProjectPayments userProjects={userProjects} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-lg font-medium">
            Henüz süreç yok
          </h2>
        </div>
      )}
    </div>
  );
}