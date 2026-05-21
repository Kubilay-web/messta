import { validateRequest } from "@/app/auth";
import { UserRoleGayrimenkul } from "../types/types";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import NotAuthorized from "./not-authorized";

interface Props {
  children: ReactNode;
  allowedRoles: UserRoleGayrimenkul[];
}

export default async function RoleBasedWrapper({ children, allowedRoles }: Props) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const userRole = user?.roleGayrimenkul as UserRoleGayrimenkul;
  if (!allowedRoles.includes(userRole)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
}
