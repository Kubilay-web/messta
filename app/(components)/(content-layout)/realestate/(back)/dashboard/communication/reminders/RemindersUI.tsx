"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  Plus, Pencil, Trash2, X, Bell, Mail, Send,
  UserCheck, Users, AlertCircle, Type, Building2, SendHorizonal,
  MessageSquare, Smartphone,
} from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";
import { EmailEditor } from "../../../../components/emails/email-editor";
import {
  sendMultipleEmails,
  sendSingleEmail,
} from "../../../../actions/emails";

const QuillEditor = dynamic(
  () => import("../../../../components/FormInputs/QuilEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md" />
    ),
  },
);

// ─── Types ──────────────────────────────────────────────────────────────────

type ActiveTab = "reminders" | "email" | "sms";
type ReminderView = "list" | "form";
type EmailType = "single" | "multiple" | "group";
type SmsMode = "single" | "group";

type Reminder = {
  id: string; subject: string; message: string;
  recipient: string; from: string;
  name: string | null; email: string | null;
  createdAt: Date;
};

type ReminderFormVals = {
  subject: string; recipient: string; from: string;
  name: string; email: string;
};

type EmailFormVals = { email_addresses: string; subject: string };

interface Props {
  reminders: Reminder[];
  groupsData: { agents: number; clients: number };
  agencyId: string;
  createReminder: (
    data: ReminderFormVals & { message: string },
  ) => Promise<{ ok: boolean; error?: string }>;
  updateReminder: (
    id: string,
    data: Partial<ReminderFormVals & { message: string }>,
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteReminder: (id: string) => Promise<{ ok: boolean; error?: string }>;
  sendReminderAsEmail: (id: string) => Promise<{ ok: boolean; error?: string; sent?: number }>;
  sendGroupEmail: (data: {
    key: string; subject: string; message: string;
  }) => Promise<{ ok: boolean; error?: string; sent?: number }>;
  sendReminderAsSMS: (id: string) => Promise<{ ok: boolean; error?: string; sent?: number; failed?: number }>;
  sendGroupSMS: (data: {
    key: string; message: string;
  }) => Promise<{ ok: boolean; error?: string; sent?: number; failed?: number }>;
  sendSingleSMS: (data: {
    phone: string; message: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RECIPIENT_LABEL: Record<string, string> = {
  Clients: "Müşteriler", Agents: "Danışmanlar",
  All: "Tümü", Management: "Yönetim",
};
const FROM_LABEL: Record<string, string> = {
  Management: "Yönetim", Agent: "Danışman", Client: "Müşteri",
};
const RECIPIENT_COLOR: Record<string, string> = {
  Clients:    "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
  Agents:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  All:        "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400",
  Management: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const inputCls =
  "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium block mb-1";

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RemindersUI({
  reminders,
  groupsData,
  createReminder,
  updateReminder,
  deleteReminder,
  sendReminderAsEmail,
  sendGroupEmail,
  sendReminderAsSMS,
  sendGroupSMS,
  sendSingleSMS,
}: Props) {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState<ActiveTab>("reminders");

  // ── Reminder state ──
  const [reminderView, setReminderView] = useState<ReminderView>("list");
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [msgError, setMsgError] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ReminderFormVals>();

  // ── Email state ──
  const [emailType, setEmailType] = useState<EmailType>("group");
  const [emailHtml, setEmailHtml] = useState("");
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);

  // ── SMS state ──
  const [smsMode, setSmsMode] = useState<SmsMode>("single");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsGroup, setSmsGroup] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);

  const {
    register: ereg,
    handleSubmit: eHandleSubmit,
    setValue: eSetValue,
    watch: eWatch,
    reset: eReset,
    formState: { errors: eErrors },
  } = useForm<EmailFormVals>();

  const emailAddressesField = eWatch("email_addresses", "");

  const groups = [
    { title: "All",        label: "Tümü",       count: groupsData.agents + groupsData.clients },
    { title: "Agents",     label: "Danışmanlar", count: groupsData.agents },
    { title: "Clients",    label: "Müşteriler",  count: groupsData.clients },
    { title: "Management", label: "Yönetim",     count: 0 },
  ];

  // pill input sync
  useEffect(() => {
    if (emailType !== "multiple") return;
    const parsed = emailAddressesField
      .split(/[\s,;]+/)
      .filter((e) => e.trim());
    setEmailAddresses(Array.from(new Set(parsed)));
    setEmailErrors(parsed.filter((e) => !isValidEmail(e)));
  }, [emailAddressesField, emailType]);

  // ── Reminder handlers ──────────────────────────────────────────────────────

  function openCreate() {
    reset({ subject: "", recipient: "All", from: "Management", name: "", email: "" });
    setReminderMessage("");
    setMsgError(false);
    setEditingReminder(null);
    setReminderView("form");
  }

  function openEdit(r: Reminder) {
    reset({
      subject: r.subject, recipient: r.recipient, from: r.from,
      name: r.name ?? "", email: r.email ?? "",
    });
    setReminderMessage(r.message);
    setMsgError(false);
    setEditingReminder(r);
    setReminderView("form");
  }

  function backToList() { setEditingReminder(null); setReminderView("list"); }

  async function onReminderSubmit(data: ReminderFormVals) {
    if (!stripHtml(reminderMessage)) { setMsgError(true); return; }
    setMsgError(false);
    const payload = { ...data, message: reminderMessage };
    const res = editingReminder
      ? await updateReminder(editingReminder.id, payload)
      : await createReminder(payload);
    if (res.ok) {
      toast.success(editingReminder ? "Hatırlatma güncellendi." : "Hatırlatma oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await deleteReminder(id);
    setDeletingId(null);
    if (res.ok) toast.success("Hatırlatma silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  async function handleSendReminderEmail(id: string) {
    setSendingEmailId(id);
    const res = await sendReminderAsEmail(id);
    setSendingEmailId(null);
    if (res.ok) toast.success(`E-posta gönderildi. (${res.sent ?? 0} alıcı)`);
    else toast.error(res.error ?? "E-posta gönderilemedi.");
  }

  async function handleSendReminderSMS(id: string) {
    setSendingSmsId(id);
    const res = await sendReminderAsSMS(id);
    setSendingSmsId(null);
    if (res.ok) {
      const msg = res.failed && res.failed > 0
        ? `SMS gönderildi. (${res.sent} başarılı, ${res.failed} başarısız)`
        : `SMS gönderildi. (${res.sent ?? 0} alıcı)`;
      toast.success(msg);
    } else {
      toast.error(res.error ?? "SMS gönderilemedi.");
    }
  }

  async function handleGroupSMS() {
    if (!smsGroup) { toast.error("Lütfen bir grup seçin."); return; }
    if (!smsMessage.trim()) { toast.error("Mesaj boş bırakılamaz."); return; }
    setSmsLoading(true);
    const res = await sendGroupSMS({ key: smsGroup, message: smsMessage });
    setSmsLoading(false);
    if (res.ok) {
      const msg = res.failed && res.failed > 0
        ? `SMS gönderildi. (${res.sent} başarılı, ${res.failed} başarısız)`
        : `Grup SMS gönderildi. (${res.sent ?? 0} alıcı)`;
      toast.success(msg);
      setSmsMessage("");
      setSmsGroup("");
    } else {
      toast.error(res.error ?? "SMS gönderilemedi.");
    }
  }

  async function handleSingleSMS() {
    if (!smsPhone.trim()) { toast.error("Telefon numarası zorunlu."); return; }
    if (!smsMessage.trim()) { toast.error("Mesaj boş bırakılamaz."); return; }
    setSmsLoading(true);
    const res = await sendSingleSMS({ phone: smsPhone, message: smsMessage });
    setSmsLoading(false);
    if (res.ok) {
      toast.success("SMS gönderildi.");
      setSmsPhone("");
      setSmsMessage("");
    } else {
      toast.error(res.error ?? "SMS gönderilemedi.");
    }
  }

  // ── Email handlers ─────────────────────────────────────────────────────────

  function handleEmailTypeChange(type: EmailType) {
    setEmailType(type);
    eSetValue("email_addresses", "");
    setEmailAddresses([]);
    setEmailErrors([]);
  }

  function removeEmailAddress(addr: string) {
    const updated = emailAddresses.filter((e) => e !== addr);
    setEmailAddresses(updated);
    eSetValue("email_addresses", updated.join(" "));
    setEmailErrors((prev) => prev.filter((e) => e !== addr));
  }

  function addEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ([" ", "Enter", ",", ";"].includes(e.key)) {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const val = input.value.trim();
      if (val && !emailAddresses.includes(val)) {
        const updated = [...emailAddresses, val];
        setEmailAddresses(updated);
        eSetValue("email_addresses", updated.join(" "));
        if (!isValidEmail(val)) setEmailErrors((prev) => [...prev, val]);
      }
      input.value = "";
    }
  }

  function handleEmailPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").split(/[\s,;]+/).filter((s) => s.trim());
    const unique = pasted.filter((p) => !emailAddresses.includes(p.trim()));
    const updated = [...emailAddresses, ...unique.map((p) => p.trim())];
    setEmailAddresses(updated);
    eSetValue("email_addresses", updated.join(" "));
    setEmailErrors((prev) => [
      ...prev,
      ...unique.filter((p) => !isValidEmail(p.trim())).map((p) => p.trim()),
    ]);
  }

  async function onEmailSubmit(data: EmailFormVals) {
    if (emailType === "multiple" && emailErrors.length > 0) {
      toast.error("Geçersiz e-posta adresleri var.");
      return;
    }
    if (!emailHtml || !stripHtml(emailHtml)) {
      toast.error("E-posta içeriği boş bırakılamaz.");
      return;
    }
    setEmailLoading(true);
    try {
      if (emailType === "single") {
        const res = await sendSingleEmail({
          email_address: data.email_addresses,
          subject: data.subject,
          message: emailHtml,
        });
        if (!res.success) { toast.error(res.message); return; }
        toast.success("E-posta başarıyla gönderildi.");
        eReset();
        setEmailHtml("");
      } else if (emailType === "multiple") {
        const res = await sendMultipleEmails({
          email_addresses: data.email_addresses,
          subject: data.subject,
          message: emailHtml,
        });
        if (!res.success) { toast.error(res.message); return; }
        toast.success("E-postalar başarıyla gönderildi.");
        eReset();
        setEmailAddresses([]);
        setEmailErrors([]);
        setEmailHtml("");
      } else {
        const res = await sendGroupEmail({
          key: data.email_addresses,
          subject: data.subject,
          message: emailHtml,
        });
        if (!res.ok) { toast.error(res.error ?? "Gönderilemedi."); return; }
        toast.success(`Grup e-postası gönderildi. (${res.sent ?? 0} alıcı)`);
        eReset();
        setEmailHtml("");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 border-b border-gray-200 dark:border-gray-700 min-w-max sm:min-w-0">
          {(
            [
              { key: "reminders", icon: Bell,          label: "Hatırlatmalar", badge: reminders.length },
              { key: "email",     icon: Mail,          label: "E-posta Gönder" },
              { key: "sms",       icon: MessageSquare, label: "SMS Gönder" },
            ] as const
          ).map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              {badge != null && badge > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hatırlatmalar tab ────────────────────────────────────────── */}
      {activeTab === "reminders" && (
        <div className="space-y-4">
          {/* sub-header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {reminderView === "form" && (
                <button
                  onClick={backToList}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <p className="text-sm font-medium">
                {reminderView === "form"
                  ? editingReminder ? "Hatırlatmayı Düzenle" : "Yeni Hatırlatma"
                  : `${reminders.length} hatırlatma`}
              </p>
            </div>
            {reminderView === "list" && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Yeni Hatırlatma</span>
                <span className="sm:hidden">Ekle</span>
              </button>
            )}
          </div>

          {/* form */}
          {reminderView === "form" && (
            <Card className="border-t-4 border-blue-600 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit(onReminderSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Alıcı *</label>
                      <select {...register("recipient", { required: true })} className={inputCls}>
                        <option value="All">Tümü</option>
                        <option value="Clients">Müşteriler</option>
                        <option value="Agents">Danışmanlar</option>
                        <option value="Management">Yönetim</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Gönderen *</label>
                      <select {...register("from", { required: true })} className={inputCls}>
                        <option value="Management">Yönetim</option>
                        <option value="Agent">Danışman</option>
                        <option value="Client">Müşteri</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Konu *</label>
                    <input
                      {...register("subject", { required: "Konu zorunlu." })}
                      type="text"
                      placeholder="Hatırlatma konusu..."
                      className={inputCls}
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Mesaj *</label>
                    <QuillEditor
                      key={editingReminder?.id ?? "new"}
                      label=""
                      className="w-full"
                      value={reminderMessage}
                      onChange={(val: string) => {
                        setReminderMessage(val);
                        if (msgError && stripHtml(val)) setMsgError(false);
                      }}
                    />
                    {msgError && (
                      <p className="text-xs text-red-500 mt-1">Mesaj zorunlu.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>İsim (isteğe bağlı)</label>
                      <input
                        {...register("name")}
                        type="text"
                        placeholder="Gönderen / alıcı adı..."
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>E-posta (isteğe bağlı)</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="eposta@ornek.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      {isSubmitting
                        ? "Kaydediliyor..."
                        : editingReminder ? "Güncelle" : "Oluştur"}
                    </button>
                    <button
                      type="button"
                      onClick={backToList}
                      className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* list */}
          {reminderView === "list" && (
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                    <Bell className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Henüz hatırlatma eklenmedi.</p>
                    <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                      İlk hatırlatmayı ekle
                    </button>
                  </div>
                ) : (
                  <>
                    {/* desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                            <th className="text-left px-4 py-3">Konu</th>
                            <th className="text-left px-4 py-3">Alıcı</th>
                            <th className="text-left px-4 py-3">Gönderen</th>
                            <th className="text-left px-4 py-3">Tarih</th>
                            <th className="text-right px-4 py-3">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {reminders.map((r) => (
                            <tr
                              key={r.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium">{r.subject}</p>
                                <p className="text-xs text-gray-400 line-clamp-1">
                                  {stripHtml(r.message)}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${RECIPIENT_COLOR[r.recipient] ?? ""}`}
                                >
                                  {RECIPIENT_LABEL[r.recipient] ?? r.recipient}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                {FROM_LABEL[r.from] ?? r.from}
                                {r.name && <span className="block text-gray-400">{r.name}</span>}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">
                                {fmtDate(r.createdAt)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleSendReminderEmail(r.id)}
                                    disabled={sendingEmailId === r.id}
                                    title="E-posta olarak gönder"
                                    className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 transition-colors disabled:opacity-30"
                                  >
                                    {sendingEmailId === r.id
                                      ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                      : <SendHorizonal className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleSendReminderSMS(r.id)}
                                    disabled={sendingSmsId === r.id}
                                    title="SMS olarak gönder"
                                    className="p-1.5 rounded hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-600 transition-colors disabled:opacity-30"
                                  >
                                    {sendingSmsId === r.id
                                      ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                                      : <Smartphone className="h-4 w-4" />}
                                  </button>
                                  <button
                                    onClick={() => openEdit(r)}
                                    className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.id)}
                                    disabled={deletingId === r.id}
                                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* mobile cards */}
                    <div className="md:hidden divide-y">
                      {reminders.map((r) => (
                        <div key={r.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{r.subject}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {stripHtml(r.message)}
                              </p>
                            </div>
                            <div className="flex gap-0.5 shrink-0">
                              <button
                                onClick={() => handleSendReminderEmail(r.id)}
                                disabled={sendingEmailId === r.id}
                                title="E-posta olarak gönder"
                                className="p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 disabled:opacity-30 touch-manipulation"
                              >
                                {sendingEmailId === r.id
                                  ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                  : <SendHorizonal className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleSendReminderSMS(r.id)}
                                disabled={sendingSmsId === r.id}
                                title="SMS olarak gönder"
                                className="p-2 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-600 disabled:opacity-30 touch-manipulation"
                              >
                                {sendingSmsId === r.id
                                  ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                                  : <Smartphone className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openEdit(r)}
                                className="p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 touch-manipulation"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deletingId === r.id}
                                className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 disabled:opacity-30 touch-manipulation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${RECIPIENT_COLOR[r.recipient] ?? ""}`}>
                              {RECIPIENT_LABEL[r.recipient] ?? r.recipient}
                            </span>
                            <span className="text-gray-500">{FROM_LABEL[r.from] ?? r.from}</span>
                            {r.name && <span className="text-gray-400">{r.name}</span>}
                            <span className="text-gray-400 ml-auto">{fmtDate(r.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── SMS Gönder tab ──────────────────────────────────────────── */}
      {activeTab === "sms" && (
        <Card className="overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-lg border-0">
          <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <CardContent className="p-6 sm:p-8">
            <header className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                SMS Gönder
              </h2>
              <p className="text-gray-500 text-sm">
                Tek numara veya kayıtlı gruba SMS gönderin
              </p>
            </header>

            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 w-full sm:w-fit">
              <button
                type="button"
                onClick={() => { setSmsMode("single"); setSmsMessage(""); }}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  smsMode === "single"
                    ? "bg-white dark:bg-gray-700 text-violet-700 dark:text-violet-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                Tek Numara
              </button>
              <button
                type="button"
                onClick={() => { setSmsMode("group"); setSmsMessage(""); }}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  smsMode === "group"
                    ? "bg-white dark:bg-gray-700 text-violet-700 dark:text-violet-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                Grup
              </button>
            </div>

            <div className="space-y-6">
              {/* Single phone input */}
              {smsMode === "single" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm">
                    <span className="bg-violet-50 dark:bg-violet-900/30 p-1.5 rounded-md">
                      <Smartphone className="h-4 w-4 text-violet-600" />
                    </span>
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    placeholder="+905xxxxxxxxx veya 05xxxxxxxxx"
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-300 text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400">
                    Türkiye: 05xx ile başlayabilirsiniz — otomatik +90 eklenir
                  </p>
                </div>
              )}

              {/* Group select */}
              {smsMode === "group" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm">
                    <span className="bg-violet-50 dark:bg-violet-900/30 p-1.5 rounded-md">
                      <Users className="h-4 w-4 text-violet-600" />
                    </span>
                    Hedef Grup
                  </label>
                  <div className="relative">
                    <select
                      value={smsGroup}
                      onChange={(e) => setSmsGroup(e.target.value)}
                      className="w-full py-3 pl-4 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-300 appearance-none text-sm"
                    >
                      <option value="">Grup seçin...</option>
                      {groups.map((g, i) => (
                        <option key={i} value={g.title}>
                          {g.label} ({g.count} kişi)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm">
                  <span className="bg-violet-50 dark:bg-violet-900/30 p-1.5 rounded-md">
                    <MessageSquare className="h-4 w-4 text-violet-600" />
                  </span>
                  SMS Mesajı
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={5}
                  maxLength={160}
                  placeholder="SMS mesajınızı yazın... (maks. 160 karakter)"
                  className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-100 focus:border-violet-300 text-sm resize-none"
                />
                <p className="text-xs text-gray-400 text-right">
                  {smsMessage.length} / 160 karakter
                </p>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-500 bg-violet-50 dark:bg-violet-900/10 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                <span>
                  {smsMode === "single"
                    ? "Test amaçlı istediğiniz numaraya SMS gönderebilirsiniz."
                    : "Grup SMS'lerde alıcıların sistemde kayıtlı telefon numaraları kullanılır. Hatırlatma listesindeki her kayıt için telefon ikonuna tıklayarak da doğrudan gönderebilirsiniz."}
                </span>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={smsMode === "single" ? handleSingleSMS : handleGroupSMS}
                disabled={smsLoading}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {smsLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    {smsMode === "single" ? "SMS Gönder" : "Grup SMS Gönder"}
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── E-posta Gönder tab ───────────────────────────────────────── */}
      {activeTab === "email" && (
        <Card className="overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-lg border-0">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardContent className="p-6 sm:p-8">
            <header className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                E-posta Oluştur
              </h2>
              <p className="text-gray-500 text-sm">
                Bireysel veya gruplara e-posta gönderin
              </p>
            </header>

            <form onSubmit={eHandleSubmit(onEmailSubmit)} className="space-y-8">

              {/* Recipient type selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-md">
                    <Mail className="h-4 w-4 text-indigo-600" />
                  </span>
                  Alıcı Türü
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      { type: "single"   as EmailType, Icon: UserCheck, label: "Tekil Alıcı",   desc: "Bir kişiye gönder" },
                      { type: "multiple" as EmailType, Icon: Users,     label: "Çoklu Alıcı",   desc: "Birden fazla adrese" },
                      { type: "group"    as EmailType, Icon: Building2, label: "Grup Alıcı",     desc: "Kayıtlı gruba gönder" },
                    ]
                  ).map(({ type, Icon, label, desc }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleEmailTypeChange(type)}
                      className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left ${
                        emailType === type
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-100 dark:ring-indigo-900/30"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-200"
                      }`}
                    >
                      <Icon className="h-6 w-6 text-indigo-600 mb-2" />
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                      {emailType === type && (
                        <div className="absolute top-3 right-3 text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient input */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-800 dark:text-gray-100 text-sm">
                  {emailType === "single" ? "Alıcı E-posta" : emailType === "multiple" ? "E-posta Adresleri" : "Grup Seçin"}
                </label>

                {emailType === "single" && (
                  <input
                    {...ereg("email_addresses", { required: "E-posta zorunlu." })}
                    type="email"
                    placeholder="ornek@domain.com"
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm"
                  />
                )}

                {emailType === "multiple" && (
                  <div className="space-y-3">
                    <input
                      type="hidden"
                      {...ereg("email_addresses")}
                      value={emailAddresses.join(" ")}
                    />

                    {emailAddresses.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[60px]">
                        {emailAddresses.map((addr, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                              emailErrors.includes(addr)
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
                            }`}
                          >
                            {addr}
                            <button
                              type="button"
                              onClick={() => removeEmailAddress(addr)}
                              className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder="E-posta yazın, Space / Enter / Virgül ile ekleyin..."
                      className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm"
                      onKeyDown={addEmailKeyDown}
                      onPaste={handleEmailPaste}
                    />

                    {emailErrors.length > 0 && (
                      <div className="flex items-start text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Geçersiz e-posta adresleri:</p>
                          <ul className="mt-1 list-disc list-inside text-xs">
                            {emailErrors.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p>Space, Enter, virgül veya noktalı virgül ile e-posta ekleyin. Yinelenenler otomatik kaldırılır.</p>
                    </div>
                  </div>
                )}

                {emailType === "group" && (
                  <div className="relative">
                    <select
                      {...ereg("email_addresses", { required: "Grup seçimi zorunlu." })}
                      className="w-full py-3 pl-4 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 appearance-none text-sm"
                    >
                      <option value="">Grup seçin...</option>
                      {groups.map((g, i) => (
                        <option key={i} value={g.title}>
                          {g.label} ({g.count} kişi)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                )}

                {eErrors.email_addresses && (
                  <p className="text-xs text-red-500">{eErrors.email_addresses.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-800 dark:text-gray-100 text-sm">
                  Konu
                </label>
                <div className="relative">
                  <input
                    {...ereg("subject", { required: "Konu zorunlu." })}
                    type="text"
                    placeholder="E-posta konusu..."
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm pr-10"
                  />
                  <div className="absolute top-3 right-3 text-gray-400 pointer-events-none">
                    <Type className="h-5 w-5" />
                  </div>
                </div>
                {eErrors.subject && (
                  <p className="text-xs text-red-500">{eErrors.subject.message}</p>
                )}
              </div>

              {/* Email content — TipTap EmailEditor */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-800 dark:text-gray-100 text-sm">
                  E-posta İçeriği
                </label>
                <EmailEditor onHtmlChange={setEmailHtml} />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  {emailLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      E-posta Gönder
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
