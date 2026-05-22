"use client";

// GET  /api/portal/parent/messages        → tüm mesajlar
// POST /api/portal/parent/messages        → yeni mesaj gönder (senderId=oturumdaki kullanıcı)
// PUT  /api/portal/parent/messages/[id]   → okundu işaretle
// DELETE /api/portal/parent/messages/[id] → mesajı sil
// GET  /api/portal/parent/messages/users?q= → alıcı arama (ajans içi)

import { useEffect, useState, useCallback, useRef } from "react";
import { Archive, Plus, Search, X, Send, Menu, ChevronDown } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { ScrollArea } from "../../../ui/scroll-area";
import { Textarea } from "../../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../ui/dialog";
import { cn } from "../../../../lib/utils";

interface MsgUser {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  roleGayrimenkul?: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageStatus: string;
  createdAt: string;
  sender: MsgUser;
  receiver: MsgUser;
}

const API = "/api/portal/parent/messages";

function initials(name?: string | null) {
  return (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Alıcı Seçimi: Arama Dropdown ──────────────────────────────────────────
function RecipientPicker({
  value,
  onChange,
}: {
  value: MsgUser | null;
  onChange: (u: MsgUser | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MsgUser[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`${API}/users?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [q, open]);

  const select = (u: MsgUser) => {
    onChange(u);
    setOpen(false);
    setQ("");
  };

  const clear = () => {
    onChange(null);
    setQ("");
  };

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={value.avatarUrl ?? ""} />
            <AvatarFallback className="text-[10px]">{initials(value.displayName)}</AvatarFallback>
          </Avatar>
          <span className="flex-1 text-sm">{value.displayName ?? value.email}</span>
          <button type="button" onClick={clear} className="text-gray-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        >
          <Search className="h-4 w-4 text-gray-400" />
          <span className="flex-1 text-sm text-gray-400">Alıcı ara…</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              placeholder="İsim veya e-posta ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <ScrollArea className="max-h-48">
            {loading ? (
              <p className="px-3 py-2 text-xs text-gray-400">Aranıyor…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">Sonuç bulunamadı</p>
            ) : (
              results.map((u) => (
                <div
                  key={u.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50"
                  onClick={() => select(u)}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={u.avatarUrl ?? ""} />
                    <AvatarFallback className="text-[10px]">{initials(u.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.displayName ?? u.email}</p>
                    <p className="truncate text-xs text-gray-400">{u.email}</p>
                  </div>
                  {u.roleGayrimenkul && (
                    <Badge variant="secondary" className="ml-auto text-[10px] shrink-0">
                      {u.roleGayrimenkul}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ── Ana Sayfa ──────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Compose state
  const [recipient, setRecipient] = useState<MsgUser | null>(null);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");

  // GET — tüm mesajları getir
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API);
    if (res.ok) {
      const { messages: data, currentUserId: uid } = await res.json();
      setCurrentUserId(uid);
      setMessages(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchMessages(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // PUT — mesajı okundu yap (sadece alıcı işaretleyebilir)
  const markRead = async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.messageStatus === "read" || msg.senderId === currentUserId) return;
    await fetch(`${API}/${id}`, { method: "PUT" });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, messageStatus: "read" } : m))
    );
  };

  // DELETE — mesajı sil
  const deleteMessage = async (id: string) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = messages.filter((m) => m.id !== id);
      setMessages(remaining);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
    }
  };

  // POST — yeni mesaj gönder
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !msgText.trim()) return;
    setSending(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: recipient.id, message: msgText }),
    });
    if (res.ok) {
      const created: Message = await res.json();
      setMessages((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setRecipient(null);
      setMsgText("");
      setComposeOpen(false);
    }
    setSending(false);
  };

  // POST — reply (karşıdaki kişiye gönder, kendine değil)
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !replyText.trim()) return;
    const replyTo =
      selectedMsg.senderId === currentUserId
        ? selectedMsg.receiverId
        : selectedMsg.senderId;
    setSending(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: replyTo, message: replyText }),
    });
    if (res.ok) {
      const created: Message = await res.json();
      setMessages((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setReplyText("");
    }
    setSending(false);
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.sender.displayName?.toLowerCase().includes(q) ||
      m.receiver.displayName?.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const selectedMsg = messages.find((m) => m.id === selectedId) ?? null;
  const selectedOther = selectedMsg
    ? selectedMsg.senderId === currentUserId
      ? selectedMsg.receiver
      : selectedMsg.sender
    : null;

  const selectMessage = (id: string) => {
    setSelectedId(id);
    markRead(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-gray-50 transition-transform",
          "sm:static sm:z-auto sm:w-80 sm:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <span className="font-semibold">Mesajlar</span>
          <button className="sm:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-3 py-2">
          <Button className="w-full h-8 text-sm" onClick={() => setComposeOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Yeni Mesaj
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <p className="p-4 text-sm text-gray-400 text-center">Yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">Mesaj yok</p>
          ) : (
            <div className="flex flex-col gap-0.5 p-2">
              {filtered.map((msg) => {
                const isUnread = msg.messageStatus !== "read" && msg.senderId !== currentUserId;
                const other = msg.senderId === currentUserId ? msg.receiver : msg.sender;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "group flex items-start gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors",
                      selectedId === msg.id ? "bg-gray-200" : "hover:bg-gray-100",
                      isUnread && "font-semibold"
                    )}
                    onClick={() => selectMessage(msg.id)}
                  >
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarImage src={other.avatarUrl ?? ""} />
                      <AvatarFallback className="text-xs">{initials(other.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm truncate">{other.displayName ?? other.email}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{msg.message}</p>
                      {isUnread && (
                        <Badge variant="secondary" className="mt-0.5 text-[10px] h-4">yeni</Badge>
                      )}
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    >
                      <Archive className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* ── Ana Panel ── */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="flex items-center gap-2 border-b p-3 sm:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm truncate">
            {selectedOther
              ? selectedOther.displayName ?? selectedOther.email
              : "Mesajlar"}
          </span>
        </div>

        {selectedMsg ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mesaj başlığı */}
            <div className="flex items-start justify-between border-b p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedOther?.avatarUrl ?? ""} />
                  <AvatarFallback>{initials(selectedOther?.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedOther?.displayName ?? selectedOther?.email}
                  </p>
                  <p className="text-xs text-gray-500">{selectedOther?.email}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(selectedMsg.createdAt), "d MMM yyyy  HH:mm")}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => deleteMessage(selectedMsg.id)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>

            {/* Mesaj içeriği */}
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="prose prose-sm max-w-none text-gray-800">
                {selectedMsg.message.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </ScrollArea>

            {/* Yanıtla */}
            <form onSubmit={sendReply} className="border-t p-3 flex gap-2 items-end">
              <Textarea
                placeholder="Yanıt yaz…"
                className="flex-1 min-h-[60px] max-h-32 resize-none text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={sending || !replyText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
            {loading ? "Mesajlar yükleniyor…" : "Bir mesaj seçin"}
          </div>
        )}
      </main>

      {/* ── Compose Dialog ── */}
      <Dialog
        open={composeOpen}
        onOpenChange={(o) => {
          setComposeOpen(o);
          if (!o) { setRecipient(null); setMsgText(""); }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-white text-black">
          <form onSubmit={sendMessage}>
            <DialogHeader>
              <DialogTitle>Yeni Mesaj</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Alıcı</label>
                <RecipientPicker value={recipient} onChange={setRecipient} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Mesaj</label>
                <Textarea
                  placeholder="Mesajınızı yazın…"
                  className="min-h-[120px] resize-none text-sm"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={sending || !recipient || !msgText.trim()}>
                {sending ? "Gönderiliyor…" : "Gönder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
