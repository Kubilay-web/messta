"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Building2, Users } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Dept = {
  id: string; name: string; slug: string;
  managerName: string | null; budget: number | null; budgetYear: string | null;
  _count: { agents: number };
  createdAt: Date;
};

type FormVals = { name: string; managerName: string; budget: string; budgetYear: string };

interface Props {
  departments: Dept[];
  createDept: (data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  updateDept: (id: string, data: FormVals) => Promise<{ ok: boolean; error?: string }>;
  deleteDept: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

export default function DeptManagementUI({ departments, createDept, updateDept, deleteDept }: Props) {
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Dept | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormVals>();

  function openCreate() {
    reset({ name: "", managerName: "", budget: "", budgetYear: "" });
    setEditing(null); setView("form");
  }
  function openEdit(d: Dept) {
    reset({ name: d.name, managerName: d.managerName ?? "", budget: d.budget?.toString() ?? "", budgetYear: d.budgetYear ?? "" });
    setEditing(d); setView("form");
  }
  function backToList() { setEditing(null); setView("list"); }

  async function onSubmit(data: FormVals) {
    const res = editing ? await updateDept(editing.id, data) : await createDept(data);
    if (res.ok) {
      toast.success(editing ? "Departman güncellendi." : "Departman oluşturuldu.");
      backToList();
    } else {
      toast.error(res.error ?? "İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deleteDept(id);
    setDeleting(null);
    if (res.ok) toast.success("Departman silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === "form" && (
            <button onClick={backToList} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              {view === "form" ? (editing ? "Departman Düzenle" : "Yeni Departman") : "Departman Yönetimi"}
            </h1>
            <p className="text-xs text-gray-500">{departments.length} departman</p>
          </div>
        </div>
        {view === "list" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" /> Yeni Departman
          </button>
        )}
      </div>

      {/* ── LİSTE ────────────────────────────────────────────────────────── */}
      {view === "list" && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {departments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Building2 className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz departman eklenmedi.</p>
                <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
                  İlk departmanı ekle
                </button>
              </div>
            ) : (
              <>
                {/* Desktop tablo */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Departman</th>
                        <th className="text-left px-4 py-3">Yönetici</th>
                        <th className="text-left px-4 py-3">Bütçe</th>
                        <th className="text-left px-4 py-3">Danışmanlar</th>
                        <th className="text-right px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {departments.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                              </div>
                              <div>
                                <p className="font-medium">{d.name}</p>
                                <p className="text-xs text-gray-400">{d.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {d.managerName || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {d.budget != null
                              ? `₺${d.budget.toLocaleString("tr-TR")}${d.budgetYear ? ` (${d.budgetYear})` : ""}`
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                              <Users className="h-3 w-3" /> {d._count.agents}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(d)}
                                className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(d.id)}
                                disabled={deleting === d.id || d._count.agents > 0}
                                title={d._count.agents > 0 ? "Danışmanları olan departman silinemez" : "Sil"}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                <div className="sm:hidden divide-y">
                  {departments.map((d) => (
                    <div key={d.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{d.name}</p>
                          <p className="text-xs text-gray-500">{d.managerName || "Yönetici atanmamış"}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={deleting === d.id || d._count.agents > 0}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {d._count.agents} danışman
                        </span>
                        {d.budget != null && (
                          <span>₺{d.budget.toLocaleString("tr-TR")}{d.budgetYear ? ` · ${d.budgetYear}` : ""}</span>
                        )}
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Departman Adı *</label>
                  <input
                    {...register("name", { required: "Zorunlu alan" })}
                    placeholder="ör. Satış, Kiralama, Değerleme"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Yönetici Adı</label>
                  <input
                    {...register("managerName")}
                    placeholder="ör. Ahmet Yılmaz"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Bütçe (₺)</label>
                  <input
                    {...register("budget")}
                    type="number" step="0.01" placeholder="ör. 50000"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Bütçe Yılı</label>
                  <input
                    {...register("budgetYear")}
                    placeholder="ör. 2025"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:w-40 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
                >
                  {isSubmitting ? "Kaydediliyor..." : editing ? "Güncelle" : "Oluştur"}
                </button>
                <button
                  type="button" onClick={backToList}
                  className="flex-1 sm:flex-none sm:w-28 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
