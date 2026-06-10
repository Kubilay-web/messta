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
import { Check, Edit, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { TaskProps } from "../../types/types";
import toast from "react-hot-toast";

import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmitButton";

import { TaskStatus } from "@prisma/client";
import { createTask, updateTaskById } from "../../actions/tasks";

export default function TaskForm({
  moduleId,
  initialTitle,
  initialStatus,
  isDefault = false,
  editingId,
}: {
  moduleId: string;
  initialTitle?: string;
  initialStatus: TaskStatus;
  editingId?: string;
  isDefault?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskProps>({
    defaultValues: { title: initialTitle || "" },
  });

  const [loading, setLoading] = useState(false);

  async function saveModule(data: TaskProps) {
    data.moduleId = moduleId;
    data.status = initialStatus;
    try {
      setLoading(true);
      if (editingId) {
        await updateTaskById(editingId, data);
        toast.success("Başarıyla güncellendi!");
      } else {
        await createTask(data);
        toast.success("Başarıyla oluşturuldu!");
      }
      setLoading(false);
      reset();
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Bir şeyler ters gitti!");
    }
  }

  return (
    <div className="py-2">
      <Dialog>
        <DialogTrigger asChild>
          {editingId ? (
            <Button
              variant="ghost"
              className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300 z-50"
            >
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          ) : (
            <Button
              variant={isDefault ? "default" : "ghost"}
              className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isDefault && <span>Yeni Görev Ekle</span>}
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md mx-auto mt-20">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Görevi Düzenle" : "Yeni Görev Ekle"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(saveModule)} className="mt-4 space-y-4">
            <TextInput
              register={register}
              errors={errors}
              label=""
              name="title"
              // icon={Check}
              className="bg-gray-50 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />

            <div className="pt-2">
              <SubmitButton
                title={editingId ? "Güncelle" : "Ekle"}
                loading={loading}
                className="w-full bg-black text-white hover:bg-gray-800"
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}