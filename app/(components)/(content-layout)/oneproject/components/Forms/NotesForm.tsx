"use client";

import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ProjectProps } from "../../types/types";

import { updateProjectById } from "../../actions/projects";
import SubmitButton from "../FormInputs/SubmitButton";
import Editor from "../Editor/advanced-editor";

export type SelectOptionProps = {
  label: string;
  value: string;
};
export default function NotesForm({
  editingId,
  initialNotes,
  isEditable,
}: {
  editingId?: string | undefined;
  initialNotes?: string | undefined | null;
  isEditable: boolean;
}) {
  const [content, setContent] = useState<any>(initialNotes);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectProps>();
  // console.log(content)
  const [loading, setLoading] = useState(false);
  async function updateDescription(data: ProjectProps) {
    try {
      data.notes = JSON.stringify(content);
      // console.log(data);
      setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
        setLoading(false);
        toast.success("Notlar başarıyla güncellendi!");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  return (
    <form className="" onSubmit={handleSubmit(updateDescription)}>
      <div className="grid gap-3">
        <Editor
          isEditable={isEditable}
          initialValue={content}
          onChange={setContent}
        />
        {isEditable && (
          <SubmitButton size={"sm"} title="Güncelle" loading={loading} />
        )}
      </div>
    </form>
  );
}
