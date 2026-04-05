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
        <p className="font-semibold text-gray-900 mb-1">Client créé avec succès</p>
        <a href={`/embed/${siret}/clients?token=${token}`} className="text-sm font-medium mt-3 inline-block" style={{ color: accent }}>
          ← Retour aux clients
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Nouveau client</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ajoutez les informations du client</p>
        </div>
        <a href={`/embed/${siret}/clients?token=${token}`} className="text-sm" style={{ color: accent }}>← Retour</a>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-4 max-w-2xl">
        {/* Type toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Type de client</p>
          <div className="flex gap-2">
            {(["company", "individual"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={type === t ? { backgroundColor: accent, color: "#fff", borderColor: accent } : { borderColor: "#d1d5db" }}
              >
                {t === "company" ? "Entreprise" : "Particulier"}
              </button>
            ))}
          </div>
        </div>

        {/* Identity */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Identité</p>
          {type === "company" ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Raison sociale *</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Nom de l'entreprise" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">SIRET *</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono" placeholder="14 chiffres" maxLength={14} value={clientSiret} onChange={(e) => setClientSiret(e.target.value.replace(/\D/g, ""))} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Prénom</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nom *</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="email@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Téléphone</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="06 00 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Adresse</p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Adresse</label>
            <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Rue, numéro" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Code postal</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="73000" maxLength={5} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Ville</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Chambéry" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700">Notes</p>
          <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} placeholder="Notes internes (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {saving ? "Création..." : "Créer le client"}
        </button>
      </div>
    </div>
  );
}
