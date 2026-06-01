"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2, Home, Info, Star, Wrench, Phone, AlignJustify,
  LayoutDashboard, Globe, Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";

const sections = [
  { slug: "",                    label: "Genel Bakış",         icon: LayoutDashboard },
  { slug: "logo",                label: "Logo & Navigasyon",   icon: Globe },
  { slug: "hero-section",        label: "Hero Bölümü",         icon: Home },
  { slug: "about-section",       label: "Hakkımızda",          icon: Info },
  { slug: "featured-properties", label: "Öne Çıkan Mülkler",  icon: Building2 },
  { slug: "services",            label: "Hizmetler",           icon: Wrench },
  { slug: "testimonials",        label: "Referanslar",         icon: Star },
  { slug: "team",                label: "Ekip",                icon: Users },
  { slug: "contact-section",     label: "İletişim",            icon: Phone },
  { slug: "footer",              label: "Alt Bilgi",           icon: AlignJustify },
];

type Agency = { id: string; name: string; slug: string; siteEnabled: boolean; siteCompletion: number };

export default function AgencyCustomizeSidebar({ agency, agencyId }: { agency: Agency; agencyId: string }) {
  const pathname = usePathname();
  const base = `/estate/agency/${agencyId}/customize`;

  return (
    <aside className="hidden md:flex flex-col border-r bg-white min-h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b">
        <p className="font-bold text-sm truncate">{agency.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={agency.siteEnabled ? "default" : "secondary"} className="text-xs">
            {agency.siteEnabled ? "Yayında" : "Taslak"}
          </Badge>
          <span className="text-xs text-muted-foreground">%{agency.siteCompletion}</span>
        </div>
      </div>

      {/* Linkler */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {sections.map(({ slug, label, icon: Icon }) => {
          const href   = slug ? `${base}/${slug}` : base;
          const active = slug ? pathname === href : pathname === base;
          return (
            <Link
              key={slug}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Siteyi Görüntüle */}
      <div className="p-3 border-t">
        <Link
          href={`/estate/agency/${agencyId}`}
          target="_blank"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-blue-600 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" /> Siteyi Görüntüle
        </Link>
      </div>
    </aside>
  );
}
