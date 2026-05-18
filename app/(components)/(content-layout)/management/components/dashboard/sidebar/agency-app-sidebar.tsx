import React from "react";
import {
  BarChart2,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  Key,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "../../../components/ui/sidebar";
import Logo from "../../../components/logo";
import UserMenu from "./user-menu";
import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";

export default async function AgencyAppSidebar() {
  const { user } = await validateRequest();
  if (!user) return null;

  const agency = user.agencyId
    ? await prisma.agency.findUnique({
        where: { id: user.agencyId },
        select: { slug: true },
      })
    : null;

  const slug = agency?.slug ?? "";

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Genel Bakış", url: "/management/dashboard" },
        { title: "Aktivite Günlüğü", url: "/management/dashboard/logs" },
      ],
    },
    {
      title: "Danışmanlar",
      icon: UserCog,
      items: [
        { title: "Tüm Danışmanlar", url: "/management/dashboard/users/teachers" },
        { title: "Yeni Danışman", url: "/management/dashboard/users/teachers/new" },
        { title: "Devamsızlık", url: "/management/dashboard/attendance" },
      ],
    },
    {
      title: "Müşteriler",
      icon: Users,
      items: [
        { title: "Tüm Müşteriler", url: "/management/dashboard/users/parents" },
        { title: "Yeni Müşteri", url: "/management/dashboard/users/parents/new" },
      ],
    },
    {
      title: "Mülkler & İlanlar",
      icon: Building2,
      items: [
        { title: "Mülk Listesi", url: "/management/dashboard/academics/classes" },
        { title: "Departmanlar", url: "/management/dashboard/academics/departments" },
      ],
    },
    {
      title: "Sözleşmeler",
      icon: FileText,
      items: [
        { title: "Sözleşmeler", url: "/management/dashboard/finance/payments" },
        { title: "Ödemeler", url: "/management/dashboard/finance/fees" },
      ],
    },
    {
      title: "Randevular",
      icon: ClipboardList,
      items: [
        { title: "Tüm Randevular", url: "/management/dashboard/attendance/by-class" },
      ],
    },
    {
      title: "İletişim",
      icon: Bell,
      items: [
        { title: "Hatırlatıcılar", url: "/management/dashboard/communication/reminders" },
        { title: "Web Mesajları", url: "/management/dashboard/communication/website-messages" },
      ],
    },
    {
      title: "Raporlar",
      icon: BarChart2,
      items: [
        { title: "Analizler", url: "/management/dashboard/academics/reports" },
      ],
    },
    {
      title: "Yönetici",
      icon: Key,
      items: [
        { title: "Kişiler", url: "/management/dashboard/admin/contacts" },
      ],
    },
    {
      title: "Web Sitesi",
      icon: Globe,
      items: [
        { title: "Canlı Site", url: `/agency/${slug}` },
        { title: "Site Yönetimi", url: `/agency/${slug}/customize` },
      ],
    },
  ];

  return (
    <Sidebar className="!bg-gray-200 !text-black [&_*]:!text-black" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo href="/management/dashboard" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarLinks.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={sub.url}>
                              <span>{sub.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
