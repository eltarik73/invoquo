"use client";

import { useState } from "react";

interface Props {
  accent: string;
  siret: string;
  token: string;
}

export default function EmbedClientForm({ accent, siret, token }: Props) {
  const [type, setType] = useState<"company" | "individual">("company");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientSiret, setClientSiret] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");
    if (type === "company" && !companyName.trim()) { setError("La raison sociale est obligatoire"); return; }
    if (type === "individual" && !firstName.trim() && !lastName.trim()) { setError("Le nom ou prénom est obligatoire"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/embed/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-embed-token": token },
        body: JSON.stringify({
          type, companyName: companyName || undefined, firstName: firstName || undefined,
          lastName: lastName || undefined, siret: clientSiret || undefined,
          email: email || undefined, phone: phone || undefined,
          address: address || undefined, postalCode: postalCode || undefined,
          city: city || undefined, notes: notes || undefined,
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
        <p className="text-base font-semibold text-gray-900 mb-1">Client créé</p>
        <p className="text-sm text-gray-500 mb-5">Le client a été ajouté avec succès</p>
        <a href={`/embed/${siret}/clients?token=${token}`} className="text-sm font-medium hover:underline" style={{ color: accent }}>Retour aux clients</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nouveau client</h1>
        <a href={`/embed/${siret}/clients?token=${token}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Annuler</a>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm mb-5">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          {error}
        </div>
      )}

      {/* Type toggle */}
      <section className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</label>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          {(["company", "individual"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex-1 h-11 text-sm font-medium transition-all"
              style={type === t ? { background: accent, color: "#fff" } : { background: "#fff", color: "#6b7280" }}
            >
              {t === "company" ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h4v5m-4 0h4"/></svg>
                  Entreprise
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8"/></svg>
                  Particulier
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Identité */}
      <section className="mb-5 space-y-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Identité</label>
        {type === "company" ? (
          <>
            <input className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Raison sociale *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <input className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm font-mono focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="SIRET (14 chiffres)" maxLength={14} value={clientSiret} onChange={(e) => setClientSiret(e.target.value.replace(/\D/g, ""))} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Nom *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="mb-5 space-y-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="email" className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </section>

      {/* Adresse */}
      <section className="mb-5 space-y-3">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</label>
        <input className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Rue, numéro" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <input className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Code postal" maxLength={5} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          <input className="h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </section>

      {/* Notes */}
      <section className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
        <textarea className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent } as React.CSSProperties} rows={2} placeholder="Notes internes (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </section>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full h-12 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
        style={{ background: accent }}
      >
        {saving ? "Création..." : "Créer le client"}
      </button>
    </div>
  );
}
