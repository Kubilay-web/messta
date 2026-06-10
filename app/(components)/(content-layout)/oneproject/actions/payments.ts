"use server";

import db from "@/app/lib/db";
import { CategoryProps, InvoiceDetails, PaymentProps } from "../types/types";



import { revalidatePath } from "next/cache";

export async function createPayment(data: PaymentProps) {
  try {
    const payment = await db.payment.create({
      data,
    });
    revalidatePath("/oneproject/dashboard/projects");
    revalidatePath("/oneproject/dashboard/payments");
    return payment;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getInvoiceById(id: string) {
  try {
    const payment = await db.payment.findUnique({
      where: {
        id,
      },
    });
    if (!payment) {
      return null;
    }
    const propertyClient = await db.propertyClient.findUnique({
      where: { id: payment?.clientId },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });
    const client = propertyClient
      ? {
          name: `${propertyClient.firstName} ${propertyClient.lastName}`,
          phone: propertyClient.phone,
          email: propertyClient.email,
          companyName: "",
          companyDescription: "",
        }
      : null;
    const user = await db.user.findFirst({
      where: {
        id: payment?.userId,
        OR: [{ roleproject: "USER" }, { roleproject: "ADMIN" }],
      },
      select: {
        name: true,
        phone: true,
        email: true,
        companyName: true,
        companyDescription: true,
        userLogo: true,
      },
    });
    return {
      invoice: payment,
      user,
      client,
    } as InvoiceDetails;
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


export async function deletePayment(id: string) {
  try {
    const deletedPayment = await db.payment.delete({
      where: {
        id,
      },
    });
    revalidatePath("/oneproject/dashboard/projects");
    revalidatePath("/oneproject/dashboard/payments");
    return {
      ok: true,
      data: deletedPayment,
    };
  } catch (error) {
    console.log(error);
  }
}
