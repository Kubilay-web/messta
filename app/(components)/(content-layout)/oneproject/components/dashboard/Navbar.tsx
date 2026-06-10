"use client";
import React from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Menu,
  Home,
  Users,
  LayoutGrid,
  Combine,
  Handshake,
  DollarSign,
  User2,
  Mail,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../../lib/generateInitials";
import { ModeToggle } from "../mode-toggle";
import { AvatarMenuButton } from "./AvatarMenuButton";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";

type SafeUser = {
  id: string;
  roleproject: "ADMIN" | "USER" | "CLIENT" | "MEMBER";
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export default function Navbar({ user }: { user: SafeUser }) {
  const role = user.roleproject;
  const pathname = usePathname();

  const navLinks = [
    { title: "Overview", href: "/oneproject/dashboard", icon: Home },
    { title: "Clients", href: "/oneproject/dashboard/clients", icon: Users },
    {
      title: "Projects",
      href: "/oneproject/dashboard/projects",
      icon: LayoutGrid,
    },
    {
      title: "Payments",
      href: "/oneproject/dashboard/payments",
      icon: Handshake,
    },
    {
      title: "Currency",
      href: "/oneproject/dashboard/currency",
      icon: DollarSign,
      badge: "New",
    },
    { title: "Team", href: "/oneproject/dashboard/members", icon: User2 },
    { title: "Emails", href: "/oneproject/dashboard/emails", icon: Mail },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden lg:block w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Link href="/oneproject/dashboard">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </Button>

              {/* Desktop Navigation Links */}
              <div className="hidden xl:flex items-center space-x-1">
                {navLinks.slice(1, 5).map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Center Section - Search */}
            {/* <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600"
                />
              </div>
            </div> */}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>

              <ModeToggle />

              <AvatarMenuButton user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Navbar */}
      <div className="lg:hidden w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>

              <ModeToggle />

              <AvatarMenuButton user={user} />
            </div>
          </div>

          {/* Search Row */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Navigation Links Row */}
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-1">
              {navLinks.slice(0, 5).map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
