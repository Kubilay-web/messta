import { getServerUser } from "../actions/auth";
import { UserRole } from "../types/types";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import NotAuthorized from "./not-authorized";
import { validateRequest } from "@/app/auth";
interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}
export default async function RoleBasedWrapper({
  children,
  allowedRoles,
}: Props) {

 const { user } = await validateRequest();



  // if (!user) {
  //   redirect("/login");
  // }



  const userRole = user?.roleschool;



  // check
  // if (!allowedRoles.includes(userRole)) {
  //   return <NotAuthorized />;
  // }


  return <>{children}</>;
}
