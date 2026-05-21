import React from "react";
import {
  BarChart2, Bell, Building2, ChevronRight, ClipboardList,
  FileText, Globe, Key, LayoutDashboard, ScrollText,
  UserCog, Users, Wallet, CalendarCheck, Activity,
} from "lucide-react";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "../../ui/collapsible";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail,
} from "../../ui/sidebar";
import Logo from "../../logo";
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
  const base = "/realestate/dashboard";

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Genel Bakış",       url: base },
        { title: "Aktivite Logları",  url: `${base}/logs` },
      ],
    },
    {
      title: "Danışmanlar",
      icon: UserCog,
      items: [
        { title: "Tüm Danışmanlar",   url: `${base}/users/agents` },
        { title: "Yeni Danışman",     url: `${base}/users/new` },
        { title: "Devamsızlık",       url: `${base}/attendance` },
        { title: "Bireysel Devam",    url: `${base}/attendance/client` },
      ],
    },
    {
      title: "Müşteriler",
      icon: Users,
      items: [
        { title: "Tüm Müşteriler",    url: `${base}/propertyclient` },
        { title: "Yeni Müşteri",      url: `${base}/propertyclient/new` },
      ],
    },
    {
      title: "Mülkler & İlanlar",
      icon: Building2,
      items: [
        { title: "Mülk Listesi",      url: `${base}/estates/properties` },
        { title: "İlanlar",           url: `${base}/estates/listings` },
        { title: "Departmanlar",      url: `${base}/estates/departments` },
        { title: "Ziyaretler",        url: `${base}/estates/visits` },
      ],
    },
    {
      title: "Sözleşmeler",
      icon: FileText,
      items: [
        { title: "Sözleşmeler",       url: `${base}/estates/payments` },
        { title: "Dönemler",          url: `${base}/estates/terms` },
      ],
    },
    {
      title: "Finans",
      icon: Wallet,
      items: [
        { title: "Ödeme Planı",       url: `${base}/finance/fees` },
        { title: "Tahsilat",          url: `${base}/finance/payments` },
      ],
    },
    {
      title: "İletişim",
      icon: Bell,
      items: [
        { title: "Hatırlatıcılar",    url: `${base}/communication/reminders` },
        { title: "Web Mesajları",     url: `${base}/communication/website-messages` },
      ],
    },
    {
      title: "Kullanıcılar",
      icon: Users,
      items: [
        { title: "Tüm Kullanıcılar",  url: `${base}/users` },
        { title: "Yeni Kullanıcı",    url: `${base}/users/new` },
      ],
    },
    {
      title: "Yönetici",
      icon: Key,
      items: [
        { title: "Kişiler",           url: `${base}/admin/contacts` },
      ],
    },
    {
      title: "Web Sitesi",
      icon: Globe,
      items: [
        { title: "Canlı Site",        url: `/agency/${slug}` },
        { title: "Site Yönetimi",     url: `/agency/${slug}/customize` },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo href={base} />
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
