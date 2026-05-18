"use client";

import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CalendarCheck,
  FileText,
  ListOrdered,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { AgentPortalStats } from "../../actions/analytics";

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

const LISTING_TYPE_LABEL: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
  SHORT_RENT: "Kısa Dönem",
};

export default function AgentPortalDashboard({ data }: { data: AgentPortalStats }) {
  const stats = [
    { title: "Aktif İlanlar", count: data.activeListings, icon: ListOrdered, color: "#f59e0b", href: "/management/portal/teacher/students" },
    { title: "Müşteriler", count: data.uniqueClients, icon: Users, color: "#3b82f6", href: "/management/portal/teacher/students" },
    { title: "Yaklaşan Randevu", count: data.upcomingVisits, icon: CalendarCheck, color: "#10b981", href: "/management/portal/teacher/attendance" },
    { title: "Sözleşmeler", count: data.contracts, icon: FileText, color: "#8b5cf6", href: "/management/portal/teacher/exams" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        {/* Recent Listings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Son İlanlarım</span>
              <Link href="/management/portal/teacher/students" className="text-sm text-blue-500 hover:text-blue-600">
                Tümü →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İlan</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentListings.length > 0 ? (
                  data.recentListings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{l.listingNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {LISTING_TYPE_LABEL[l.listingType] ?? l.listingType}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[l.status] ?? "secondary"}>
                          {l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      İlan bulunamadı
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
              <Link href="/management/portal/teacher/attendance" className="text-sm text-blue-500 hover:text-blue-600">
                Tümü →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mülk</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.upcomingVisitsList.length > 0 ? (
                  data.upcomingVisitsList.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-sm">{v.propertyTitle}</TableCell>
                      <TableCell className="text-sm">{v.clientFirstName} {v.clientLastName}</TableCell>
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
