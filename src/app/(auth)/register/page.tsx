"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyInfo {
  companyName: string;
  legalForm: string;
  address: string;
  city: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [siret, setSiret] = useState("");
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [siretLoading, setSiretLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupSiret = useCallback(async (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.length !== 14) {
      setCompany(null);
      return;
    }

    setSiretLoading(true);
    try {
      const res = await fetch(
        `https://api.pappers.fr/v2/entreprise?siret=${cleaned}&api_token=${process.env.NEXT_PUBLIC_PAPPERS_API_KEY ?? ""}`,
      );
      if (res.ok) {
        const data = await res.json();
        setCompany({
          companyName:
            data.nom_entreprise ?? data.denomination ?? data.nom_complet ?? "",
          legalForm: data.forme_juridique ?? "",
          address: data.siege?.adresse_ligne_1 ?? "",
          city: `${data.siege?.code_postal ?? ""} ${data.siege?.ville ?? ""}`.trim(),
        });
      }
    } catch {
      // Pappers lookup is best-effort
    } finally {
      setSiretLoading(false);
    }
  }, []);

  function handleSiretChange(value: string) {
    // Allow spaces for readability (123 456 789 00012)
    const display = value.replace(/[^\d\s]/g, "");
    setSiret(display);
    const cleaned = display.replace(/\s/g, "");
    if (cleaned.length === 14) {
      lookupSiret(cleaned);
    } else {
      setCompany(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleaned = siret.replace(/\s/g, "");
    if (cleaned.length !== 14) {
      setError("Le SIRET doit contenir 14 chiffres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, siret: cleaned }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      localStorage.setItem("accessToken", data.data.accessToken);
      router.push("/");
    } catch {
      setError("Une erreur est survenue. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Invoquo</h1>
        <p className="text-muted-foreground mt-1">
          Creez votre compte en 2 minutes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>
            Entrez votre SIRET, on s&apos;occupe du reste
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="siret" className="text-sm font-medium">
                SIRET de votre entreprise
              </label>
              <Input
                id="siret"
                type="text"
                placeholder="123 456 789 00012"
                value={siret}
                onChange={(e) => handleSiretChange(e.target.value)}
                maxLength={17}
                required
              />
              {siretLoading && (
                <p className="text-xs text-muted-foreground">
                  Recherche en cours...
                </p>
              )}
              {company && (
                <div className="bg-violet-50 border border-violet-100 rounded-md px-3 py-2 text-sm space-y-0.5 animate-fade-in-up">
                  <p className="font-semibold text-foreground">
                    {company.companyName}
                  </p>
                  <p className="text-muted-foreground">
                    {company.legalForm}
                  </p>
                  <p className="text-muted-foreground">
                    {company.address}
                    {company.city ? ` - ${company.city}` : ""}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creation..." : "Creer mon compte"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Deja un compte ?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
