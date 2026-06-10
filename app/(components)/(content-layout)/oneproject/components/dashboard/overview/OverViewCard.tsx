// "use client";

import { CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";


import { AnalyticsProps } from "../../../actions/analytics";
import Link from "next/link";

export default function OverViewCard({ item }: { item: AnalyticsProps }) {
  const Icon = item.icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {item.isCurrency
            ? `${item.total.toLocaleString("tr-TR")} ₺`
            : item.total.toString().padStart(2, "0")}
        </div>
        <Link href={item.href} className="text-xs text-muted-foreground">
          Detayları gör
        </Link>
      </CardContent>
    </Card>
  );
}
