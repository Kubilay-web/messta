// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../../components/ui/card";
// import { ScrollArea } from "../../components/ui/scroll-area";
// import { Separator } from "../../components/ui/separator";
// import { Button } from "../../components/ui/button";
// import { FileText } from "lucide-react";

// // import { Payment, Project } from "../..prisma/client";


// import { DetailedUserProjects, ProjectWithPayments } from "../../types/types";
// import { useSearchParams } from "next/navigation";
// import { cn } from "../../lib/utils";
// import useCurrencySettings from "../../hooks/useCurrencySettings";
// import { formatCurrency } from "../../lib/formatCurrency";

// export default function ProjectPayments({
//   userProjects,
// }: {
//   userProjects: DetailedUserProjects;
// }) {
//   const params = useSearchParams();
//   const selectedProjectId = params.get("pId") ?? "";
//   const selectedProject =
//     userProjects.find((project) => project.id === selectedProjectId) ||
//     userProjects[0];
//   const { defaultCurrency, exchangeRate } = useCurrencySettings();

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-6">Project Payments</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="md:col-span-1">
//           <CardHeader>
//             <CardTitle>Projects</CardTitle>
//             <CardDescription>Select a project to view payments</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea >
//               {userProjects.map((project) => (
//                 <Link
//                   href={`/oneproject/dashboard/payments?pId=${project.id}`}
//                   key={project.id}
//                   className="block mb-4"
//                 >
//                   {/* className={`hover:bg-accent transition-colors ${
                      
//                     }`} */}
//                   <Card
//                     className={cn(
//                       "hover:bg-accent transition-colors",
//                       project.id === selectedProjectId
//                         ? "bg-blue-50 ring-1 ring-blue-600 text-blue-800 hover:bg-blue-100"
//                         : ""
//                     )}
//                   >
//                     <CardContent className="p-4 flex items-center">
//                       <div className="w-16 h-16 mr-4 relative overflow-hidden rounded-md">
//                         <Image
//                           src={project.thumbnail ?? "/oneproject/placeholder.svg"}
//                           alt={project.name}
//                           layout="fill"
//                           objectFit="cover"
//                         />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold line-clamp-1">
//                           {project.name}
//                         </h3>
//                         <p className="text-sm text-muted-foreground">
//                           {project.payments.length ?? 0} payments
//                         </p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </Link>
//               ))}
//             </ScrollArea>
//           </CardContent>
//         </Card>
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>{selectedProject?.name}</CardTitle>
//             <CardDescription>
//               {selectedProject
//                 ? "View payment details for the selected project"
//                 : "Click on a project to view its payments"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {selectedProject ? (
//               <ScrollArea>
//                 {selectedProject.payments.map((payment) => (
//                   <div key={payment.id} className="mb-4">
//                     <div className="flex justify-between items-center">
//                       <div className="hidden lg:block">
//                         <p className="font-medium">9/22/2024</p>
//                         <p className="text-sm text-muted-foreground">
//                           Invoice: {payment.invoiceNumber}
//                         </p>
//                       </div>
//                       <h2>{payment.title}</h2>
//                       <div className="flex items-center">
//                         <p className="font-medium mr-4">
//                           {/* ${payment.amount.toLocaleString()} */}
//                           {formatCurrency(
//                             payment.amount,
//                             defaultCurrency,
//                             exchangeRate
//                           )}
//                         </p>
//                         <Button size="sm" asChild>
//                           <Link
//                             href={`/oneproject/project/invoice/${payment.id}?project=${selectedProject.slug}`}
//                           >
//                             <FileText className="h-4 w-4 mr-2" />
//                             <span className="hidden lg:inline-block lg:mr-2">
//                               View
//                             </span>{" "}
//                             Invoice
//                           </Link>
//                         </Button>
//                       </div>
//                     </div>
//                     <Separator className="my-4" />
//                   </div>
//                 ))}
//               </ScrollArea>
//             ) : (
//               <div className="flex items-center justify-center h-[calc(100vh-250px)]">
//                 <p className="text-muted-foreground">No project selected</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





















"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { FileText } from "lucide-react";

import { DetailedUserProjects } from "../../types/types";
import { useSearchParams } from "next/navigation";
import { cn } from "../../lib/utils";
import useCurrencySettings from "../../hooks/useCurrencySettings";
import { formatCurrency } from "../../lib/formatCurrency";

// Gayrimenkul işlem tipi etiketleri
const transactionTypeLabels: Record<string, string> = {
  SATIS: "Satış Komisyonu",
  KIRALAMA: "Kiralama Komisyonu",
  KOMISYON: "Komisyon",
  KAPORA: "Kapora",
  DEPOZITO: "Depozito",
  TAKSIT: "Taksit",
};

export default function ProjectPayments({
  userProjects,
}: {
  userProjects: DetailedUserProjects;
}) {
  const params = useSearchParams();
  const selectedProjectId = params.get("pId") ?? "";

  const selectedProject =
    userProjects.find((project) => project.id === selectedProjectId) ||
    userProjects[0];

  const { defaultCurrency, exchangeRate } = useCurrencySettings();

  return (
    <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-8">
      
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Süreç Tahsilatları
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* ================= LEFT: PROJECT LIST ================= */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Süreçler</CardTitle>
            <CardDescription className="text-sm">
              Tahsilatları görüntülemek için bir süreç seçin
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-3">
              {userProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/oneproject/dashboard/payments?pId=${project.id}`}
                  className="block mb-3"
                >
                  <Card
                    className={cn(
                      "transition-colors hover:bg-accent",
                      project.id === selectedProjectId
                        ? "bg-blue-50 ring-1 ring-blue-600 text-blue-800"
                        : ""
                    )}
                  >
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                      
                      {/* IMAGE */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 relative overflow-hidden rounded-md shrink-0">
                        <Image
                          src={project.thumbnail ?? "/oneproject/placeholder.svg"}
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {project.payments.length ?? 0} tahsilat
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ================= RIGHT: PAYMENTS ================= */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {selectedProject?.name}
            </CardTitle>

            <CardDescription className="text-sm">
              {selectedProject
                ? "Seçili sürecin tahsilat detaylarını görüntüleyin"
                : "Tahsilatlarını görmek için bir sürece tıklayın"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {selectedProject ? (
              <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-3">
                {selectedProject.payments.map((payment) => (
                  <div key={payment.id} className="mb-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      {/* LEFT INFO */}
                      <div className="text-sm">
                        <p className="font-medium">
                          {new Date(payment.date ?? Date.now()).toLocaleDateString()}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Fatura: {payment.invoiceNumber}
                        </p>
                      </div>

                      {/* TITLE + GAYRIMENKUL İŞLEM/KOMİSYON */}
                      <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-medium truncate">
                          {payment.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {payment.transactionType && (
                            <span className="inline-block rounded bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
                              {transactionTypeLabels[payment.transactionType] ??
                                payment.transactionType}
                            </span>
                          )}
                          {payment.commissionAmount != null && (
                            <span className="text-xs text-muted-foreground">
                              Komisyon:{" "}
                              {formatCurrency(
                                payment.commissionAmount,
                                defaultCurrency,
                                exchangeRate
                              )}
                              {payment.commissionRate != null
                                ? ` (%${payment.commissionRate})`
                                : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT ACTIONS */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <p className="font-medium text-sm sm:text-base">
                          {formatCurrency(
                            payment.amount,
                            defaultCurrency,
                            exchangeRate
                          )}
                        </p>

                        <Button size="sm" asChild>
                          <Link
                            href={`/oneproject/project/invoice/${payment.id}?project=${selectedProject.slug}`}
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">
                              Fatura
                            </span>
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-3 sm:my-4" />
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Süreç seçilmedi
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}