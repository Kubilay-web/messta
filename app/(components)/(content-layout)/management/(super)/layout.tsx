import { validateRequest } from "@/app/auth";
import { getServerUser } from "../actions/auth";
import { getSchoolNotifications } from "../actions/site";
import Sidebar from "../components/super-admin-dasboard/sidebar";
import TopNav from "../components/super-admin-dasboard/top-nav";

import { redirect } from "next/navigation";
import type { ReactNode } from "react"
// import Sidebar from "./sidebar"
// import TopNav from "./top-nav"

interface LayoutProps {
  children: ReactNode
}

export default async function SuperAdminDashboardLayout({ children }: LayoutProps) {
  
const {user} = await validateRequest();

  // if (!user) {
  //   redirect("/login");
  // }
  // if (user.role !== "SUPER_ADMIN") {
  //   redirect("/login");
  // }


    const notifications = (await getSchoolNotifications(user.schoolId ?? "")) || [];

    
  return (
    <div className="flex h-screen">
      {/* <Sidebar /> */}
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav user={user}/>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">{children}</main>
      </div>
    </div>
  )
}


