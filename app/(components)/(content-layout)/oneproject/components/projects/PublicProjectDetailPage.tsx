"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import parse from "html-react-parser";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";



import emptyFolder from "../../../../../../public/oneproject/empty-folder.png"
import { CalendarDays, Edit, Eye, Trash, TriangleAlert, X } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";

import { ProjectData } from "../../types/types";
import Image from "next/image";

import DescriptionForm from "../Forms/DescriptionForm";
import NotesForm from "../Forms/NotesForm";
import ProjectBanner from "./ProjectBanner";

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
} from "../../components/ui/alert-dialog";

import Link from "next/link";

import { getInitials } from "../../lib/generateInitials";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { deleteModule } from "../../actions/modules";
import toast from "react-hot-toast";

import DomainCard from "./DomainCard";

export default function PublicProjectDetailPage({
  projectData,
}: {
  projectData: ProjectData;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  function calculateDaysDifference(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  function formatTimeDifference(days: number): string {
    const absDay = Math.abs(days);
    const years = Math.floor(absDay / 365);
    const remainingDays = absDay % 365;

    let result = "";
    if (years > 0) {
      result += `${years} year${years !== 1 ? "s" : ""}`;
      if (remainingDays > 0) {
        result += ` and ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
      }
    } else {
      result = `${absDay} day${absDay !== 1 ? "s" : ""}`;
    }

    if (days > 0) {
      return `${result} remaining`;
    } else if (days < 0) {
      return `${result} past deadline`;
    } else {
      return "Deadline is today";
    }
  }
  const [daysDifference, setDaysDifference] = useState(0);
  useEffect(() => {
    // Calculate initial days difference
    if (projectData.endDate) {
      setDaysDifference(calculateDaysDifference(projectData.endDate));
    }

    // Set up an interval to update days difference every day
    const intervalId = setInterval(() => {
      if (projectData.endDate) {
        setDaysDifference(calculateDaysDifference(projectData.endDate));
      }
    }, 24 * 60 * 60 * 1000); // Update every 24 hours

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [projectData.endDate]);

  async function handleModuleDelete(id: string) {
    try {
      const res = await deleteModule(id);
      if (res.ok) {
        toast.success("Module Deleted");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      {/* Project Banner */}
      <ProjectBanner
        editingId={projectData.id}
        name={projectData.name}
        bannerImage={projectData.bannerImage}
        bg={projectData.gradient}
        isPrivate={false}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Description */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{projectData.description || "No description available."}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="modules" className="w-full">
            <TabsList>
              <TabsTrigger value="modules">Project Modules</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="modules">
              {/* Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center justify-between">
                      <h2>Project Modules</h2>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    {projectData.modules.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {projectData.modules.map((module) => (
                          <Card
                            key={module.id}
                            className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-cyan-50 group"
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm flex items-center justify-between space-x-2">
                                {module.name}
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="space-y-4">
                          {/* <h2>No Modules Yet</h2> */}
                          <Image
                            src={emptyFolder}
                            alt="No Modules"
                            className="w-36 h-auto"
                          />
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notes">
              {/* Notes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose lg:prose-xl">
                    <>
                      {projectData.notes ? (
                        <NotesForm
                          isEditable={false}
                          editingId={projectData.id}
                          initialNotes={JSON.parse(projectData.notes)}
                        />
                      ) : (
                        <p>No notes available.</p>
                      )}
                    </>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments">
              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex  items-center justify-between">
                      <h2>Comments</h2>
                    </div>
                  </CardTitle>
                </CardHeader>
                {projectData.comments.length > 0 ? (
                  <CardContent className="space-y-4">
                    {projectData.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start space-x-4 group cursor-pointer"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(comment.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex ">
                            <p className="font-semibold">{comment.userName}</p>
                          </div>
                          <div className="prose ">{parse(comment.content)}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                ) : (
                  <CardFooter>
                    <div className="flex flex-col gap-3 justify-center">
                      <p>No Comments Yet</p>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-b pb-3">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Timeline:</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Start:{" "}
                      {new Date(projectData.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      End:{" "}
                      {projectData.endDate
                        ? new Date(projectData.endDate).toLocaleDateString()
                        : "Ongoing"}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      daysDifference < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Status:{" "}
                    {projectData.endDate
                      ? formatTimeDifference(daysDifference)
                      : "Ongoing"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Done By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {projectData.user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{projectData.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {projectData.user.companyName || "Individual Client"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <p>
                  <span className="font-semibold">Contact:</span>{" "}
                  {projectData.user.firstName} {projectData.user.lastName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {projectData.user.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {projectData.user.phone}
                </p>
              </div>
            </CardContent>
          </Card>
          <DomainCard isPrivate={false} projectData={projectData} />
        </div>
      </div>
    </div>
  );
}
