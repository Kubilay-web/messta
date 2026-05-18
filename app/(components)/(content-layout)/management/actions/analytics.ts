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

import prisma from "@/app/lib/db";

// ── Real Estate ERP Analytics ────────────────────────────────────────────────

export interface AgencyStats {
  agents: number;
  clients: number;
  properties: number;
  activeListings: number;
  contracts: number;
  recentListings: RecentListing[];
  upcomingVisits: UpcomingVisit[];
}

interface RecentListing {
  id: string;
  title: string;
  listingNo: string;
  listingType: string;
  status: string;
  askingPrice: number;
  currency: string;
  agentName: string;
}

interface UpcomingVisit {
  id: string;
  scheduledAt: string;
  status: string;
  propertyTitle: string;
  clientFirstName: string;
  clientLastName: string;
  agentFirstName: string;
  agentLastName: string;
}

export async function getAgencyAnalytics(agencyId: string): Promise<AgencyStats> {
  try {
    const [agents, clients, properties, activeListings, contracts, recentListings, upcomingVisits] =
      await Promise.all([
        prisma.agent.count({ where: { agencyId } }),
        prisma.propertyClient.count({ where: { agencyId } }),
        prisma.propertyRealEstate.count({ where: { agencyId } }),
        prisma.listing.count({ where: { agencyId, status: "ACTIVE" } }),
        prisma.propertyContract.count({ where: { agencyId } }),
        prisma.listing.findMany({
          where: { agencyId },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true, title: true, listingNo: true,
            listingType: true, status: true,
            askingPrice: true, currency: true, agentName: true,
          },
        }),
        prisma.propertyVisit.findMany({
          where: {
            property: { agencyId },
            scheduledAt: { gte: new Date() },
          },
          orderBy: { scheduledAt: "asc" },
          take: 6,
          select: {
            id: true, scheduledAt: true, status: true,
            property: { select: { title: true } },
            client: { select: { firstName: true, lastName: true } },
            agent: { select: { firstName: true, lastName: true } },
          },
        }),
      ]);

    return {
      agents,
      clients,
      properties,
      activeListings,
      contracts,
      recentListings,
      upcomingVisits: upcomingVisits.map((v) => ({
        id: v.id,
        scheduledAt: v.scheduledAt.toISOString(),
        status: v.status,
        propertyTitle: v.property.title,
        clientFirstName: v.client.firstName,
        clientLastName: v.client.lastName,
        agentFirstName: v.agent.firstName,
        agentLastName: v.agent.lastName,
      })),
    };
  } catch (error) {
    console.error("getAgencyAnalytics:", error);
    return {
      agents: 0, clients: 0, properties: 0,
      activeListings: 0, contracts: 0,
      recentListings: [], upcomingVisits: [],
    };
  }
}

// ── Agent Portal Analytics ───────────────────────────────────────────────────

export interface AgentPortalStats {
  activeListings: number;
  upcomingVisits: number;
  contracts: number;
  uniqueClients: number;
  recentListings: {
    id: string; title: string; listingNo: string;
    listingType: string; status: string; askingPrice: number; currency: string;
  }[];
  upcomingVisitsList: {
    id: string; scheduledAt: string; status: string;
    propertyTitle: string; clientFirstName: string; clientLastName: string;
  }[];
}

export async function getAgentPortalData(userId: string): Promise<AgentPortalStats> {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!agent) {
    return { activeListings: 0, upcomingVisits: 0, contracts: 0, uniqueClients: 0, recentListings: [], upcomingVisitsList: [] };
  }

  const agentId = agent.id;
  const now = new Date();

  const [activeListings, upcomingVisits, contracts, visitClients, recentListings, upcomingVisitsList] =
    await Promise.all([
      prisma.listing.count({ where: { agentId, status: "ACTIVE" } }),
      prisma.propertyVisit.count({ where: { agentId, scheduledAt: { gte: now } } }),
      prisma.propertyContract.count({ where: { agentId } }),
      prisma.propertyVisit.findMany({
        where: { agentId },
        select: { clientId: true },
        distinct: ["clientId"],
      }),
      prisma.listing.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true, title: true, listingNo: true,
          listingType: true, status: true, askingPrice: true, currency: true,
        },
      }),
      prisma.propertyVisit.findMany({
        where: { agentId, scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 6,
        select: {
          id: true, scheduledAt: true, status: true,
          property: { select: { title: true } },
          client: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  return {
    activeListings,
    upcomingVisits,
    contracts,
    uniqueClients: visitClients.length,
    recentListings,
    upcomingVisitsList: upcomingVisitsList.map((v) => ({
      id: v.id,
      scheduledAt: v.scheduledAt.toISOString(),
      status: v.status,
      propertyTitle: v.property.title,
      clientFirstName: v.client.firstName,
      clientLastName: v.client.lastName,
    })),
  };
}

// ── Client Portal Analytics ───────────────────────────────────────────────────

export interface ClientPortalStats {
  interestedListings: number;
  upcomingVisits: number;
  contracts: number;
  recentInterests: { id: string; listingTitle: string; listingNo: string; askingPrice: number; currency: string; status: string }[];
  upcomingVisitsList: { id: string; scheduledAt: string; status: string; propertyTitle: string; agentFirstName: string; agentLastName: string }[];
}

export async function getClientPortalData(userId: string): Promise<ClientPortalStats> {
  const client = await prisma.propertyClient.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!client) {
    return { interestedListings: 0, upcomingVisits: 0, contracts: 0, recentInterests: [], upcomingVisitsList: [] };
  }

  const clientId = client.id;
  const now = new Date();

  const [interestedListings, upcomingVisits, contracts, recentInterests, upcomingVisitsList] =
    await Promise.all([
      prisma.clientInterest.count({ where: { clientId } }),
      prisma.propertyVisit.count({ where: { clientId, scheduledAt: { gte: now } } }),
      prisma.propertyContract.count({ where: { clientId } }),
      prisma.clientInterest.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          listing: { select: { title: true, listingNo: true, askingPrice: true, currency: true, status: true } },
        },
      }),
      prisma.propertyVisit.findMany({
        where: { clientId, scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 6,
        select: {
          id: true, scheduledAt: true, status: true,
          property: { select: { title: true } },
          agent: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  return {
    interestedListings,
    upcomingVisits,
    contracts,
    recentInterests: recentInterests.map((i) => ({
      id: i.id,
      listingTitle: i.listing.title,
      listingNo: i.listing.listingNo,
      askingPrice: i.listing.askingPrice,
      currency: i.listing.currency,
      status: i.listing.status,
    })),
    upcomingVisitsList: upcomingVisitsList.map((v) => ({
      id: v.id,
      scheduledAt: v.scheduledAt.toISOString(),
      status: v.status,
      propertyTitle: v.property.title,
      agentFirstName: v.agent.firstName,
      agentLastName: v.agent.lastName,
    })),
  };
}

// ── School Analytics ─────────────────────────────────────────────────────────

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