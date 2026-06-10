import useCurrencySettings from "../../hooks/useCurrencySettings";
import { formatCurrency } from "../../lib/formatCurrency";
import { Project } from "@prisma/client";
import React from "react";

export default function DisplayCurrency({ project }: { project: Project }) {
  const { exchangeRate, defaultCurrency } = useCurrencySettings();
  return (
    <p>{formatCurrency(project.budget ?? 0, defaultCurrency, exchangeRate)}</p>
  );
}
