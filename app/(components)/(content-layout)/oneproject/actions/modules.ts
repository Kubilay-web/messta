"use server";

import db from "@/app/lib/db";
import { CategoryProps, CommentProps, ModuleProps } from "../types/types";


import { revalidatePath } from "next/cache";
export async function createModule(data: ModuleProps) {
  try {
    // Acente kapsamını bağlı süreçten (Project) türet
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      select: { agencyId: true },
    });
    const newModule = await db.module.create({
      data: { ...data, agencyId: project?.agencyId ?? null },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return newModule;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getProjectModules(projectId: string | undefined) {
  if (projectId) {
    try {
      const modules = await db.module.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          projectId,
        },
        include: {
          tasks: true,
        },
      });

      return modules;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
export async function updateModuleById(id: string, data: ModuleProps) {
  try {
    const updatedModule = await db.module.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/oneproject/dashboard/projects");
    return updatedModule;
  } catch (error) {
    console.log(error);
  }
}
export async function getModuleById(id: string) {
  try {
    const module = await db.module.findUnique({
      where: {
        id,
      },
    });
    return module;
  } catch (error) {
    console.log(error);
  }
}
export async function deleteModule(id: string) {
  try {
    const deletedModule = await db.module.delete({
      where: {
        id,
      },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return {
      ok: true,
      data: deletedModule,
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
    };
    console.log(error);
  }
}
