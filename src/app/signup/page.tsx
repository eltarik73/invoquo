"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [siret, setSiret] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLookup, setCompanyLookup] = useState<string | null>(null);
  const [siretLoading, setSiretLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength
  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const pwColors = ["bg-gray-200", "bg-red-400", "bg-amber-400", "bg-emerald-400"];
  const pwLabels = ["", "Faible", "Correct", "Fort"];

  const lookupSiret = useCallback(async (value: string) => {
    if (value.length !== 14) { setCompanyLookup(null); return; }
    setSiretLoading(true);
    try {
      const res = await fetch(`/api/lookup/siret?q=${value}`);
      const data = await res.json();
      if (data.data?.companyName) {
        setCompanyLookup(data.data.companyName);
        if (!companyName) setCompanyName(data.data.companyName);
      } else {
        setCompanyLookup(null);
      }
    } catch {
      setCompanyLookup(null);
    } finally {
      setSiretLoading(false);
    }
  }, [companyName]);

  function handleSiretChange(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 14);
    setSiret(cleaned);
    if (cleaned.length === 14) lookupSiret(cleaned);
    else setCompanyLookup(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!accepted) { setError("Veuillez accepter les CGV"); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, siret, companyName: companyName || undefined }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" fill="none" width={36} height={36}>
              <rect width="32" height="32" rx="8" fill="#7c3aed" />
              <path d="M8 10h4v12H8V10z" fill="#fff" />
              <path d="M15 10h4l5 12h-4l-5-12z" fill="#fff" opacity=".9" />
              <circle cx="24" cy="10" r="2" fill="#a78bfa" />
            </svg>
            <span className="text-xl font-bold text-gray-900">invoquo</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Creer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inscrivez-vous en 2 minutes
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email" type="email" placeholder="vous@entreprise.fr" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="8 caracteres minimum" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= pwStrength ? pwColors[pwStrength] : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="siret" className="text-sm font-medium text-gray-700">SIRET</label>
              <Input id="siret" type="text" placeholder="14 chiffres" value={siret} onChange={(e) => handleSiretChange(e.target.value)} required maxLength={14} inputMode="numeric" />
              {siretLoading && <p className="text-xs text-gray-400">Recherche...</p>}
              {companyLookup && (
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 text-sm animate-fade-in-up">
                  <p className="font-medium text-violet-900">{companyLookup}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="company" className="text-sm font-medium text-gray-700">Nom de l&apos;entreprise</label>
              <Input id="company" type="text" placeholder="Rempli automatiquement" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-violet-500" />
              <span className="text-xs text-gray-500">
                J&apos;accepte les{" "}
                <span className="text-violet-600 underline">CGV</span> et la{" "}
                <span className="text-violet-600 underline">politique de confidentialite</span>
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={loading || !accepted}>
              {loading ? "Creation..." : "Creer mon compte"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              1 mois gratuit · Sans carte bancaire
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Deja un compte ?{" "}
              <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
