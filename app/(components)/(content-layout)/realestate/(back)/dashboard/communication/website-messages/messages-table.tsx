"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Eye, Trash2, X, Mail } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Message = {
  id: string; fullName: string; email: string;
  phone: string; subject: string; message: string;
  createdAt: Date;
};

interface Props {
  messages: Message[];
  deleteMessage: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function MessagesTable({ messages, deleteMessage }: Props) {
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<Message | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  const filtered = messages.filter((m) =>
    [m.fullName, m.email, m.subject, stripHtml(m.message)]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSearch(val: string) { setSearch(val); setPage(1); }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteMessage(id);
    setDeleting(null);
    if (res.ok) { toast.success("Mesaj silindi."); if (selected?.id === id) setSelected(null); }
    else toast.error(res.error ?? "Silme başarısız.");
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Arama + sayaç */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{filtered.length} mesaj</p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ad, e-posta, konu ara..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* Liste */}
        <Card className={`shadow-sm flex-1 min-w-0 ${selected ? "lg:max-w-[60%]" : "w-full"}`}>
          <CardContent className="p-0">
            {slice.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Mail className="h-10 w-10 opacity-30" />
                <p className="text-sm">{search ? "Sonuç bulunamadı." : "Henüz mesaj yok."}</p>
              </div>
            ) : (
              <>
                {/* Masaüstü tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Gönderen</th>
                        <th className="text-left px-4 py-3">Konu</th>
                        <th className="text-left px-4 py-3">Tarih</th>
                        <th className="text-right px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {slice.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setSelected(m)}
                          className={`cursor-pointer transition-colors ${selected?.id === m.id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/30"}`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{m.fullName}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{m.subject}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(m.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelected(m); }}
                                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                                disabled={deleting === m.id}
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

                {/* Mobil kart */}
                <div className="md:hidden divide-y">
                  {slice.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`p-4 space-y-1 cursor-pointer transition-colors ${selected?.id === m.id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/20"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{m.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{m.email} · {m.phone}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); setSelected(m); }} className="p-1.5 rounded text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} disabled={deleting === m.id} className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">{m.subject}</p>
                      <p className="text-xs text-gray-400">{fmtDate(m.createdAt)}</p>
                    </div>
                  ))}
                </div>

                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-t">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 h-8 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      ‹ Önceki
                    </button>
                    <span className="text-xs text-gray-500">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 h-8 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Sonraki ›
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Detay paneli */}
        {selected && (
          <Card className="shadow-sm lg:w-[380px] shrink-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-semibold text-sm leading-snug">{selected.subject}</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">Ad:</span>
                  <span className="font-medium">{selected.fullName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">E-posta:</span>
                  <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline break-all">{selected.email}</a>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">Telefon:</span>
                  <a href={`tel:${selected.phone}`} className="text-blue-600 hover:underline">{selected.phone}</a>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-16 shrink-0">Tarih:</span>
                  <span>{fmtDate(selected.createdAt)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Mesaj</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                  {stripHtml(selected.message)}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" /> Yanıtla
                </a>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting === selected.id}
                  className="h-9 px-3 flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs rounded-md transition-colors disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting === selected.id ? "..." : "Sil"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
