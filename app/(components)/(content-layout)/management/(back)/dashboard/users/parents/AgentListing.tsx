"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Eye, Pencil, Trash2, Plus, Search,
  CheckCircle, XCircle, Users, Briefcase,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { cn } from "../../../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Agent = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  imageUrl: string | null;
  gender: string;
  designation: string;
  departmentName: string;
  isActive: boolean;
  commissionRate: number | null;
  licenseNo: string | null;
  experience: number | null;
  employeeId: string;
};

interface AgentListingProps {
  agents: Agent[];
  onDelete: (id: string) => Promise<{ ok: boolean }>;
  onToggleActive: (id: string, isActive: boolean) => Promise<{ ok: boolean }>;
}

type FilterKey = "ALL" | "ACTIVE" | "INACTIVE";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "ACTIVE",   label: "Active"   },
  { key: "INACTIVE", label: "Inactive" },
];

// ─── Toggle Button ────────────────────────────────────────────────────────────

function ToggleButton({ id, isActive, onToggle }: {
  id: string; isActive: boolean;
  onToggle: (id: string, v: boolean) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  function handle() {
    start(async () => {
      const res = await onToggle(id, !isActive);
      if (res.ok) { toast.success(isActive ? "Agent deactivated" : "Agent activated"); router.refresh(); }
      else toast.error("Could not update status");
    });
  }

  return (
    <Button
      size="icon" variant="outline"
      className={cn("h-8 w-8", isActive ? "text-green-600 border-green-300" : "text-gray-400")}
      onClick={handle} disabled={isPending}
    >
      {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    </Button>
  );
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({ id, name, onDelete }: {
  id: string; name: string;
  onDelete: (id: string) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  function handle() {
    start(async () => {
      const res = await onDelete(id);
      if (res.ok) { toast.success("Agent deleted"); router.refresh(); }
      else toast.error("Could not delete agent");
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
            This will permanently delete the agent and their portal account. This cannot be undone.
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

export default function AgentListing({ agents, onDelete, onToggleActive }: AgentListingProps) {
  const [activeFilter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const filtered = agents.filter((a) => {
    if (activeFilter === "ACTIVE"   && !a.isActive) return false;
    if (activeFilter === "INACTIVE" &&  a.isActive) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.designation.toLowerCase().includes(q) ||
      a.departmentName.toLowerCase().includes(q)
    );
  });

  const countFor = (f: FilterKey) => {
    if (f === "ALL")      return agents.length;
    if (f === "ACTIVE")   return agents.filter((a) => a.isActive).length;
    if (f === "INACTIVE") return agents.filter((a) => !a.isActive).length;
    return 0;
  };

  return (
    <div className="w-full space-y-4 px-3 sm:px-4 md:px-0">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Agents</h1>
          <p className="text-sm text-muted-foreground">{agents.length} registered agents</p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/management/dashboard/users/parents/new">
            <Plus className="h-4 w-4" /> New Agent
          </Link>
        </Button>
      </div>

      {/* ── Filter + Search ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                activeFilter === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
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

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, designation..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Desktop Table ────────────────────────────────────────────── */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Agent", "Contact", "Designation", "Commission", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? filtered.map((a) => {
              const name = `${a.title} ${a.firstName} ${a.lastName}`;
              return (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  {/* Agent */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={a.imageUrl || "/management/images/student.png"}
                        alt={name} width={36} height={36}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[140px]">{name}</p>
                        <p className="text-xs text-gray-400">{a.departmentName}</p>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[160px]">{a.email}</p>
                    <p className="text-xs text-gray-400">{a.phone}</p>
                  </td>
                  {/* Designation */}
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium">{a.designation}</p>
                    {a.experience != null && (
                      <p className="text-xs text-gray-400">{a.experience} yrs exp.</p>
                    )}
                  </td>
                  {/* Commission */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {a.commissionRate != null ? `${a.commissionRate}%` : "—"}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge className={cn(
                      "text-xs",
                      a.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                    )}>
                      {a.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button asChild size="icon" variant="outline" className="h-8 w-8">
                        <Link href={`/management/dashboard/users/parents/view/${a.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button asChild size="icon" variant="outline" className="h-8 w-8">
                        <Link href={`/management/dashboard/users/parents/edit/${a.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <ToggleButton id={a.id} isActive={a.isActive} onToggle={onToggleActive} />
                      <DeleteButton id={a.id} name={name} onDelete={onDelete} />
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="py-14 text-center text-sm text-gray-400">
                  No agents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ─────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {filtered.length > 0 ? filtered.map((a) => {
          const name = `${a.title} ${a.firstName} ${a.lastName}`;
          return (
            <div key={a.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Image
                  src={a.imageUrl || "/management/images/student.png"}
                  alt={name} width={40} height={40}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{name}</p>
                  <p className="text-xs text-gray-400">{a.designation} · {a.departmentName}</p>
                </div>
                <Badge className={cn(
                  "text-[10px] shrink-0",
                  a.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                )}>
                  {a.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {/* Card body */}
              <div className="px-4 py-2.5 space-y-1.5 text-sm">
                {[
                  { label: "Email",      value: a.email },
                  { label: "Phone",      value: a.phone },
                  { label: "Commission", value: a.commissionRate != null ? `${a.commissionRate}%` : "—" },
                  ...(a.experience != null ? [{ label: "Experience", value: `${a.experience} years` }] : []),
                  ...(a.licenseNo ? [{ label: "License", value: a.licenseNo }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-gray-400 shrink-0">{label}</span>
                    <span className="text-xs font-medium text-right truncate max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
              {/* Card footer */}
              <div className="flex justify-end gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <Button asChild size="icon" variant="outline" className="h-8 w-8">
                  <Link href={`/management/dashboard/users/parents/view/${a.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                </Button>
                <Button asChild size="icon" variant="outline" className="h-8 w-8">
                  <Link href={`/management/dashboard/users/parents/edit/${a.id}`}><Pencil className="w-3.5 h-3.5" /></Link>
                </Button>
                <ToggleButton id={a.id} isActive={a.isActive} onToggle={onToggleActive} />
                <DeleteButton id={a.id} name={name} onDelete={onDelete} />
              </div>
            </div>
          );
        }) : (
          <div className="py-12 text-center text-sm text-gray-400">No agents found.</div>
        )}
      </div>

    </div>
  );
}
