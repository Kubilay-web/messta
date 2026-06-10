"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Phone, Mail, Users, Home, MessageSquare, Trash2, Check, Plus, Bell } from "lucide-react";
import {
  createActivity,
  deleteActivity,
  createTask,
  setTaskStatus,
  deleteTask,
  createNote,
  deleteNote,
  createReminder,
  setReminderDone,
  deleteReminder,
} from "../../../actions/crm";

type Ctx = {
  leadId?: string;
  dealId?: string;
  agencyId: string;
  agentId?: string | null;
  clientId?: string | null;
  userId: string;
};

const activityTypes = [
  { value: "CALL", label: "Arama" },
  { value: "EMAIL", label: "E-posta" },
  { value: "MEETING", label: "Toplantı" },
  { value: "VIEWING", label: "Mülk Gösterimi" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SMS", label: "SMS" },
  { value: "NOTE", label: "Not" },
  { value: "OTHER", label: "Diğer" },
];

const activityIcon: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  VIEWING: Home,
  WHATSAPP: MessageSquare,
  SMS: MessageSquare,
  NOTE: MessageSquare,
  OTHER: MessageSquare,
};

const fmtDate = (d: any) => (d ? new Date(d).toLocaleString("tr-TR") : "");

export default function CrmTimeline({
  ctx,
  initial,
}: {
  ctx: Ctx;
  initial: { activities: any[]; tasks: any[]; notes: any[]; reminders?: any[] };
}) {
  const router = useRouter();
  const base = {
    leadId: ctx.leadId,
    dealId: ctx.dealId,
    agencyId: ctx.agencyId,
    agentId: ctx.agentId ?? undefined,
    clientId: ctx.clientId ?? undefined,
  };

  // Activity form
  const [actType, setActType] = useState("CALL");
  const [actSubject, setActSubject] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actLoading, setActLoading] = useState(false);

  async function addActivity() {
    if (!actSubject.trim()) return toast.error("Konu girin");
    setActLoading(true);
    const res = await createActivity({
      ...base,
      type: actType,
      subject: actSubject,
      description: actDesc || undefined,
      userId: ctx.userId,
    });
    setActLoading(false);
    if (res.ok) {
      toast.success("Etkileşim eklendi");
      setActSubject("");
      setActDesc("");
      router.refresh();
    } else toast.error("Eklenemedi");
  }

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  async function addTask() {
    if (!taskTitle.trim()) return toast.error("Görev başlığı girin");
    setTaskLoading(true);
    const res = await createTask({
      ...base,
      title: taskTitle,
      dueDate: taskDue || undefined,
      assignedUserId: ctx.userId,
      createdByUserId: ctx.userId,
    });
    setTaskLoading(false);
    if (res.ok) {
      toast.success("Görev eklendi");
      setTaskTitle("");
      setTaskDue("");
      router.refresh();
    } else toast.error("Eklenemedi");
  }

  // Note form
  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  async function addNote() {
    if (!noteContent.trim()) return toast.error("Not girin");
    setNoteLoading(true);
    const res = await createNote({
      ...base,
      content: noteContent,
      authorUserId: ctx.userId,
    });
    setNoteLoading(false);
    if (res.ok) {
      toast.success("Not eklendi");
      setNoteContent("");
      router.refresh();
    } else toast.error("Eklenemedi");
  }

  // Reminder form
  const [remTitle, setRemTitle] = useState("");
  const [remAt, setRemAt] = useState("");
  const [remLoading, setRemLoading] = useState(false);

  async function addReminder() {
    if (!remTitle.trim()) return toast.error("Hatırlatma başlığı girin");
    if (!remAt) return toast.error("Tarih/saat girin");
    setRemLoading(true);
    const res = await createReminder({
      title: remTitle,
      remindAt: remAt,
      leadId: ctx.leadId,
      dealId: ctx.dealId,
      agencyId: ctx.agencyId,
      targetUserId: ctx.userId,
      createdByUserId: ctx.userId,
    });
    setRemLoading(false);
    if (res.ok) {
      toast.success("Hatırlatma eklendi");
      setRemTitle("");
      setRemAt("");
      router.refresh();
    } else toast.error("Eklenemedi");
  }

  const input =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* AKTİVİTELER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Etkileşimler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={actType}
            onChange={(e) => setActType(e.target.value)}
            className={input}
          >
            {activityTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            value={actSubject}
            onChange={(e) => setActSubject(e.target.value)}
            placeholder="Konu (ör. Tanışma araması)"
            className={input}
          />
          <textarea
            value={actDesc}
            onChange={(e) => setActDesc(e.target.value)}
            placeholder="Açıklama"
            rows={2}
            className={input}
          />
          <Button size="sm" onClick={addActivity} disabled={actLoading}>
            <Plus className="w-4 h-4 mr-1" /> Etkileşim Ekle
          </Button>

          <div className="space-y-2 pt-2">
            {initial.activities.map((a) => {
              const Icon = activityIcon[a.type] ?? MessageSquare;
              return (
                <div key={a.id} className="flex items-start gap-2 border-b pb-2">
                  <Icon className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.subject}</p>
                    {a.description && (
                      <p className="text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDate(a.occurredAt)}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteActivity(a.id);
                      router.refresh();
                    }}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {initial.activities.length === 0 && (
              <p className="text-xs text-muted-foreground">Henüz etkileşim yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GÖREVLER */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Görevler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Görev (ör. Müşteriyi ara)"
            className={input}
          />
          <input
            type="date"
            value={taskDue}
            onChange={(e) => setTaskDue(e.target.value)}
            className={input}
          />
          <Button size="sm" onClick={addTask} disabled={taskLoading}>
            <Plus className="w-4 h-4 mr-1" /> Görev Ekle
          </Button>

          <div className="space-y-2 pt-2">
            {initial.tasks.map((t) => (
              <div key={t.id} className="flex items-start gap-2 border-b pb-2">
                <button
                  onClick={async () => {
                    await setTaskStatus(t.id, t.status === "DONE" ? "TODO" : "DONE");
                    router.refresh();
                  }}
                  className={`mt-0.5 rounded border w-4 h-4 flex items-center justify-center shrink-0 ${
                    t.status === "DONE"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {t.status === "DONE" && <Check className="w-3 h-3" />}
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
                  {t.dueDate && (
                    <p className="text-[11px] text-muted-foreground">
                      Vade: {new Date(t.dueDate).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await deleteTask(t.id);
                    router.refresh();
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {initial.tasks.length === 0 && (
              <p className="text-xs text-muted-foreground">Henüz görev yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NOTLAR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Not yazın..."
            rows={3}
            className={input}
          />
          <Button size="sm" onClick={addNote} disabled={noteLoading}>
            <Plus className="w-4 h-4 mr-1" /> Not Ekle
          </Button>

          <div className="space-y-2 pt-2">
            {initial.notes.map((n) => (
              <div key={n.id} className="flex items-start gap-2 border-b pb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fmtDate(n.createdAt)}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteNote(n.id);
                    router.refresh();
                  }}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {initial.notes.length === 0 && (
              <p className="text-xs text-muted-foreground">Henüz not yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HATIRLATMALAR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" /> Hatırlatmalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            value={remTitle}
            onChange={(e) => setRemTitle(e.target.value)}
            placeholder="Hatırlatma (ör. Geri ara)"
            className={input}
          />
          <input
            type="datetime-local"
            value={remAt}
            onChange={(e) => setRemAt(e.target.value)}
            className={input}
          />
          <Button size="sm" onClick={addReminder} disabled={remLoading}>
            <Plus className="w-4 h-4 mr-1" /> Hatırlatma Ekle
          </Button>

          <div className="space-y-2 pt-2">
            {(initial.reminders ?? []).map((r) => {
              const overdue = !r.isDone && new Date(r.remindAt) < new Date();
              return (
                <div key={r.id} className="flex items-start gap-2 border-b pb-2">
                  <button
                    onClick={async () => {
                      await setReminderDone(r.id, !r.isDone);
                      router.refresh();
                    }}
                    className={`mt-0.5 rounded border w-4 h-4 flex items-center justify-center shrink-0 ${
                      r.isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {r.isDone && <Check className="w-3 h-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        r.isDone ? "line-through text-muted-foreground" : "font-medium"
                      }`}
                    >
                      {r.title}
                    </p>
                    <p
                      className={`text-[11px] ${
                        overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {fmtDate(r.remindAt)}
                      {overdue ? " (geçti)" : ""}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteReminder(r.id);
                      router.refresh();
                    }}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {(initial.reminders ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">Henüz hatırlatma yok</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
