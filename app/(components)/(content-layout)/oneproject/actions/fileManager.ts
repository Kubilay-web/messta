"use server";

import db from "@/app/lib/db";
import { FileProps, FolderProps, UserFolder } from "../types/types";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// 🌟 Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,


});

export async function createFolder(data: FolderProps) {
  try {
    const newFolder = await db.folder.create({ data });
    revalidatePath("/oneproject/dashboard/file-manager");
    return newFolder;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateFolderById(id: string, data: FolderProps) {
  try {
    const updatedFolder = await db.folder.update({ where: { id }, data });
    revalidatePath("/oneproject/dashboard/file-manager");
    return updatedFolder;
  } catch (error) {
    console.log(error);
  }
}

export async function updateFileById(id: string, data: FileProps) {
  try {
    const updatedFile = await db.file.update({ where: { id }, data });
    revalidatePath("/oneproject/dashboard/file-manager");
    return updatedFile;
  } catch (error) {
    console.log(error);
  }
}

export async function createFile(data: FileProps) {
  try {
    const newFile = await db.file.create({ data });
    revalidatePath("/oneproject/dashboard/file-manager");
    return newFile;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createMultipleFiles(files: FileProps[]) {
  try {
    const createdFiles = await Promise.all(files.map((file) => createFile(file)));
    const successfulFiles = createdFiles.filter((file) => file !== null);
    revalidatePath("/oneproject/dashboard/file-manager");
    return successfulFiles;
  } catch (error) {
    console.log("Error creating files:", error);
    return [];
  }
}

export async function getUserFolders(userId: string | undefined) {
  if (!userId) return null;
  try {
    const folders = await db.folder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { files: true },
    });
    return folders as UserFolder[];
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Acentenin tüm klasörleri (acente bazlı paylaşımlı dosya yöneticisi). */
export async function getAgencyFolders(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    const folders = await db.folder.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      include: { files: true },
    });
    return folders as UserFolder[];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function deleteFolder(id: string) {
  try {
    const deletedFolder = await db.folder.delete({ where: { id } });
    revalidatePath("/oneproject/dashboard/file-manager");
    return { ok: true, data: deletedFolder };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

// 🌟 Yeni: Cloudinary’den de sil


export async function deleteFile(id: string) {
  try {
    // 1️⃣ Veritabanından dosya bilgisi
    const file = await db.file.findUnique({ where: { id } });
    if (!file) throw new Error("File not found");

    // 2️⃣ publicId ve extension
    const urlParts = file.url.split("/");
    const publicIdWithExt = urlParts.slice(-1)[0]; // örn: h3u00by4ydb7skxxarbl.avif
    const parts = publicIdWithExt.split(".");
    const ext = parts.pop()?.toLowerCase() || "";
    const publicId = parts.join(".");

    // 3️⃣ Cloudinary resource_type belirleme
    // URL’den kontrol (image/video/raw)
    let resourceType: "image" | "video" | "raw" = "raw";
    if (file.url.includes("/image/")) resourceType = "image";
    else if (file.url.includes("/video/")) resourceType = "video";
    else resourceType = "raw";

    // 4️⃣ Cloudinary’den sil
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

    // 5️⃣ Veritabanından sil
    const deletedFile = await db.file.delete({ where: { id } });
    revalidatePath("/oneproject/dashboard/file-manager");

    return { ok: true, data: deletedFile };
  } catch (error) {
    console.log("Failed to delete file:", error);
    return { ok: false, data: null };
  }
}

