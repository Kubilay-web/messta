import React from "react";
import Link from "next/link";
import { Users, TrendingUp, CheckSquare, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getAgencyLeads } from "../../actions/leads";
import { getAgencyBoard } from "../../actions/deals";
import { getAgencyTasks, getUpcomingReminders } from "../../actions/crm";
import { getCrmAccess } from "../../lib/crm-access";

export default async function page() {
  const { agencyId, canView } = await getCrmAccess();
  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim — CRM modülüne erişiminiz yok.
      </div>
    );
  }

  const [leads, board, tasks, reminders] = await Promise.all([
    getAgencyLeads(agencyId),
    getAgencyBoard(agencyId),
    getAgencyTasks(agencyId),
    getUpcomingReminders(agencyId, 6),
  ]);

  const deals = (board?.deals ?? []) as any[];
  const newLeads = leads.filter((l) => l.status === "NEW").length;
  const wonLeads = leads.filter((l) => l.status === "WON").length;
  const openValue = deals
    .filter((d) => d.status === "OPEN")
    .reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = deals.filter((d) => d.status === "WON").length;
  const openTasks = (tasks as any[]).filter((t) => t.status !== "DONE").length;
  const overdue = (tasks as any[]).filter(
    (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const cards = [
    {
      title: "Lead / Talepler",
      value: `${leads.length}`,
      sub: `${newLeads} yeni · ${wonLeads} kazanıldı`,
      href: "/oneproject/dashboard/leads",
      icon: UserPlus,
    },
    {
      title: "Açık Fırsat Değeri",
      value: `${openValue.toLocaleString("tr-TR")} ₺`,
      sub: `${wonDeals} kazanılan fırsat`,
      href: "/oneproject/dashboard/deals",
      icon: TrendingUp,
    },
    {
      title: "Görevler",
      value: `${openTasks}`,
      sub: `${overdue} geciken`,
      href: "/oneproject/dashboard/tasks",
      icon: CheckSquare,
    },
    {
      title: "Müşteriler",
      value: "→",
      sub: "ERP müşteri kayıtları",
      href: "/oneproject/dashboard/clients",
      icon: Users,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM Genel Bakış</h1>
        <p className="text-sm text-muted-foreground">
          Talep, satış hunisi ve görevlerinizin acente bazlı özeti
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href}>
            <Card className="hover:bg-accent transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Yaklaşan hatırlatmalar */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yaklaşan Hatırlatmalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reminders.map((r) => {
              const overdue = new Date(r.remindAt) < new Date();
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 text-sm border-b pb-2 last:border-0"
                >
                  <span className="font-medium">{r.title}</span>
                  <span
                    className={`text-xs ${
                      overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(r.remindAt).toLocaleString("tr-TR")}
                    {overdue ? " (geçti)" : ""}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Lead durum dağılımı */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lead Durum Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[
            ["NEW", "Yeni"],
            ["CONTACTED", "İletişimde"],
            ["QUALIFIED", "Nitelikli"],
            ["PROPOSAL", "Teklif"],
            ["NEGOTIATION", "Pazarlık"],
            ["WON", "Kazanıldı"],
            ["LOST", "Kaybedildi"],
          ].map(([key, label]) => {
            const count = leads.filter((l) => l.status === key).length;
            return (
              <div
                key={key}
                className="rounded-lg border px-4 py-2 text-center min-w-[110px]"
              >
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
