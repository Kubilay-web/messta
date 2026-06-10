"use client";
import { InvoiceDetails } from "../types/types";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "./ui/button";
import Link from "next/link";
import { ChevronLeft, Mail, Printer } from "lucide-react";
import { getNormalDate } from "../lib/getNormalDate";

import { sendInvoiceLink } from "../actions/emails";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { formatCurrency } from "../lib/formatCurrency";
import useCurrencySettings from "../hooks/useCurrencySettings";
import { useSession } from "@/app/SessionProvider";

export default function Invoice({
  invoiceDetails,
  project,
}: {
  invoiceDetails: InvoiceDetails | null;
  project: string;
}) {
  const { defaultCurrency, exchangeRate } = useCurrencySettings();

  const session = useSession();
  const user = session.user;
  const role = user.roleproject;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Faturayı Yazdır",
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const invoiceLink = `${baseUrl}/oneproject/project/invoice/${invoiceDetails?.invoice.id}?project=${project}`;
  async function handleSendInvoice() {
    setLoading(true);
    try {
      const res = await sendInvoiceLink(
        invoiceDetails as InvoiceDetails,
        invoiceLink,
      );
      setLoading(false);
      toast.success("Fatura Gönderildi");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex py-3 justify-between items-center">
        <Button variant="outline" className="mb-4">
          <Link
            href={`/oneproject/project/${project}`}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Projeye Dön
          </Link>
        </Button>
        <div className="flex justify-end gap-x-2">
          {role === "USER" ||
            (role == "ADMIN" && (
              <button
                onClick={handleSendInvoice}
                disabled={loading}
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
              >
                {!loading && <Mail className="shrink-0 size-4" />}
                {loading ? " Gönderiliyor..." : " Müşteriye Gönder"}
              </button>
            ))}
          <button
            onClick={() => {
              handlePrint(null, () => contentToPrint.current);
            }}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Printer className="shrink-0 size-4" />
            Yazdır
          </button>
        </div>
      </div>
      <div
        ref={contentToPrint}
        className="relative flex flex-col bg-white shadow-lg rounded-xl pointer-events-auto dark:bg-neutral-800"
      >
        <div className="relative overflow-hidden min-h-32 bg-gray-900 text-center rounded-t-xl dark:bg-neutral-950">
          <figure className="absolute inset-x-0 bottom-0 -mb-px">
            <svg
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 1920 100.1"
            >
              <path
                fill="currentColor"
                className="fill-white dark:fill-neutral-800"
                d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
              ></path>
            </svg>
          </figure>
        </div>

        <div className="relative z-10 -mt-12">
          <img
            src={invoiceDetails?.user?.userLogo ?? "/placeholder.svg"}
            alt=""
            className="mx-auto flex justify-center items-center size-[62px] rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
          />
        </div>

        <div className="p-4 sm:p-7 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-10">
            {/* BILL FROM */}
            <div className="w-full sm:w-auto">
              <h3
                id="hs-ai-modal-label"
                className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"
              >
                Düzenleyen
              </h3>

              <p className="text-sm text-gray-500 dark:text-neutral-500 break-words">
                {invoiceDetails?.user?.name}
              </p>

              <p className="text-sm text-gray-500 dark:text-neutral-500 break-words">
                {invoiceDetails?.user?.email}
              </p>

              <p className="text-sm font-medium dark:text-neutral-500 pt-3">
                Fatura Tarihi:{" "}
                <span className="text-muted-foreground">
                  {getNormalDate(invoiceDetails?.invoice.date ?? new Date())}
                </span>
              </p>
            </div>

            {/* BILL TO */}
            <div className="w-full sm:w-auto">
              <h3
                id="hs-ai-modal-label"
                className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"
              >
                Faturalanan
              </h3>

              <p className="text-sm text-gray-500 dark:text-neutral-500 break-words">
                {invoiceDetails?.client?.name}
              </p>

              <p className="text-sm text-gray-500 dark:text-neutral-500 break-words">
                {invoiceDetails?.client?.email}
              </p>

              <p className="text-sm font-medium dark:text-neutral-500 pt-3">
                Fatura No{" "}
                <span className="text-muted-foreground">
                  {invoiceDetails?.invoice.invoiceNumber}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div>
              <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                Ödenen tutar:
              </span>
              <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                {/* ${invoiceDetails?.invoice.amount.toLocaleString()} */}
                {formatCurrency(
                  invoiceDetails!.invoice.amount * exchangeRate,
                  defaultCurrency,
                )}
              </span>
            </div>

            <div>
              <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                Ödeme tarihi:
              </span>
              <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                {getNormalDate(invoiceDetails?.invoice.date ?? new Date())}
              </span>
            </div>

            <div>
              <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                Ödeme yöntemi:
              </span>
              <div className="flex items-center gap-x-2">
                <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                  {invoiceDetails?.invoice.method}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-10">
            <h4 className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
              Özet
            </h4>

            <ul className="mt-3 flex flex-col">
              <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
                <div className="flex items-center justify-between w-full">
                  <span>{invoiceDetails?.invoice.title}</span>
                  <span>
                    {/* $
                    {(
                      invoiceDetails!.invoice.amount -
                      invoiceDetails!.invoice.tax
                    ).toLocaleString()} */}
                    {formatCurrency(
                      (invoiceDetails!.invoice.amount -
                        invoiceDetails!.invoice.tax) *
                        exchangeRate,
                      defaultCurrency,
                    )}
                  </span>
                </div>
              </li>
              <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
                <div className="flex items-center justify-between w-full">
                  <span>Vergi/KDV</span>
                  <span>
                    {/* ${invoiceDetails?.invoice.tax.toLocaleString()} */}
                    {formatCurrency(
                      invoiceDetails!.invoice.tax * exchangeRate,
                      defaultCurrency,
                    )}
                  </span>
                </div>
              </li>
              <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm font-semibold bg-gray-50 border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
                <div className="flex items-center justify-between w-full">
                  <span>Toplam Ödenen Tutar</span>
                  <span>
                    {/* ${invoiceDetails?.invoice.amount.toLocaleString()} */}
                    {formatCurrency(
                      invoiceDetails!.invoice.amount * exchangeRate,
                      defaultCurrency,
                    )}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-5 sm:mt-10">
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              Herhangi bir sorunuz olursa, bize ulaşın:{" "}
              <a
                className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
                href={`mailto:${invoiceDetails?.user?.email}`}
              >
                {invoiceDetails?.user?.email}
              </a>{" "}
              veya telefonla arayın:{" "}
              <a
                className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
                href={`tel:${invoiceDetails?.user?.phone}`}
              >
                {invoiceDetails?.user?.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
