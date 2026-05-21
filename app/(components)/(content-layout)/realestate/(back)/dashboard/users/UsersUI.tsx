"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";

type AgentInfo = { id: string; designation: string; departmentName: string; isActive: boolean; employeeId: string; imageUrl: string | null } | null;
type ClientInfo = { id: string; isBuyer: boolean; isSeller: boolean; isTenant: boolean; isLandlord: boolean } | null;

type User = {
  id: string; name: string | null; email: string; phone: string | null;
  roleGayrimenkul: string | null; createdAt: Date;
  agent: AgentInfo; propertyClient: ClientInfo;
};

interface Props {
  users: User[];
  updateRole: (id: string, role: string) => Promise<{ ok: boolean; error?: string }>;
  toggleAgentActive: (agentId: string, isActive: boolean) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const ROLES: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Süper Admin",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ADMIN:       { label: "Admin",        color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  AGENT:       { label: "Danışman",     color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  CLIENT:      { label: "Müşteri",      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  SECRETARY:   { label: "Sekreter",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  ACCOUNTANT:  { label: "Muhasebeci",   color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UsersUI({ users, updateRole, toggleAgentActive, deleteUser }: Props) {
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage]         = useState(1);
  const [busy, setBusy]         = useState<string | null>(null);
  const PER_PAGE = 15;

  const filtered = users.filter((u) => {
    const matchSearch = [u.name ?? "", u.email, u.phone ?? "", u.agent?.designation ?? "", u.agent?.departmentName ?? ""]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === "ALL" || u.roleGayrimenkul === roleFilter;
    return matchSearch && matchRole;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSearch(val: string) { setSearch(val); setPage(1); }
  function handleRoleFilter(val: string) { setRoleFilter(val); setPage(1); }

  async function handleRoleChange(id: string, role: string) {
    setBusy(id);
    const res = await updateRole(id, role);
    setBusy(null);
    if (res.ok) toast.success("Rol güncellendi.");
    else toast.error(res.error ?? "Hata.");
  }

  async function handleToggle(agentId: string, current: boolean) {
    setBusy(agentId);
    const res = await toggleAgentActive(agentId, !current);
    setBusy(null);
    if (res.ok) toast.success(current ? "Pasife alındı." : "Aktife alındı.");
    else toast.error(res.error ?? "Hata.");
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kullanıcısı silinsin mi?`)) return;
    setBusy(id);
    const res = await deleteUser(id);
    setBusy(null);
    if (res.ok) toast.success("Silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  // Özet sayılar
  const counts = Object.keys(ROLES).reduce((acc, r) => {
    acc[r] = users.filter((u) => u.roleGayrimenkul === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Özet kartlar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(ROLES).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => handleRoleFilter(roleFilter === key ? "ALL" : key)}
            className={`rounded-lg p-2.5 text-center border transition-all ${roleFilter === key ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 dark:border-gray-700 hover:border-blue-300"}`}
          >
            <p className="text-lg font-bold">{counts[key] ?? 0}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{filtered.length} kullanıcı</p>
          <Link
            href="/realestate/dashboard/users/new"
            className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
          >
            <Users className="h-3.5 w-3.5" /> Yeni Danışman
          </Link>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ad, e-posta, departman ara..."
            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {slice.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <Users className="h-10 w-10 opacity-30" />
              <p className="text-sm">{search || roleFilter !== "ALL" ? "Sonuç bulunamadı." : "Henüz kullanıcı yok."}</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Kullanıcı</th>
                      <th className="text-left px-4 py-3">Rol</th>
                      <th className="text-left px-4 py-3">Departman / Tip</th>
                      <th className="text-left px-4 py-3">Kayıt</th>
                      <th className="text-right px-4 py-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {slice.map((u) => {
                      const roleInfo = ROLES[u.roleGayrimenkul ?? ""] ?? { label: u.roleGayrimenkul ?? "—", color: "bg-gray-100 text-gray-600" };
                      return (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{u.name ?? "—"}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                            {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              defaultValue={u.roleGayrimenkul ?? ""}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={busy === u.id}
                              className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {Object.entries(ROLES).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {u.agent && (
                              <div>
                                <p className="font-medium text-gray-700 dark:text-gray-300">{u.agent.departmentName}</p>
                                <p>{u.agent.designation} · {u.agent.employeeId}</p>
                              </div>
                            )}
                            {u.propertyClient && (
                              <div className="flex flex-wrap gap-1">
                                {u.propertyClient.isBuyer    && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Alıcı</span>}
                                {u.propertyClient.isSeller   && <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Satıcı</span>}
                                {u.propertyClient.isTenant   && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">Kiracı</span>}
                                {u.propertyClient.isLandlord && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">Kiraya Veren</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {u.agent && (
                                <>
                                  <button
                                    onClick={() => handleToggle(u.agent!.id, u.agent!.isActive)}
                                    disabled={busy === u.agent.id}
                                    title={u.agent.isActive ? "Pasife al" : "Aktife al"}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
                                  >
                                    {u.agent.isActive
                                      ? <ToggleRight className="h-5 w-5 text-green-500" />
                                      : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                                  </button>
                                  <Link
                                    href={`/realestate/dashboard/users/agents/view/${u.agent.id}`}
                                    className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 text-xs font-medium transition-colors"
                                  >
                                    Görüntüle
                                  </Link>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(u.id, u.name ?? u.email)}
                                disabled={busy === u.id}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y">
                {slice.map((u) => {
                  const roleInfo = ROLES[u.roleGayrimenkul ?? ""] ?? { label: u.roleGayrimenkul ?? "—", color: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={u.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{u.name ?? "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {u.agent && (
                            <button
                              onClick={() => handleToggle(u.agent!.id, u.agent!.isActive)}
                              disabled={busy === u.agent.id}
                              className="p-1.5 rounded disabled:opacity-30"
                            >
                              {u.agent.isActive
                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(u.id, u.name ?? u.email)}
                            disabled={busy === u.id}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
                        {u.agent && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.agent.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                            {u.agent.isActive ? "Aktif" : "Pasif"}
                          </span>
                        )}
                      </div>

                      {u.agent && (
                        <p className="text-xs text-gray-500">{u.agent.departmentName} · {u.agent.designation}</p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-400">{fmtDate(u.createdAt)}</p>
                        {u.agent && (
                          <Link
                            href={`/realestate/dashboard/users/agents/view/${u.agent.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Görüntüle →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
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
