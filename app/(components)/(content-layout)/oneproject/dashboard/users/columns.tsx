"use client";

import Image from "next/image";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";


import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";



import DateColumn from "../../components/DataTableColumns/DateColumn";
import ImageColumn from "../../components/DataTableColumns/ImageColumn";
import SortableColumn from "../../components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import ActionColumn from "../../components/DataTableColumns/ActionColumn";
import { User as PrismaUser, Project } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";



import { timeAgo } from "../../lib/timeAgo";
import Link from "next/link";
interface User extends PrismaUser {
  projects: Project[];
}
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "image",
    header: "Görsel",
    cell: ({ row }) => <ImageColumn row={row} accessorKey="image" />,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Ad" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableColumn column={column} title="E-posta" />,
  },
  {
    accessorKey: "comment",
    header: "Görüntüle",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button size={"sm"} variant={"outline"}>
              Görüntüle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-4 border-b pb-4">
                  <Image
                    src={user.image ?? ""}
                    alt={user.name ?? ""}
                    width={300}
                    height={300}
                    className="h-16 w-16 rounded-full"
                  />
                  <div className="">
                    <p className="mt-1">{user.name}</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
              </DialogTitle>
              <div className="py-6">
                <h2 className="border-b pb-2 text-2xl font-semibold mb-2">
                  Süreçler ({user.projects.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {user.projects.map((pro) => {
                    return (
                      <Link
                        key={pro.id}
                        className=""
                        href={pro.freeDomain ?? "#"}
                      >
                        {pro.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <p>Oluşturulma : {timeAgo(user.createdAt.toString())}</p>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Süreçler",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="">
          <p>{user.projects.length}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Ne zaman",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="">
          <p> {timeAgo(user.createdAt.toString())}</p>
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
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <ActionColumn
          row={row}
          model="user"
          editEndpoint=""
          id={user.id}
        />
      );
    },
  },
];
