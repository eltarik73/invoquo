"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/components/format";
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
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  unit: string;
}

// ── Constants ──

const EMPTY_LINE: Line = { description: "", quantity: 1, unitPriceHT: 0, vatRate: 20, unit: "" };

const VAT_RATES = [
  { value: "20", label: "20 %" },
  { value: "10", label: "10 % (rénovation)" },
  { value: "5.5", label: "5,5 % (énergie)" },
  { value: "2.1", label: "2,1 %" },
  { value: "0", label: "0 % (exonéré)" },
];

const PAYMENT_TERMS = [
  { value: "a_reception", label: "Comptant (à réception)" },
  { value: "30_days", label: "30 jours" },
  { value: "45_days_end_of_month", label: "45 jours fin de mois" },
  { value: "60_days", label: "60 jours" },
];

const OPERATION_CATEGORIES = [
  { value: "services", label: "Prestation de services" },
  { value: "goods", label: "Livraison de biens" },
  { value: "mixed", label: "Mixte (biens + services)" },
];

// ── Helpers ──

function clientLabel(c: Client): string {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom";
}

function clientSubLabel(c: Client): string {
  if (c.siret) return `SIRET ${c.siret}`;
  return c.type === "individual" ? "Particulier" : "";
}

function calcLine(line: Line) {
  const totalHT = Math.round(line.quantity * line.unitPriceHT * 100) / 100;
  const totalVAT = Math.round(totalHT * (line.vatRate / 100) * 100) / 100;
  return { totalHT, totalVAT, totalTTC: totalHT + totalVAT };
}

// ── Client Combobox with search + create ──

function ClientCombobox({
  clients,
  selectedId,
  onSelect,
  onCreated,
}: {
  clients: Client[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      clientLabel(c).toLowerCase().includes(q) ||
      (c.siret || "").includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const selected = clients.find((c) => c.id === selectedId);

  // New client form
  const [newName, setNewName] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate() {
    setCreateError("");
    setCreating(true);
    try {
      const res = await apiFetch<{ client: Client }>("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          type: "company",
          companyName: newName,
          siret: newSiret || undefined,
          email: newEmail || undefined,
          address: newAddress || undefined,
        }),
      });
      onSelect(res.client.id);
      onCreated();
      setDialogOpen(false);
      setOpen(false);
      setNewName("");
      setNewSiret("");
      setNewEmail("");
      setNewAddress("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors text-left"
      >
        {selected ? (
          <div>
            <span className="font-medium">{clientLabel(selected)}</span>
            {clientSubLabel(selected) && (
              <span className="text-muted-foreground ml-2 text-xs font-mono">{clientSubLabel(selected)}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Sélectionner un client...</span>
        )}
        <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-72 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <Input
                ref={inputRef}
                placeholder="Rechercher par nom ou SIRET..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Results */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Aucun client trouvé
                </p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-violet-50 transition-colors ${c.id === selectedId ? "bg-violet-50" : ""}`}
                    onClick={() => { onSelect(c.id); setOpen(false); setSearch(""); }}
                  >
                    <span className="font-medium text-gray-900">{clientLabel(c)}</span>
                    {clientSubLabel(c) && (
                      <span className="text-muted-foreground ml-2 text-xs font-mono">{clientSubLabel(c)}</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create button */}
            <div className="border-t border-border p-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-md transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Nouveau client
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouveau client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    {createError && (
                      <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</div>
                    )}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Nom de l&apos;entreprise *</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Dupont Menuiserie" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">SIRET</label>
                      <Input value={newSiret} onChange={(e) => setNewSiret(e.target.value.replace(/\D/g, ""))} placeholder="14 chiffres (optionnel)" maxLength={14} inputMode="numeric" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="contact@client.fr" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Adresse</label>
                      <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Rue, code postal, ville" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="flex-1">
                        {creating ? "Création..." : "Créer le client"}
                      </Button>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: clientsData, refetch: refetchClients } = useApi<{ data: Client[] }>("/api/clients?limit=200&sort=companyName&order=asc");

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

  function updateLine(index: number, field: keyof Line, value: string | number) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
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
      await apiFetch<{ invoice: { id: string } }>("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
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
                  <label className="text-sm font-medium">Date de facture</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d&apos;échéance</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conditions de paiement</label>
                  <Select value={paymentTerms} onValueChange={(v) => v && setPaymentTerms(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie d&apos;opération</label>
                  <Select value={operationCategory} onValueChange={(v) => v && setOperationCategory(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OPERATION_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Prestation de services ou livraison de biens</p>
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
              {lines.map((line, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Designation - wider */}
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Désignation</label>
                      <Input
                        placeholder="Description du produit ou service"
                        value={line.description}
                        onChange={(e) => updateLine(i, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Quantité</label>
                      <Input type="number" min="0" step="0.001" value={line.quantity} onChange={(e) => updateLine(i, "quantity", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Prix unit. HT</label>
                      <Input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(i, "unitPriceHT", parseFloat(e.target.value) || 0)} className="font-mono" />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">TVA</label>
                      <Select value={String(line.vatRate)} onValueChange={(v) => v && updateLine(i, "vatRate", parseFloat(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VAT_RATES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Line total */}
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
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Notes ou conditions particulières (optionnel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar — Recap ── */}
        <div>
          <div
            className="sticky top-24 rounded-2xl p-6 space-y-5 animate-fade-in-up stagger-3"
            style={{ border: "1px solid #ede8f5", background: "#faf8ff" }}
          >
            <h3 className="font-bold text-gray-900" style={{ fontSize: 16 }}>Récapitulatif</h3>

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
                <span className="font-mono font-bold text-[#7c3aed]" style={{ fontSize: 24 }}>
                  {formatCurrency(totals.totalTTC)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button className="w-full" disabled={saving || !clientId} onClick={() => handleSubmit(true)}>
                {saving ? "Création..." : "Créer et finaliser"}
              </Button>
              <Button variant="outline" className="w-full" disabled={saving || !clientId} onClick={() => handleSubmit(false)}>
                Enregistrer en brouillon
              </Button>
            </div>

            <div className="pt-3 border-t border-violet-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Mentions légales (auto)</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Pénalités de retard : 3× le taux d&apos;intérêt légal</p>
                <p>Indemnité de recouvrement : 40 €</p>
                <p>
                  Catégorie :{" "}
                  {operationCategory === "services"
                    ? "Prestation de services"
                    : operationCategory === "goods"
                      ? "Livraison de biens"
                      : "Mixte"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
