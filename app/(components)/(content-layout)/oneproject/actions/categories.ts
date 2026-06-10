"use server";

import db from "@/app/lib/db";
import { CategoryProps } from "../types/types";
import { revalidatePath } from "next/cache";

export async function createCategory(data: CategoryProps) {
  const slug = data.slug;
  try {
    const existingCategory = await db.categoryProject.findUnique({
      where: {
        slug,
      },
    });
    if (existingCategory) {
      return existingCategory;
    }
    const newCategory = await db.categoryProject.create({
      data,
    });
    // console.log(newCategory);
    revalidatePath("/oneproject/dashboard/categories");
    return newCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllCategories(agencyId?: string | null) {
  try {
    const categories = await db.categoryProject.findMany({
      where: agencyId ? { agencyId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Her kategoriyi bağlı ERP mülk tipi (+ varsa ilan tipi) canlı sayısıyla zenginleştir
    const enriched = await Promise.all(
      categories.map(async (c: any) => {
        let propertyCount = 0;
        let listingCount = 0;
        if (agencyId && c.propertyType) {
          const propertyWhere = { is: { propertyType: c.propertyType as any } };
          [propertyCount, listingCount] = await Promise.all([
            db.propertyRealEstate.count({
              where: { agencyId, propertyType: c.propertyType as any },
            }),
            db.listing.count({
              where: {
                agencyId,
                property: propertyWhere,
                // Kategoride ilan tipi belirtilmişse (Satılık/Kiralık) ilanları ona göre de filtrele
                ...(c.listingType ? { listingType: c.listingType as any } : {}),
              },
            }),
          ]);
        }
        return { ...c, propertyCount, listingCount };
      })
    );

    return enriched;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function updateCategoryById(id: string, data: CategoryProps) {
  try {
    const updatedCategory = await db.categoryProject.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/oneproject/dashboard/categories");
    return updatedCategory;
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
    revalidatePath("/oneproject/dashboard/categories");
    return {
      ok: true,
      data: deletedCategory,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function createBulkCategories(categories: CategoryProps[]) {
  try {
    for (const category of categories) {
      await createCategory(category);
    }
  } catch (error) {
    console.log(error);
  }
}
