import { getProjectModules, getModuleById } from "../../../actions/modules";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { cn } from "@/app/lib/utils";
import Link from "next/link";
import TaskForm from "../../../components/Forms/TaskForm";
import { DeleteTask } from "../../../components/Forms/DeleteTask";
import ModuleForm from "../../../components/Forms/ModuleForm";
import AuthenticatedAvatar from "../../../components/global/AuthenticatedAvatar";
import { ModeToggle } from "../../../components/mode-toggle";
import BackBtn from "../../../components/BackBtn";
import TaskBoard from "../../../components/projects/modules/TaskBoard";
import { validateRequest } from "@/app/auth";
export default async function Page({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { pId, slug = "Project" } = searchParams;
  const modules = (await getProjectModules(pId as string)) || [];
  const { user } = await validateRequest();

  const activeModule = modules.find((module, i) => module.id === id);
  if (!activeModule || modules?.length < 0) {
    return notFound();
  }
  let percentageCompletion = 0;
  const allTasks = activeModule.tasks.length ?? 0;
  const completedTasks =
    activeModule.tasks.length > 0
      ? activeModule.tasks.filter((task, i) => task.status === "COMPLETE")
          .length
      : 0;
  if (allTasks === 0 || completedTasks === 0) {
    percentageCompletion = 0;
  } else {
    percentageCompletion = (completedTasks / allTasks) * 100;
  }
  function getTitle(slug: string) {
    return slug
      .split("-") // Split the slug by hyphen
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back with spaces
  }
  // console.log(allTasks);
  const title = getTitle(slug as string);

  const safeUser = {
    id: user?.id,
    roleproject: user?.roleproject,
    email: user?.email,
    username: user?.username,
    avatarUrl: user?.avatarUrl,
  };
  return (
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow min-h-96">
        <div className="flex items-center p-4 justify-between">
          <BackBtn title={`Geri: ${title}`} />
          {/* <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-2">
            <ModeToggle />
            <AuthenticatedAvatar user={safeUser} />
          </div> */}
        </div>
        <div className="grid grid-cols-12 ">
          <div className="col-span-full lg:col-span-3 px-8 py-4">
            <h2 className="py-2 text-xl font-bold ">Süreç Modülleri</h2>
            <ScrollArea>
              {modules.map((module) => (
                <Link
                  href={`/oneproject/project/modules/${module.id}?pId=${module.projectId}`}
                  key={module.id}
                  className={`p-2 mb-2 cursor-pointer rounded-lg flex items-center ${
                    activeModule?.id === module.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {activeModule?.id === module.id ? (
                    <CheckCheck className="w-4 h-4 mr-2 text-blue-500" />
                  ) : (
                    <Check className="w-4 h-4 mr-2 text-muted-foreground" />
                  )}

                  <span>{module.name}</span>
                </Link>
              ))}
            </ScrollArea>
            <ModuleForm
              projectId={pId as string}
              userId={user?.id ?? ""}
              userName={user?.username ?? ""}
            />
          </div>
          <div className="col-span-full lg:col-span-9 bg-slate-50 py-4 px-8">
            <div className="flex-1 p-3">
              {activeModule && <TaskBoard activeModule={activeModule} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
