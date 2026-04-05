"use client";

import { useState, useMemo } from "react";

interface Line {
  id: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
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
  { value: 10, label: "10 %" },
  { value: 5.5, label: "5,5 %" },
  { value: 0, label: "0 %" },
];

const PAYMENT_TERMS = [
  { value: "a_reception", label: "Comptant" },
  { value: "30_days", label: "30 jours" },
  { value: "45_days_end_of_month", label: "45 jours fin de mois" },
  { value: "60_days", label: "60 jours" },
];

let lineCounter = 0;
function newLine(): Line {
  return { id: `l-${++lineCounter}-${Date.now()}`, description: "", quantity: 1, unitPriceHT: 0, vatRate: 20 };
}

function calcLine(l: Line) {
  const ht = Math.round(l.quantity * l.unitPriceHT * 100) / 100;
  return { ht, tva: Math.round(ht * (l.vatRate / 100) * 100) / 100 };
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function dueDateFromTerms(date: string, terms: string): string {
  const d = new Date(date);
  if (terms === "a_reception") return date;
  if (terms === "30_days") d.setDate(d.getDate() + 30);
  else if (terms === "45_days_end_of_month") { d.setMonth(d.getMonth() + 2); d.setDate(0); }
  else if (terms === "60_days") d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

function clientName(c: Client) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Sans nom";
}

export default function EmbedInvoiceForm({ accent, siret, token, clients: initialClients }: Props) {
  const [clients, setClients] = useState(initialClients);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState("30_days");
  const [dueDate, setDueDate] = useState(dueDateFromTerms(new Date().toISOString().slice(0, 10), "30_days"));
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Inline client creation
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientSiret, setNewClientSiret] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);

  const totals = useMemo(() => {
    let totalHT = 0, totalTVA = 0;
    for (const l of lines) { const c = calcLine(l); totalHT += c.ht; totalTVA += c.tva; }
    return { ht: Math.round(totalHT * 100) / 100, tva: Math.round(totalTVA * 100) / 100, ttc: Math.round((totalHT + totalTVA) * 100) / 100 };
  }, [lines]);

  function updateLine(id: string, field: keyof Line, value: string | number) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function handleTermsChange(terms: string) {
    setPaymentTerms(terms);
    setDueDate(dueDateFromTerms(date, terms));
  }

  async function createClientInline() {
    if (!newClientName.trim()) return;
    setCreatingClient(true);
    try {
      const res = await fetch("/api/v1/embed/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-embed-token": token },
        body: JSON.stringify({ type: "company", companyName: newClientName, siret: newClientSiret || undefined, email: newClientEmail || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const c = data.data.client;
      setClients((prev) => [...prev, c]);
      setClientId(c.id);
      setShowNewClient(false);
      setNewClientName(""); setNewClientSiret(""); setNewClientEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur création client");
    } finally {
      setCreatingClient(false);
    }
  }

  async function handleSubmit(finalize: boolean) {
    setError("");
    if (!clientId) { setError("Sélectionnez un client"); return; }
    const validLines = lines.filter((l) => l.description.trim() && l.quantity > 0);
    if (validLines.length === 0) { setError("Ajoutez au moins une ligne"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/embed/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-embed-token": token },
        body: JSON.stringify({
          clientId, date, dueDate, paymentTerms, operationCategory: "services",
          lines: validLines.map((l) => ({ description: l.description, quantity: l.quantity, unitPriceHT: l.unitPriceHT, vatRate: l.vatRate })),
          notes: notes || undefined, finalize,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: `${accent}18` }}>
          <svg width="28" height="28" fill="none" stroke={accent} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-base font-semibold text-gray-900 mb-1">Facture créée</p>
        <p className="text-sm text-gray-500 mb-5">Votre facture a été enregistrée avec succès</p>
        <a href={`/embed/${siret}/invoices?token=${token}`} className="text-sm font-medium hover:underline" style={{ color: accent }}>
          Retour aux factures
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nouvelle facture</h1>
        <a href={`/embed/${siret}/invoices?token=${token}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Annuler</a>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm mb-5">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          {error}
        </div>
      )}

      {/* Client */}
      <section className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Client</label>
        {!showNewClient ? (
          <div className="flex gap-2">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="flex-1 h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              style={{ "--tw-ring-color": accent } as React.CSSProperties}
            >
              <option value="">Choisir un client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{clientName(c)}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setShowNewClient(true)}
              className="h-11 px-4 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
              Nouveau
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Nouveau client</span>
              <button type="button" onClick={() => setShowNewClient(false)} className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
            </div>
            <input className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Raison sociale *" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-mono focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="SIRET (14 chiffres)" maxLength={14} value={newClientSiret} onChange={(e) => setNewClientSiret(e.target.value.replace(/\D/g, ""))} />
              <input className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Email" type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
            </div>
            <button
              type="button"
              onClick={createClientInline}
              disabled={creatingClient || !newClientName.trim()}
              className="h-9 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: accent }}
            >
              {creatingClient ? "Création..." : "Ajouter"}
            </button>
          </div>
        )}
      </section>

      {/* Dates + paiement */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date</label>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setDueDate(dueDateFromTerms(e.target.value, paymentTerms)); }} className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Échéance</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Paiement</label>
          <select value={paymentTerms} onChange={(e) => handleTermsChange(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties}>
            {PAYMENT_TERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </section>

      {/* Lignes */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prestations</label>
          <button type="button" onClick={() => setLines((p) => [...p, newLine()])} className="text-xs font-medium hover:underline" style={{ color: accent }}>
            + Ajouter une ligne
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Désignation</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase text-center">Qté</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase text-right">Prix HT</span>
            <span className="text-[11px] font-semibold text-gray-400 uppercase text-center">TVA</span>
            <span />
          </div>

          {lines.map((line, i) => {
            const lc = calcLine(line);
            return (
              <div key={line.id} className={`grid grid-cols-[1fr_80px_100px_80px_32px] gap-0 items-center px-3 py-2 ${i < lines.length - 1 ? "border-b border-gray-100" : ""}`}>
                <input className="h-9 rounded-lg border-0 bg-transparent px-2 text-sm focus:outline-none focus:bg-gray-50" placeholder="Description du produit ou service" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} />
                <input type="number" min="0" step="0.01" className="h-9 w-full rounded-lg border-0 bg-transparent px-2 text-sm text-center focus:outline-none focus:bg-gray-50" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", parseFloat(e.target.value) || 0)} />
                <input type="number" min="0" step="0.01" className="h-9 w-full rounded-lg border-0 bg-transparent px-2 text-sm text-right font-mono focus:outline-none focus:bg-gray-50" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, "unitPriceHT", parseFloat(e.target.value) || 0)} />
                <select value={line.vatRate} onChange={(e) => updateLine(line.id, "vatRate", parseFloat(e.target.value))} className="h-9 w-full rounded-lg border-0 bg-transparent text-sm text-center focus:outline-none focus:bg-gray-50 appearance-none cursor-pointer">
                  {VAT_RATES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <div className="flex justify-center">
                  {lines.length > 1 ? (
                    <button type="button" onClick={() => setLines((p) => p.filter((x) => x.id !== line.id))} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  ) : <span className="w-7" />}
                </div>
                {lc.ht > 0 && (
                  <div className="col-span-5 text-right pr-10 -mt-1 pb-1">
                    <span className="text-[11px] text-gray-400">{fmt(lc.ht)} HT</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Notes */}
      <section className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
        <textarea className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} rows={2} placeholder="Conditions particulières (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </section>

      {/* Totaux + Actions */}
      <div className="rounded-xl p-5 mb-4" style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">Total HT</span>
          <span className="font-mono font-medium text-gray-700">{fmt(totals.ht)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">TVA</span>
          <span className="font-mono text-gray-500">{fmt(totals.tva)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t" style={{ borderColor: `${accent}20` }}>
          <span className="text-sm font-bold text-gray-900">Total TTC</span>
          <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{fmt(totals.ttc)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="flex-1 h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          {saving ? "Création..." : "Créer et finaliser"}
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="h-12 px-6 rounded-xl text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Brouillon
        </button>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
        Pénalités de retard : 3x le taux légal · Indemnité de recouvrement : 40 € · Escompte : Néant
      </p>
    </div>
  );
}
