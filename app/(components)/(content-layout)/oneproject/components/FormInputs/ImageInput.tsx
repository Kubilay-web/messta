"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";

type ImageInputProps = {
  title: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
};

export default function ImageInput({
  title,
  imageUrl,
  setImageUrl,
}: ImageInputProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Image
            alt={title}
            className="h-40 w-full rounded-md object-cover"
            height={300}
            width={300}
            src={imageUrl}
          />

          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleUpload(e.target.files[0]);
              }
            }}
          />

          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() =>
              document.getElementById("imageUpload")?.click()
            }
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
