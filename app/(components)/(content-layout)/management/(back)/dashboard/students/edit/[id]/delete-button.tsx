"use client";

export function DeleteClientButton({ action }: { action: () => Promise<never> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Bu müşteriyi kalıcı olarak silmek istediğinizden emin misiniz?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="h-10 px-5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
      >
        Müşteriyi Sil
      </button>
    </form>
  );
}
