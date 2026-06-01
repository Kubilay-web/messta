import React from "react";
import {
  LayoutDashboard, Building2, FileText, CalendarCheck,
  Users, User, BarChart3, MessageSquare, DollarSign,
  Activity, Settings2, Key, Globe, ChevronRight,
  ClipboardList, TrendingUp,
} from "lucide-react";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail,
} from "../../../components/ui/sidebar";
import Logo    from "../../../components/logo";
import UserMenu from "./user-menu";

type Props = { agencySlug: string; agencyName: string };

export default function AppSidebar({ agencySlug, agencyName }: Props) {
  const base = "/estate/dashboard";

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon:  LayoutDashboard,
      isActive: true,
      items: [
        { title: "Genel Bakış",       url: `${base}` },
        { title: "Analitik",          url: `${base}/academics/analytics` },
        { title: "Aktivite Logları",  url: `${base}/logs` },
      ],
    },
    {
      title: "Mülk Yönetimi",
      icon:  Building2,
      items: [
        { title: "Mülkler",          url: `${base}/academics/properties` },
        { title: "İlanlar",          url: `${base}/academics/listings` },
        { title: "Sözleşmeler",      url: `${base}/academics/contracts` },
        { title: "Mülk Gezileri",    url: `${base}/academics/visits` },
      ],
    },
    {
      title: "Ödeme Planları",
      icon:  ClipboardList,
      items: [
        { title: "Tüm Ödemeler",     url: `${base}/academics/payments` },
      ],
    },
    {
      title: "Danışmanlar",
      icon:  User,
      items: [
        { title: "Tüm Danışmanlar",  url: `${base}/agents` },
        { title: "Yeni Danışman",    url: `${base}/agents/new` },
        { title: "Departmanlar",     url: `${base}/users/departments` },
      ],
    },
    {
      title: "Müşteriler",
      icon:  Users,
      items: [
        { title: "Tüm Müşteriler",   url: `${base}/users/clients` },
        { title: "Yeni Müşteri",     url: `${base}/users/clients/new` },
      ],
    },
    {
      title: "Devam Takibi",
      icon:  CalendarCheck,
      items: [
        { title: "Genel Bakış",         url: `${base}/attendance` },
        { title: "Departmana Göre",     url: `${base}/attendance/by-department` },
        { title: "Danışman Görüntüsü",  url: `${base}/attendance/agent` },
      ],
    },
    {
      title: "İletişim",
      icon:  MessageSquare,
      items: [
        { title: "Hatırlatıcılar",       url: `${base}/communication/reminders` },
        { title: "Web Sitesi Mesajları", url: `${base}/communication/website-messages` },
      ],
    },
    {
      title: "Finans",
      icon:  DollarSign,
      items: [
        { title: "Komisyonlar",   url: `${base}/finance/commissions` },
        { title: "Gelir Takibi",  url: `${base}/finance/revenue` },
      ],
    },
    {
      title: "Kullanıcılar",
      icon:  Settings2,
      items: [
        { title: "Ajans Kullanıcıları", url: `${base}/users` },
        { title: "Rol Ata",             url: `${base}/users/new` },
      ],
    },
    {
      title: "Admin",
      icon:  Key,
      items: [
        { title: "Talepler / İletişim", url: `${base}/admin/contacts` },
      ],
    },
    {
      title: "Web Sitesi",
      icon:  Globe,
      items: [
        { title: "Canlı Site",     url: `/estate/${agencySlug}` },
        { title: "Özelleştir",     url: `/estate/${agencySlug}/customize` },
      ],
    },
  ];

  return (
    <Sidebar className="!bg-gray-200 !text-black [&_*]:!text-black" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo href="/estate/dashboard" />
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
