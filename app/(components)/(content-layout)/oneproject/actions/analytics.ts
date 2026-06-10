"use server";

import db from "@/app/lib/db";
import {
  DollarSign,
  LayoutGrid,
  LucideProps,
  Users,
  Users2,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
export type AnalyticsProps = {
  title: string;
  total: number;
  href: string;
  icon: any;
  isCurrency?: boolean;
};
export async function getDashboardOverview(agencyId: string | undefined | null) {
  if (agencyId) {
    try {
      const projects = await db.project.findMany({
        where: { agencyId },
      });
      const clientLength = await db.propertyClient.count({
        where: { agencyId },
      });
      const subscriberLength = await db.subscriber.count({
        where: { agencyId },
      });
      const totalRevenue =
        projects && projects.length > 0
          ? projects.reduce((acc, item) => {
              return acc + (item.budget || 0);
            }, 0)
          : 0;
      const analytics = [
        {
          title: "Süreçler",
          total: projects.length,
          href: "/oneproject/dashboard/projects",
          icon: LayoutGrid,
        },
        {
          title: "Toplam İşlem Hacmi",
          total: totalRevenue,
          href: "/oneproject/dashboard/projects",
          icon: DollarSign,
          isCurrency: true,
        },
        {
          title: "Müşteriler",
          total: clientLength,
          href: "/oneproject/dashboard/clients",
          icon: Users,
        },
        {
          title: "Aboneler",
          total: subscriberLength,
          href: "/oneproject/dashboard/subscribers",
          icon: Users2,
        },
      ];

      return analytics;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
