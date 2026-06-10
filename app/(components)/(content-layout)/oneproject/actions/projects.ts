"use server";

import db from "@/app/lib/db";
import { ProjectData, ProjectProps } from "../types/types";

import { revalidatePath } from "next/cache";

/**
 * oneproject "Proje" artık ERP bir İlanı (Listing) + bağlı Mülkü (PropertyRealEstate)
 * temsil eden bir satış/kiralama sürecidir. Emlak detayları bağlı ilandan/mülkten
 * gelir; oneproject yalnızca süreç katmanını (modül/görev/yorum/üye) tutar.
 */

// ---- Süreçleri ERP ilan/mülk verisiyle zenginleştir ----
async function enrichProjects<T extends { listingId: string | null; propertyId: string | null; clientId: string }>(
  projects: T[]
) {
  const listingIds = [...new Set(projects.map((p) => p.listingId).filter(Boolean))] as string[];
  const propertyIds = [...new Set(projects.map((p) => p.propertyId).filter(Boolean))] as string[];
  const clientIds = [...new Set(projects.map((p) => p.clientId).filter(Boolean))] as string[];

  const [listings, properties, clients] = await Promise.all([
    listingIds.length
      ? db.listing.findMany({ where: { id: { in: listingIds } } })
      : Promise.resolve([]),
    propertyIds.length
      ? db.propertyRealEstate.findMany({ where: { id: { in: propertyIds } } })
      : Promise.resolve([]),
    clientIds.length
      ? db.propertyClient.findMany({ where: { id: { in: clientIds } } })
      : Promise.resolve([]),
  ]);

  const lMap = new Map(listings.map((l) => [l.id, l]));
  const pMap = new Map(properties.map((p) => [p.id, p]));
  const cMap = new Map(clients.map((c) => [c.id, c]));

  return projects.map((p) => ({
    ...p,
    listing: p.listingId ? lMap.get(p.listingId) ?? null : null,
    property: p.propertyId ? pMap.get(p.propertyId) ?? null : null,
    client: p.clientId ? cMap.get(p.clientId) ?? null : null,
  }));
}

export async function createProject(data: ProjectProps) {
  const slug = data.slug;
  try {
    const existingProject = await db.project.findUnique({ where: { slug } });
    if (existingProject) {
      return {
        status: 409,
        error: `Süreç adı ( ${data.name} ) zaten mevcut`,
        data: null,
      };
    }
    const newProject = await db.project.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        notes: data.notes,
        thumbnail: data.thumbnail,
        startDate: data.startDate,
        endDate: data.endDate,
        deadline: data.deadline,
        budget: data.budget,
        budgetLocal: data.budgetLocal,
        status: data.status,
        clientId: data.clientId,
        userId: data.userId,
        // ERP bağlantıları
        agencyId: data.agencyId,
        agentId: data.agentId,
        listingId: data.listingId,
        propertyId: data.propertyId,
      },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return { status: 200, error: null, data: newProject };
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Acentenin tüm süreçleri (ilan/mülk/müşteri verisiyle zenginleştirilmiş). */
export async function getAgencyProjects(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      where: { agencyId },
      include: { payments: true },
    });
    return await enrichProjects(projects);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserProjects(userId: string | undefined) {
  if (!userId) return null;
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      where: { userId },
      include: { payments: true },
    });
    return await enrichProjects(projects);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserProjectsCount(userId: string | undefined) {
  if (userId) {
    try {
      return await db.project.count({ where: { userId } });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function getAgencyProjectsCount(agencyId: string | undefined | null) {
  if (!agencyId) return 0;
  try {
    return await db.project.count({ where: { agencyId } });
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export async function getUserGuestProjects(userId: string | undefined) {
  if (userId) {
    try {
      return await db.guestProject.findMany({
        orderBy: { createdAt: "desc" },
        where: { gustId: userId },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

/** Acentenin tüm paylaşılan süreçleri (acente bazlı işbirliği görünümü, ERP ilan/mülk ile zenginleştirilmiş). */
export async function getAgencyGuestProjects(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const guests = await db.guestProject.findMany({
      orderBy: { createdAt: "desc" },
      where: { agencyId },
    });

    // Bağlı ERP ilan/mülk bilgisini ekle (paylaşılan süreçte gösterilir)
    const listingIds = [...new Set(guests.map((g) => g.listingId).filter(Boolean))] as string[];
    const propertyIds = [...new Set(guests.map((g) => g.propertyId).filter(Boolean))] as string[];
    const [listings, properties] = await Promise.all([
      listingIds.length
        ? db.listing.findMany({ where: { id: { in: listingIds } } })
        : Promise.resolve([]),
      propertyIds.length
        ? db.propertyRealEstate.findMany({ where: { id: { in: propertyIds } } })
        : Promise.resolve([]),
    ]);
    const lMap = new Map(listings.map((l) => [l.id, l]));
    const pMap = new Map(properties.map((p) => [p.id, p]));

    return guests.map((g) => ({
      ...g,
      listing: g.listingId ? lMap.get(g.listingId) ?? null : null,
      property: g.propertyId ? pMap.get(g.propertyId) ?? null : null,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserMembers(userId: string | undefined) {
  if (userId) {
    try {
      return await db.guestProject.findMany({
        orderBy: { createdAt: "desc" },
        where: { ownerId: userId },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function getDetailedUserProjects(userId: string | undefined) {
  if (userId) {
    try {
      return await db.project.findMany({
        orderBy: { createdAt: "desc" },
        where: { userId },
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          payments: true,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

/** Acentenin süreçleri + tahsilatları (acente bazlı tahsilat görünümü). */
export async function getAgencyDetailedProjects(
  agencyId: string | undefined | null
) {
  if (!agencyId) return [];
  try {
    return await db.project.findMany({
      orderBy: { createdAt: "desc" },
      where: { agencyId },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        payments: true,
      },
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserRecentProjects(userId: string | undefined) {
  if (userId) {
    try {
      const projects = await db.project.findMany({
        orderBy: { createdAt: "desc" },
        where: { userId },
        take: 3,
      });
      return await enrichProjects(projects);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

/** Acentenin son süreçleri (acente bazlı dashboard özeti, ERP ilan/mülk ile zenginleştirilmiş). */
export async function getAgencyRecentProjects(
  agencyId: string | undefined | null,
  take = 3
) {
  if (!agencyId) return [];
  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      where: { agencyId },
      take,
    });
    return await enrichProjects(projects);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserPublicFeaturedProjects(userId: string | undefined) {
  if (userId) {
    try {
      const projects = await db.project.findMany({
        orderBy: { createdAt: "desc" },
        where: { userId, isPublic: true },
        include: { user: true },
        take: 4,
      });
      return await enrichProjects(projects);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function getUserPublicOtherProjects(userId: string | undefined) {
  if (userId) {
    try {
      const projects = await db.project.findMany({
        orderBy: { createdAt: "desc" },
        where: { userId, isPublic: true },
        include: { user: true },
        skip: 4,
      });
      return await enrichProjects(projects);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export async function updateProjectById(id: string, data: ProjectProps) {
  try {
    const updatedProject = await db.project.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        notes: data.notes,
        thumbnail: data.thumbnail,
        startDate: data.startDate,
        endDate: data.endDate,
        deadline: data.deadline,
        budget: data.budget,
        budgetLocal: data.budgetLocal,
        status: data.status,
        clientId: data.clientId,
        agencyId: data.agencyId,
        agentId: data.agentId,
        listingId: data.listingId,
        propertyId: data.propertyId,
      },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return updatedProject;
  } catch (error) {
    console.log(error);
  }
}

export async function getProjectById(id: string) {
  try {
    return await db.project.findUnique({ where: { id } });
  } catch (error) {
    console.log(error);
  }
}

export async function getProjectDetailsBySlug(
  slug: string
): Promise<ProjectData | null> {
  try {
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        modules: true,
        comments: true,
        members: true,
        invoices: true,
        payments: true,
        user: true,
      },
    });

    if (!project) return null;

    const [client, listing, property] = await Promise.all([
      project.clientId
        ? db.propertyClient.findUnique({ where: { id: project.clientId } })
        : Promise.resolve(null),
      project.listingId
        ? db.listing.findUnique({ where: { id: project.listingId } })
        : Promise.resolve(null),
      project.propertyId
        ? db.propertyRealEstate.findUnique({ where: { id: project.propertyId } })
        : Promise.resolve(null),
    ]);

    return { ...(project as any), client, listing, property };
  } catch (error) {
    console.error("Süreç detayı alınırken hata:", error);
    return null;
  }
}

export async function deleteProject(id: string) {
  try {
    const deletedProject = await db.project.delete({ where: { id } });
    revalidatePath("/oneproject/dashboard/projects");
    return { ok: true, data: deletedProject };
  } catch (error) {
    console.log(error);
  }
}

export async function updateProjectPublicity(id: string, isPublic: boolean) {
  try {
    const updatedProject = await db.project.update({
      where: { id },
      data: { isPublic },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return { data: updatedProject, ok: true };
  } catch (error) {
    console.log(error);
    return { data: null, ok: false };
  }
}

// ==================== FORM SEÇENEKLERİ (ERP) ====================

/** Acentenin ilanları (form select için: label + value=listingId + propertyId). */
export async function getAgencyListingOptions(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const listings = await db.listing.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        listingNo: true,
        propertyId: true,
        listingType: true,
        askingPrice: true,
        currency: true,
      },
    });
    return listings.map((l) => ({
      label: `${l.title} (${l.listingNo})`,
      value: l.id,
      propertyId: l.propertyId,
      listingType: l.listingType,
      askingPrice: l.askingPrice,
      currency: l.currency,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Acentenin müşterileri (form select için). */
export async function getAgencyClientOptions(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const clients = await db.propertyClient.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true },
    });
    return clients.map((c) => ({
      label: `${c.firstName} ${c.lastName}`,
      value: c.id,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Acentenin danışmanları (form select için). */
export async function getAgencyAgentOptions(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const agents = await db.agent.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true },
    });
    return agents.map((a) => ({
      label: `${a.firstName} ${a.lastName}`,
      value: a.id,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}
