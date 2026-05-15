import { redirect } from "next/navigation";

// Tüm CRUD /teachers ana sayfasında yönetiliyor.
export default function NewAgentRedirect() {
  redirect("/management/dashboard/users/teachers");
}
