"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../ui/button";
import { MessageSquare, Pen } from "lucide-react";
import { useForm } from "react-hook-form";
import { CommentProps } from "../../types/types";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import SubmitButton from "../FormInputs/SubmitButton";
import { createComment, updateCommentById } from "../../actions/comments";
import { Role } from "@prisma/client";

const QuillEditor = dynamic(
  () => import("../../components/FormInputs/QuilEditor"),
  { ssr: false }
);

export default function CommentForm({
  projectId,
  userId,
  userName,
  userRole,
  initialContent,
  editingId,
}: {
  projectId: string;
  userId: string;
  userName: string;
  userRole: Role;
  initialContent?: string;
  editingId?: string;
}) {
  const { handleSubmit } = useForm<CommentProps>();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(initialContent ?? "");

  async function saveComment(data: CommentProps) {
    if (!content) {
      toast.error("Lütfen bir şeyler yazın");
      return;
    }

    data.content = content;
    data.userName = userName;
    data.projectId = projectId;
    data.userRole = userRole;
    data.userId = userId;

    try {
      setLoading(true);
      if (editingId) {
        await updateCommentById(editingId, data);
        toast.success("Başarıyla güncellendi!");
      } else {
        await createComment(data);
        toast.success("Başarıyla oluşturuldu!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Bir şeyler ters gitti!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          {editingId ? (
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-black">
              <Pen className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <Button
              variant="outline"
              className="w-full bg-white text-black border-gray-300 hover:bg-gray-100"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Yorum Ekle
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="bg-white text-black rounded-lg p-6 shadow-lg max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Yorumu Düzenle" : "Yeni Yorum Ekle"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(saveComment)} className="space-y-4 mt-4">
            <QuillEditor
              value={content}
              onChange={setContent}
              className="bg-white text-black border border-gray-300 rounded-md min-h-[150px] p-2"
              label=""
            />

            <div className="flex justify-end">
              <SubmitButton
                title={editingId ? "Yorumu Güncelle" : "Yorum Ekle"}
                loading={loading}
                className="bg-black text-white hover:bg-gray-800"
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
