// "use client";
// import React, { useState } from "react";
// import { Button } from "../../components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "../../components/ui/alert-dialog";
// import { MoreHorizontal, Pencil, Trash } from "lucide-react";
// import { deleteCategory } from "../../actions/categories";
// import toast from "react-hot-toast";
// import Link from "next/link";
// import { deleteUser } from "../../actions/users";
// import { deleteProject } from "../../actions/projects";

// type ActionColumnProps = {
//   row: any;
//   model: any;
//   editEndpoint: string;
//   id: string | undefined;
// };

// export default function ActionColumn({
//   row,
//   model,
//   editEndpoint,
//   id = "",
// }: ActionColumnProps) {
//   const [loading, setLoading] = useState(false);

//   async function handleDelete() {
//     try {
//       if (model === "category") {
//         const res = await deleteCategory(id);
//         if (res?.ok) toast.success(`${model} Deleted Successfully`);
//       } else if (model === "client") {
//         const res = await deleteUser(id);
//         if (res?.ok) toast.success(`${model} Deleted Successfully`);
//       } else if (model === "project") {
//         const res = await deleteProject(id);
//         if (res?.ok) toast.success(`${model} Deleted Successfully`);
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(`${model} Couldn't be deleted`);
//     }
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           className="h-8 w-8 p-0 bg-white text-black hover:bg-gray-100"
//         >
//           <span className="sr-only">Open menu</span>
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         align="end"
//         className="bg-white text-black border border-gray-200"
//       >
//         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//         <DropdownMenuSeparator />

//         <AlertDialog>
//           <AlertDialogTrigger asChild>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-red-600 hover:text-red-700 transition-all duration-300 flex items-center gap-2"
//             >
//               <Trash className="w-4 h-4" />
//               <span>Delete</span>
//             </Button>
//           </AlertDialogTrigger>

//           <AlertDialogContent className="bg-white text-black border border-gray-200">
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete this{" "}
//                 {model}.
//               </AlertDialogDescription>
//             </AlertDialogHeader>

//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <Button
//                 variant="destructive"
//                 onClick={() => handleDelete()}
//                 className="bg-red-600 text-white hover:bg-red-700"
//               >
//                 Permanently Delete
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>

//         <DropdownMenuItem className="flex items-center gap-2 text-black hover:bg-gray-100">
//           <Link href={editEndpoint} className="flex items-center gap-2">
//             <Pencil className="w-4 h-4" />
//             <span>Edit</span>
//           </Link>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }








"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { deleteCategory } from "../../actions/categories";
import { deletePropertyClient } from "../../actions/clients";
import { deleteProject } from "../../actions/projects";
import { deleteUser } from "../../actions/users";
import { deleteLead } from "../../actions/leads";
import toast from "react-hot-toast";
import Link from "next/link";

type ActionColumnProps = {
  row: any;
  model: "category" | "client" | "project" | "user" | "lead";
  editEndpoint: string;
  id: string | undefined;
};

export default function ActionColumn({
  row,
  model,
  editEndpoint,
  id = "",
}: ActionColumnProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    setLoading(true);

    try {
      if (model === "category") {
        const res = await deleteCategory(id);
        if (res?.ok) toast.success("Başarıyla silindi");
      } else if (model === "client") {
        const res = await deletePropertyClient(id);
        if (res?.ok) toast.success("Müşteri başarıyla silindi");
      } else if (model === "project") {
        const res = await deleteProject(id);
        if (res?.ok) toast.success("Başarıyla silindi");
      } else if (model === "user") {
        const res = await deleteUser(id);
        if (res?.ok) toast.success("Kullanıcı başarıyla silindi");
      } else if (model === "lead") {
        const res = await deleteLead(id);
        if (res?.ok) toast.success("Lead başarıyla silindi");
      }

      // Sayfayı yeniden yükle (force reload)
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Kayıt silinemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 bg-white text-black hover:bg-gray-100"
        >
          <span className="sr-only">Menüyü aç</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-white text-black border border-gray-200"
      >
        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 transition-all duration-300 flex items-center gap-2"
            >
              <Trash className="w-4 h-4" />
              <span>Sil</span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-white text-black border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Bu kayıt kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={loading}
              >
                Kalıcı Olarak Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {editEndpoint ? (
          <DropdownMenuItem className="flex items-center gap-2 text-black hover:bg-gray-100">
            <Link href={editEndpoint} className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              <span>Düzenle</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}