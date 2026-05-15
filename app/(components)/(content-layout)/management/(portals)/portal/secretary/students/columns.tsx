"use client";

import Image from "next/image";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";


import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../../../components/DataTableColumns/ActionColumn";
import { Student } from "../../../../types/types";
import { ParentInfoModal } from "../../../../components/dashboard/modals/parent-info-modal";
import { StudentInfoModal } from "../../../../components/dashboard/modals/student-info-modal";
import { Button } from "../../../../components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "student",
    header: "Name",
    cell: ({ row }) => {
      const student = row.original;
      const dob = student.dob;
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      return (
        <div className="flex items-center gap-1">
          <Image
            src={student.imageUrl}
            alt={student.firstName}
            width={512}
            height={512}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="">
            <h2 className="font-medium capitalize">
              {student.firstName.toLowerCase()} {student.lastName.toLowerCase()}
            </h2>
            <p className="text-xs text-muted-foreground">
              Age : {age} Gender: {student.gender}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email-phone",
    header: "Details",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="">
          <h2 className="font-medium">{student.regNo}</h2>
          <p className="text-xs text-muted-foreground">
            Guardian : {student?.parentName}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "class-stream",
    header: "Class",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="">
          <h2 className="font-medium">{student.classTitle ?? ""}</h2>
          <p className="text-xs text-muted-foreground">
            {student.streamTitle ?? ""}
          </p>
        </div>
      );
    },
  },

  // {
  //   accessorKey: "createdAt",
  //   header: "Date Created",
  //   cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  // },

  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-6">
          <StudentInfoModal student={row.original} />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild size={"icon"} variant={"outline"}>
                  <Link href={`/portal/secretary/students/view/${student.id}`}>
                    <Eye />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <ActionColumn
          row={row}
          model="contact"
          editEndpoint={`#`}
          id={contact.id}
        />
      );
    },
  },
];
