// "use client";
// import { useState } from "react";
// import {
//   Folder,
//   ArrowLeft,
//   X,
//   Trash2,
//   Download,
// } from "lucide-react";
// import { ScrollArea } from "../../components/ui/scroll-area";
// import { Button } from "../../components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetClose,
// } from "../../components/ui/sheet";

// import Link from "next/link";
// import FolderForm from "../Forms/FolderForm";
// import { UserFolder } from "../../types/types";
// import { useSearchParams } from "next/navigation";
// import { cn } from "@/app/lib/utils";
// import FileUploadForm from "../Forms/FileUploadForm";
// import { File as PrismaFile } from "@prisma/client";
// import { getNormalDate } from "../../lib/getNormalDate";
// import { formatBytes } from "../../lib/formatBytes";
// import { getModifiedDate } from "../../lib/getModifiedDate";
// import {
//   FaFileAlt,
//   FaFileArchive,
//   FaFileExcel,
//   FaFilePdf,
//   FaFilePowerpoint,
//   FaFileWord,
//   FaImage,
// } from "react-icons/fa";
// import { MdTextSnippet } from "react-icons/md";
// import { deleteFile, deleteFolder } from "../../actions/fileManager";
// import toast from "react-hot-toast";

// const VibrantProgress = ({ value }: { value: number }) => {
//   const getColorClass = (percentage: number) =>
//     percentage > 50 ? "bg-red-500" : "bg-green-500";

//   return (
//     <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
//       <div
//         className={`h-full ${getColorClass(value)}`}
//         style={{ width: `${value}%` }}
//       />
//     </div>
//   );
// };

// export default function FileManager({
//   userId,
//   userFolders,
// }: {
//   userId: string;
//   userFolders: UserFolder[];
// }) {
//   const [selectedFile, setSelectedFile] = useState<PrismaFile | null>(null);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);
//   const [extension, setExtension] = useState("");

//   const params = useSearchParams();
//   const selectedFolderId = params.get("fId") ?? "";

//   const selectedFolder =
//     userFolders.find((f) => f.id === selectedFolderId) ||
//     userFolders[0] || { files: [], name: "", id: "" };

//   const usedSpace = selectedFolder.files.reduce(
//     (acc, item) => acc + item.size,
//     0
//   );

//   function getFileIcon(extension?: string) {
//     const base =
//       "w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-lg";
//     switch (extension) {
//       case "pdf":
//         return <div className={`${base} bg-red-200`}><FaFilePdf className="text-red-600" /></div>;
//       case "jpg":
//       case "jpeg":
//       case "png":
//         return <div className={`${base} bg-blue-200`}><FaImage className="text-blue-600" /></div>;
//       case "doc":
//       case "docx":
//         return <div className={`${base} bg-blue-200`}><FaFileWord className="text-blue-600" /></div>;
//       case "xls":
//       case "xlsx":
//         return <div className={`${base} bg-green-200`}><FaFileExcel className="text-green-600" /></div>;
//       case "ppt":
//       case "pptx":
//         return <div className={`${base} bg-orange-200`}><FaFilePowerpoint className="text-orange-600" /></div>;
//       case "zip":
//         return <div className={`${base} bg-yellow-200`}><FaFileArchive className="text-yellow-700" /></div>;
//       case "txt":
//         return <div className={`${base} bg-gray-200`}><MdTextSnippet className="text-gray-700" /></div>;
//       default:
//         return <div className={`${base} bg-gray-200`}><FaFileAlt className="text-gray-700" /></div>;
//     }
//   }

//   return (
//     <div className="flex flex-wrap h-screen bg-white text-black mt-4">
//       {/* SIDEBAR */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4 flex justify-between">
//           <h2 className="font-semibold">Folders</h2>
//           <FolderForm userId={userId} />
//         </div>

//         <ScrollArea className="h-[calc(100vh-60px)]">
//           {userFolders.map((folder) => (
//             <Link
//               key={folder.id}
//               href={`/oneproject/dashboard/file-manager?fId=${folder.id}`}
//               className={cn(
//                 "flex items-center p-4 border-b border-gray-200 hover:bg-gray-100",
//                 selectedFolder.id === folder.id && "bg-gray-100"
//               )}
//             >
//               <Folder className="mr-2 text-blue-600" />
//               <div>
//                 <div className="font-medium">{folder.name}</div>
//                 <div className="text-sm text-gray-700">
//                   {folder.files.length} öğe ·{" "}
//                   {formatBytes(
//                     folder.files.reduce((a, b) => a + b.size, 0)
//                   )}
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </ScrollArea>
//       </div>

//       {/* MAIN */}
//       <div className="flex-1 overflow-auto bg-white">
//         <div className="p-4 flex justify-between items-center border-b border-gray-200">
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon">
//               <ArrowLeft />
//             </Button>
//             <span className="text-lg font-semibold">{selectedFolder.name}</span>
//             <FolderForm
//               initialContent={selectedFolder.name}
//               editingId={selectedFolder.id}
//               userId={userId}
//             />
//             <button
//               onClick={() => deleteFolder(selectedFolder.id)}
//               className="text-red-600"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//           <FileUploadForm folderId={selectedFolder.id} />
//         </div>

//         <div className="p-4">
//           <div className="mb-4">
//             <div className="text-sm text-gray-700">
//               Folders / {selectedFolder.name}
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <VibrantProgress value={65} />
//               <span className="text-sm text-gray-800">
//                 {formatBytes(usedSpace)} used
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-4 gap-4">
//             {selectedFolder.files.map((file) => {
//               const ext = file.name.split(".").pop();
//               return (
//                 <button
//                   key={file.id}
//                   onClick={() => {
//                     setSelectedFile(file);
//                     setExtension(ext || "");
//                     setIsSheetOpen(true);
//                   }}
//                   className="p-4 border border-gray-200 rounded-lg hover:bg-gray-100 text-black"
//                 >
//                   {getFileIcon(ext)}
//                   <div className="text-sm truncate">{file.name}</div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* SHEET */}
//       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//         <SheetContent className="bg-white text-black">
//           <SheetHeader>
//             <SheetTitle>File Information</SheetTitle>
//             <SheetClose asChild>
//               <Button variant="ghost" size="icon">
//                 <X />
//               </Button>
//             </SheetClose>
//           </SheetHeader>

//           {selectedFile && (
//             <div className="mt-4 space-y-2">
//               {getFileIcon(extension)}
//               <div className="font-semibold text-center">
//                 {selectedFile.name}
//               </div>

//               <div className="text-sm space-y-1">
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Created</span>
//                   <span>{getNormalDate(selectedFile.createdAt)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Size</span>
//                   <span>{formatBytes(selectedFile.size)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-700">Last Modified</span>
//                   <span>{getModifiedDate(selectedFile.updatedAt)}</span>
//                 </div>
//               </div>

//               <div className="flex gap-2 pt-4">
//                 <Button
//                   onClick={() =>
//                     window.open(selectedFile.url, "_blank")
//                   }
//                 >
//                   <Download className="mr-2 h-4 w-4" />
//                   Download
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   onClick={() => deleteFile(selectedFile.id)}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Delete
//                 </Button>
//               </div>
//             </div>
//           )}
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// }








"use client";
import { useState } from "react";
import {
  Folder,
  ArrowLeft,
  X,
  Trash2,
  Download,
} from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "../../components/ui/sheet";

import Link from "next/link";
import FolderForm from "../Forms/FolderForm";
import { UserFolder } from "../../types/types";
import { useSearchParams } from "next/navigation";
import { cn } from "@/app/lib/utils";
import FileUploadForm from "../Forms/FileUploadForm";
import { File as PrismaFile } from "@prisma/client";
import { getNormalDate } from "../../lib/getNormalDate";
import { formatBytes } from "../../lib/formatBytes";
import { getModifiedDate } from "../../lib/getModifiedDate";
import {
  FaFileAlt,
  FaFileArchive,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaImage,
} from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import { deleteFile, deleteFolder } from "../../actions/fileManager";

const VibrantProgress = ({ value }: { value: number }) => {
  const getColorClass = (percentage: number) =>
    percentage > 50 ? "bg-red-500" : "bg-green-500";

  return (
    <div className="w-full md:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${getColorClass(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default function FileManager({
  userId,
  agencyId,
  userFolders,
}: {
  userId: string;
  agencyId?: string;
  userFolders: UserFolder[];
}) {
  const [selectedFile, setSelectedFile] = useState<PrismaFile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [extension, setExtension] = useState("");

  const params = useSearchParams();
  const selectedFolderId = params.get("fId") ?? "";

  const selectedFolder =
    userFolders.find((f) => f.id === selectedFolderId) ||
    userFolders[0] || { files: [], name: "", id: "" };

  const usedSpace = selectedFolder.files.reduce(
    (acc, item) => acc + item.size,
    0
  );

  function getFileIcon(extension?: string) {
    const base =
      "w-14 h-14 md:w-16 md:h-16 mx-auto mb-2 flex items-center justify-center rounded-lg";

    switch (extension) {
      case "pdf":
        return <div className={`${base} bg-red-200`}><FaFilePdf className="text-red-600" /></div>;
      case "jpg":
      case "jpeg":
      case "png":
        return <div className={`${base} bg-blue-200`}><FaImage className="text-blue-600" /></div>;
      case "doc":
      case "docx":
        return <div className={`${base} bg-blue-200`}><FaFileWord className="text-blue-600" /></div>;
      case "xls":
      case "xlsx":
        return <div className={`${base} bg-green-200`}><FaFileExcel className="text-green-600" /></div>;
      case "ppt":
      case "pptx":
        return <div className={`${base} bg-orange-200`}><FaFilePowerpoint className="text-orange-600" /></div>;
      case "zip":
        return <div className={`${base} bg-yellow-200`}><FaFileArchive className="text-yellow-700" /></div>;
      case "txt":
        return <div className={`${base} bg-gray-200`}><MdTextSnippet className="text-gray-700" /></div>;
      default:
        return <div className={`${base} bg-gray-200`}><FaFileAlt className="text-gray-700" /></div>;
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white text-black mt-4">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200">
        <div className="p-4 flex justify-between items-center">
          <h2 className="font-semibold">Klasörler</h2>
          <FolderForm userId={userId} agencyId={agencyId} />
        </div>

        <ScrollArea className="h-[200px] md:h-[calc(100vh-60px)]">
          {userFolders.map((folder) => (
            <Link
              key={folder.id}
              href={`/oneproject/dashboard/file-manager?fId=${folder.id}`}
              className={cn(
                "flex items-center p-3 md:p-4 border-b border-gray-200 hover:bg-gray-100",
                selectedFolder.id === folder.id && "bg-gray-100"
              )}
            >
              <Folder className="mr-2 text-blue-600 shrink-0" />
              <div className="overflow-hidden">
                <div className="font-medium truncate">{folder.name}</div>
                <div className="text-xs md:text-sm text-gray-700">
                  {folder.files.length} öğe ·{" "}
                  {formatBytes(
                    folder.files.reduce((a, b) => a + b.size, 0)
                  )}
                </div>
              </div>
            </Link>
          ))}
        </ScrollArea>
      </div>

      {/* MAIN */}
      <div className="flex-1 overflow-auto bg-white">
        
        {/* HEADER */}
        <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-5 border-b border-gray-200">
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>

            <span className="text-base md:text-lg font-semibold truncate max-w-[150px] md:max-w-none">
              {selectedFolder.name}
            </span>

            <FolderForm
              initialContent={selectedFolder.name}
              editingId={selectedFolder.id}
              userId={userId}
              agencyId={agencyId}
            />

            <button
              onClick={() => deleteFolder(selectedFolder.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <FileUploadForm folderId={selectedFolder.id} />
        </div>

        <div className="p-4">
          
          {/* PATH + STORAGE */}
          <div className="mb-4">
            <div className="text-sm text-gray-700">
              Klasörler / {selectedFolder.name}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
              <VibrantProgress value={65} />
              <span className="text-sm text-gray-800">
                {formatBytes(usedSpace)} kullanıldı
              </span>
            </div>
          </div>

          {/* FILE GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFolder.files.map((file) => {
              const ext = file.name.split(".").pop();

              return (
                <button
                  key={file.id}
                  onClick={() => {
                    setSelectedFile(file);
                    setExtension(ext || "");
                    setIsSheetOpen(true);
                  }}
                  className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-100 text-black"
                >
                  {getFileIcon(ext)}
                  <div className="text-xs md:text-sm truncate">
                    {file.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SHEET */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white text-black w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Dosya Bilgisi</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>

          {selectedFile && (
            <div className="mt-4 space-y-3">
              {getFileIcon(extension)}

              <div className="font-semibold text-center break-words">
                {selectedFile.name}
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700">Oluşturulma</span>
                  <span>{getNormalDate(selectedFile.createdAt)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Boyut</span>
                  <span>{formatBytes(selectedFile.size)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Son Değişiklik</span>
                  <span>{getModifiedDate(selectedFile.updatedAt)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={() =>
                    window.open(selectedFile.url, "_blank")
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  İndir
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => deleteFile(selectedFile.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}