import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarTrigger } from "../../../components/ui/sidebar";
import NotificationButton from "./notification-button";

export default function SidebarHeader({
  notifications,
}: {
  notifications: any[];
}) {
  return (
    <div className="flex h-16 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />

      {/* Hızlı erişim butonları */}
      <div className="flex items-center gap-2 flex-1">
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/estate/dashboard/listings/new">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Yeni İlan
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs hidden sm:flex">
          <Link href="/estate/dashboard/contracts/new">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Yeni Sözleşme
          </Link>
        </Button>
      </div>

      <NotificationButton notifications={notifications} />

      <SidebarFooter className="p-0">
        <SidebarMenu>
          <SidebarMenuItem />
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
