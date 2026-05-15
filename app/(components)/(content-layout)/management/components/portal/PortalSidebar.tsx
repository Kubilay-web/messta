"use client";
import React from "react";
import Link from "next/link";
import {
  Banknote,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  Check,
  CircleEllipsis,
  CircleUser,
  Clock,
  DollarSign,
  ExternalLink,
  Eye,
  GraduationCap,
  History,
  Home,
  LayoutGrid,
  LineChart,
  LucideIcon,
  Mail,
  Menu,
  MessagesSquare,
  Package,
  Package2,
  Pencil,
  ScrollText,
  ShoppingCart,
  SquareLibrary,
  User,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { usePathname, useRouter } from "next/navigation";


import { cn } from "../../lib/utils";


import { UserRole } from "../../types/types";


import { useUserSession } from "../../store/auth";
import Logo from "../logo";



// Interface for individual link items
interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  count?: number;
}
// Type for available roles

// Type for the links object structure
type RoleLinks = {
  [K in UserRole]: NavLink[];
};

export function renderLoggedInUserLinks(role: UserRole): NavLink[] {
  const commonLinks = [
    {
      title: "Dashboard",
      href: "/management/portal",
      icon: Home,
    },
  ];
  const links: RoleLinks = {
    SUPER_ADMIN: [
      {
        title: "Dashboard",
        href: "/management/dashboard",
        icon: Home,
      },
    ],
    ADMIN: [
      {
        title: "Orders",
        href: "/management/dashboard/orders",
        icon: ShoppingCart,
        count: 6,
      },
      {
        title: "Products",
        href: "/management/dashboard/products",
        icon: Package,
      },
      {
        title: "Customers",
        href: "/management/dashboard/customers",
        icon: Users,
      },
      {
        title: "Categories",
        href: "/management/dashboard/categories",
        icon: LayoutGrid,
      },
      {
        title: "Analytics",
        href: "/management/dashboard/analytics",
        icon: LineChart,
      },
    ],
    TEACHER: [
      {
        title: "Students",
        href: "/management/portal/teacher/students",
        icon: GraduationCap,
      },
      {
        title: "Mark Attendance",
        href: "/management/portal/teacher/attendance",
        icon: Pencil,
      },
      {
        title: "View Class Attendance",
        href: "/management/portal/teacher/attendance/by-class",
        icon: BookOpen,
      },
      {
        title: "View Student Attendance",
        href: "/management/portal/teacher/attendance/student",
        icon: Eye,
      },
      {
        title: "Exams",
        href: "/management/portal/teacher/exams",
        icon: SquareLibrary,
      },
      {
        title: "Inbox ",
        href: "/management/portal/teacher/inbox",
        icon: MessagesSquare,
      },

      {
        title: "Reports",
        href: "/management/portal/teacher/reports",
        icon: Banknote,
      },
    ],
    PARENT: [
      {
        title: "My Children",
        href: "/management/portal/parent",
        icon: Users,
      },
      {
        title: "Messages",
        href: "/management/portal/parent/messages",
        icon: Mail,
      },
      {
        title: "Payments",
        href: "/management/portal/parent/payments",
        icon: DollarSign,
      },
    ],
    SECRETARY: [
      {
        title: "Students",
        href: "/management/portal/secretary/students",
        icon: Users,
      },
      {
        title: "Teachers",
        href: "/management/portal/secretary/teachers",
        icon: UsersRound,
      },
      {
        title: "Parents",
        href: "/management/portal/secretary/parents",
        icon: UserPlus,
      },
    ],
    LIBRARIAN: [
      {
        title: "Users",
        href: "/management/dashboard/orders",
        icon: ShoppingCart,
        count: 6,
      },
    ],
    STUDENT: [
      {
        title: "My Profile",
        href: "/management/portal/student/profile",
        icon: User,
      },
      {
        title: "Timetable",
        href: "/management/portal/student",
        icon: Calendar,
      },
    ],
  };
  return [...commonLinks, ...links[role]];
}
export default function PortalSidebar({ userRole }: { userRole: UserRole }) {
  const sidebarLinks = renderLoggedInUserLinks(userRole);
  const { clearSession } = useUserSession();
  const router = useRouter();
  async function handleLogout() {
    await clearSession();
    router.push("/login");
  }
  const pathname = usePathname();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b  lg:h-[60px] ">
          <Logo />
          <Button
            variant="outline"
            size="icon"
            className="ml-auto h-8 w-8 mr-6"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {sidebarLinks.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && " bg-muted  text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                  {item.count && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
            {/* <Link
              href="/"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              )}
            >
              <ExternalLink className="h-4 w-4" />
              Live Website
            </Link> */}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button onClick={handleLogout} size="sm" className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
