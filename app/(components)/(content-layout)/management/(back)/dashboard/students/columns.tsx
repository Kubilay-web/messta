"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "../../../types/types";
import { StudentInfoModal } from "../../../components/dashboard/modals/student-info-modal";
import { Button } from "../../../components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteStudent } from "../../../actions/students";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";

function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to delete student");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-black max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the student and their user account. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "student",
    header: "Name",
    cell: ({ row }) => {
      const student = row.original;
      const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
      return (
        <div className="flex items-center gap-2">
          <Image
            src={student.imageUrl || "/management/images/student.png"}
            alt={student.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm capitalize truncate">
              {student.firstName.toLowerCase()} {student.lastName.toLowerCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              Age: {age} · {student.gender}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{student.regNo}</p>
          <p className="text-xs text-muted-foreground truncate">
            Guardian: {student.parentName}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{student.classTitle ?? ""}</p>
          <p className="text-xs text-muted-foreground truncate">{student.streamTitle ?? ""}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <StudentInfoModal student={student} />
          <Button asChild size="icon" variant="outline">
            <Link href={`/management/dashboard/students/view/${student.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline">
            <Link href={`/management/dashboard/students/edit/${student.id}`}>
              <Pencil className="w-4 h-4" />
            </Link>
          </Button>
          <DeleteButton id={student.id} />
        </div>
      );
    },
  },
];
