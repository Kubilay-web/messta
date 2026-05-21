"use client";

// GET    /api/portal/parent/payments                   → sözleşmeler + ödeme planları
// POST   /api/portal/parent/payments                   → yeni ödeme kaydı
// PUT    /api/portal/parent/payments/[id]              → durum güncelle
// DELETE /api/portal/parent/payments/[id]              → ödeme sil (PENDING)
// POST   /api/portal/parent/payments/stripe/checkout   → Stripe Checkout Session oluştur
// POST   /api/portal/parent/payments/stripe/webhook    → Stripe webhook (PAID güncelle)

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  CheckCircle2, Clock, XCircle, Plus, Trash2,
  ChevronDown, ChevronUp, Building2, User2, AlertCircle, CreditCard,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Input } from "../../../../components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../../../components/ui/dialog";
import { cn } from "../../../../lib/utils";

const API = "/api/portal/parent/payments";

// ── Tipler ──────────────────────────────────────────────────────────────────
type PayStatus = "PENDING" | "PAID" | "PARTIAL" | "FAILED" | "REFUNDED";

interface ContractPayment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PayStatus;
  paymentMethod: string | null;
  receiptNo: string | null;
  notes: string | null;
}

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  propertyType: string;
}

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  phone: string;
}

interface Contract {
  id: string;
  contractNo: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  salePrice: number | null;
  rentalPrice: number | null;
  deposit: number | null;
  currency: string;
  property: Property;
  agent: Agent;
  payments: ContractPayment[];
}

// ── Yardımcı ────────────────────────────────────────────────────────────────
const statusMeta: Record<PayStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Beklemede",  color: "bg-yellow-100 text-yellow-800",  icon: <Clock className="h-3 w-3" /> },
  PAID:     { label: "Ödendi",     color: "bg-green-100 text-green-800",    icon: <CheckCircle2 className="h-3 w-3" /> },
  PARTIAL:  { label: "Kısmi",      color: "bg-blue-100 text-blue-800",      icon: <AlertCircle className="h-3 w-3" /> },
  FAILED:   { label: "Başarısız",  color: "bg-red-100 text-red-800",        icon: <XCircle className="h-3 w-3" /> },
  REFUNDED: { label: "İade",       color: "bg-gray-100 text-gray-800",      icon: <XCircle className="h-3 w-3" /> },
};

function fmt(d: string) {
  return format(new Date(d), "d MMM yyyy", { locale: tr });
}
function money(n: number, cur: string) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 0 }) + " " + cur;
}

// ── Bileşen ─────────────────────────────────────────────────────────────────
export default function ParentPaymentsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  // Yeni ödeme dialogu
  const [addOpen, setAddOpen]         = useState(false);
  const [targetContract, setTarget]   = useState<Contract | null>(null);
  const [form, setForm]               = useState({ title: "", amount: "", dueDate: "", paymentMethod: "", notes: "" });
  const [saving, setSaving]           = useState(false);
  const [stripeLoading, setStripeLoading] = useState<string | null>(null); // paymentId
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // PUT dialogu
  const [editPayment, setEditPayment] = useState<ContractPayment | null>(null);
  const [editStatus, setEditStatus]   = useState<PayStatus>("PAID");
  const [editMethod, setEditMethod]   = useState("");
  const [editReceipt, setEditReceipt] = useState("");

  // GET
  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API);
    if (res.ok) {
      const { contracts: data } = await res.json();
      setContracts(data ?? []);
      if (data?.length) setExpanded(new Set([data[0].id]));
    }
    setLoading(false);
  }, []);

  // URL'deki success/cancelled param kontrolü
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("success") === "1") {
      setToast({ msg: "Ödeme başarıyla tamamlandı!", type: "success" });
      load();
    } else if (searchParams.get("cancelled") === "1") {
      setToast({ msg: "Ödeme iptal edildi.", type: "error" });
    }
  }, []); // eslint-disable-line

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => { load(); }, []); // eslint-disable-line

  function toggle(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // POST
  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!targetContract) return;
    setSaving(true);
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId: targetContract.id, ...form }),
    });
    if (res.ok) {
      const created: ContractPayment = await res.json();
      setContracts((prev) =>
        prev.map((c) =>
          c.id === targetContract.id ? { ...c, payments: [...c.payments, created] } : c
        )
      );
      setAddOpen(false);
      setForm({ title: "", amount: "", dueDate: "", paymentMethod: "", notes: "" });
    }
    setSaving(false);
  }

  // PUT
  async function updatePayment() {
    if (!editPayment) return;
    setSaving(true);
    const res = await fetch(`${API}/${editPayment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, paymentMethod: editMethod, receiptNo: editReceipt }),
    });
    if (res.ok) {
      const updated: ContractPayment = await res.json();
      setContracts((prev) =>
        prev.map((c) => ({
          ...c,
          payments: c.payments.map((p) => (p.id === updated.id ? updated : p)),
        }))
      );
      setEditPayment(null);
    }
    setSaving(false);
  }

  // Stripe Checkout
  async function stripePay(paymentId: string) {
    setStripeLoading(paymentId);
    const res = await fetch("/api/portal/parent/payments/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      const { error } = await res.json();
      setToast({ msg: error ?? "Stripe hatası", type: "error" });
      setStripeLoading(null);
    }
  }

  // DELETE
  async function deletePayment(contractId: string, paymentId: string) {
    const res = await fetch(`${API}/${paymentId}`, { method: "DELETE" });
    if (res.ok) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? { ...c, payments: c.payments.filter((p) => p.id !== paymentId) }
            : c
        )
      );
    }
  }

  // ── Özet istatistikler ───────────────────────────────────────────────────
  const allPayments = contracts.flatMap((c) => c.payments);
  const totalPaid   = allPayments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalPending = allPayments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg",
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
      <div className="mx-auto max-w-4xl">

        {/* Başlık */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Ödemelerim</h1>
          <p className="text-sm text-gray-500">Sözleşme bazlı ödeme planlarınız</p>
        </div>

        {/* Özet kartlar */}
        {!loading && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white border p-4">
              <p className="text-xs text-gray-500">Sözleşme</p>
              <p className="text-2xl font-bold">{contracts.length}</p>
            </div>
            <div className="rounded-xl bg-white border p-4">
              <p className="text-xs text-gray-500">Ödenen</p>
              <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString("tr-TR")}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl bg-white border p-4">
              <p className="text-xs text-gray-500">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{totalPending.toLocaleString("tr-TR")}</p>
            </div>
          </div>
        )}

        {/* İçerik */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-gray-400">Yükleniyor…</div>
        ) : contracts.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border bg-white text-gray-400">
            Aktif sözleşme bulunamadı
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {contracts.map((contract) => {
              const isOpen = expanded.has(contract.id);
              const paidAmt = contract.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
              const totalAmt = contract.payments.reduce((s, p) => s + p.amount, 0);

              return (
                <div key={contract.id} className="rounded-xl border bg-white overflow-hidden">
                  {/* Sözleşme başlığı */}
                  <button
                    className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => toggle(contract.id)}
                  >
                    <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                      <Building2 className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{contract.property.title}</span>
                        <Badge variant="outline" className="text-xs">{contract.contractType}</Badge>
                        <Badge
                          className={cn("text-xs", contract.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700")}
                        >
                          {contract.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{contract.property.address}, {contract.property.city}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>#{contract.contractNo}</span>
                        <span>{fmt(contract.startDate)}{contract.endDate ? ` – ${fmt(contract.endDate)}` : ""}</span>
                        {contract.rentalPrice && <span>Kira: {money(contract.rentalPrice, contract.currency)}/ay</span>}
                        {contract.salePrice && <span>Satış: {money(contract.salePrice, contract.currency)}</span>}
                      </div>
                      {/* Progress */}
                      {totalAmt > 0 && (
                        <div className="mt-2">
                          <div className="h-1.5 w-full rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-green-500 transition-all"
                              style={{ width: `${Math.min((paidAmt / totalAmt) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="mt-0.5 text-[10px] text-gray-400">
                            {money(paidAmt, contract.currency)} / {money(totalAmt, contract.currency)} ödendi
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                        <User2 className="h-3.5 w-3.5" />
                        {contract.agent.firstName} {contract.agent.lastName}
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Ödemeler listesi */}
                  {isOpen && (
                    <div className="border-t px-4 pb-4">
                      <div className="mb-3 flex items-center justify-between pt-3">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Ödeme Planı</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => { setTarget(contract); setAddOpen(true); }}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Ekle
                        </Button>
                      </div>

                      {contract.payments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Ödeme kaydı yok</p>
                      ) : (
                        <ScrollArea className="max-h-64">
                          <div className="flex flex-col gap-2">
                            {contract.payments.map((p) => {
                              const meta = statusMeta[p.status];
                              return (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-gray-50"
                                >
                                  <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0", meta.color)}>
                                    {meta.icon}
                                    <span className="hidden sm:inline">{meta.label}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.title}</p>
                                    <p className="text-xs text-gray-500">
                                      Vade: {fmt(p.dueDate)}
                                      {p.paidDate && ` · Ödendi: ${fmt(p.paidDate)}`}
                                      {p.paymentMethod && ` · ${p.paymentMethod}`}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold shrink-0">
                                    {money(p.amount, contract.currency)}
                                  </span>
                                  <div className="flex gap-1 shrink-0">
                                    {p.status === "PENDING" && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs px-2 bg-black text-white hover:bg-gray-800"
                                        disabled={stripeLoading === p.id}
                                        onClick={() => stripePay(p.id)}
                                      >
                                        {stripeLoading === p.id ? (
                                          <span className="animate-pulse">…</span>
                                        ) : (
                                          <><CreditCard className="mr-1 h-3 w-3" />Stripe</>
                                        )}
                                      </Button>
                                    )}
                                    {p.status === "PENDING" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs px-2"
                                        onClick={() => { setEditPayment(p); setEditStatus("PAID"); setEditMethod(""); setEditReceipt(""); }}
                                      >
                                        Manuel
                                      </Button>
                                    )}
                                    {p.status === "PENDING" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => deletePayment(contract.id, p.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── POST: Yeni Ödeme Dialog ── */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setTarget(null); }}>
        <DialogContent className="sm:max-w-md bg-white text-black">
          <form onSubmit={addPayment}>
            <DialogHeader>
              <DialogTitle>Yeni Ödeme Ekle</DialogTitle>
              {targetContract && (
                <p className="text-xs text-gray-500">{targetContract.property.title} — #{targetContract.contractNo}</p>
              )}
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Başlık</label>
                <Input placeholder="Peşinat, 1. Taksit…" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Tutar</label>
                  <Input type="number" placeholder="0" value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Vade Tarihi</label>
                  <Input type="date" value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} required />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Ödeme Yöntemi</label>
                <Input placeholder="Nakit, EFT, Çek…" value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Not</label>
                <Input placeholder="Opsiyonel" value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
              <Button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : "Ekle"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── PUT: Ödeme Güncelle Dialog ── */}
      <Dialog open={!!editPayment} onOpenChange={(o) => { if (!o) setEditPayment(null); }}>
        <DialogContent className="sm:max-w-sm bg-white text-black">
          <DialogHeader>
            <DialogTitle>Ödeme Güncelle</DialogTitle>
            {editPayment && <p className="text-xs text-gray-500">{editPayment.title} — {editPayment.amount.toLocaleString("tr-TR")}</p>}
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Durum</label>
              <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as PayStatus)}
              >
                {(Object.keys(statusMeta) as PayStatus[]).map((s) => (
                  <option key={s} value={s}>{statusMeta[s].label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Ödeme Yöntemi</label>
              <Input placeholder="EFT, Nakit, Çek…" value={editMethod}
                onChange={(e) => setEditMethod(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Dekont / Makbuz No</label>
              <Input placeholder="Opsiyonel" value={editReceipt}
                onChange={(e) => setEditReceipt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPayment(null)}>İptal</Button>
            <Button onClick={updatePayment} disabled={saving}>{saving ? "Kaydediliyor…" : "Güncelle"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
