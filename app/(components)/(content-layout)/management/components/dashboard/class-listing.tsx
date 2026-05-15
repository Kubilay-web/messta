"use client";

import * as React from "react";
import {
  Building2, ChevronLeft, MapPin, Loader2, Plus, Pencil,
  Trash2, Home, Tag, TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";

// ── Server Actions (direct DB) ────────────────────────────────────────────────
import {
  createProperty,
  updateProperty,
  deleteProperty,
  createListing,
  deleteListing,
} from "../../actions/realestate";

// ── Types ─────────────────────────────────────────────────────────────────────

type ListingItem = {
  id: string; title: string; listingNo: string;
  listingType: string; status: string;
  askingPrice: number; currency: string; agentName: string;
};

type PropertyItem = {
  id: string; title: string; address: string;
  city: string; district: string;
  propertyType: string; status: string;
  price: number | null; currency: string;
  listings: ListingItem[];
  _count: { listings: number };
};

type Agent = {
  id: string; firstName: string; lastName: string; designation: string;
};

interface Props {
  agencyId: string;
  properties: PropertyItem[];
  agents: Agent[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ["APARTMENT","HOUSE","VILLA","OFFICE","SHOP","LAND","WAREHOUSE","BUILDING"];
const LISTING_TYPES  = ["SALE","RENT","SHORT_RENT"];

const statusColor: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  SOLD:      "bg-gray-100 text-gray-600",
  RENTED:    "bg-blue-100 text-blue-700",
  ACTIVE:    "bg-green-100 text-green-700",
  PENDING:   "bg-yellow-100 text-yellow-700",
  WITHDRAWN: "bg-red-100 text-red-700",
};

const fmt = (n: number | null, cur = "TRY") =>
  n != null
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n)
    : "—";

const EMPTY_PROP = { title: "", address: "", city: "", district: "", propertyType: "APARTMENT", price: "" };
const EMPTY_LIST = { title: "", listingType: "SALE", askingPrice: "", agentId: "", agentName: "" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function PropertyListing({ agencyId, properties, agents }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch]         = useState("");

  // Create property
  const [propOpen, setPropOpen]     = useState(false);
  const [propForm, setPropForm]     = useState(EMPTY_PROP);

  // Edit property
  const [editOpen, setEditOpen]     = useState(false);
  const [editForm, setEditForm]     = useState(EMPTY_PROP);
  const [editId, setEditId]         = useState("");

  // Create listing
  const [listOpen, setListOpen]     = useState(false);
  const [listForm, setListForm]     = useState(EMPTY_LIST);

  const selected = properties.find((p) => p.id === selectedId);

  const filtered = properties.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  // POST — create property
  function handleCreateProperty() {
    if (!propForm.title || !propForm.city || !propForm.address || !propForm.district) {
      toast.error("Please fill required fields."); return;
    }
    startTransition(async () => {
      const res = await createProperty(propForm);
      if (res.ok) { toast.success("Property created"); setPropOpen(false); setPropForm(EMPTY_PROP); router.refresh(); }
      else toast.error("Could not create property");
    });
  }

  // PUT — update property
  function handleUpdateProperty() {
    if (!editForm.title || !editForm.city || !editForm.address || !editForm.district) {
      toast.error("Please fill required fields."); return;
    }
    startTransition(async () => {
      const res = await updateProperty(editId, editForm);
      if (res.ok) { toast.success("Property updated"); setEditOpen(false); router.refresh(); }
      else toast.error("Could not update property");
    });
  }

  // DELETE — delete property
  function handleDeleteProperty(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteProperty(id);
      setDeletingId("");
      if (res.ok) {
        toast.success("Property deleted");
        if (selectedId === id) setSelectedId("");
        router.refresh();
      } else toast.error("Could not delete property");
    });
  }

  // POST — create listing
  function handleCreateListing() {
    if (!listForm.title || !listForm.askingPrice || !listForm.agentName) {
      toast.error("Please fill required fields."); return;
    }
    startTransition(async () => {
      const res = await createListing({ ...listForm, propertyId: selectedId });
      if (res.ok) {
        toast.success("Listing created");
        setListOpen(false);
        setListForm(EMPTY_LIST);
        router.refresh();
      } else toast.error("Could not create listing");
    });
  }

  // DELETE — delete listing
  function handleDeleteListing(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteListing(id);
      setDeletingId("");
      if (res.ok) { toast.success("Listing deleted"); router.refresh(); }
      else toast.error("Could not delete listing");
    });
  }

  function openEdit(p: PropertyItem) {
    setEditId(p.id);
    setEditForm({ title: p.title, address: p.address, city: p.city, district: p.district, propertyType: p.propertyType, price: p.price?.toString() ?? "" });
    setEditOpen(true);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 h-full">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      {/* Hide on mobile when a property is selected */}
      <div className={cn(
        "flex flex-col gap-2 lg:border-r lg:pr-2",
        selectedId ? "hidden lg:flex" : "flex"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold">Properties</h2>
            <Badge variant="secondary" className="text-xs">{properties.length}</Badge>
          </div>

          {/* Create Property Dialog */}
          <Dialog open={propOpen} onOpenChange={setPropOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-black w-[calc(100vw-2rem)] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>New Property</DialogTitle>
              </DialogHeader>
              <PropertyForm form={propForm} setForm={setPropForm} />
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPropOpen(false)}>Cancel</Button>
                <Button className="w-full sm:w-auto" onClick={handleCreateProperty} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="px-2">
          <Input
            placeholder="Search properties..."
            className="h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Property list */}
        {filtered.length > 0 ? (
          <ScrollArea className="flex-1 max-h-[calc(100dvh-200px)] lg:max-h-[calc(100vh-180px)]">
            <div className="px-1 space-y-1 pb-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "group flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                    selectedId === p.id ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50 text-muted-foreground"
                  )}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />{p.city}, {p.district}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", statusColor[p.status] ?? "bg-gray-100")}>
                        {p.status}
                      </span>
                      <span className="text-xs text-gray-400">{p._count.listings} listings</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-blue-500 hover:text-blue-600"
                      onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          disabled={deletingId === p.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {deletingId === p.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white text-black w-[calc(100vw-2rem)] max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{p.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>All listings under this property will also be deleted.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteProperty(p.id)}
                          >Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {search ? "No properties match your search." : "No properties yet. Add one to get started."}
          </div>
        )}
      </div>

      {/* ── Edit Property Dialog ─────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white text-black w-[calc(100vw-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          <PropertyForm form={editForm} setForm={setEditForm} />
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto" onClick={handleUpdateProperty} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MAIN PANEL ──────────────────────────────────────────────────── */}
      {selected ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-card w-full overflow-auto">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b">
            <div className="flex items-center gap-2 min-w-0">
              {/* Back button — mobile: always visible, desktop: only when needed */}
              <Button
                variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setSelectedId("")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-semibold leading-tight truncate">{selected.title}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{selected.address}, {selected.city}</span>
                </p>
              </div>
            </div>

            {/* Add Listing Dialog */}
            <Dialog open={listOpen} onOpenChange={(o) => { setListOpen(o); if (!o) setListForm(EMPTY_LIST); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">Add Listing</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white text-black w-[calc(100vw-2rem)] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle className="truncate">New Listing — {selected.title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="grid gap-1">
                    <Label className="text-xs">Listing Title *</Label>
                    <Input
                      placeholder="e.g. 3+1 for Sale"
                      value={listForm.title}
                      onChange={(e) => setListForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Listing Type *</Label>
                    <Select value={listForm.listingType} onValueChange={(v) => setListForm((f) => ({ ...f, listingType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white text-black">
                        {LISTING_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Asking Price (TRY) *</Label>
                    <Input
                      placeholder="e.g. 1500000"
                      type="number"
                      value={listForm.askingPrice}
                      onChange={(e) => setListForm((f) => ({ ...f, askingPrice: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs">Responsible Agent *</Label>
                    {agents.length > 0 ? (
                      <Select
                        value={listForm.agentId}
                        onValueChange={(v) => {
                          const agent = agents.find((a) => a.id === v);
                          setListForm((f) => ({ ...f, agentId: v, agentName: agent ? `${agent.firstName} ${agent.lastName}` : "" }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                        <SelectContent className="bg-white text-black">
                          {agents.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.firstName} {a.lastName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Enter agent name"
                        value={listForm.agentName}
                        onChange={(e) => setListForm((f) => ({ ...f, agentName: e.target.value }))}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => setListOpen(false)}>Cancel</Button>
                  <Button className="w-full sm:w-auto" onClick={handleCreateListing} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Listing"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Property Info Cards */}
          <div className="px-3 sm:px-4">
            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Home,       label: "Type",     value: selected.propertyType },
                  { icon: Tag,        label: "Status",   value: selected.status },
                  { icon: TrendingUp, label: "Price",    value: fmt(selected.price, selected.currency) },
                  { icon: Building2,  label: "Listings", value: `${selected._count.listings} active` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-blue-50 shrink-0">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xs sm:text-sm font-medium truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="px-3 sm:px-4 pb-4">
            <h3 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
              Listings ({selected.listings.length})
            </h3>

            {selected.listings.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {selected.listings.map((l) => (
                  <Card key={l.id} className="overflow-hidden">
                    <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold leading-tight">{l.title}</CardTitle>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost" size="icon"
                              className="h-6 w-6 text-red-400 hover:text-red-600 shrink-0"
                              disabled={deletingId === l.id}
                            >
                              {deletingId === l.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Trash2 className="h-3 w-3" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white text-black w-[calc(100vw-2rem)] max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete listing "{l.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDeleteListing(l.id)}
                              >Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <p className="text-xs text-muted-foreground"># {l.listingNo}</p>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", statusColor[l.status] ?? "bg-gray-100")}>
                          {l.status}
                        </span>
                        <span className="text-xs font-semibold text-blue-700 truncate">
                          {fmt(l.askingPrice, l.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                        <span className="uppercase font-medium shrink-0">{l.listingType.replace("_", " ")}</span>
                        <span className="truncate text-right">{l.agentName}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] text-center text-sm text-muted-foreground">
                <Building2 className="h-10 w-10 mb-2 text-gray-300" />
                <p>No listings yet.</p>
                <p className="text-xs mt-1">Click "Add Listing" to create the first one.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex min-h-[400px] items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Select a property to see details</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Property Form ──────────────────────────────────────────────────────

function PropertyForm({
  form, setForm,
}: {
  form: { title: string; address: string; city: string; district: string; propertyType: string; price: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <div className="grid gap-3 py-2">
      {([
        { key: "title",    label: "Title *",        placeholder: "e.g. Sunset Apartments" },
        { key: "address",  label: "Address *",      placeholder: "Street and number" },
        { key: "city",     label: "City *",         placeholder: "Istanbul" },
        { key: "district", label: "District *",     placeholder: "Kadıköy" },
        { key: "price",    label: "Price (TRY)",    placeholder: "e.g. 2500000", type: "number" },
      ] as const).map(({ key, label, placeholder, type }) => (
        <div key={key} className="grid gap-1">
          <Label className="text-xs">{label}</Label>
          <Input
            placeholder={placeholder}
            type={type ?? "text"}
            value={(form as any)[key]}
            onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
          />
        </div>
      ))}
      <div className="grid gap-1">
        <Label className="text-xs">Property Type *</Label>
        <Select value={form.propertyType} onValueChange={(v) => setForm((f: any) => ({ ...f, propertyType: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white text-black">
            {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
