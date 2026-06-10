"use server";

import db from "@/app/lib/db";
import {
  CategoryProps,
  CommentProps,
  ModuleProps,
  TaskProps,
} from "../types/types";



import { TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
export async function createTask(data: TaskProps) {
  try {
    // Acente kapsamını bağlı modülden türet
    const moduleRec = await db.module.findUnique({
      where: { id: data.moduleId },
      select: { agencyId: true },
    });
    const newTask = await db.task.create({
      data: { ...data, agencyId: moduleRec?.agencyId ?? null },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return newTask;
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
export async function updateTaskById(id: string, data: TaskProps) {
  try {
    const updatedTask = await db.task.update({
      where: {
        id,
      },
      data,
    });
     revalidatePath("/oneproject/dashboard/projects");
    return updatedTask;
  } catch (error) {
    console.log(error);
  }
}
export async function updateTaskStatus(id: string, status: TaskStatus) {
  try {
    const updatedTask = await db.task.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    revalidatePath("/oneproject/dashboard/projects");
    return updatedTask;
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
export async function deleteTask(id: string) {
  try {
    const deletedTask = await db.task.delete({
      where: {
        id,
      },
    });
   revalidatePath("/oneproject/dashboard/projects");
    return {
      ok: true,
      data: deletedTask,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      data: null,
    };
  }
}




export async function updateTaskStatusJob(taskId: string, status: "TODO" | "INPROGRESS" | "COMPLETE") {
  return await db.task.update({
    where: { id: taskId },
    data: { status },
  });
}