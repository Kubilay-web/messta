"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Parent } from "../../../../types/types";
import { deleteParent } from "../../../../actions/parents";
import { ParentInfoModal } from "../../../../components/dashboard/modals/parent-info-modal";
import { Button } from "../../../../components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";

function ParentActions({ parent }: { parent: Parent }) {
  async function handleDelete() {
    try {
      await deleteParent(parent.id);
      toast.success("Parent deleted");
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <ParentInfoModal parent={parent} />
      <Button asChild size="icon" variant="outline" className="h-8 w-8">
        <Link href={`/management/dashboard/users/parents/edit/${parent.id}`}>
          <Pencil className="w-3.5 h-3.5" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive" className="h-8 w-8">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[92vw] max-w-md bg-white text-black">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {parent.firstName} {parent.lastName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the parent and their user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ParentTable({ parents }: { parents: Parent[] }) {
  if (!parents.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No parents found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Parent", "Contact", "Nationality", "Relationship", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parents.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src={p.imageUrl || "/management/images/student.png"}
                      alt={p.firstName} width={36} height={36}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium capitalize truncate max-w-[140px]">
                        {p.title} {p.firstName.toLowerCase()} {p.lastName.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-400">{p.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-[160px]">{p.email}</p>
                  <p className="text-xs text-gray-400">{p.phone}</p>
                </td>
                <td className="px-4 py-3 text-sm">{p.nationality}</td>
                <td className="px-4 py-3 text-sm">{p.relationship}</td>
                <td className="px-4 py-3">
                  <ParentActions parent={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {parents.map((p) => (
          <div key={p.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Image
                src={p.imageUrl || "/management/images/student.png"}
                alt={p.firstName} width={40} height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold capitalize truncate">
                  {p.title} {p.firstName.toLowerCase()} {p.lastName.toLowerCase()}
                </p>
                <p className="text-xs text-gray-400">{p.relationship} · {p.gender}</p>
              </div>
            </div>
            <div className="px-4 py-2 space-y-1">
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-gray-400">Email</span>
                <span className="font-medium truncate max-w-[200px]">{p.email}</span>
              </div>
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium">{p.phone}</span>
              </div>
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-gray-400">Nationality</span>
                <span className="font-medium">{p.nationality}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <ParentActions parent={p} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
