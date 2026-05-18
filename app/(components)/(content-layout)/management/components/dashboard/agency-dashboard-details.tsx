"use client";

import React from "react";
import { format } from "date-fns";
import {
  Building2,
  CalendarCheck,
  FileText,
  ListOrdered,
  UserCog,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { AgencyStats } from "../../actions/analytics";

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

export default function AgencyDashboardDetails({
  analytics,
  agencySlug,
}: {
  analytics: AgencyStats;
  agencySlug: string;
}) {
  const stats = [
    {
      title: "Danışmanlar",
      count: analytics.agents,
      href: "/management/dashboard/users/teachers",
      icon: UserCog,
      color: "#8b5cf6",
    },
    {
      title: "Müşteriler",
      count: analytics.clients,
      href: "/management/dashboard/users/parents",
      icon: Users,
      color: "#3b82f6",
    },
    {
      title: "Mülkler",
      count: analytics.properties,
      href: "/management/dashboard/academics/classes",
      icon: Building2,
      color: "#10b981",
    },
    {
      title: "Aktif İlanlar",
      count: analytics.activeListings,
      href: "/management/dashboard/academics/classes",
      icon: ListOrdered,
      color: "#f59e0b",
    },
    {
      title: "Sözleşmeler",
      count: analytics.contracts,
      href: "/management/dashboard/finance/payments",
      icon: FileText,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="relative overflow-hidden hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: item.color }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                    <p className="text-2xl font-semibold tracking-tight">
                      {item.count.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-opacity-10" style={{ background: item.color + "22" }}>
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                </div>
                <Link
                  href={item.href}
                  className="mt-3 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
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
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center justify-between">
                <span>Son İlanlar</span>
                <Link
                  href="/management/dashboard/academics/classes"
                  className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Tümünü gör →
                </Link>
              </div>
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
                {analytics.recentListings.length > 0 ? (
                  analytics.recentListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{listing.title}</span>
                          <span className="text-xs text-muted-foreground">{listing.listingNo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{listing.listingType}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[listing.status] ?? "secondary"}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center justify-between">
                <span>Yaklaşan Randevular</span>
                <Link
                  href="/management/dashboard/attendance/by-class"
                  className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Tümünü gör →
                </Link>
              </div>
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
                {analytics.upcomingVisits.length > 0 ? (
                  analytics.upcomingVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">{visit.propertyTitle}</TableCell>
                      <TableCell>{visit.clientFirstName} {visit.clientLastName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(visit.scheduledAt), "dd MMM, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
