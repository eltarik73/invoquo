"use client";

import { useState, useRef, useEffect } from "react";

interface CompanyResult {
  siret: string;
  siren: string;
  companyName: string;
  address: string;
  postalCode: string;
  city: string;
  vatNumber: string;
  isActive: boolean;
}

interface Props {
  accent: string;
  token: string;
  onClientCreated: (client: { id: string; companyName: string | null; firstName: string | null; lastName: string | null }) => void;
  onCancel: () => void;
}

function computeVat(siren: string): string {
  const s = parseInt(siren, 10);
  if (isNaN(s)) return "";
  const key = ((12 + 3 * (s % 97)) % 97).toString().padStart(2, "0");
  return `FR${key}${siren}`;
}

export default function EmbedCompanySearch({ accent, token, onClientCreated, onCancel }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CompanyResult | null>(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"search" | "manual" | "individual">("search");
  const [manualName, setManualName] = useState("");
  const [manualSiret, setManualSiret] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query.trim())}&per_page=5`);
        if (!res.ok) { setResults([]); return; }
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CompanyResult[] = (data.results || []).map((r: any) => ({
          siret: r.siege?.siret || "",
          siren: r.siren || "",
          companyName: r.nom_complet || "",
          address: [r.siege?.numero_voie, r.siege?.type_voie, r.siege?.libelle_voie].filter(Boolean).join(" ") || "",
          postalCode: r.siege?.code_postal || "",
          city: r.siege?.libelle_commune || "",
          vatNumber: computeVat(r.siren || ""),
          isActive: r.etat_administratif === "A",
        }));
        setResults(mapped);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function createClient(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/v1/embed/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-embed-token": token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onClientCreated(data.data.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function handleSelectCompany(company: CompanyResult) {
    setSelected(company);
    setQuery(company.companyName);
    setResults([]);
  }

  function handleConfirm() {
    if (mode === "individual") {
      if (!firstName && !lastName) { setError("Nom ou prénom requis"); return; }
      createClient({ type: "individual", firstName: firstName || undefined, lastName: lastName || undefined, email: email || undefined });
    } else if (selected) {
      createClient({
        type: "company", companyName: selected.companyName, siret: selected.siret || undefined,
        siren: selected.siren || undefined, vatNumber: selected.vatNumber || undefined,
        address: selected.address || undefined, postalCode: selected.postalCode || undefined,
        city: selected.city || undefined, email: email || undefined,
      });
    } else if (mode === "manual") {
      if (!manualName.trim()) { setError("Raison sociale requise"); return; }
      createClient({
        type: "company", companyName: manualName, siret: manualSiret || undefined, email: email || undefined,
      });
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">Nouveau client</span>
        <button type="button" onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        {([["search", "Rechercher"], ["manual", "Saisir"], ["individual", "Particulier"]] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setMode(key); setSelected(null); setResults([]); setQuery(""); }}
            className="flex-1 text-xs font-medium py-1.5 rounded-md transition-all"
            style={mode === key ? { background: "#fff", color: accent, boxShadow: "0 1px 2px rgba(0,0,0,.08)" } : { color: "#6b7280" }}
          >{label}</button>
        ))}
      </div>

      {mode === "search" && !selected && (
        <>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              className="w-full h-10 rounded-lg border border-gray-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": accent } as React.CSSProperties}
              placeholder="Nom ou SIRET de l'entreprise..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              autoFocus
            />
            {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /></div>}
          </div>

          {results.length > 0 && (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {results.map((r) => (
                <button key={r.siret} type="button" onClick={() => handleSelectCompany(r)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.companyName}</p>
                    <p className="text-xs text-gray-500">{r.address ? `${r.address}, ` : ""}{r.postalCode} {r.city}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-gray-400">{r.siret}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${r.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {r.isActive ? "Active" : "Fermée"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">Aucun résultat. <button type="button" onClick={() => { setMode("manual"); setManualName(query); }} className="font-medium hover:underline" style={{ color: accent }}>Saisir manuellement</button></p>
          )}
        </>
      )}

      {mode === "search" && selected && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <svg width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            <span className="text-sm font-semibold text-green-800">{selected.companyName}</span>
          </div>
          <p className="text-xs text-green-700">{selected.address}, {selected.postalCode} {selected.city} · SIRET {selected.siret}</p>
          <button type="button" onClick={() => setSelected(null)} className="text-[10px] text-green-600 hover:underline mt-1">Modifier</button>
        </div>
      )}

      {mode === "manual" && (
        <>
          <input className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Raison sociale *" value={manualName} onChange={(e) => setManualName(e.target.value)} autoFocus />
          <input className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm font-mono focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="SIRET (optionnel)" maxLength={14} value={manualSiret} onChange={(e) => setManualSiret(e.target.value.replace(/\D/g, ""))} />
        </>
      )}

      {mode === "individual" && (
        <div className="grid grid-cols-2 gap-2">
          <input className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
          <input className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Nom *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      )}

      {/* Email (shown for all modes once ready) */}
      {(selected || mode === "manual" || mode === "individual") && (
        <input className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Email (optionnel)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      )}

      {/* Confirm button */}
      {(selected || mode === "manual" || mode === "individual") && (
        <button type="button" onClick={handleConfirm} disabled={saving}
          className="w-full h-10 rounded-lg text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          style={{ background: accent }}
        >
          {saving ? "Création..." : "Ajouter le client"}
        </button>
      )}
    </div>
  );
}
