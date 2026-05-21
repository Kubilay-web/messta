"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Trash2, X, CheckCircle, Banknote } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

type Payment = {
  id: string; title: string; amount: number; dueDate: Date;
  paidDate: Date | null; status: string; paymentMethod: string | null; receiptNo: string | null; notes: string | null;
  contract: { id: string; contractNo: string; contractType: string; currency: string; client: { firstName: string; lastName: string; email: string } };
};
type ManualVals = { paymentMethod: string; receiptNo: string; notes: string };

interface Props {
  payments: Payment[];
  stripePublicKey: string;
  createStripeIntent: (id: string) => Promise<{ ok: boolean; clientSecret?: string; error?: string }>;
  confirmStripePayment: (id: string, intentId: string) => Promise<{ ok: boolean; error?: string }>;
  markManualPayment: (id: string, data: { paymentMethod: string; receiptNo?: string; notes?: string }) => Promise<{ ok: boolean; error?: string }>;
  deletePayment: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

const STATUS_LABEL: Record<string, string> = { PENDING: "Bekliyor", PAID: "Ödendi", PARTIAL: "Kısmi", FAILED: "Başarısız", REFUNDED: "İade" };
const STATUS_COLOR: Record<string, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FAILED:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function fmt(d: Date) { return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtMoney(n: number) { return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(n); }

const inputCls = "w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "text-sm font-medium block mb-1";

// Stripe ödeme formu bileşeni
function StripeCheckoutForm({ paymentId, onSuccess, onCancel, confirmStripePayment }: {
  paymentId: string;
  onSuccess: () => void;
  onCancel: () => void;
  confirmStripePayment: (id: string, intentId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message ?? "Ödeme başarısız.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const res = await confirmStripePayment(paymentId, paymentIntent.id);
      if (res.ok) { toast.success("Ödeme başarıyla tamamlandı."); onSuccess(); }
      else toast.error(res.error ?? "Kayıt güncellenemedi.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!stripe || loading} className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          <CreditCard className="h-4 w-4" />
          {loading ? "İşleniyor..." : "Ödemeyi Tamamla"}
        </button>
        <button type="button" onClick={onCancel} className="h-11 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">
          İptal
        </button>
      </div>
    </form>
  );
}

export default function PaymentsUI({ payments, stripePublicKey, createStripeIntent, confirmStripePayment, markManualPayment, deletePayment }: Props) {
  const stripePromise = loadStripe(stripePublicKey);

  const [filter, setFilter]         = useState("ALL");
  const [stripeTarget, setStripe]   = useState<{ id: string; clientSecret: string } | null>(null);
  const [manualTarget, setManual]   = useState<Payment | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [loadingIntent, setLoading] = useState<string | null>(null);

  const manualForm = useForm<ManualVals>();

  const filtered = filter === "ALL" ? payments : payments.filter((p) => p.status === filter);

  const total   = payments.reduce((s, p) => s + p.amount, 0);
  const paid    = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);

  async function handleStripeClick(p: Payment) {
    setLoading(p.id);
    const res = await createStripeIntent(p.id);
    setLoading(null);
    if (res.ok && res.clientSecret) {
      setStripe({ id: p.id, clientSecret: res.clientSecret });
    } else {
      toast.error(res.error ?? "Stripe başlatılamadı.");
    }
  }

  function openManual(p: Payment) {
    manualForm.reset({ paymentMethod: "Nakit", receiptNo: "", notes: "" });
    setManual(p);
  }

  async function onManualSubmit(data: ManualVals) {
    if (!manualTarget) return;
    const res = await markManualPayment(manualTarget.id, data);
    if (res.ok) { toast.success("Ödeme kaydedildi."); setManual(null); }
    else toast.error(res.error ?? "Hata.");
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await deletePayment(id);
    setDeleting(null);
    if (res.ok) toast.success("Silindi.");
    else toast.error(res.error ?? "Silme başarısız.");
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">

      {/* Özet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Toplam Portföy", amount: total,   cls: "border-l-gray-400" },
          { label: "Tahsil Edildi",  amount: paid,    cls: "border-l-green-500" },
          { label: "Bekleyen",       amount: pending, cls: "border-l-yellow-500" },
        ].map((s) => (
          <Card key={s.label} className={`shadow-sm border-l-4 ${s.cls}`}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold">{fmtMoney(s.amount)} ₺</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stripe ödeme modal */}
      {stripeTarget && (
        <Card className="border-t-4 border-blue-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Stripe ile Ödeme</h3>
              </div>
              <button onClick={() => setStripe(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret: stripeTarget.clientSecret, appearance: { theme: "stripe" } }}>
              <StripeCheckoutForm
                paymentId={stripeTarget.id}
                confirmStripePayment={confirmStripePayment}
                onSuccess={() => setStripe(null)}
                onCancel={() => setStripe(null)}
              />
            </Elements>
          </CardContent>
        </Card>
      )}

      {/* Manuel ödeme modal */}
      {manualTarget && (
        <Card className="border-t-4 border-green-600 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Manuel Ödeme Kaydı</h3>
                <p className="text-xs text-gray-500">{manualTarget.contract.contractNo} — {manualTarget.title} — {fmtMoney(manualTarget.amount)} ₺</p>
              </div>
              <button onClick={() => setManual(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ödeme Yöntemi *</label>
                  <select {...manualForm.register("paymentMethod", { required: true })} className={inputCls}>
                    <option value="Nakit">Nakit</option>
                    <option value="EFT/Havale">EFT / Havale</option>
                    <option value="Çek">Çek</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Makbuz / Fiş No</label>
                  <input {...manualForm.register("receiptNo")} placeholder="İsteğe bağlı" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Notlar</label>
                <input {...manualForm.register("notes")} placeholder="İsteğe bağlı" className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={manualForm.formState.isSubmitting} className="flex-1 sm:flex-none sm:w-40 h-10 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />{manualForm.formState.isSubmitting ? "Kaydediliyor..." : "Ödendi Olarak Kaydet"}
                </button>
                <button type="button" onClick={() => setManual(null)} className="flex-1 sm:flex-none sm:w-24 h-10 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm transition-colors">İptal</button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtre + liste */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b gap-3">
            <p className="text-sm text-gray-500">{filtered.length} ödeme</p>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 px-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
              <option value="ALL">Tümü</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <CreditCard className="h-10 w-10 opacity-30" />
              <p className="text-sm">Bu filtrede kayıt yok.</p>
            </div>
          ) : (
            <>
              {/* Masaüstü tablo */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Sözleşme</th>
                      <th className="text-left px-4 py-3">Kalem</th>
                      <th className="text-left px-4 py-3">Tutar</th>
                      <th className="text-left px-4 py-3">Vade</th>
                      <th className="text-left px-4 py-3">Durum</th>
                      <th className="text-right px-4 py-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs">{p.contract.contractNo}</p>
                          <p className="text-xs text-gray-400">{p.contract.client.firstName} {p.contract.client.lastName}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">{p.title}</td>
                        <td className="px-4 py-3 font-semibold">{fmtMoney(p.amount)} ₺</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {fmt(p.dueDate)}
                          {p.paidDate && <p className="text-green-600 text-xs">✓ {fmt(p.paidDate)}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                          {p.paymentMethod && <p className="text-xs text-gray-400 mt-0.5">{p.paymentMethod}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {p.status !== "PAID" && (
                              <>
                                <button
                                  onClick={() => handleStripeClick(p)}
                                  disabled={loadingIntent === p.id}
                                  title="Stripe ile öde"
                                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors disabled:opacity-30"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openManual(p)}
                                  title="Manuel kayıt"
                                  className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                                >
                                  <Banknote className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors disabled:opacity-30">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobil kart */}
              <div className="md:hidden divide-y">
                {filtered.map((p) => (
                  <div key={p.id} className={`p-4 space-y-2 border-l-4 ${p.status === "PAID" ? "border-l-green-500" : p.status === "PENDING" ? "border-l-yellow-500" : "border-l-gray-300"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.contract.contractNo} · {p.contract.client.firstName} {p.contract.client.lastName}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {p.status !== "PAID" && (
                          <>
                            <button onClick={() => handleStripeClick(p)} disabled={loadingIntent === p.id} className="p-1.5 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-30"><CreditCard className="h-4 w-4" /></button>
                            <button onClick={() => openManual(p)} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Banknote className="h-4 w-4" /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? ""}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                      <span className="font-bold">{fmtMoney(p.amount)} ₺</span>
                      <span className="text-gray-500">Vade: {fmt(p.dueDate)}</span>
                      {p.paymentMethod && <span className="text-gray-400">{p.paymentMethod}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Açıklama */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-blue-600" /> Stripe kartla ödeme</span>
        <span className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5 text-green-600" /> Nakit / EFT / Çek ile manuel kayıt</span>
      </div>
    </div>
  );
}
