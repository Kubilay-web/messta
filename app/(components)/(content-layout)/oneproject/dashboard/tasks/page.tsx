import React from "react";
import { getAgencyTasks } from "../../actions/crm";
import { getCrmAccess } from "../../lib/crm-access";
import TasksBoard from "../../components/dashboard/crm/TasksBoard";

export default async function page() {
  const { agencyId, canView } = await getCrmAccess();
  if (!canView) {
    return (
      <div className="flex justify-center text-lg w-full pt-10 font-medium">
        Yetkisiz erişim — CRM modülüne erişiminiz yok.
      </div>
    );
  }

  const tasks = (await getAgencyTasks(agencyId)) as any[];
  const openCount = tasks.filter((t) => t.status !== "DONE").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Görevler</h1>
        <p className="text-sm text-muted-foreground">
          Açık görev: <span className="font-semibold">{openCount}</span> /{" "}
          {tasks.length}
        </p>
      </div>
      <TasksBoard tasks={tasks} />
    </div>
  );
}
