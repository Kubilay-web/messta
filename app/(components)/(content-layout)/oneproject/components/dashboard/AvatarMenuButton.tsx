"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { getInitials } from "../../lib/generateInitials";
import {
  Headset,
  LogOut,
  Mail,
  MessageSquareMore,
  PhoneCall,
  Presentation,
  Settings,
  User,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

type SafeUser = {
  id: string;
  roleproject: "ADMIN" | "USER" | "CLIENT" | "MEMBER";
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export function AvatarMenuButton({ user }: { user: SafeUser }) {
  const initials = getInitials(user.username ?? "");
  const router = useRouter();

  const menuLinks = [
    { name: "Settings", icon: Settings, href: "/oneproject/dashboard/settings" },
    { name: "Profile", icon: UserRound, href: "/oneproject/dashboard/profile" },
    { name: "POS", icon: Presentation, href: "/oneproject/dashboard/pos" },
  ];

  const assistanceLinks = [
    {
      name: "Free 2 hour set-up assistance",
      icon: Headset,
      href: "/oneproject/dashboard/settings",
    },
    {
      name: "Chat with Our experts",
      icon: MessageSquareMore,
      href: "/oneproject/dashboard/profile",
    },
    {
      name: "Send an Email",
      icon: Mail,
      href: "/oneproject/dashboard/pos",
    },
    {
      name: "Talk to Us - 256 784 143 872",
      icon: PhoneCall,
      href: "/oneproject/dashboard/pos",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Avatar>
          <AvatarImage src={user.avatarUrl ?? ""} alt={user.username ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </SheetTrigger>

      <SheetContent className="bg-white text-black">
        <SheetHeader>
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <Avatar>
              <AvatarImage
                src={user?.avatarUrl ?? ""}
                alt={user.username ?? ""}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-black">
                {user?.username}
              </h2>
              <p className="text-sm text-black">{user.email}</p>
            </div>
          </div>

          <div className="flex space-x-6 items-center py-6 border-b border-gray-200">
            <Button
              asChild
              variant="outline"
              className="text-black border-gray-300"
            >
              <Link href="/oneproject/dashboard/account">
                <User className="h-4 w-4 mr-2 text-black" />
                <span>Manage Account</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="text-black border-gray-300"
            >
              <LogOut className="h-4 w-4 mr-2 text-black" />
              <span>Logout</span>
            </Button>
          </div>
        </SheetHeader>

        {/* CONTENT */}
        <div>
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-gray-200">
            {menuLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="flex flex-col items-center text-black hover:text-black"
                >
                  <Icon className="w-8 h-8 mb-1 text-black" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="py-6">
            <h2 className="text-xl font-semibold tracking-tight text-black">
              Need Assistance?
            </h2>

            <div className="py-2 flex flex-col gap-1">
              {assistanceLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={i}
                    size="sm"
                    asChild
                    variant="ghost"
                    className="justify-start text-black hover:text-black"
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4 mr-2 text-black" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
