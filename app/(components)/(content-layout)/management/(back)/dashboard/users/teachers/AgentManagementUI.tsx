"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, AlertTriangle, Building2, Users, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import AgentForm, { AgentFormData } from "../../../../components/dashboard/forms/users/agent-form";

export type Agent = {
  id: string; title: string; firstName: string; lastName: string;
  email: string; phone: string; whatsappNo: string | null;
  designation: string; departmentName: string; departmentId: string;
  imageUrl: string | null; isActive: boolean; gender: string;
  NIN: string; contactMethod: string; dateOfBirth: Date | null;
  dateOfJoining: Date; licenseNo: string | null; qualification: string;
  experience: number | null; commissionRate: number | null;
  bio: string | null; skills: string | null;
};

interface Props {
  agents: Agent[];
  departments: { id: string; name: string }[];
  createAgent: (data: AgentFormData) => Promise<{ ok: boolean; error?: string }>;
  updateAgent: (id: string, data: Partial<AgentFormData>) => Promise<{ ok: boolean; error?: string }>;
  deleteAgent: (id: string) => Promise<{ ok: boolean }>;
  createDepartment: (fd: FormData) => Promise<void>;
}

function fmt(date: Date | null | string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("tr-TR");
}

export default function AgentManagementUI({
  agents, departments, createAgent, updateAgent, deleteAgent, createDepartment,
}: Props) {
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() { setEditing(null); setView("form"); }
  function openEdit(a: Agent) { setEditing(a); setView("form"); }
  function backToList() { setEditing(null); setView("list"); }

  async function handleSubmit(data: AgentFormData): Promise<{ ok: boolean; error?: string }> {
    if (editing) {
      const res = await updateAgent(editing.id, data);
      if (res.ok) { toast.success("Danışman güncellendi."); backToList(); }
      else toast.error(res.error ?? "Güncelleme başarısız.");
      return res;
    }
    const res = await createAgent(data);
    if (res.ok) { toast.success("Danışman oluşturuldu."); backToList(); }
    else toast.error(res.error ?? "Oluşturulamadı.");
    return res;
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteAgent(id);
    setDeleting(null);
    if (res.ok) toast.success("Danışman silindi.");
    else toast.error("Silme başarısız.");
  }

  const initialData: Partial<AgentFormData> | undefined = editing
    ? {
        title: editing.title, firstName: editing.firstName, lastName: editing.lastName,
        email: editing.email, phone: editing.phone, whatsappNo: editing.whatsappNo ?? "",
        gender: editing.gender, NIN: editing.NIN, contactMethod: editing.contactMethod,
        dateOfBirth: editing.dateOfBirth ? new Date(editing.dateOfBirth).toISOString().split("T")[0] : "",
        designation: editing.designation, departmentId: editing.departmentId,
        dateOfJoining: new Date(editing.dateOfJoining).toISOString().split("T")[0],
        licenseNo: editing.licenseNo ?? "", qualification: editing.qualification,
        experience: editing.experience?.toString() ?? "",
        commissionRate: editing.commissionRate?.toString() ?? "2.5",
        bio: editing.bio ?? "", skills: editing.skills ?? "",
        imageUrl: editing.imageUrl ?? "", password: "",
      }
    : undefined;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === "form" && (
            <button onClick={backToList} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              {view === "form" ? (editing ? "Danışman Düzenle" : "Yeni Danışman") : "Danışman Yönetimi"}
            </h1>
            <p className="text-xs text-gray-500">{agents.length} danışman kayıtlı</p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Yeni Danışman
          </button>
        )}
      </div>

      {/* Departman uyarısı */}
      {departments.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Departman Bulunamadı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Danışman oluşturmadan önce en az bir departman tanımlamanız gerekiyor.
            </p>
            <form action={createDepartment} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <input
                  name="deptName" required
                  placeholder="Departman adı (ör. Satış, Kiralama)"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-amber-300 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button type="submit" className="h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors shrink-0">
                Departman Oluştur
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── LİSTE ────────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Users className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz danışman eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                  İlk danışmanı ekle
                </button>
              </div>
            ) : (
              <>
                {/* Desktop tablo */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Danışman</th>
                        <th className="text-left px-4 py-3">Ünvan / Departman</th>
                        <th className="text-left px-4 py-3">İletişim</th>
                        <th className="text-left px-4 py-3">Katılış</th>
                        <th className="text-left px-4 py-3">Komisyon</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agents.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {a.imageUrl ? (
                                <img src={a.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                    {a.firstName[0]}{a.lastName[0]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{a.title} {a.firstName} {a.lastName}</p>
                                <p className="text-xs text-gray-400">{a.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p>{a.designation}</p>
                            <p className="text-xs text-gray-400">{a.departmentName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p>{a.phone}</p>
                            {a.whatsappNo && <p className="text-xs text-gray-400">{a.whatsappNo}</p>}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{fmt(a.dateOfJoining)}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {a.commissionRate != null ? `%${a.commissionRate}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(a)}
                                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                                title="Düzenle"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                disabled={deleting === a.id}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-40"
                                title="Sil"
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

                {/* Mobil kart listesi */}
                <div className="md:hidden divide-y">
                  {agents.map((a) => (
                    <div key={a.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {a.imageUrl ? (
                            <img src={a.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                {a.firstName[0]}{a.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{a.title} {a.firstName} {a.lastName}</p>
                            <p className="text-xs text-gray-500">{a.designation} · {a.departmentName}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(a)}
                            className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            disabled={deleting === a.id}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 pl-[52px]">
                        <span className="truncate">{a.email}</span>
                        <span>{a.phone}</span>
                        <span>Katılış: {fmt(a.dateOfJoining)}</span>
                        {a.commissionRate != null && <span>Komisyon: %{a.commissionRate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      {view === "form" && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            {departments.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Departman oluşturduktan sonra bu form aktif olacak.
              </p>
            ) : (
              <AgentForm
                onSubmit={handleSubmit}
                initialData={initialData}
                editingId={editing?.id}
                departments={departments}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
