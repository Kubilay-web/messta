"use client";

import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarCheck, FileText, Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { ClientPortalStats } from "../../actions/analytics";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  RESERVED: "outline",
  WITHDRAWN: "secondary",
  SOLD: "destructive",
  RENTED: "outline",
  SCHEDULED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export default function ClientPortalDashboard({ data }: { data: ClientPortalStats }) {
  const stats = [
    { title: "İlgilendiğim İlanlar", count: data.interestedListings, icon: Heart, color: "#ef4444", href: "/management/portal/parent" },
    { title: "Yaklaşan Randevu", count: data.upcomingVisits, icon: CalendarCheck, color: "#10b981", href: "/management/portal/parent/payments" },
    { title: "Sözleşmeler", count: data.contracts, icon: FileText, color: "#8b5cf6", href: "/management/portal/parent/payments" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: item.color }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                    <p className="text-2xl font-semibold">{item.count.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-full" style={{ background: item.color + "22" }}>
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                </div>
                <Link
                  href={item.href}
                  className="mt-3 text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  Detaylar →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Interested Listings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>İlgilendiğim İlanlar</span>
              <Link href="/management/portal/parent" className="text-sm text-blue-500 hover:text-blue-600">
                Tümü →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İlan</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentInterests.length > 0 ? (
                  data.recentInterests.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{i.listingTitle}</p>
                          <p className="text-xs text-muted-foreground">{i.listingNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {i.askingPrice.toLocaleString()} {i.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[i.status] ?? "secondary"}>
                          {i.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      İlgilendiğiniz ilan yok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Yaklaşan Randevular</span>
              <Link href="/management/portal/parent/payments" className="text-sm text-blue-500 hover:text-blue-600">
                Tümü →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mülk</TableHead>
                  <TableHead>Danışman</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.upcomingVisitsList.length > 0 ? (
                  data.upcomingVisitsList.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-sm">{v.propertyTitle}</TableCell>
                      <TableCell className="text-sm">{v.agentFirstName} {v.agentLastName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(v.scheduledAt), "d MMM, HH:mm", { locale: tr })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      Yaklaşan randevu yok
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
