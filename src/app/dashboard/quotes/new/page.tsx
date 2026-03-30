"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
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
  { value: "10", label: "10 % (r\u00e9novation)" },
  { value: "5.5", label: "5,5 % (\u00e9nergie)" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (exon\u00e9r\u00e9)" },
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

  async function handleSubmit(finalize: boolean) {
    setError("");
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
      setError(err instanceof Error ? err.message : "Erreur lors de la cr\u00e9ation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Nouveau devis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Remplissez les informations ci-dessous pour cr&eacute;er votre devis
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main form ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client + Info */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <ClientCombobox
                  clients={clientsData?.data ?? []}
                  selectedId={clientId}
                  onSelect={setClientId}
                  onCreated={refetchClients}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date du devis</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de validit&eacute;</label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cat&eacute;gorie d&apos;op&eacute;ration</label>
                  <Select
                    value={operationCategory}
                    onValueChange={(v) => v && setOperationCategory(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATION_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Prestation de services ou livraison de biens
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Lignes du devis</CardTitle>
              <Button variant="outline" size="sm" onClick={addLine}>
                + Ajouter une ligne
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.map((line, i) => (
                <div key={line.id} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">
                        D&eacute;signation
                      </label>
                      <Input
                        placeholder="Description du produit ou service"
                        value={line.description}
                        onChange={(e) => updateLine(i, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">
                        Quantit&eacute;
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(i, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">
                        Prix unit. HT
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPriceHT}
                        onChange={(e) =>
                          updateLine(i, "unitPriceHT", parseFloat(e.target.value) || 0)
                        }
                        className="font-mono"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">TVA</label>
                      <Select
                        value={String(line.vatRate)}
                        onValueChange={(v) => v && updateLine(i, "vatRate", parseFloat(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VAT_RATES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-end justify-end">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-5"
                          onClick={() => removeLine(i)}
                          title="Supprimer cette ligne"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Line total */}
                  <div className="flex justify-end mt-2 text-sm">
                    <span className="text-muted-foreground mr-2">Total HT :</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(calcLine(line).totalHT)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Notes ou conditions particuli&egrave;res (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar -- Recap ── */}
        <div>
          <div
            className="sticky top-24 rounded-2xl p-6 space-y-5 animate-fade-in-up stagger-3"
            style={{ border: "1px solid #ede8f5", background: "#faf8ff" }}
          >
            <h3 className="font-bold text-gray-900" style={{ fontSize: 16 }}>
              R&eacute;capitulatif
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span className="font-mono font-medium">{formatCurrency(totals.totalHT)}</span>
              </div>
              {totals.vatBreakdown.map((v) => (
                <div key={v.rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {v.rate} %</span>
                  <span className="font-mono text-gray-500">{formatCurrency(v.vat)}</span>
                </div>
              ))}
              <div className="border-t border-violet-200 pt-3 flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total TTC</span>
                <span
                  className="font-mono font-bold text-[#7c3aed]"
                  style={{ fontSize: 24 }}
                >
                  {formatCurrency(totals.totalTTC)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-200">
              <p className="text-xs text-gray-400">
                Devis valable jusqu&apos;au{" "}
                <span className="font-mono font-medium text-gray-600">
                  {formatDate(validUntil)}
                </span>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                className="w-full"
                disabled={saving || !clientId}
                onClick={() => handleSubmit(true)}
              >
                {saving ? "Cr\u00e9ation..." : "Cr\u00e9er le devis"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={saving || !clientId}
                onClick={() => handleSubmit(false)}
              >
                Enregistrer en brouillon
              </Button>
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
