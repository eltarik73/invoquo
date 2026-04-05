"use client";

import { useState, useMemo } from "react";

interface Line {
  id: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  unit: string;
}

interface Client {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface Props {
  accent: string;
  siret: string;
  token: string;
  clients: Client[];
}

const VAT_RATES = [
  { value: 20, label: "20 %" },
  { value: 10, label: "10 % (rénovation)" },
  { value: 5.5, label: "5,5 % (énergie)" },
  { value: 0, label: "0 % (exonéré)" },
];

let lineCounter = 0;
function newLine(): Line {
  return { id: `line-${++lineCounter}-${Date.now()}`, description: "", quantity: 1, unitPriceHT: 0, vatRate: 20, unit: "" };
}

function calcLine(line: Line) {
  const totalHT = Math.round(line.quantity * line.unitPriceHT * 100) / 100;
  const totalVAT = Math.round(totalHT * (line.vatRate / 100) * 100) / 100;
  return { totalHT, totalVAT, totalTTC: totalHT + totalVAT };
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function EmbedQuoteForm({ accent, siret, token, clients }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(today);
  const [validUntil, setValidUntil] = useState(addDays(today, 30));
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const totals = useMemo(() => {
    let totalHT = 0;
    let totalVAT = 0;
    for (const line of lines) {
      const lt = calcLine(line);
      totalHT += lt.totalHT;
      totalVAT += lt.totalVAT;
    }
    return {
      totalHT: Math.round(totalHT * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      totalTTC: Math.round((totalHT + totalVAT) * 100) / 100,
    };
  }, [lines]);

  function updateLine(id: string, field: keyof Line, value: string | number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  async function handleSubmit(finalize: boolean) {
    setError("");
    if (!clientId) { setError("Sélectionnez un client"); return; }
    const validLines = lines.filter((l) => l.description.trim() && l.quantity > 0);
    if (validLines.length === 0) { setError("Ajoutez au moins une ligne valide"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/v1/embed/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-embed-token": token },
        body: JSON.stringify({
          clientId, date, validUntil, operationCategory: "services",
          lines: validLines.map((l) => ({
            description: l.description, quantity: l.quantity,
            unitPriceHT: l.unitPriceHT, vatRate: l.vatRate,
            unit: l.unit || undefined,
          })),
          notes: notes || undefined, finalize,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}15` }}>
          <svg className="w-7 h-7" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-900 mb-1">Devis créé avec succès</p>
        <a href={`/embed/${siret}/quotes?token=${token}`} className="text-sm font-medium mt-3 inline-block" style={{ color: accent }}>
          ← Retour aux devis
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Nouveau devis</h1>
          <p className="text-xs text-gray-500 mt-0.5">Remplissez les informations ci-dessous</p>
        </div>
        <a href={`/embed/${siret}/quotes?token=${token}`} className="text-sm" style={{ color: accent }}>← Retour</a>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Client + dates */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Informations</p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": accent } as React.CSSProperties}
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Sans nom"}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Aucun client. <a href={`/embed/${siret}/clients/new?token=${token}`} style={{ color: accent }} className="font-medium">Créer un client</a> d&apos;abord.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Date du devis</label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setValidUntil(addDays(e.target.value, 30)); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Valide jusqu&apos;au</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Lignes du devis</p>
              <button type="button" onClick={() => setLines((prev) => [...prev, newLine()])} className="text-xs font-medium px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50">+ Ajouter</button>
            </div>
            {lines.map((line) => (
              <div key={line.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="text-[10px] text-gray-500 font-medium">Désignation</label>
                    <input className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm" placeholder="Description..." value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-medium">Quantité</label>
                    <input type="number" min="0" step="0.001" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-medium">Prix HT</label>
                    <input type="number" min="0" step="0.01" className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, "unitPriceHT", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label className="text-[10px] text-gray-500 font-medium">TVA</label>
                    <select value={line.vatRate} onChange={(e) => updateLine(line.id, "vatRate", parseFloat(e.target.value))} className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm">
                      {VAT_RATES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex items-end justify-end">
                    {lines.length > 1 && (
                      <button type="button" className="p-1 text-gray-400 hover:text-red-500" onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right mt-1 text-xs text-gray-500">
                  Total HT : <span className="font-mono font-medium text-gray-700">{formatCurrency(calcLine(line).totalHT)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Notes</p>
            <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="Conditions ou remarques (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-4 bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-900">Récapitulatif</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total HT</span><span className="font-mono font-medium">{formatCurrency(totals.totalHT)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">TVA</span><span className="font-mono">{formatCurrency(totals.totalVAT)}</span></div>
              <div className="border-t pt-2 flex justify-between items-baseline">
                <span className="font-semibold">Total TTC</span>
                <span className="font-mono font-bold text-lg" style={{ color: accent }}>{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: accent }}
              >
                {saving ? "Création..." : "Créer et envoyer"}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Enregistrer en brouillon
              </button>
            </div>
            <div className="pt-2 border-t text-[10px] text-gray-400">
              <p>Validité : 30 jours par défaut</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
