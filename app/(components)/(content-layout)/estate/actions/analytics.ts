// "use server";

// export type Analytics = {
//   title: string;
//   count: number;
// };

// export interface PublicStats {
//   students: number;
//   teachers: number;
//   schools: number;
//   parents: number;
// }

// export interface AdminStats {
//   students: number;
//   teachers: number;
//   parents: number;
//   totalPending: number;
//   totalPaid: number;
//   recentStudents: Student[];
//   recentEvents: Event[];
// }

// interface Student {
//   id: string;
//   name: string;
//   regNo: string;
//   gender: "MALE" | "FEMALE";
//   class: {
//     title: string;
//   };
// }

// interface Event {
//   id: string;
//   title: string;
//   startTime: string;
//   endTime: string;
//   date: string;
//   location: string;
// }

// export type TeacherAnalyticsData = {
//   students: number;
//   exams: number;
//   reminders: number;
//   recentStudents: Student[];
//   recentEvents: Event[];
// };



// export async function getAllAnalytics(schoolId: string): Promise<AdminStats> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/${schoolId}`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch analytics");

//     const analytics = await res.json();
//     return analytics as AdminStats;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       teachers: 0,
//       parents: 0,
//       totalPending: 0,
//       totalPaid: 0,
//       recentStudents: [],
//       recentEvents: [],
//     };
//   }
// }

// export async function getTeacherAnalytics(
//   schoolId: string
// ): Promise<TeacherAnalyticsData> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/teachers/${schoolId}`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch teacher analytics");

//     const analytics = await res.json();
//     return analytics as TeacherAnalyticsData;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       reminders: 0,
//       exams: 0,
//       recentStudents: [],
//       recentEvents: [],
//     };
//   }
// }

// export async function getPublicStats(): Promise<PublicStats> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/public`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch public stats");

//     const analytics = await res.json();
//     return analytics as PublicStats;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       teachers: 0,
//       schools: 0,
//       parents: 0,
//     };
//   }
// }









"use server";

export type Analytics = {
  title: string;
  count: number;
};

export interface PublicStats {
  students: number;
  teachers: number;
  schools: number;
  parents: number;
}

export interface AdminStats {
  students: number;
  teachers: number;
  parents: number;
  totalPending: number;
  totalPaid: number;
  recentStudents: Student[];
  recentEvents: Event[];
}

interface Student {
  id: string;
  name: string;
  regNo: string;
  gender: "MALE" | "FEMALE";
  class: {
    title: string;
  };
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
}

export type TeacherAnalyticsData = {
  students: number;
  exams: number;
  reminders: number;
  recentStudents: Student[];
  recentEvents: Event[];
};

// Fetch admin analytics for a specific school
export async function getAllAnalytics(schoolId: string): Promise<AdminStats> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=school&schoolId=${schoolId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch analytics");

    const analytics = await res.json();
    return analytics as AdminStats;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      teachers: 0,
      parents: 0,
      totalPending: 0,
      totalPaid: 0,
      recentStudents: [],
      recentEvents: [],
    };
  }
}

// Fetch teacher-specific analytics for a school
export async function getTeacherAnalytics(
  schoolId: string,
): Promise<TeacherAnalyticsData> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=teacher&schoolId=${schoolId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch teacher analytics");

    const analytics = await res.json();
    return analytics as TeacherAnalyticsData;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      reminders: 0,
      exams: 0,
      recentStudents: [],
      recentEvents: [],
    };
  }
}

// Fetch public stats (no schoolId required)
export async function getPublicStats(): Promise<PublicStats> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=public`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch public stats");

    const analytics = await res.json();
    return analytics as PublicStats;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      teachers: 0,
      schools: 0,
      parents: 0,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Real Estate ERP — Ajans Analitik
// ─────────────────────────────────────────────────────────────────────────────

import db from "@/app/lib/db";

export interface AgencyAnalytics {
  counts: {
    properties:       number;
    totalListings:    number;
    activeListings:   number;
    totalContracts:   number;
    activeContracts:  number;
    agents:           number;
    clients:          number;
    totalVisits:      number;
    scheduledVisits:  number;
  };
  revenue: {
    totalSaleValue:   number;
    totalCommission:  number;
    pendingPayments:  number;
    paidPayments:     number;
  };
  listingsByStatus:    { status: string; count: number }[];
  contractsByType:     { type: string;   count: number }[];
  propertiesByType:    { type: string;   count: number }[];
  recentContracts: {
    id:           string;
    contractNo:   string;
    clientName:   string;
    contractType: string;
    status:       string;
    createdAt:    Date;
  }[];
  recentListings: {
    id:          string;
    title:       string;
    listingNo:   string;
    listingType: string;
    status:      string;
    askingPrice: number;
    currency:    string;
    createdAt:   Date;
  }[];
  recentVisits: {
    id:          string;
    scheduledAt: Date;
    status:      string;
    agentName:   string;
    clientName:  string;
  }[];
}

export async function getAgencyAnalytics(agencyId: string): Promise<AgencyAnalytics> {
  const [
    propCount,
    listingCount,
    activeListingCount,
    contractCount,
    activeContractCount,
    agentCount,
    clientCount,
    visitCount,
    scheduledVisitCount,
    saleAgg,
    commissionAgg,
    pendingPayAgg,
    paidPayAgg,
    listingStatuses,
    contractTypes,
    propertyTypes,
    recentContracts,
    recentListings,
    recentVisits,
  ] = await Promise.all([
    // Temel sayımlar
    db.propertyRealEstate.count({ where: { agencyId } }),
    db.listing.count({ where: { agencyId } }),
    db.listing.count({ where: { agencyId, status: "ACTIVE" } }),
    db.propertyContract.count({ where: { agencyId } }),
    db.propertyContract.count({ where: { agencyId, status: "ACTIVE" } }),
    db.agent.count({ where: { agencyId } }),
    db.propertyClient.count({ where: { agencyId } }),
    db.propertyVisit.count({
      where: { property: { agencyId } },
    }),
    db.propertyVisit.count({
      where: { property: { agencyId }, status: "SCHEDULED" },
    }),

    // Gelir
    db.propertyContract.aggregate({
      where: { agencyId, status: "COMPLETED", contractType: "SALE" },
      _sum: { salePrice: true },
    }),
    db.propertyContract.aggregate({
      where: { agencyId, status: "COMPLETED" },
      _sum: { commission: true },
    }),
    db.contractPayment.aggregate({
      where: { contract: { agencyId }, status: "PENDING" },
      _sum: { amount: true },
    }),
    db.contractPayment.aggregate({
      where: { contract: { agencyId }, status: "PAID" },
      _sum: { amount: true },
    }),

    // Dağılımlar — groupBy yerine findMany + map (MongoDB uyumluluğu)
    db.listing.findMany({
      where: { agencyId },
      select: { status: true },
    }),
    db.propertyContract.findMany({
      where: { agencyId },
      select: { contractType: true },
    }),
    db.propertyRealEstate.findMany({
      where: { agencyId },
      select: { propertyType: true },
    }),

    // Son 5 kayıt
    db.propertyContract.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, contractNo: true, clientName: true, contractType: true, status: true, createdAt: true },
    }),
    db.listing.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, listingNo: true, listingType: true, status: true, askingPrice: true, currency: true, createdAt: true },
    }),
    db.propertyVisit.findMany({
      where: { property: { agencyId } },
      orderBy: { scheduledAt: "desc" },
      take: 5,
      select: { id: true, scheduledAt: true, status: true, agentId: true, clientId: true },
    }),
  ]);

  // Dağılım hesaplamaları
  function toCounts<T extends string>(arr: T[]): { key: string; count: number }[] {
    const map: Record<string, number> = {};
    arr.forEach((v) => { map[v] = (map[v] ?? 0) + 1; });
    return Object.entries(map).map(([key, count]) => ({ key, count }));
  }

  const listingsByStatus = toCounts(listingStatuses.map((l) => l.status));
  const contractsByType  = toCounts(contractTypes.map((c) => c.contractType));
  const propertiesByType = toCounts(propertyTypes.map((p) => p.propertyType));

  // Ziyaret için agent/client isimlerini çek
  const agentIds  = [...new Set(recentVisits.map((v) => v.agentId).filter(Boolean))];
  const clientIds = [...new Set(recentVisits.map((v) => v.clientId).filter(Boolean))];

  const [visitAgents, visitClients] = await Promise.all([
    agentIds.length  ? db.agent.findMany({ where: { id: { in: agentIds } }, select: { id: true, firstName: true, lastName: true } }) : [],
    clientIds.length ? db.propertyClient.findMany({ where: { id: { in: clientIds } }, select: { id: true, firstName: true, lastName: true } }) : [],
  ]);

  const agentMap  = Object.fromEntries(visitAgents.map((a) => [a.id, `${a.firstName} ${a.lastName}`]));
  const clientMap = Object.fromEntries(visitClients.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));

  return {
    counts: {
      properties:      propCount,
      totalListings:   listingCount,
      activeListings:  activeListingCount,
      totalContracts:  contractCount,
      activeContracts: activeContractCount,
      agents:          agentCount,
      clients:         clientCount,
      totalVisits:     visitCount,
      scheduledVisits: scheduledVisitCount,
    },
    revenue: {
      totalSaleValue:  saleAgg._sum.salePrice     ?? 0,
      totalCommission: commissionAgg._sum.commission ?? 0,
      pendingPayments: pendingPayAgg._sum.amount   ?? 0,
      paidPayments:    paidPayAgg._sum.amount      ?? 0,
    },
    listingsByStatus: listingsByStatus.map((s) => ({ status: s.key, count: s.count })),
    contractsByType:  contractsByType.map((t)  => ({ type:   t.key, count: t.count })),
    propertiesByType: propertiesByType.map((t) => ({ type:   t.key, count: t.count })),
    recentContracts,
    recentListings,
    recentVisits: recentVisits.map((v) => ({
      id:          v.id,
      scheduledAt: v.scheduledAt,
      status:      v.status,
      agentName:   agentMap[v.agentId]  ?? "—",
      clientName:  clientMap[v.clientId] ?? "—",
    })),
  };
}