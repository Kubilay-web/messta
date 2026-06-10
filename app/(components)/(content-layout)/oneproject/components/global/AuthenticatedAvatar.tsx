"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { getInitials } from "../../lib/generateInitials";
import Link from "next/link";
import LogoutBtn from "../../components/global/LogoutBtn";

type SafeUser = {
  id: string;
  roleproject: string | null;
  email: string;
  username: string;
  avatarUrl:string;
};

export default function AuthenticatedAvatar({
  user,
}: {
  user: SafeUser | null;
}) {
  const role = user?.roleproject;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar>
          <AvatarImage
            src={user?.avatarUrl ?? ""}
            alt={user?.username ?? ""}
          />
          <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <p>{user?.username}</p>
          <p className=" text-xs text-muted-foreground">
            {user?.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
