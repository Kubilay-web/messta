"use client";
import React from "react";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import {
  Bell,
  CircleUser,
  Combine,
  DollarSign,
  ExternalLink,
  Handshake,
  Home,
  LayoutGrid,
  LineChart,
  Lock,
  Mail,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  User2,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import Logo from "../global/Logo";

type SafeUser = {
  id: string;
  roleproject: "ADMIN" | "USER" | "CLIENT" | "MEMBER";
  email: string | null;
  username: string | null;
};

export default function Sidebar({ user }: { user: SafeUser | null }) {
  const role = user?.roleproject;

  const sidebarLinks = [
    {
      title: "Panel",
      links: [
        {
          title: "Genel Bakış",
          href: "/oneproject/dashboard",
          icon: Home,
        },
      ],
    },
    {
      title: "Müşteriler & Süreçler",
      links: [
        {
          title: "Müşteriler",
          href: "/oneproject/dashboard/clients",
          icon: Users,
        },
        {
          title: "Süreçler",
          href: "/oneproject/dashboard/projects",
          icon: LayoutGrid,
        },
        {
          title: "Paylaşılan Süreçler",
          href: "/oneproject/dashboard/guest-projects",
          icon: Combine,
        },
      ],
    },
    {
      title: "Finans",
      links: [
        {
          title: "Tahsilatlar",
          href: "/oneproject/dashboard/payments",
          icon: Handshake,
        },
        {
          title: "Para Birimi",
          href: "/oneproject/dashboard/currency",
          icon: DollarSign,
          badge: {
            title: "Yeni",
            variant: "info",
          },
        },
      ],
    },
    {
      title: "Ekip",
      links: [
        {
          title: "Danışmanlar",
          href: "/oneproject/dashboard/members",
          icon: User2,
        },
      ],
    },
    {
      title: "İletişim",
      links: [
        {
          title: "E-postalar",
          href: "/oneproject/dashboard/emails",
          icon: User2,
        },
        {
          title: "Talep Aboneleri",
          href: "/oneproject/dashboard/subscribers",
          icon: Mail,
        },
      ],
    },
    {
      title: "Portföy",
      links: [
        {
          title: "Portföy Oluştur",
          href: "/oneproject/dashboard/portfolio",
          icon: User2,
        },
      ],
    },
    {
      title: "Acente",
      links: [
        {
          title: "Marka Ayarları",
          href: "/oneproject/dashboard/brand-settings",
          icon: User2,
        },
        {
          title: "Dosya Yöneticisi",
          href: "/oneproject/dashboard/file-manager",
          icon: Lock,
        },
      ],
    },
    {
      title: "Ayarlar",
      links: [
        {
          title: "Şifre Değiştir",
          href: "/oneproject/dashboard/change-password",
          icon: Lock,
        },
      ],
    },
  ];

  const pathname = usePathname();

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Mobile Header (lg: altında görünür) */}
      <div className="lg:hidden w-full border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Logo href="/oneproject/dashboard" title="Emlak Pro" />
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (lg: ve üzeri görünür) */}
      <div className="hidden lg:flex lg:flex-col lg:h-screen lg:w-64 xl:w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Logo href="/oneproject/dashboard" title="Emlak Pro" />
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <nav className="p-4 space-y-6">
              {sidebarLinks.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-2">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {section.links.map((link, linkIndex) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={linkIndex}
                          href={link.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">
                            {link.title}
                          </span>
                          {link.badge && (
                            <span
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-full",
                                link.badge.variant === "info"
                                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                                  : "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300",
                              )}
                            >
                              {link.badge.title}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Admin Link */}
              {role === "ADMIN" && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                    Yönetim
                  </h2>
                  <Link
                    href="/oneproject/dashboard/users"
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      pathname === "/oneproject/dashboard/users"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                    )}
                  >
                    <Users className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Kullanıcılar</span>
                  </Link>
                </div>
              )}

              {/* Live Website Link */}
              <Link
                href="/oneproject/home"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ExternalLink className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Canlı Site</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button size="default" className="w-full" variant="outline">
            Logout
          </Button>
        </div> */}
      </div>

      {/* Mobile Navigation (lg: altında görünür) */}
      <div className="lg:hidden">
        <div className="overflow-x-auto">
          <div className="flex space-x-1 p-4 border-b border-gray-200 dark:border-gray-800">
            {sidebarLinks.slice(0, 4).map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="flex flex-col items-center space-y-1 min-w-[70px]"
              >
                {section.links.slice(0, 1).map((link, linkIndex) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium truncate max-w-[60px]">
                        {link.title.split(" ")[0]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
