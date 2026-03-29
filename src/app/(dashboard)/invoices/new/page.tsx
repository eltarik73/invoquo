"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

interface Client {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  type: string;
}

interface Line {
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  unit: string;
}

const EMPTY_LINE: Line = {
  description: "",
  quantity: 1,
  unitPriceHT: 0,
  vatRate: 20,
  unit: "",
};

const VAT_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 %" },
  { value: "5.5", label: "5,5 %" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 %" },
];

const PAYMENT_TERMS = [
  { value: "a_reception", label: "A reception" },
  { value: "30_days", label: "30 jours" },
  { value: "45_days_end_of_month", label: "45 jours fin de mois" },
  { value: "60_days", label: "60 jours" },
];

const OPERATION_CATEGORIES = [
  { value: "services", label: "Prestation de services" },
  { value: "goods", label: "Livraison de biens" },
  { value: "mixed", label: "Mixte" },
];

function clientDisplayName(c: Client) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

function calculateLineTotals(line: Line) {
  const totalHT = Math.round(line.quantity * line.unitPriceHT * 100) / 100;
  const totalVAT = Math.round(totalHT * (line.vatRate / 100) * 100) / 100;
  return { totalHT, totalVAT, totalTTC: totalHT + totalVAT };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: clientsData } = useApi<{ data: Client[] }>("/api/clients?limit=100");

  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [paymentTerms, setPaymentTerms] = useState("30_days");
  const [operationCategory, setOperationCategory] = useState("services");
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    let totalHT = 0;
    let totalVAT = 0;
    const vatMap = new Map<number, { base: number; vat: number }>();

    for (const line of lines) {
      const lt = calculateLineTotals(line);
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

  function updateLine(index: number, field: keyof Line, value: string | number) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(finalize: boolean) {
    setError("");
    setSaving(true);

    try {
      const payload = {
        clientId,
        date,
        dueDate,
        paymentTerms,
        operationCategory,
        lines: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceHT: l.unitPriceHT,
          vatRate: l.vatRate,
          unit: l.unit || undefined,
        })),
        notes: notes || undefined,
        finalize,
      };

      const result = await apiFetch<{ invoice: { id: string } }>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push(`/invoices`);
      void result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la creation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Nouvelle facture</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Remplissez les informations ci-dessous
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client + Info */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.data?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {clientDisplayName(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de facture</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d&apos;echeance</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conditions de paiement</label>
                  <Select value={paymentTerms} onValueChange={(v) => v && setPaymentTerms(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categorie d&apos;operation</label>
                  <Select value={operationCategory} onValueChange={(v) => v && setOperationCategory(v)}>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Lignes de facturation</CardTitle>
              <Button variant="outline" size="sm" onClick={addLine}>
                Ajouter une ligne
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-muted/50"
                >
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    <label className="text-xs text-muted-foreground">Designation</label>
                    <Input
                      placeholder="Description du produit ou service"
                      value={line.description}
                      onChange={(e) => updateLine(i, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <label className="text-xs text-muted-foreground">Quantite</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <label className="text-xs text-muted-foreground">PU HT</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPriceHT}
                      onChange={(e) => updateLine(i, "unitPriceHT", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    <label className="text-xs text-muted-foreground">TVA</label>
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
                  <div className="col-span-1 sm:col-span-1 space-y-1 flex flex-col">
                    <label className="text-xs text-muted-foreground">Total HT</label>
                    <span className="font-mono text-sm py-2">
                      {formatCurrency(calculateLineTotals(line).totalHT)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-end justify-end pb-1">
                    {lines.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeLine(i)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
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
                placeholder="Notes ou conditions particulieres (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Totals */}
        <div className="space-y-6">
          <Card className="animate-fade-in-up stagger-3 sticky top-8">
            <CardHeader>
              <CardTitle className="text-base">Recapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(totals.totalHT)}
                  </span>
                </div>

                {totals.vatBreakdown.map((v) => (
                  <div key={v.rate} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      TVA {v.rate}%
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {formatCurrency(v.vat)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold">Total TTC</span>
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatCurrency(totals.totalTTC)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full"
                  disabled={saving || !clientId}
                  onClick={() => handleSubmit(true)}
                >
                  {saving ? "Creation..." : "Creer et finaliser"}
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

              {/* Auto-generated legal mentions preview */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Mentions legales (auto)
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Penalites de retard : 3x le taux d&apos;interet legal</p>
                  <p>Indemnite de recouvrement : 40 EUR</p>
                  <p>
                    Categorie :{" "}
                    {operationCategory === "services"
                      ? "Prestation de services"
                      : operationCategory === "goods"
                        ? "Livraison de biens"
                        : "Mixte"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
