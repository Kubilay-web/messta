"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function DeleteAgentButton({
  action,
  name,
}: {
  action: () => Promise<void>;
  name: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handle() {
    if (!confirm(`"${name}" adlı danışmanı silmek istediğinizden emin misiniz?`)) return;
    start(async () => {
      await action();
      toast.success("Danışman silindi");
      router.push("/management/dashboard/users/parents");
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="h-9 px-4 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Siliniyor…" : "Danışmanı Sil"}
    </button>
  );
}

export function ToggleActiveButton({
  action,
  isActive,
}: {
  action: () => Promise<void>;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handle() {
    start(async () => {
      await action();
      toast.success(isActive ? "Danışman deaktif edildi" : "Danışman aktif edildi");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className={`h-9 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {pending ? "…" : isActive ? "Deaktif Et" : "Aktif Et"}
    </button>
  );
}
