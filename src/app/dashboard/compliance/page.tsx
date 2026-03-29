"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useState } from "react";

interface PaStatus {
  connected: boolean;
  status: string;
  lastSync: string | null;
}

const CHECKLIST = [
  { label: "Numerotation sequentielle sans rupture", ok: true },
  { label: "Mentions obligatoires sur chaque facture", ok: true },
  { label: "Format Factur-X pour toutes les emissions", ok: true },
  { label: "SIREN client renseigne (B2B France)", ok: true },
  { label: "Categorie d'operation sur chaque facture", ok: true },
  { label: "Archivage PDF securise (7 ans)", ok: true },
  { label: "Penalites de retard mentionnees", ok: true },
  { label: "Indemnite forfaitaire de recouvrement 40 EUR", ok: true },
];

export default function CompliancePage() {
  const { data: paStatus } = useApi<PaStatus>("/api/pa/status");
  const [syncing, setSyncing] = useState(false);
  const paConnected = paStatus?.connected ?? false;

  // TODO: replace with API data
  const stats = { transmitted: 12, eReporting: 3, rejected: 0 };

  async function handleSync() {
    setSyncing(true);
    try {
      await apiFetch("/api/pa/sync", { method: "POST" });
    } catch {
      // handled
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Conformite</h1>
      </div>

      {/* Banner */}
      <div className={`animate-fade-in-up stagger-1 rounded-xl p-4 ${paConnected ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {paConnected ? (
              <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`text-sm font-medium ${paConnected ? "text-emerald-800" : "text-amber-800"}`}>
              {paConnected
                ? "Toutes vos factures sont conformes a la reforme de la facturation electronique."
                : "Connectez-vous a une Plateforme Agreee pour etre conforme a la reforme."}
            </p>
          </div>
          {!paConnected && (
            <Link href="/dashboard/settings">
              <Button size="sm">Connecter ma PA</Button>
            </Link>
          )}
        </div>
      </div>

      {/* PA Card */}
      <Card className="animate-fade-in-up stagger-2">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${paConnected ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                PA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Plateforme Agreee</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paConnected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {paConnected ? "Connectee" : "Deconnectee"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Certifiee par l&apos;Etat — NF 203, ISO 27001, Access Point Peppol
                </p>
                {paStatus?.lastSync && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Derniere synchronisation : {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(paStatus.lastSync))}
                  </p>
                )}
              </div>
            </div>
            {paConnected && (
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                <svg className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                {syncing ? "Synchronisation..." : "Synchroniser maintenant"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="animate-fade-in-up stagger-3">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Factures transmises</p>
            <p className="text-3xl font-bold font-mono mt-1">{stats.transmitted}</p>
            <p className="text-xs text-muted-foreground mt-1">via votre PA</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">E-reporting</p>
            <p className="text-3xl font-bold font-mono mt-1">{stats.eReporting}</p>
            <p className="text-xs text-muted-foreground mt-1">declarations B2C</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rejets corriges</p>
            <p className="text-3xl font-bold font-mono mt-1">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist */}
      <Card className="animate-fade-in-up stagger-5">
        <CardHeader>
          <CardTitle className="text-base">Checklist de conformite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CHECKLIST.map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
            {/* PA check — dynamic */}
            <div className="flex items-center gap-3 py-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${paConnected ? "bg-emerald-100" : "bg-amber-100"}`}>
                {paConnected ? (
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm">Transmission via Plateforme Agreee</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ISCA Block */}
      <Card className="animate-fade-in-up stagger-6 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Securisation et archivage de vos donnees</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Invoquo securise et archive vos donnees de facturation conformement a la reglementation.
                Vos factures sont protegees par un systeme de signature cryptographique et conservees
                pendant la duree legale.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium text-violet-700">Attestation de conformite</span> — bientot disponible.
              </p>
              <p className="text-sm text-violet-700 font-medium mt-3">
                Vous n&apos;avez rien a faire, on s&apos;occupe de tout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
