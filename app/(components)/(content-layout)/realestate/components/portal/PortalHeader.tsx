"use client";

import Link from "next/link";
import { Menu, Search, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { User, UserRoleGayrimenkul } from "../../types/types";
import UserAvatar from "./UserAvatar";
import { renderRealEstateLinks } from "./PortalSidebar";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { useUserSession } from "../../store/auth";
import { useState, useEffect, FormEvent } from "react";

const ROLE_LABELS: Record<UserRoleGayrimenkul, string> = {
  SUPER_ADMIN: "Süper Yönetici",
  ADMIN:       "Yönetici",
  AGENT:       "Danışman",
  CLIENT:      "Müşteri",
  SECRETARY:   "Sekreter",
  ACCOUNTANT:  "Muhasebeci",
};

export default function PortalHeader({ user }: { user: User & { roleGayrimenkul?: UserRoleGayrimenkul; agencyName?: string } }) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const router      = useRouter();
  const { clearSession } = useUserSession();

  const userRole    = (user as any).roleGayrimenkul as UserRoleGayrimenkul | undefined;
  const mobileLinks = userRole ? renderRealEstateLinks(userRole) : [];

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/management/dashboard");
    } else {
      router.push(`/management/dashboard?q=${encodeURIComponent(q)}`);
    }
  }

  async function handleLogout() {
    await clearSession();
    router.push("/login");
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">

      {/* Mobil menü */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menüyü aç</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col gap-0 p-0">
          {/* Başlık */}
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {(user as any).agencyName || "Emlak Ofisi"}
              </p>
              {userRole && (
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
              )}
            </div>
          </div>

          {/* Navigasyon */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {mobileLinks.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                    isActive && "bg-muted text-primary font-medium"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Çıkış */}
          <div className="border-t p-4">
            <Button onClick={handleLogout} size="sm" variant="outline" className="w-full">
              Çıkış Yap
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Arama */}
      <div className="w-full flex-1">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İlan, mülk veya müşteri ara..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      {/* Kullanıcı avatarı */}
      {/* <UserAvatar user={user} /> */}
    </header>
  );
}
