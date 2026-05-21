"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Monitor, Smartphone, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

type Log = {
  id: string; name: string; activity: string; time: string;
  ipAddress: string | null; device: string | null; createdAt: Date;
};

interface Props {
  logs: Log[];
  deleteLog: (id: string) => Promise<{ ok: boolean; error?: string }>;
  clearAllLogs: () => Promise<{ ok: boolean; error?: string }>;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function activityColor(activity: string) {
  const a = activity.toLowerCase();
  if (a.includes("silindi") || a.includes("delete")) return "text-red-600 bg-red-50 dark:bg-red-900/20";
  if (a.includes("oluşturuldu") || a.includes("eklendi") || a.includes("create")) return "text-green-700 bg-green-50 dark:bg-green-900/20";
  if (a.includes("güncellendi") || a.includes("update")) return "text-blue-700 bg-blue-50 dark:bg-blue-900/20";
  if (a.includes("giriş") || a.includes("login")) return "text-purple-700 bg-purple-50 dark:bg-purple-900/20";
  return "text-gray-700 bg-gray-100 dark:bg-gray-800";
}

export default function LogsUI({ logs, deleteLog, clearAllLogs }: Props) {
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const PER_PAGE = 20;

  const filtered = logs.filter((l) =>
    [l.name, l.activity, l.ipAddress ?? "", l.device ?? ""]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSearch(val: string) { setSearch(val); setPage(1); }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteLog(id);
    setDeleting(null);
    if (res.ok) toast.success("Log silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  async function handleClear() {
    if (!confirm("Tüm loglar silinsin mi? Bu işlem geri alınamaz.")) return;
    setClearing(true);
    const res = await clearAllLogs();
    setClearing(false);
    if (res.ok) toast.success("Tüm loglar temizlendi.");
    else toast.error(res.error ?? "Hata.");
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{filtered.length} kayıt</p>
          {logs.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-1.5 h-9 px-3 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {clearing ? "..." : "Tümünü Temizle"}
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ad, aktivite, IP ara..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {slice.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <Monitor className="h-10 w-10 opacity-30" />
              <p className="text-sm">{search ? "Sonuç bulunamadı." : "Henüz log yok."}</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Kullanıcı</th>
                      <th className="text-left px-4 py-3">Aktivite</th>
                      <th className="text-left px-4 py-3">Saat</th>
                      <th className="text-left px-4 py-3">IP / Cihaz</th>
                      <th className="text-left px-4 py-3">Tarih</th>
                      <th className="text-right px-4 py-3">Sil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {slice.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{l.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${activityColor(l.activity)}`}>
                            {l.activity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{l.time}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {l.ipAddress && <p>{l.ipAddress}</p>}
                            {l.device && (
                              <p className="flex items-center gap-1">
                                {/mobil/i.test(l.device)
                                  ? <Smartphone className="h-3 w-3 shrink-0" />
                                  : <Monitor className="h-3 w-3 shrink-0" />}
                                <span className="truncate max-w-[180px]">{l.device}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(l.id)}
                            disabled={deleting === l.id}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y">
                {slice.map((l) => (
                  <div key={l.id} className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{l.name}</p>
                        <p className="text-xs text-gray-400">{l.time} · {fmtDate(l.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={deleting === l.id}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${activityColor(l.activity)}`}>
                      {l.activity}
                    </span>
                    {(l.ipAddress || l.device) && (
                      <p className="text-xs text-gray-400 truncate">
                        {[l.ipAddress, l.device].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-t">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 h-8 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">‹ Önceki</button>
                  <span className="text-xs text-gray-500">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 h-8 text-xs rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Sonraki ›</button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
