"use server";

import db from "@/app/lib/db";
import {
  CategoryProps,
  CommentProps,
  ModuleProps,
  PortfolioProps,
  TaskProps,
} from "../types/types";


import { TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
export async function createPortfolioProfile(data: PortfolioProps) {
  try {
    const newPortfolio = await db.portfolioProfile.create({
      data,
    });
    revalidatePath("/oneproject/dashboard/portfolio");
    return newPortfolio;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updatePortfolioById(id: string, data: PortfolioProps) {
  try {
    const updatedPo = await db.portfolioProfile.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/oneproject/dashboard/portfolio");
    return updatedPo;
  } catch (error) {
    console.log(error);
  }
}
export async function getPortfolioByUserId(userId: string) {
  try {
    const data = await db.portfolioProfile.findUnique({
      where: {
        userId,
      },
    });
    // revalidatePath("/oneproject/portfolio");
    return data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Portföyü ERP `Agent` profiline bağlar: danışmanın ERP kaydından ön-doldurma
 * verileri ve gerçek ilan sayısını döner. Danışman değilse null.
 */
export async function getAgentPortfolioInfo(userId: string | undefined) {
  if (!userId) return null;
  try {
    const agent = await db.agent.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        imageUrl: true,
        bio: true,
        agencyId: true,
        agencyName: true,
        specializationCities: true,
      },
    });
    if (!agent) return null;

    const listingCount = await db.listing.count({
      where: { agentId: agent.id },
    });

    return {
      agentId: agent.id,
      name: `${agent.firstName} ${agent.lastName}`.trim(),
      email: agent.email ?? "",
      profileImage: agent.imageUrl ?? "",
      description: agent.bio ?? "",
      location: agent.specializationCities?.[0] ?? "",
      agencyId: agent.agencyId,
      listingCount,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
