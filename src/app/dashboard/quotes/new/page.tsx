"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCombobox } from "@/components/client-combobox";
import { formatCurrency, formatDate } from "@/components/format";
import { useApi, apiFetch } from "@/hooks/use-api";

// ── Types ──

interface Client {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  email: string | null;
  type: string;
}

interface Line {
  id: number;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

// ── Constants ──

const VAT_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 % (rénovation)" },
  { value: "5.5", label: "5,5 % (énergie)" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (exonéré)" },
];

const OPERATION_CATEGORIES = [
  { value: "services", label: "Prestation de services" },
  { value: "goods", label: "Livraison de biens" },
  { value: "mixed", label: "Mixte (biens + services)" },
];

// ── Helpers ──

function calcLine(line: Line) {
  const totalHT = Math.round(line.quantity * line.unitPriceHT * 100) / 100;
  const totalVAT = Math.round(totalHT * (line.vatRate / 100) * 100) / 100;
  return { totalHT, totalVAT, totalTTC: totalHT + totalVAT };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function plus30Days(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// ── Page ──

let lineCounter = 1;

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: clientsData, refetch: refetchClients } = useApi<{ data: Client[] }>(
    "/api/clients?limit=200&sort=createdAt&order=desc",
  );

  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [validUntil, setValidUntil] = useState(plus30Days());
  const [operationCategory, setOperationCategory] = useState("services");
  const [lines, setLines] = useState<Line[]>([
    { id: lineCounter++, description: "", quantity: 1, unitPriceHT: 0, vatRate: 20 },
  ]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Pre-select client from URL params
  useEffect(() => {
    const preselect = searchParams.get("clientId");
    if (preselect) setClientId(preselect);
  }, [searchParams]);

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
      vatBreakdown: Array.from(vatMap.entries())
        .map(([rate, { base, vat }]) => ({ rate, base, vat }))
        .sort((a, b) => b.rate - a.rate),
    };
  }, [lines]);

  function updateLine(index: number, field: keyof Omit<Line, "id">, value: string | number) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: lineCounter++, description: "", quantity: 1, unitPriceHT: 0, vatRate: 20 },
    ]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
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
      await apiFetch<{ quote: { id: string } }>("/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          date,
          validUntil,
          operationCategory,
          lines: lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPriceHT: l.unitPriceHT,
            vatRate: l.vatRate,
          })),
          notes: notes || undefined,
          finalize,
        }),
      });
      router.push("/dashboard/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  const selectedClient = (clientsData?.data ?? []).find((c) => c.id === clientId);

  return (
    <div className="max-w-5xl animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Retour">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complétez les informations pour créer votre devis</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-6">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* ── Section 1: Client ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </div>
              <h2 className="font-semibold text-gray-900">Client</h2>
            </div>
            <ClientCombobox
              clients={clientsData?.data ?? []}
              selectedId={clientId}
              onSelect={(id) => { setClientId(id); setFieldErrors((e) => { const { client: _, ...rest } = e; return rest; }); }}
              onCreated={refetchClients}
              hasError={!!fieldErrors.client}
            />
            {fieldErrors.client && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.client}</p>}
            {selectedClient && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Client sélectionné
                {selectedClient.siret && <span className="font-mono">· {selectedClient.siret}</span>}
              </div>
            )}
          </section>

          {/* ── Section 2: Détails ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              </div>
              <h2 className="font-semibold text-gray-900">Détails</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Date du devis</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Valable jusqu&apos;au</label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Catégorie d&apos;opération</label>
                <Select value={operationCategory} onValueChange={(v) => v && setOperationCategory(v)}>
                  <SelectTrigger><SelectValue>{() => OPERATION_CATEGORIES.find((c) => c.value === operationCategory)?.label}</SelectValue></SelectTrigger>
                  <SelectContent>{OPERATION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* ── Section 3: Lignes ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
                <h2 className="font-semibold text-gray-900">Prestations</h2>
              </div>
              <Button variant="outline" size="sm" onClick={addLine} className="text-violet-600 border-violet-200 hover:bg-violet-50">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Ajouter
              </Button>
            </div>

            {fieldErrors.lines && <p className="text-xs text-red-500 mb-3">{fieldErrors.lines}</p>}

            <div className="space-y-3">
              {lines.map((line, index) => {
                const lineTotal = calcLine(line);
                return (
                  <div key={line.id} className="group relative rounded-xl border border-gray-150 bg-gray-50/50 p-4 hover:border-violet-200 hover:bg-violet-50/20 transition-all">
                    <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] font-medium text-gray-400">
                      Ligne {index + 1}
                    </div>

                    <div className="space-y-3 mt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500">Désignation</label>
                        <Input
                          placeholder="Ex: Rénovation cuisine complète"
                          value={line.description}
                          onChange={(e) => updateLine(index, "description", e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-11 gap-2 sm:gap-3 items-end">
                        <div className="col-span-1 sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-medium text-gray-500">Qté</label>
                          <Input type="number" min="0" step="0.001" value={line.quantity} onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value) || 0)} className="bg-white text-center" />
                        </div>
                        <div className="col-span-1 sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-medium text-gray-500">Prix HT</label>
                          <div className="relative">
                            <Input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(index, "unitPriceHT", parseFloat(e.target.value) || 0)} className="font-mono bg-white pr-6" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                          </div>
                        </div>
                        <div className="col-span-1 sm:col-span-3 space-y-1.5">
                          <label className="text-xs font-medium text-gray-500">TVA</label>
                          <Select value={String(line.vatRate)} onValueChange={(v) => v && updateLine(index, "vatRate", parseFloat(v))}>
                            <SelectTrigger className="bg-white"><SelectValue>{() => VAT_RATES.find((r) => r.value === String(line.vatRate))?.label}</SelectValue></SelectTrigger>
                            <SelectContent>{VAT_RATES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="hidden sm:flex col-span-2 items-end justify-end">
                          {lines.length > 1 && (
                            <button type="button" className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" onClick={() => removeLine(index)} aria-label="Supprimer la ligne">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {lines.length > 1 && (
                        <button type="button" className="sm:hidden text-xs text-red-400 hover:text-red-600 transition-colors" onClick={() => removeLine(index)}>
                          Supprimer cette ligne
                        </button>
                      )}
                    </div>

                    <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400">Total HT</span>
                        <span className="font-mono font-semibold text-sm text-gray-700">{formatCurrency(lineTotal.totalHT)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Section 4: Notes ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h2 className="font-semibold text-gray-900">Notes</h2>
              <span className="text-xs text-gray-400">(optionnel)</span>
            </div>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-colors resize-none"
              rows={3}
              placeholder="Conditions particulières, informations complémentaires..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>
        </div>

        {/* ── Sidebar: Récapitulatif ── */}
        <div className="animate-fade-in-up stagger-2">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50/80 to-white p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base">Récapitulatif</h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span className="font-mono font-medium text-gray-700">{formatCurrency(totals.totalHT)}</span>
                </div>
                {totals.vatBreakdown.map((v) => (
                  <div key={v.rate} className="flex justify-between text-sm">
                    <span className="text-gray-500">TVA {v.rate} %</span>
                    <span className="font-mono text-gray-500">{formatCurrency(v.vat)}</span>
                  </div>
                ))}
                <div className="border-t border-violet-200 pt-3 flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="font-mono font-bold text-violet-600 text-2xl">{formatCurrency(totals.totalTTC)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-violet-100">
                <p className="text-xs text-gray-400">
                  Devis valable jusqu&apos;au{" "}
                  <span className="font-mono font-medium text-gray-600">{formatDate(validUntil)}</span>
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <Button className="w-full h-11 text-sm font-semibold rounded-xl" disabled={saving || !clientId} onClick={() => handleSubmit(true)}>
                  {saving ? "Création..." : "Créer le devis"}
                </Button>
                <Button variant="outline" className="w-full h-10 text-sm rounded-xl" disabled={saving || !clientId} onClick={() => handleSubmit(false)}>
                  Enregistrer en brouillon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Chargement...</div>}>
      <NewQuoteContent />
    </Suspense>
  );
}
