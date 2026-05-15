// "use client";

// import { useState, useEffect } from "react";
// import { Search, Eye } from "lucide-react";
// import { format } from "date-fns";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../../../components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../../components/ui/dialog";
// import { Button } from "../../../../components/ui/button";
// import { Input } from "../../../../components/ui/input";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "../../../../components/ui/pagination";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../../../../components/ui/card";

// // Define the SchoolContactMessage type based on your model
// export type SchoolContactMessage = {
//   id: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   message: string;
//   subject: string;
//   schoolId: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

// // Mock data for demonstration
// // const mockMessages: SchoolContactMessage[] = Array.from({ length: 50 }).map(
// //   (_, i) => ({
// //     id: `cuid${i + 1}`,
// //     fullName: `User ${i + 1}`,
// //     email: `user${i + 1}../../../..example.com`,
// //     phone: `+1234567${i.toString().padStart(4, "0")}`,
// //     message: `This is a sample message ${i + 1}. It contains details about an inquiry or feedback from the user. The message might be quite long and contain multiple sentences with various information that the user wants to convey to the school administration.`,
// //     subject: `Inquiry about ${["Admission", "Curriculum", "Facilities", "Faculty", "Events"][i % 5]}`,
// //     schoolId: `school${(i % 3) + 1}`,
// //     createdAt: new Date(Date.now() - i * 86400000),
// //     updatedAt: new Date(Date.now() - i * 43200000),
// //   })
// // );

// export default function SchoolContactMessagesTable({
//   data,
//   schoolId
// }: {
//   data: SchoolContactMessage[];
//   schoolId:string;
// }) {
//   const [messages, setMessages] = useState<SchoolContactMessage[]>(data);
//   const [filteredMessages, setFilteredMessages] = useState<
//     SchoolContactMessage[]
//   >([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedMessage, setSelectedMessage] =
//     useState<SchoolContactMessage | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const messagesPerPage = 10;

//   // Initialize with mock data
//   // useEffect(() => {
//   //   setMessages(mockMessages);
//   //   setFilteredMessages(mockMessages);
//   // }, []);

//   // Handle search
//   useEffect(() => {
//     const results = messages.filter(
//       (message) =>
//         message.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         message.message.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredMessages(results);
//     setCurrentPage(1); // Reset to first page on new search
//   }, [searchTerm, messages]);

//   // Calculate pagination
//   const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
//   const indexOfLastMessage = currentPage * messagesPerPage;
//   const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
//   const currentMessages = filteredMessages.slice(
//     indexOfFirstMessage,
//     indexOfLastMessage
//   );

//   // Handle page change
//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   // View message details
//   const viewMessageDetails = (message: SchoolContactMessage) => {
//     setSelectedMessage(message);
//     setIsModalOpen(true);
//   };

//   // Generate pagination items
//   const renderPaginationItems = () => {
//     const items = [];

//     // Always show first page
//     items.push(
//       <PaginationItem key="first">
//         <PaginationLink
//           onClick={() => paginate(1)}
//           isActive={currentPage === 1}
//         >
//           1
//         </PaginationLink>
//       </PaginationItem>
//     );

//     // Show ellipsis if needed
//     if (currentPage > 3) {
//       items.push(
//         <PaginationItem key="ellipsis-1">
//           <PaginationEllipsis />
//         </PaginationItem>
//       );
//     }

//     // Show current page and neighbors
//     for (
//       let i = Math.max(2, currentPage - 1);
//       i <= Math.min(totalPages - 1, currentPage + 1);
//       i++
//     ) {
//       if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
//       items.push(
//         <PaginationItem key={i}>
//           <PaginationLink
//             onClick={() => paginate(i)}
//             isActive={currentPage === i}
//           >
//             {i}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     // Show ellipsis if needed
//     if (currentPage < totalPages - 2) {
//       items.push(
//         <PaginationItem key="ellipsis-2">
//           <PaginationEllipsis />
//         </PaginationItem>
//       );
//     }

//     // Always show last page if there's more than one page
//     if (totalPages > 1) {
//       items.push(
//         <PaginationItem key="last">
//           <PaginationLink
//             onClick={() => paginate(totalPages)}
//             isActive={currentPage === totalPages}
//           >
//             {totalPages}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     return items;
//   };

//   return (
//     <div className="space-y-4">
//       <Card className="shadow-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <div>
//             <CardTitle>School Contact Messages</CardTitle>
//             <CardDescription>
//               Browse and search through all contact messages sent to the school.
//             </CardDescription>
//           </div>
//           <div className="relative w-64">
//             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search messages..."
//               className="pl-8"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Phone</TableHead>
//                 <TableHead>Subject</TableHead>
//                 <TableHead>Date</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentMessages.length > 0 ? (
//                 currentMessages.map((message) => (
//                   <TableRow key={message.id}>
//                     <TableCell className="font-medium">
//                       {message.fullName}
//                     </TableCell>
//                     <TableCell>{message.email}</TableCell>
//                     <TableCell>{message.phone}</TableCell>
//                     <TableCell>{message.subject}</TableCell>
//                     <TableCell>
//                       {format(message.createdAt, "MMM dd, yyyy")}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Dialog
//                         open={isModalOpen && selectedMessage?.id === message.id}
//                         onOpenChange={setIsModalOpen}
//                       >
//                         <DialogTrigger asChild>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => viewMessageDetails(message)}
//                           >
//                             <Eye className="h-4 w-4 mr-1" />
//                             View
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-md">
//                           <DialogHeader>
//                             <DialogTitle>Message Details</DialogTitle>
//                           </DialogHeader>
//                           {selectedMessage && (
//                             <div className="space-y-4">
//                               <div className="grid grid-cols-[100px_1fr] gap-2">
//                                 <span className="font-medium text-muted-foreground">
//                                   From:
//                                 </span>
//                                 <span>{selectedMessage.fullName}</span>

//                                 <span className="font-medium text-muted-foreground">
//                                   Email:
//                                 </span>
//                                 <span>{selectedMessage.email}</span>

//                                 <span className="font-medium text-muted-foreground">
//                                   Phone:
//                                 </span>
//                                 <span>{selectedMessage.phone}</span>

//                                 <span className="font-medium text-muted-foreground">
//                                   Subject:
//                                 </span>
//                                 <span>{selectedMessage.subject}</span>

//                                 <span className="font-medium text-muted-foreground">
//                                   Date:
//                                 </span>
//                                 <span>
//                                   {format(selectedMessage.createdAt, "PPpp")}
//                                 </span>
//                               </div>

//                               <div>
//                                 <h4 className="font-medium text-muted-foreground mb-2">
//                                   Message:
//                                 </h4>
//                                 <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
//                                   {selectedMessage.message}
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                         </DialogContent>
//                       </Dialog>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="h-24 text-center">
//                     No messages found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//         <CardFooter className="flex justify-center border-t pt-6">
//           {totalPages > 1 && (
//             <Pagination>
//               <PaginationContent>
//                 <PaginationItem>
//                   <PaginationPrevious
//                     onClick={() => currentPage > 1 && paginate(currentPage - 1)}
//                     className={
//                       currentPage === 1 ? "pointer-events-none opacity-50" : ""
//                     }
//                   />
//                 </PaginationItem>

//                 {renderPaginationItems()}

//                 <PaginationItem>
//                   <PaginationNext
//                     onClick={() =>
//                       currentPage < totalPages && paginate(currentPage + 1)
//                     }
//                     className={
//                       currentPage === totalPages
//                         ? "pointer-events-none opacity-50"
//                         : ""
//                     }
//                   />
//                 </PaginationItem>
//               </PaginationContent>
//             </Pagination>
//           )}
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../../components/ui/pagination";

// Define the SchoolContactMessage type
export type SchoolContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  subject: string;
  schoolId: string;
  createdAt: string; // ISO string from server
  updatedAt: string;
};

// Fetch messages via API
async function fetchMessages(schoolId: string): Promise<SchoolContactMessage[]> {
  const res = await fetch(`/api/schools/${schoolId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export default function SchoolContactMessagesTable({ schoolId }: { schoolId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<SchoolContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messagesPerPage = 10;

  // Fetch data using TanStack Query
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["schoolMessages", schoolId],
    queryFn: () => fetchMessages(schoolId),
    keepPreviousData: true,
  });

  // Filter messages based on search
  const filteredMessages = messages.filter(
    (msg) =>
      msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const indexOfLast = currentPage * messagesPerPage;
  const indexOfFirst = indexOfLast - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirst, indexOfLast);

  const paginate = (page: number) => setCurrentPage(page);
  const viewMessageDetails = (message: SchoolContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const renderPaginationItems = () => {
    const items = [];
    if (totalPages <= 1) return null;

    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => paginate(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) items.push(<PaginationItem key="ellipsis-1"><PaginationEllipsis /></PaginationItem>);

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => paginate(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPages - 2) items.push(<PaginationItem key="ellipsis-2"><PaginationEllipsis /></PaginationItem>);

    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => paginate(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm w-full overflow-x-auto">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
          <div>
            <CardTitle>School Contact Messages</CardTitle>
            <CardDescription>Browse and search through all contact messages sent to the school.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-center py-8">Loading messages...</p>
          ) : error ? (
            <p className="text-center py-8 text-red-500">Failed to load messages.</p>
          ) : (
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMessages.length > 0 ? (
                  currentMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium">{msg.fullName}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">{msg.phone}</TableCell>
                      <TableCell>{msg.subject}</TableCell>
                      <TableCell>{format(new Date(msg.createdAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={isModalOpen && selectedMessage?.id === msg.id}
                          onOpenChange={setIsModalOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewMessageDetails(msg)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Message Details</DialogTitle>
                            </DialogHeader>
                            {selectedMessage && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                  <span className="font-medium text-muted-foreground">From:</span>
                                  <span>{selectedMessage.fullName}</span>
                                  <span className="font-medium text-muted-foreground">Email:</span>
                                  <span>{selectedMessage.email}</span>
                                  <span className="font-medium text-muted-foreground">Phone:</span>
                                  <span>{selectedMessage.phone}</span>
                                  <span className="font-medium text-muted-foreground">Subject:</span>
                                  <span>{selectedMessage.subject}</span>
                                  <span className="font-medium text-muted-foreground">Date:</span>
                                  <span>{format(new Date(selectedMessage.createdAt), "PPpp")}</span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-muted-foreground mb-2">Message:</h4>
                                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedMessage.message}</div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No messages found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className="flex justify-center border-t pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}








