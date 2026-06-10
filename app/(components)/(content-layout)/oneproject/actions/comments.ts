"use server";

import db from "@/app/lib/db";
import { CategoryProps, CommentProps } from "../types/types";
import { revalidatePath } from "next/cache";

export async function createComment(data: CommentProps) {
  try {
    // Acente kapsamını bağlı süreçten (Project) türet
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      select: { agencyId: true },
    });
    const newComment = await db.projectComment.create({
      data: { ...data, agencyId: project?.agencyId ?? null } as any,
    });
    revalidatePath("/oneproject/dashboard/projects");
    return newComment;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllCategories() {
  try {
    const categories = await db.categoryProject.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function updateCommentById(id: string, data: CommentProps) {
  try {
    const updatedComment = await db.projectComment.update({
      where: {
        id,
      },
      data: data as any,
    });
    revalidatePath("/oneproject/dashboard/projects");
    return updatedComment;
  } catch (error) {
    console.log(error);
  }
}
export async function getCategoryById(id: string) {
  try {
    const category = await db.categoryProject.findUnique({
      where: {
        id,
      },
    });
    return category;
  } catch (error) {
    console.log(error);
  }
}
export async function deleteCategory(id: string) {
  try {
    const deletedCategory = await db.categoryProject.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedCategory,
    };
  } catch (error) {
    console.log(error);
  }
}
