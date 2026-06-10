"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import parse from "html-react-parser";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";

// import emptyFolder from "../../public/empty-folder.png";

import emptyFolder from "../../../../../../public/oneproject/empty-folder.png";
import {
  CalendarDays,
  ChevronLeft,
  DollarSign,
  Edit,
  Eye,
  MessageSquare,
  Pen,
  Plus,
  Trash,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ProjectData } from "../../types/types";
import Image from "next/image";
import TextArea from "../FormInputs/TextAreaInput";
import DescriptionForm from "../Forms/DescriptionForm";
import NotesForm from "../Forms/NotesForm";
import ProjectBanner from "./ProjectBanner";
import AuthenticatedAvatar from "../global/AuthenticatedAvatar";
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
import { ModeToggle } from "../mode-toggle";
import PaymentForm from "../Forms/PaymentForm";
import Link from "next/link";
import BudgetProgressBar from "./BudgetProgressBar";
import CommentForm from "../Forms/CommentForm";
import { getInitials } from "../../lib/generateInitials";
import ModuleForm from "../Forms/ModuleForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { deleteModule } from "../../actions/modules";
import toast from "react-hot-toast";
import InviteClient from "../DataTableColumns/InviteClient";
import LogoutBtn from "../global/LogoutBtn";
import InviteMembers from "./InviteMembers";
import { ExistingUser } from "../../actions/users";
import DomainCard from "./DomainCard";
import PaymentDeleteButton from "./PaymentDeleteButton";
import useCurrencySettings from "../../hooks/useCurrencySettings";
import { formatCurrency } from "../../lib/formatCurrency";
import { useSession } from "@/app/SessionProvider";

type SafeUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
};

export default function ProjectDetailPage({
  projectData,
  existingUsers,
}: {
  projectData: ProjectData;
  existingUsers: ExistingUser[];
}) {
  const { defaultCurrency, exchangeRate } = useCurrencySettings();

  // const formatCurrency = (amount: number) => {
  //   const convertedAmount = amount * exchangeRate;
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: defaultCurrency,
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(convertedAmount);
  // };

  const session = useSession();
  const user = session.user;

  let role = user?.roleproject;

  if (user?.id !== projectData.user.id) {
    role = "MEMBER";
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const paidAmount = projectData.payments.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);
  const remainingAmount = projectData.budget
    ? projectData.budget - paidAmount
    : 0;

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
      result += `${years} yıl`;
      if (remainingDays > 0) {
        result += ` ${remainingDays} gün`;
      }
    } else {
      result = `${absDay} gün`;
    }

    if (days > 0) {
      return `${result} kaldı`;
    } else if (days < 0) {
      return `${result} gecikme`;
    } else {
      return "Termin bugün";
    }
  }
  const [daysDifference, setDaysDifference] = useState(0);
  useEffect(() => {
    // Calculate initial days difference
    if (projectData.endDate) {
      setDaysDifference(calculateDaysDifference(projectData.endDate));
    }

    // Set up an interval to update days difference every day
    const intervalId = setInterval(
      () => {
        if (projectData.endDate) {
          setDaysDifference(calculateDaysDifference(projectData.endDate));
        }
      },
      24 * 60 * 60 * 1000,
    ); // Update every 24 hours

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [projectData.endDate]);

  async function handleModuleDelete(id: string) {
    try {
      const res = await deleteModule(id);
      if (res.ok) {
        toast.success("Aşama Silindi");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (projectData.notes) {
      try {
        const parsed = JSON.parse(projectData.notes);
        setNotes(parsed?.content || "");
      } catch {
        setNotes(projectData.notes); // fallback
      }
    }
  }, [projectData.notes]);

  async function handleSaveNotes() {
    try {
      // örnek payload
      const payload = JSON.stringify({ content: notes });

      // burada kendi API/action çağrını yap
      console.log(payload);

      toast.success("Notlar kaydedildi");
      setIsEditingNotes(false);
    } catch (err) {
      toast.error("Notlar kaydedilemedi");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      {/* Back to Projects Button */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/oneproject/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Tüm Süreçlere Dön
          </Link>
        </Button>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-2">
          <ModeToggle />
          <AuthenticatedAvatar user={user} />
        </div>
      </div>

      {/* Project Banner */}
      <ProjectBanner
        editingId={projectData.id}
        name={projectData.name}
        bannerImage={projectData.bannerImage}
        bg={projectData.gradient}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Description */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Süreç Açıklaması</CardTitle>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="ghost"
                size="icon"
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <DescriptionForm
                  editingId={projectData.id}
                  initialDescription={projectData.description}
                />
              ) : (
                <p>{projectData.description || "Açıklama bulunmuyor."}</p>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="modules" className="flex-1 sm:flex-none">
                Süreç Aşamaları
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 sm:flex-none">
                Notlar
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1 sm:flex-none">
                Yorumlar
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex-1 sm:flex-none">
                Ödemeler
              </TabsTrigger>
            </TabsList>

            {/* ================= MODULES ================= */}
            <TabsContent value="modules">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3  mt-5">
                      <h2 className="text-lg sm:text-xl">Süreç Aşamaları</h2>
                      <ModuleForm
                        projectId={projectData.id}
                        userId={user?.id}
                        userName={user?.username}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[260px] sm:h-[300px] pr-2 sm:pr-4">
                    {projectData.modules.length > 0 ? (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {projectData.modules.map((module) => (
                          <Card
                            key={module.id}
                            className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-cyan-50 group"
                          >
                            <CardHeader className="p-3 sm:p-4">
                              <CardTitle className="text-xs sm:text-sm flex items-center justify-between gap-2">
                                <span className="truncate">{module.name}</span>

                                <div className="flex items-center gap-2 sm:gap-3">
                                  <ModuleForm
                                    editingId={module.id}
                                    initialContent={module.name}
                                    projectId={projectData.id}
                                    userId={user?.id}
                                    userName={user?.username}
                                  />

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4 text-red-500" />
                                      </button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          <div className="flex items-center text-red-600 text-sm sm:text-base">
                                            <TriangleAlert className="w-5 h-5 mr-2" />
                                            Kesinlikle emin misiniz?
                                          </div>
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-xs sm:text-sm">
                                          Bu işlem geri alınamaz. Bu aşama
                                          kalıcı olarak silinecek.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          İptal
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                          <button
                                            onClick={() =>
                                              handleModuleDelete(module.id)
                                            }
                                          >
                                            Devam Et ve Sil
                                          </button>
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Link
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    href={`/oneproject/project/modules/${module.id}?pId=${module.projectId}&&slug=${projectData.slug}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                </div>
                              </CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <div className="space-y-4">
                          <Image
                            src={emptyFolder}
                            alt="Aşama Yok"
                            className="w-24 sm:w-36 h-auto mx-auto"
                          />
                          <ModuleForm
                            projectId={projectData.id}
                            userId={user?.id}
                            userName={user?.username}
                          />
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================= NOTES ================= */}
            <TabsContent value="notes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Notlar</CardTitle>

                  <div className="flex gap-2 mt-5">
                    {isEditingNotes && (
                      <Button size="sm" onClick={handleSaveNotes}>
                        Kaydet
                      </Button>
                    )}

                    <Button
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      {isEditingNotes ? <X /> : <Edit />}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                  {isEditingNotes ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notlarınızı buraya yazın..."
                      className="w-full min-h-[180px] sm:min-h-[300px] p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm sm:text-base text-gray-700">
                      {notes || "Not bulunmuyor."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================= COMMENTS ================= */}
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3  mt-5">
                      <h2 className="text-lg">Yorumlar</h2>

                      <CommentForm
                        projectId={projectData.id}
                        userId={user?.id}
                        userName={user?.username}
                        userRole={user?.roleproject}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>

                {projectData.comments.length > 0 ? (
                  <CardContent className="space-y-4">
                    {projectData.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start space-x-3 sm:space-x-4"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(comment.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="font-semibold text-sm sm:text-base">
                              {comment.userName}
                            </p>

                            <CommentForm
                              projectId={projectData.id}
                              userId={user?.id}
                              userName={user?.username}
                              userRole={user?.roleproject}
                              editingId={comment.id}
                              initialContent={comment.content}
                            />
                          </div>

                          <div className="prose text-sm sm:text-base break-words">
                            {parse(comment.content)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                ) : (
                  <CardFooter>
                    <div className="flex flex-col gap-3 text-center w-full">
                      <p>Henüz Yorum Yok</p>
                      <CommentForm
                        projectId={projectData.id}
                        userId={user?.id}
                        userName={user?.username}
                        userRole={user?.roleproject}
                      />
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* ================= PAYMENTS ================= */}
            <TabsContent value="payments">
              <div className="max-w-full sm:max-w-2xl mx-auto mt-5">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-lg">Faturalar & Ödemeler</h2>

                        {(role === "USER" || role === "ADMIN") && (
                          <PaymentForm
                            projectId={projectData.id}
                            userId={projectData.userId}
                            clientId={projectData.clientId}
                            remainingAmount={remainingAmount}
                          />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <Tabs defaultValue="payments">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payments">Ödemeler</TabsTrigger>
                        <TabsTrigger value="invoices">Faturalar</TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="invoices"
                        className="space-y-3 sm:space-y-4"
                      >
                        {projectData.payments.length > 0 ? (
                          projectData.payments.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                            >
                              <div>
                                <p className="font-semibold text-sm">
                                  #{invoice.invoiceNumber}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500">
                                  Vade:{" "}
                                  {new Date(invoice.date).toLocaleDateString()}
                                </p>
                              </div>

                              <h2 className="text-sm">{invoice.title}</h2>

                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {formatCurrency(
                                    invoice.amount,
                                    defaultCurrency,
                                    exchangeRate,
                                  )}
                                </Badge>

                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/oneproject/project/invoice/${invoice.id}?project=${projectData.slug}`}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Görüntüle
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">Henüz Fatura Yok</p>
                        )}
                      </TabsContent>

                      <TabsContent
                        value="payments"
                        className="space-y-3 sm:space-y-4"
                      >
                        {projectData.payments.length > 0 ? (
                          projectData.payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                            >
                              <span className="text-sm">
                                {new Date(payment.date).toLocaleDateString()}
                              </span>

                              <p className="text-sm">{payment.title}</p>

                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-green-100"
                                >
                                  {formatCurrency(
                                    payment.amount,
                                    defaultCurrency,
                                    exchangeRate,
                                  )}
                                </Badge>

                                <PaymentDeleteButton paymentId={payment.id} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm">Henüz Ödeme Yok</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>

                  <CardFooter>
                    {projectData.budget && (
                      <BudgetProgressBar
                        budget={projectData.budget}
                        paidAmount={paidAmount}
                      />
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Süreç Bilgisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-semibold">Bütçe:</span>
                  <span className="ml-2">
                    {/* ${projectData.budget?.toLocaleString() || "N/A"} */}
                    {formatCurrency(
                      projectData?.budget ?? 0,
                      defaultCurrency,
                      exchangeRate,
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  <span className="font-semibold">Toplam Ödenen :</span>
                  <span className="ml-2">
                    {/* ${paidAmount?.toLocaleString() || "N/A"} */}
                    {formatCurrency(paidAmount, defaultCurrency, exchangeRate)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 border-b pb-3">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Zaman Çizelgesi:</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Başlangıç:{" "}
                      {new Date(projectData.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      Bitiş:{" "}
                      {projectData.endDate
                        ? new Date(projectData.endDate).toLocaleDateString()
                        : "Devam ediyor"}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      daysDifference < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    Durum:{" "}
                    {projectData.endDate
                      ? formatTimeDifference(daysDifference)
                      : "Devam ediyor"}
                  </div>
                </div>
              </div>
              {role === "USER" && (
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="mr-2 h-4 w-4 text-purple-500" />
                    <span className="font-semibold">Danışmanlar:</span>
                  </div>
                  <div className="flex -space-x-2">
                    {projectData.members.length > 0 ? (
                      <>
                        {projectData.members.map((member, index) => (
                          <Avatar key={member.id}>
                            <AvatarFallback>
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </>
                    ) : (
                      <div className="">
                        <InviteMembers
                          allMembers={existingUsers.filter(
                            (member) => member.id !== user?.id,
                          )}
                          projectData={projectData}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mülk Özellikleri Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mülk Özellikleri</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">İlan Tipi</span>
                <span className="font-medium text-right">
                  {projectData.listing?.listingType === "RENT"
                    ? "Kiralık"
                    : projectData.listing?.listingType === "SALE"
                      ? "Satılık"
                      : "-"}
                </span>

                <span className="text-muted-foreground">Mülk Tipi</span>
                <span className="font-medium text-right">
                  {projectData.property?.propertyType ?? "-"}
                </span>

                <span className="text-muted-foreground">Konum</span>
                <span className="font-medium text-right">
                  {[projectData.property?.district, projectData.property?.city]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </span>

                <span className="text-muted-foreground">Adres</span>
                <span className="font-medium text-right">
                  {projectData.property?.address ?? "-"}
                </span>

                <span className="text-muted-foreground">Brüt / Net m²</span>
                <span className="font-medium text-right">
                  {projectData.property?.grossArea ?? "-"} /{" "}
                  {projectData.property?.netArea ?? "-"}
                </span>

                <span className="text-muted-foreground">Oda Sayısı</span>
                <span className="font-medium text-right">
                  {projectData.property?.roomCount ?? "-"}
                </span>

                <span className="text-muted-foreground">Banyo</span>
                <span className="font-medium text-right">
                  {projectData.property?.bathroomCount ?? "-"}
                </span>

                <span className="text-muted-foreground">Bulunduğu Kat</span>
                <span className="font-medium text-right">
                  {projectData.property?.floorNo ?? "-"}
                </span>

                <span className="text-muted-foreground">Bina Yaşı</span>
                <span className="font-medium text-right">
                  {projectData.property?.buildingAge ?? "-"}
                </span>

                <span className="text-muted-foreground">Isıtma</span>
                <span className="font-medium text-right">
                  {projectData.property?.heatingType ?? "-"}
                </span>

                <span className="text-muted-foreground">Eşya Durumu</span>
                <span className="font-medium text-right">
                  {projectData.property?.isFurnished ? "Eşyalı" : "Eşyasız"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {role === "USER" || role === "ADMIN" ? "Müşteri" : "Kullanıcı"}{" "}
                Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {role === "USER" || role === "ADMIN" ? (
                    <Avatar className="h-12 w-12">
                      {projectData.client?.imageUrl ? (
                        <AvatarImage src={projectData.client?.imageUrl ?? ""} />
                      ) : (
                        <AvatarFallback>
                          {`${projectData.client?.firstName ?? ""}`
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ) : (
                    <Avatar className="h-12 w-12">
                      {user?.id ? (
                        <AvatarImage
                          src={projectData.user.avatarUrl ?? "/placeholder.svg"}
                        />
                      ) : (
                        <AvatarFallback>
                          {projectData.user.username
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  {role === "USER" || role === "ADMIN" ? (
                    <div>
                      <p className="font-semibold">
                        {projectData.client?.firstName}{" "}
                        {projectData.client?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {projectData.client?.occupation || "Bireysel Müşteri"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">
                        {projectData.user?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {projectData.user.companyName || "Bireysel Müşteri"}
                      </p>
                    </div>
                  )}
                </div>
                {role === "USER" ||
                  (role === "ADMIN" && <InviteClient row={projectData} />)}
              </div>

              {role == "USER" || role === "ADMIN" ? (
                <div className="text-sm">
                  <p>
                    <span className="font-semibold">İletişim:</span>{" "}
                    {projectData.client?.firstName} {projectData.client?.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">E-posta:</span>{" "}
                    {projectData.client?.email}
                  </p>
                  <p>
                    <span className="font-semibold">Telefon:</span>{" "}
                    {projectData.client?.phone}
                  </p>
                </div>
              ) : (
                <div className="text-sm">
                  <p>
                    <span className="font-semibold">İletişim:</span>{" "}
                    {projectData.user.firstName} {projectData.user.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">E-posta:</span>{" "}
                    {projectData.user.email}
                  </p>
                  <p>
                    <span className="font-semibold">Telefon:</span>{" "}
                    {projectData.user.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <DomainCard projectData={projectData} />
        </div>
      </div>
    </div>
  );
}
