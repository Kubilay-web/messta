// import { validateRequest } from "@/app/auth";
// import Navbar from "../components/dashboard/Navbar";
// import Sidebar from "../components/dashboard/Sidebar";
// import DismissableBanner from "../components/frontend/DismissableBanner";
// import { notFound, redirect } from "next/navigation";
// import React, { ReactNode } from "react";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const { user } = await validateRequest();

//   if (!user) {
//     redirect("/");
//   }
//   const role = user.roleproject;
//   // if (role !== "USER") {
//   //   return notFound();
//   // }

//   const safeUser = {
//     id: user?.id,
//     roleproject: user?.roleproject,
//     email: user?.email,
//     username: user?.username,
//     avatarUrl:user?.avatarUrl
//   };
//   return (
//     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
//       <Sidebar user={safeUser} />
//       <div className="flex flex-col">
//         <Navbar user={safeUser} />
//         {/* <DismissableBanner
//           message="Please update your local Currency => Under finance > Change Currency"
//           variant="warning"
//         /> */}
//         <DismissableBanner
//           message="Please update your local currency if you haven't already"
//           variant="warning"
//           link={{
//             text: "Update Now",
//             href: "/oneproject/dashboard/currency",
//           }}
//         />
//         {children}
//       </div>

//       {/* 1.32.16 1.video */}
//     </div>
//   );
// }





import { validateRequest } from "@/app/auth";
import DismissableBanner from "../components/frontend/DismissableBanner";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full flex-col">
      {/* Sidebar/Navbar üst (paylaşılan) ERP layout'undan gelir. */}

      {/* Main content */}
      <div className="flex flex-col">
        <DismissableBanner
          message="Henüz yapmadıysanız lütfen para biriminizi güncelleyin"
          variant="warning"
          link={{
            text: "Şimdi Güncelle",
            href: "/oneproject/dashboard/currency",
          }}
        />

        {children}
      </div>
    </div>
  );
}
