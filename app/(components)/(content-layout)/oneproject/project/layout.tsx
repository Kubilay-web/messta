

import Navbar from "../components/dashboard/Navbar";
import Sidebar from "../components/dashboard/Sidebar";

import { notFound, redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
