import React from "react";
import {
  BarChart2,
  BookOpen,
  Building,
  Bus,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Key,
  LayoutDashboard,
  MessageSquare,
  Settings2,
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
import { getServerSchool, SchoolUser } from "../../../actions/auth";
import { validateRequest } from "@/app/auth";

export default async function AppSidebar() {
  // const school = await getServerSchool();



  const { user } = await validateRequest();

  if (!user) return null;

  const school = await SchoolUser(user.id);


  const sidebarLinks = [
    {
      title: "Dashboard",
      url: "management/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "management/dashboard",
        },
        {
          title: "Logs",
          url: "management/dashboard/logs",
        },
      ],
    },
    {
      title: "Student Management",
      url: "management/students",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "management/dashboard/students",
        },
        {
          title: "Fees",
          url: "management/dashboard/students/fees",
        },
        {
          title: "Student Ids",
          url: "management/dashboard/students/ids",
        },
      ],
    },
    {
      title: "Attendance",
      url: "management/dashboard/attendance",
      icon: Users,
      items: [
        {
          title: "Attendance",
          url: "management/dashboard/attendance",
        },
        {
          title: "View Class Attendances",
          url: "management/dashboard/attendance/by-class",
        },
        {
          title: "View Student Attendances",
          url: "management/dashboard/attendance/student",
        },
      ],
    },
    {
      title: "Users",
      url: "management/dashboard/users",
      icon: Users,
      items: [
        {
          title: "Parents",
          url: "management/dashboard/users/parents",
        },
        {
          title: "Teachers",
          url: "management/dashboard/users/teachers",
        },
        {
          title: "Staff Members",
          url: "management/dashboard/users",
        },
      ],
    },
    {
      title: "Academics",
      url: "management/dashboard/academics",
      icon: GraduationCap,
      items: [
        {
          title: "Terms",
          url: "management/dashboard/academics/terms",
        },
        {
          title: "Classes and streams",
          url: "management/dashboard/academics/classes",
        },
        {
          title: "Subjects",
          url: "management/dashboard/academics/subjects",
        },
        {
          title: "Departments",
          url: "management/dashboard/academics/departments",
        },
        {
          title: "Timetable",
          url: "management/academics/timetable",
        },
        {
          title: "Examinations",
          url: "management/dashboard/academics/exams",
        },
        {
          title: "Assignments",
          url: "management/academics/assignments",
        },
        {
          title: "Report Cards",
          url: "management/dashboard/academics/reports",
        },
      ],
    },
    {
      title: "Staff Management",
      url: "management/staff",
      icon: UserCog,
      items: [
        {
          title: "Staff Directory",
          url: "management/staff/directory",
        },
        {
          title: "Attendance",
          url: "management/staff/attendance",
        },
        {
          title: "Leave Management",
          url: "management/staff/leave",
        },
        {
          title: "Performance",
          url: "management/staff/performance",
        },
      ],
    },
    {
      title: "Communication",
      url: "management/communication",
      icon: MessageSquare,
      items: [
        {
          title: "Reminders",
          url: "management/dashboard/communication/reminders",
        },
        {
          title: "Announcements",
          url: "management/communication/announcements",
        },
        {
          title: "Notice Board",
          url: "management/communication/notices",
        },
        {
          title: "Emergency Alerts",
          url: "management/communication/alerts",
        },
        {
          title: "Website Messages",
          url: "management/dashboard/communication/website-messages",
        },
      ],
    },
    {
      title: "Finance",
      url: "management/finance",
      icon: DollarSign,
      items: [
        {
          title: "Fee Management",
          url: "management/dashboard/finance/fees",
        },
        {
          title: "Payments",
          url: "management/dashboard/finance/payments",
        },
        {
          title: "Scholarships",
          url: "management/finance/scholarships",
        },
        {
          title: "Reports",
          url: "management/finance/reports",
        },
      ],
    },
    {
      title: "Transport",
      url: "management/transport",
      icon: Bus,
      items: [
        {
          title: "Routes",
          url: "management/transport/routes",
        },
        {
          title: "Tracking",
          url: "management/transport/tracking",
        },
        {
          title: "Drivers",
          url: "management/transport/drivers",
        },
        {
          title: "Maintenance",
          url: "management/transport/maintenance",
        },
      ],
    },
    {
      title: "Resources",
      url: "management/resources",
      icon: BookOpen,
      items: [
        {
          title: "Library",
          url: "management/resources/library",
        },
        {
          title: "Inventory",
          url: "management/resources/inventory",
        },
        {
          title: "Facilities",
          url: "management/resources/facilities",
        },
        {
          title: "Assets",
          url: "management/resources/assets",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "management/reports",
      icon: BarChart2,
      items: [
        {
          title: "Academic Reports",
          url: "management/reports/academic",
        },
        {
          title: "Financial Reports",
          url: "management/reports/financial",
        },
        {
          title: "Custom Reports",
          url: "management/reports/custom",
        },
        {
          title: "Analytics Dashboard",
          url: "management/reports/analytics",
        },
      ],
    },
    {
      title: "Settings",
      url: "management/settings",
      icon: Settings2,
      items: [
        {
          title: "School Profile",
          url: "management/settings/profile",
        },
        {
          title: "User Management",
          url: "management/settings/users",
        },
        {
          title: "System Settings",
          url: "management/settings/system",
        },
        {
          title: "Backup & Security",
          url: "management/settings/security",
        },
      ],
    },
    {
      title: "Admin Only",
      url: "management/dashboard/admin",
      icon: Key,
      items: [
        {
          title: "Contacts",
          url: "management/dashboard/admin/contacts",
        },
      ],
    },
    {
      title: "Website",
      url: "management/sch/school-site",
      icon: Building,
      items: [
        {
          title: "Live Website",
          url: `/sch/${school?.slug ?? ""}`,
        },
        {
          title: "Customize Website",
          url: `/sch/${school?.slug ?? ""}/customize`,
        },
      ],
    },
  ];
  return (
    <Sidebar className="!bg-gray-200 !text-black [&_*]:!text-black" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Logo href="management/dashboard" />
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
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
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
