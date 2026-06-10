import useCurrencySettings from "../../hooks/useCurrencySettings";
import { formatCurrency } from "../../lib/formatCurrency";
import { cn } from "@/app/lib/utils";
import React from "react";

interface BudgetProgressBarProps {
  budget: number;
  paidAmount: number;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  budget,
  paidAmount,
}) => {
  const remainingAmount = Math.max(budget - paidAmount, 0);
  const paidPercentage = Math.min((paidAmount / budget) * 100, 100);
  const { defaultCurrency, exchangeRate } = useCurrencySettings();

  return (
    <div className="w-full border-t pt-3">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Payment Progress(
          <span className="text-xs">{`${paidPercentage.toFixed(0)}%`}</span>)
        </span>
        <span className="text-sm font-medium text-gray-700">{`${formatCurrency(
          paidAmount,
          defaultCurrency,
          exchangeRate
        )} / ${formatCurrency(budget, defaultCurrency, exchangeRate)}`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={cn(
            "bg-yellow-400 h-2.5 rounded-full",
            paidPercentage > 50 && "bg-green-400"
          )}
          style={{ width: `${paidPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-600">
          Paid:{formatCurrency(paidAmount, defaultCurrency, exchangeRate)}
        </span>
        <span className="text-sm text-gray-600">
          Remaining:
          {formatCurrency(remainingAmount, defaultCurrency, exchangeRate)}
        </span>
      </div>
    </div>
  );
};

export default BudgetProgressBar;
