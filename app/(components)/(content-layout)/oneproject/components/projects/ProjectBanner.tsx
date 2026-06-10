import React, { useState } from "react";
import { Button } from "../ui/button";
import { Edit, Link, Pen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { cn } from "@/app/lib/utils";
import { updateProjectById } from "../../actions/projects";
import { ProjectProps } from "../../types/types";
import ImageInput from "../FormInputs/ImageInput";
import toast from "react-hot-toast";
import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { useForm } from "react-hook-form";

export default function ProjectBanner({
  bannerImage,
  name,
  editingId,
  bg,
  isPrivate = true,
}: {
  bannerImage: string | null;
  name: string;
  editingId: string;
  bg: string | null;
  isPrivate?: boolean;
}) {
  const gradients = [
    "bg-gradient-to-r from-[#291d3b] to-[#9900e0]",
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    "bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    "bg-gradient-to-r from-[#62cff4] to-[#2c67f2]",
    "bg-gradient-to-r from-[#004ff9] to-[#000000]",
    "bg-gradient-to-r from-[#fec163] to-[#de4313]",
    "bg-gradient-to-r from-[#fab2ff] to-[#1904e5]",
    "bg-gradient-to-r from-[#662d8c] to-[#ed1e79]",
    "bg-gradient-to-r from-[#c5f9d7] via-[#f7d486] to-[#f27a7d]",
  ];
  // bg-gradient-to-r from-blue-500 to-purple-600
  const initialGradient = bg || gradients[0];
  const initialImage = bannerImage || "/oneproject/bg.jpg?height=256&width=1024";
  const [gradient, setGradient] = useState(initialGradient);
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  async function handleGradientClick(bg: string) {
    console.log(bg);
    setGradient(bg);
    const data: any = {
      gradient: bg,
    };
    try {
      // setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function handleBannerUpdate() {
    const data: any = {
      bannerImage: imageUrl,
    };
    try {
      setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
        setLoading(false);
        toast.success("Banner güncellendi");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectProps>({
    defaultValues: {
      bannerImage: "",
      name: name,
    },
  });

  async function updateBannerByUrl(data: ProjectProps) {
    try {
      setImageUrl(data.bannerImage);
      setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
        setLoading(false);
        toast.success("Banner güncellendi!");
        reset();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  async function updateProjectTitle(data: ProjectProps) {
    try {
      setLoading(true);
      if (editingId) {
        await updateProjectById(editingId, data);
        setLoading(false);
        toast.success("Başlık güncellendi!");
        reset();
        setEditing(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  const [editing, setEditing] = useState(false);
  return (
    <div
      className={cn(
        "relative h-64 rounded-xl mb-8 overflow-hidden group",
        gradient
      )}
    >
      <img
        src={imageUrl}
        className="w-full h-full object-cover mix-blend-overlay"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {editing && isPrivate ? (
          <form
            className="max-w-[600px]"
            onSubmit={handleSubmit(updateProjectTitle)}
          >
            <div className="flex w-full items-center gap-3">
              <TextInput
                register={register}
                errors={errors}
                label=""
                name="name"
                className=""
                placeholder=""
              />
              <SubmitButton size={"sm"} title="Güncelle" loading={loading} />
            </div>
          </form>
        ) : (
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
  {name}
</h1>
        )}

        {!editing && isPrivate && (
          <Button
            onClick={() => setEditing(true)}
            variant="link"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pen className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          {!editing && isPrivate && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="bg-white text-black">
          <Tabs defaultValue="gradient" className="w-full">
            <TabsList>
              <TabsTrigger value="gradient">Renk Geçişi</TabsTrigger>
              <TabsTrigger value="upload">Yükle</TabsTrigger>
              <TabsTrigger value="link">Bağlantı</TabsTrigger>
              {/* <TabsTrigger value="unsplash">Unsplash</TabsTrigger> */}
            </TabsList>
            <TabsContent value="gradient">
              <div className="grid grid-cols-3 gap-4 py-3 px-6">
                {gradients.map((item: string, i) => {
                  return (
                    <button
                      onClick={() => handleGradientClick(item)}
                      key={i}
                      className={cn("w-20 h-16 rounded-2xl shadow-lg", item)}
                    ></button>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="upload">
              <div className="grid auto-rows-max items-start gap-4 ">
                <ImageInput
                  title=""
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  // endpoint="bannerImage"
                />
                <Button disabled={loading} onClick={handleBannerUpdate}>
                  {loading ? "Güncelleniyor..." : " Banner Görselini Güncelle"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="link">
              <div className="">
                <form className="" onSubmit={handleSubmit(updateBannerByUrl)}>
                  <div className="grid gap-3">
                    <TextInput
                      register={register}
                      errors={errors}
                      label=""
                      name="bannerImage"
                      icon={Link}
                      placeholder="Görsel bağlantısını girin"
                    />
                    <SubmitButton
                      size={"sm"}
                      title="Banner Görselini Güncelle"
                      loading={loading}
                    />
                  </div>
                </form>
              </div>
            </TabsContent>
            {/* <TabsContent value="unsplash">
              <h2 className="py-6">Waiting for Access to API</h2>
              <div className="grid grid-cols-2 gap-4 py-3 px-6">
                {gradients.map((item: string, i) => {
                  return (
                    <button
                      onClick={() => handleGradientClick(item)}
                      key={i}
                      className={cn("w-32 h-20 rounded-2xl shadow-lg", item)}
                    ></button>
                  );
                })}
              </div>
            </TabsContent> */}
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
