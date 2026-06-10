"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "../../ui/card";
import { Check, Trash2 } from "lucide-react";
import { setTaskStatus, deleteTask } from "../../../actions/crm";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  agent?: { firstName: string; lastName: string } | null;
};

const priorityMeta: Record<string, string> = {
  LOW: "text-gray-500",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600 font-semibold",
};

export default function TasksBoard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  async function toggle(t: Task) {
    await setTaskStatus(t.id, t.status === "DONE" ? "TODO" : "DONE");
    router.refresh();
  }
  async function remove(id: string) {
    const res = await deleteTask(id);
    if (res.ok) {
      toast.success("Görev silindi");
      router.refresh();
    }
  }

  const isOverdue = (t: Task) =>
    t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < new Date();

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Henüz görev yok.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-3">
            <button
              onClick={() => toggle(t)}
              className={`mt-0.5 rounded border w-5 h-5 flex items-center justify-center shrink-0 ${
                t.status === "DONE"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-gray-300"
              }`}
            >
              {t.status === "DONE" && <Check className="w-3.5 h-3.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  t.status === "DONE"
                    ? "line-through text-muted-foreground"
                    : "font-medium"
                }`}
              >
                {t.title}
              </p>
              {t.description && (
                <p className="text-xs text-muted-foreground">{t.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1">
                {t.dueDate && (
                  <span className={isOverdue(t) ? "text-red-600 font-medium" : "text-muted-foreground"}>
                    Vade: {new Date(t.dueDate).toLocaleDateString("tr-TR")}
                    {isOverdue(t) ? " (gecikti)" : ""}
                  </span>
                )}
                <span className={priorityMeta[t.priority] ?? ""}>
                  {t.priority === "HIGH"
                    ? "Yüksek"
                    : t.priority === "LOW"
                    ? "Düşük"
                    : "Orta"}
                </span>
                {t.agent && (
                  <span className="text-muted-foreground">
                    {t.agent.firstName} {t.agent.lastName}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => remove(t.id)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
