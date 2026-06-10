// import { validateRequest } from "@/app/auth";
// import { getPortfolioByUserId } from "../../actions/portfolio";
// import { getUserProjectsCount } from "../../actions/projects";
// import ShareLink from "../../components/dashboard/ShareLink";
// import PortfolioForm from "../../components/Forms/PortfolioForm";
// import { Button } from "../../components/ui/button";
// import { generateSlug } from "../../lib/generateSlug";
// import { Copy, Eye } from "lucide-react";

// import Link from "next/link";
// import React from "react";


// export default async function page() {
//   const { user } = await validateRequest();
//   const slug = generateSlug(user?.username ?? "slug");
//   const count = (await getUserProjectsCount(user?.id)) ?? 0;
//   const initialData = await getPortfolioByUserId(user?.id ?? "");
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//   const link = `${baseUrl}/oneproject/portfolio/${slug}?id=${user?.id}`;

//   const safeUser = user
//     ? {
//         id: user.id,
//         email: user.email,
//         name: user.username,
//         username: user.username,
//       }
//     : null;
//   return (
//     <div className="p-8">
//       <div className="flex border-b items-center justify-between pb-3">
//         <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
//           Customize Your Portfolio
//         </h2>
//         <div className="flex gap-4">
//           <Button asChild>
//             <Link
//               target="_blank"
//               href={`/oneproject/portfolio/${slug}?id=${user?.id}`}
//             >
//               <Eye className="mr-2 w-4 h-4" />
//               Preview
//             </Link>
//           </Button>
//           <ShareLink link={link} />
//         </div>
//       </div>
//       <div className="py-6">
//         <PortfolioForm
//           editingId={initialData?.id}
//           initialData={initialData}
//           user={safeUser}
//           count={count}
//         />
//       </div>
//     </div>
//   );
// }












import { validateRequest } from "@/app/auth";
import {
  getPortfolioByUserId,
  getAgentPortfolioInfo,
} from "../../actions/portfolio";
import { getUserProjectsCount } from "../../actions/projects";
import ShareLink from "../../components/dashboard/ShareLink";
import PortfolioForm from "../../components/Forms/PortfolioForm";
import { Button } from "../../components/ui/button";
import { generateSlug } from "../../lib/generateSlug";
import { Copy, Eye } from "lucide-react";

import Link from "next/link";
import React from "react";

export default async function page() {
  const { user } = await validateRequest();
  const slug = generateSlug(user?.username ?? "slug");
  const initialData = await getPortfolioByUserId(user?.id ?? "");
  // ERP Agent profilinden ön-doldurma + gerçek ilan sayısı
  const agentInfo = await getAgentPortfolioInfo(user?.id);
  const count =
    agentInfo?.listingCount ?? (await getUserProjectsCount(user?.id)) ?? 0;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const link = `${baseUrl}/oneproject/portfolio/${slug}?id=${user?.id}`;

  const safeUser = user
    ? {
        id: user.id,
        email: user.email,
        name: user.username,
        username: user.username,
      }
    : null;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Portföyünüzü Özelleştirin
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link
              target="_blank"
              href={`/oneproject/portfolio/${slug}?id=${user?.id}`}
            >
              <Eye className="mr-2 w-4 h-4" />
              Önizleme
            </Link>
          </Button>

          <div className="w-full sm:w-auto">
            <ShareLink link={link} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="py-4 sm:py-6">
        <PortfolioForm
          editingId={initialData?.id}
          initialData={initialData}
          user={safeUser}
          count={count}
          agencyId={user?.agencyId ?? ""}
          agentDefaults={agentInfo}
        />
      </div>
    </div>
  );
}