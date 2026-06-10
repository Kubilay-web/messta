import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import useCurrencySettings from "../../hooks/useCurrencySettings";
import { formatCurrency } from "../../lib/formatCurrency";
import { ProjectWithPayment } from "../../types/types";
function calculateTotalPayments(projects: ProjectWithPayment[]) {
  return projects.reduce((totalAmount, project) => {
    const projectPaymentsTotal = project.payments.reduce((sum, payment) => {
      return sum + payment.amount;
    }, 0);

    return totalAmount + projectPaymentsTotal;
  }, 0);
}
export default function ProjectSummary({ data }: { data: any[] }) {
  const { localCurrency, defaultCurrency, exchangeRate } =
    useCurrencySettings();

  const totalRevenueUSD = data.reduce((acc, item) => {
    return acc + item.budget;
  }, 0);
  const totalRevenuePaid = calculateTotalPayments(data);
  const totalBal = totalRevenueUSD - totalRevenuePaid;
  const totalRevenueDefaultCurrency =
    defaultCurrency === "USD"
      ? totalRevenueUSD
      : totalRevenueUSD * exchangeRate;

  // const formatCurrency = (amount: number, currency: string) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: currency,
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(amount);
  // };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Projects Summary</CardTitle>
          <CardDescription>Showing overview of your Projects</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              Total Projects
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {data.length.toString().padStart(2, "0")}
            </span>
          </button>
          <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Revenue</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {/* {formatCurrency(totalRevenueDefaultCurrency, defaultCurrency)} */}
              {formatCurrency(totalRevenueUSD, defaultCurrency, exchangeRate)}
            </span>
            {/* {defaultCurrency === "USD" ? (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD * exchangeRate, localCurrency)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD, "USD")}
              </span>
            )} */}
          </button>
          <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Paid</span>
            <span className="text-lg font-bold leading-none sm:text-3xl text-green-600">
              {/* {formatCurrency(totalRevenueDefaultCurrency, defaultCurrency)} */}
              {formatCurrency(totalRevenuePaid, defaultCurrency, exchangeRate)}
            </span>
            {/* {defaultCurrency === "USD" ? (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD * exchangeRate, localCurrency)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD, "USD")}
              </span>
            )} */}
          </button>
          <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Balance</span>
            <span className="text-lg font-bold leading-none sm:text-3xl text-orange-600">
              {/* {formatCurrency(totalRevenueDefaultCurrency, defaultCurrency)} */}
              {formatCurrency(totalBal, defaultCurrency, exchangeRate)}
            </span>
            {/* {defaultCurrency === "USD" ? (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD * exchangeRate, localCurrency)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalRevenueUSD, "USD")}
              </span>
            )} */}
          </button>
        </div>
      </CardHeader>
    </Card>
  );
}




