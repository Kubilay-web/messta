import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Plus,
  Sparkles,
  Sun,
} from "lucide-react";
import React from "react";
import UserMenu from "./user-menu";
import Link from "next/link";
import NotificationButton from "./notification-button";
import { RecentActivity } from "../../../types/types";

export default function SidebarHeader({
  notifications,
}: {
  notifications: RecentActivity[];
}) {
  return (
    <div className="flex h-16 items-center gap-4 border-b px-4">
      {/* <SidebarTrigger />
      <div className="flex-1">
        <Input placeholder="Search products..." className="max-w-sm" />
      </div> */}
      {/* */}
      <Button asChild variant="outline">
        <Link href={"/management/dashboard/students/new "}>
          <Plus className="h-5 w-5" />
          <span className="">Add new Student</span>
        </Link>
      </Button>
      <NotificationButton notifications={notifications} />
      <SidebarFooter>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarFooter>
      {/* <Avatar>
        <AvatarImage src="/placeholder.svg" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar> */}
    </div>
  );
}
