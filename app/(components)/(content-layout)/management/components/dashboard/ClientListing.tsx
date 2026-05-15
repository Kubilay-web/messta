"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Eye, Pencil, Trash2, Plus, Search,
  UserCheck, Home, Key, Building2, Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = {
  id: string; title: string; firstName: string; lastName: string;
  email: string; phone: string; imageUrl: string | null;
  gender: string; nationality: string; occupation: string | null; address: string;
  isBuyer: boolean; isSeller: boolean; isTenant: boolean; isLandlord: boolean;
  minBudget: number | null; maxBudget: number | null; currency: string;
  notes: string | null; createdAt: string | Date;
};

interface ClientListingProps {
  clients: Client[];
  onDelete: (id: string) => Promise<{ ok: boolean }>;
  onUpdateNotes: (id: string, notes: string) => Promise<{ ok: boolean }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | null, cur = "TRY") =>
  n != null
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n)
    : null;

type FilterKey = "ALL" | "BUYER" | "SELLER" | "TENANT" | "LANDLORD";

const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: "ALL",      label: "All",      icon: Users     },
  { key: "BUYER",    label: "Buyers",   icon: Home      },
  { key: "SELLER",   label: "Sellers",  icon: Building2 },
  { key: "TENANT",   label: "Tenants",  icon: Key       },
  { key: "LANDLORD", label: "Landlords",icon: UserCheck },
];

function clientTypes(c: Client) {
  const t: string[] = [];
  if (c.isBuyer)    t.push("Buyer");
  if (c.isSeller)   t.push("Seller");
  if (c.isTenant)   t.push("Tenant");
  if (c.isLandlord) t.push("Landlord");
  return t;
}

function matchesFilter(c: Client, f: FilterKey) {
  if (f === "ALL") return true;
  if (f === "BUYER")    return c.isBuyer;
  if (f === "SELLER")   return c.isSeller;
  if (f === "TENANT")   return c.isTenant;
  if (f === "LANDLORD") return c.isLandlord;
  return true;
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({ id, name, onDelete }: { id: string; name: string; onDelete: (id: string) => Promise<{ ok: boolean }> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const res = await onDelete(id);
      if (res.ok) { toast.success("Client deleted"); router.refresh(); }
      else toast.error("Could not delete client");
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="destructive" className="h-8 w-8" disabled={isPending}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-black max-w-[92vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the client and their portal account. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handle}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientListing({ clients, onDelete, onUpdateNotes }: ClientListingProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    if (!matchesFilter(c, activeFilter)) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.occupation ?? "").toLowerCase().includes(q)
    );
  });

  const countFor = (f: FilterKey) =>
    f === "ALL" ? clients.length : clients.filter((c) => matchesFilter(c, f)).length;

  return (
    <div className="w-full space-y-4 px-3 sm:px-4 md:px-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} registered clients</p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/management/dashboard/students/new">
            <Plus className="h-4 w-4" /> New Client
          </Link>
        </Button>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              activeFilter === key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={cn(
              "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              activeFilter === key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {countFor(key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, phone..."
          className="pl-9 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Desktop Table ───────────────────────────────────────── */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Client", "Contact", "Type", "Budget", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? filtered.map((c) => {
              const name = `${c.title} ${c.firstName} ${c.lastName}`;
              const types = clientTypes(c);
              const min = fmt(c.minBudget, c.currency);
              const max = fmt(c.maxBudget, c.currency);
              const budget = min || max ? `${min ?? "—"} – ${max ?? "—"}` : "—";

              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={c.imageUrl || "/management/images/student.png"}
                        alt={name} width={36} height={36}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[150px]">{name}</p>
                        <p className="text-xs text-gray-400">{c.gender} · {c.nationality}</p>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[160px]">{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </td>
                  {/* Type badges */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {types.length > 0
                        ? types.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0.5">{t}</Badge>
                        ))
                        : <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  {/* Budget */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{budget}</td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button asChild size="icon" variant="outline" className="h-8 w-8">
                        <Link href={`/management/dashboard/students/view/${c.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button asChild size="icon" variant="outline" className="h-8 w-8">
                        <Link href={`/management/dashboard/students/edit/${c.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <DeleteButton id={c.id} name={name} onDelete={onDelete} />
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="py-14 text-center text-sm text-gray-400">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {filtered.length > 0 ? filtered.map((c) => {
          const name = `${c.title} ${c.firstName} ${c.lastName}`;
          const types = clientTypes(c);
          const min = fmt(c.minBudget, c.currency);
          const max = fmt(c.maxBudget, c.currency);
          const budget = min || max ? `${min ?? "—"} – ${max ?? "—"}` : null;

          return (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Image
                  src={c.imageUrl || "/management/images/student.png"}
                  alt={name} width={40} height={40}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{name}</p>
                  <p className="text-xs text-gray-400">{c.gender} · {c.nationality}</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[110px]">
                  {types.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0.5">{t}</Badge>
                  ))}
                </div>
              </div>
              {/* Card body */}
              <div className="px-4 py-2.5 space-y-1.5 text-sm">
                {[
                  { label: "Email",  value: c.email },
                  { label: "Phone",  value: c.phone },
                  ...(budget ? [{ label: "Budget", value: budget }] : []),
                  ...(c.occupation ? [{ label: "Occupation", value: c.occupation }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-gray-400 shrink-0">{label}</span>
                    <span className="text-xs font-medium text-right truncate max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
              {/* Card footer actions */}
              <div className="flex justify-end gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <Button asChild size="icon" variant="outline" className="h-8 w-8">
                  <Link href={`/management/dashboard/students/view/${c.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                </Button>
                <Button asChild size="icon" variant="outline" className="h-8 w-8">
                  <Link href={`/management/dashboard/students/edit/${c.id}`}><Pencil className="w-3.5 h-3.5" /></Link>
                </Button>
                <DeleteButton id={c.id} name={name} onDelete={onDelete} />
              </div>
            </div>
          );
        }) : (
          <div className="py-12 text-center text-sm text-gray-400">No clients found.</div>
        )}
      </div>

    </div>
  );
}
