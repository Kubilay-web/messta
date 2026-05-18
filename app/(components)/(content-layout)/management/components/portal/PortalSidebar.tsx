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

import { UserRole, UserRoleGayrimenkul } from "../../types/types";

import { useUserSession } from "../../store/auth";
import Logo from "../logo";



interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  count?: number;
}

type RealEstateRoleLinks = {
  [K in UserRoleGayrimenkul]: NavLink[];
};

const REAL_ESTATE_LINKS: RealEstateRoleLinks = {
  SUPER_ADMIN: [
    { title: "Yönetim Paneli", href: "/management/dashboard", icon: Home },
  ],
  ADMIN: [
    { title: "Yönetim Paneli", href: "/management/dashboard", icon: Home },
  ],
  AGENT: [
    { title: "Genel Bakış", href: "/management/portal", icon: LayoutGrid },
    { title: "İlanlarım", href: "/management/portal/teacher/students", icon: ScrollText },
    { title: "Müşterilerim", href: "/management/portal/teacher/students", icon: Users },
    { title: "Randevular", href: "/management/portal/teacher/attendance", icon: CalendarCheck },
    { title: "Sözleşmeler", href: "/management/portal/teacher/exams", icon: Package2 },
    { title: "Gelen Kutusu", href: "/management/portal/teacher/inbox", icon: MessagesSquare },
    { title: "Raporlar", href: "/management/portal/teacher/reports", icon: Banknote },
  ],
  CLIENT: [
    { title: "Genel Bakış", href: "/management/portal", icon: LayoutGrid },
    { title: "İlgilendiğim İlanlar", href: "/management/portal/parent", icon: ScrollText },
    { title: "Randevularım", href: "/management/portal/parent/payments", icon: CalendarCheck },
    { title: "Sözleşmelerim", href: "/management/portal/parent/payments", icon: Package2 },
    { title: "Mesajlar", href: "/management/portal/parent/messages", icon: Mail },
  ],
  SECRETARY: [
    { title: "Genel Bakış", href: "/management/portal", icon: LayoutGrid },
    { title: "Danışmanlar", href: "/management/portal/secretary/teachers", icon: UsersRound },
    { title: "Müşteriler", href: "/management/portal/secretary/students", icon: Users },
    { title: "İlanlar", href: "/management/portal/secretary/parents", icon: ScrollText },
  ],
  ACCOUNTANT: [
    { title: "Genel Bakış", href: "/management/portal", icon: LayoutGrid },
    { title: "Ödemeler", href: "/management/portal/parent/payments", icon: DollarSign },
  ],
};

export function renderRealEstateLinks(role: UserRoleGayrimenkul): NavLink[] {
  return REAL_ESTATE_LINKS[role] ?? [{ title: "Genel Bakış", href: "/management/portal", icon: Home }];
}

export default function PortalSidebar({ userRole }: { userRole: UserRoleGayrimenkul }) {
  const sidebarLinks = renderRealEstateLinks(userRole);
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
