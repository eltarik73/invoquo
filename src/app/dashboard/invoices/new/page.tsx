"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/components/format";
import { useApi, apiFetch } from "@/hooks/use-api";
import { ClientCombobox, type Client } from "@/components/client-combobox";

// ── Types ──

interface Line {
  id: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  unit: string;
}

let lineCounter = 0;
function newLine(): Line {
  return { id: `line-${++lineCounter}-${Date.now()}`, description: "", quantity: 1, unitPriceHT: 0, vatRate: 20, unit: "" };
}

const VAT_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 % (rénovation)" },
  { value: "5.5", label: "5,5 % (énergie)" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (exonéré)" },
];

const PAYMENT_TERMS = [
  { value: "a_reception", label: "Comptant (à réception)" },
  { value: "30_days", label: "30 jours net" },
  { value: "45_days_end_of_month", label: "45 jours fin de mois" },
  { value: "60_days", label: "60 jours" },
];

const OPERATION_CATEGORIES = [
  { value: "services", label: "Prestation de services" },
  { value: "goods", label: "Livraison de biens" },
  { value: "mixed", label: "Mixte (biens + services)" },
];

function calcLine(line: Line) {
  const totalHT = Math.round(line.quantity * line.unitPriceHT * 100) / 100;
  const totalVAT = Math.round(totalHT * (line.vatRate / 100) * 100) / 100;
  return { totalHT, totalVAT, totalTTC: totalHT + totalVAT };
}

function dueDateFromTerms(date: string, terms: string): string {
  const d = new Date(date);
  if (terms === "a_reception") return date;
  if (terms === "30_days") d.setDate(d.getDate() + 30);
  else if (terms === "45_days_end_of_month") { d.setMonth(d.getMonth() + 2); d.setDate(0); }
  else if (terms === "60_days") d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("clientId") || "";

  const { data: clientsData, refetch: refetchClients } = useApi<{ data: Client[] }>("/api/clients?limit=200&sort=createdAt&order=desc");

  const [clientId, setClientId] = useState(preselectedClient);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState("30_days");
  const [dueDate, setDueDate] = useState(dueDateFromTerms(new Date().toISOString().slice(0, 10), "30_days"));
  const [operationCategory, setOperationCategory] = useState("services");
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function handleTermsChange(terms: string) {
    setPaymentTerms(terms);
    setDueDate(dueDateFromTerms(date, terms));
  }

  const totals = useMemo(() => {
    let totalHT = 0;
    let totalVAT = 0;
    const vatMap = new Map<number, { base: number; vat: number }>();
    for (const line of lines) {
      const lt = calcLine(line);
      totalHT += lt.totalHT;
      totalVAT += lt.totalVAT;
      const existing = vatMap.get(line.vatRate) ?? { base: 0, vat: 0 };
      existing.base += lt.totalHT;
      existing.vat += lt.totalVAT;
      vatMap.set(line.vatRate, existing);
    }
    return {
      totalHT: Math.round(totalHT * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      totalTTC: Math.round((totalHT + totalVAT) * 100) / 100,
      vatBreakdown: Array.from(vatMap.entries()).map(([rate, { base, vat }]) => ({ rate, base, vat })).sort((a, b) => b.rate - a.rate),
    };
  }, [lines]);

  function updateLine(id: string, field: keyof Line, value: string | number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
  }

  function removeLine(id: string) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!clientId) errs.client = "Sélectionnez un client";
    const validLines = lines.filter((l) => l.description.trim() && l.quantity > 0);
    if (validLines.length === 0) errs.lines = "Ajoutez au moins une ligne valide";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(finalize: boolean) {
    setError("");
    if (!validate()) return;
    setSaving(true);
    try {
      await apiFetch<{ invoice: { id: string } }>("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          clientId, date, dueDate, paymentTerms, operationCategory,
          lines: lines.filter((l) => l.description.trim()).map((l) => ({
            description: l.description, quantity: l.quantity,
            unitPriceHT: l.unitPriceHT, vatRate: l.vatRate,
            unit: l.unit || undefined,
          })),
          notes: notes || undefined, finalize,
        }),
      });
      router.push("/dashboard/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Nouvelle facture</h1>
        <p className="text-muted-foreground text-sm mt-1">Remplissez les informations ci-dessous</p>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Client + Info */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <ClientCombobox
                  clients={clientsData?.data ?? []}
                  selectedId={clientId}
                  onSelect={(id) => { setClientId(id); setFieldErrors((e) => { const { client: _, ...rest } = e; return rest; }); }}
                  onCreated={refetchClients}
                  hasError={!!fieldErrors.client}
                />
                {fieldErrors.client && <p className="text-xs text-red-500">{fieldErrors.client}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de facture</label>
                  <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setDueDate(dueDateFromTerms(e.target.value, paymentTerms)); }} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d&apos;échéance</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conditions de paiement</label>
                  <Select value={paymentTerms} onValueChange={(v) => v && handleTermsChange(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_TERMS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie d&apos;opération</label>
                  <Select value={operationCategory} onValueChange={(v) => v && setOperationCategory(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{OPERATION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Lignes de facturation</CardTitle>
              <Button variant="outline" size="sm" onClick={addLine}>+ Ajouter une ligne</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldErrors.lines && <p className="text-xs text-red-500">{fieldErrors.lines}</p>}
              {lines.map((line) => (
                <div key={line.id} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Désignation</label>
                      <Input placeholder="Description du produit ou service" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Quantité</label>
                      <Input type="number" min="0" step="0.001" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Prix unit. HT</label>
                      <Input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, "unitPriceHT", parseFloat(e.target.value) || 0)} className="font-mono" />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">TVA</label>
                      <Select value={String(line.vatRate)} onValueChange={(v) => v && updateLine(line.id, "vatRate", parseFloat(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{VAT_RATES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-end justify-end">
                      {lines.length > 1 && (
                        <button type="button" className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-5" onClick={() => removeLine(line.id)} title="Supprimer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-2 text-sm">
                    <span className="text-muted-foreground mr-2">Total HT :</span>
                    <span className="font-mono font-medium">{formatCurrency(calcLine(line).totalHT)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Notes ou conditions particulières (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <div className="sticky top-24 rounded-2xl p-6 space-y-5 animate-fade-in-up stagger-3" style={{ border: "1px solid #ede8f5", background: "#faf8ff" }}>
            <h3 className="font-bold text-gray-900" style={{ fontSize: 16 }}>Récapitulatif</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total HT</span><span className="font-mono font-medium">{formatCurrency(totals.totalHT)}</span></div>
              {totals.vatBreakdown.map((v) => <div key={v.rate} className="flex justify-between text-sm"><span className="text-gray-500">TVA {v.rate} %</span><span className="font-mono text-gray-500">{formatCurrency(v.vat)}</span></div>)}
              <div className="border-t border-violet-200 pt-3 flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total TTC</span>
                <span className="font-mono font-bold text-[#7c3aed]" style={{ fontSize: 24 }}>{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <Button className="w-full" disabled={saving} onClick={() => handleSubmit(true)}>{saving ? "Création..." : "Créer et finaliser"}</Button>
              <Button variant="outline" className="w-full" disabled={saving} onClick={() => handleSubmit(false)}>Enregistrer en brouillon</Button>
            </div>
            <div className="pt-3 border-t border-violet-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Mentions légales (auto)</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Pénalités de retard : 3× le taux d&apos;intérêt légal</p>
                <p>Indemnité de recouvrement : 40 €</p>
                <p>Escompte pour paiement anticipé : Néant</p>
                <p>Catégorie : {OPERATION_CATEGORIES.find((c) => c.value === operationCategory)?.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Chargement...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
