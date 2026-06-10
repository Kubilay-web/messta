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
import { Check, Pen, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { ModuleProps } from "../../types/types";
import { createModule, updateModuleById } from "../../actions/modules";
import toast from "react-hot-toast";
import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmitButton";

export default function ModuleForm({
  projectId,
  userId,
  userName,
  initialContent,
  editingId,
}: {
  projectId: string;
  userId: string;
  userName: string;
  initialContent?: string;
  editingId?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModuleProps>({
    defaultValues: {
      name: initialContent || "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function saveModule(data: ModuleProps) {
    data.userName = userName;
    data.projectId = projectId;
    data.userId = userId;

    try {
      setLoading(true);
      if (editingId) {
        await updateModuleById(editingId, data);
        toast.success("Başarıyla güncellendi!");
      } else {
        await createModule(data);
        toast.success("Başarıyla oluşturuldu!");
      }
    } catch (error) {
      console.log(error);
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
            <Button variant="outline" className="w-full bg-white text-black border-gray-300 hover:bg-gray-100">
              <Plus className="mr-2 h-4 w-4" /> Aşama Ekle
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-white text-black rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Aşamayı Düzenle" : "Yeni Aşama Ekle"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(saveModule)} className="space-y-4 mt-4">
            <TextInput
              register={register}
              errors={errors}
              label="Aşama Adı"
              name="name"
              // icon={Check}
              className="bg-white text-black border-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <SubmitButton
                title={editingId ? "Güncelle" : "Ekle"}
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
