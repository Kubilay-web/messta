import { validateRequest } from "@/app/auth";
import { getInvoiceById } from "../../../actions/payments";
import Invoice from "../../../components/Invoice";
import { Button } from "../../../components/ui/button";

import { getNormalDate } from "../../../lib/getNormalDate";
import { ChevronLeft, CloudDownload, Mail, Printer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

export default async function page({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { project } = searchParams;
  if (!id) {
    return notFound();
  }
  const {user} = await validateRequest();
  const role = user?.roleproject;

  const invoiceDetails = await getInvoiceById(id);

  if (!invoiceDetails?.client || !invoiceDetails.user) {
    return notFound();
  }
  return (
    <Invoice
      role={role}
      invoiceDetails={invoiceDetails}
      project={project as string}
    />
  );
}
