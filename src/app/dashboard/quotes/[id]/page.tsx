"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/components/format";
import { useApi, apiFetch } from "@/hooks/use-api";

// ── Types ──

interface QuoteLine {
  id: string;
  position: number;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  unit: string | null;
}

interface Client {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  email: string | null;
  type: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  date: string;
  validUntil: string;
  operationCategory: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  notes: string | null;
  pdfUrl: string | null;
  convertedToInvoiceId: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  client: Client;
  lines: QuoteLine[];
}

// ── Helpers ──

function clientName(client: Client): string {
  return (
    client.companyName ||
    [client.firstName, client.lastName].filter(Boolean).join(" ") ||
    "Client sans nom"
  );
}

function categoryLabel(cat: string): string {
  switch (cat) {
    case "services":
      return "Prestation de services";
    case "goods":
      return "Livraison de biens";
    case "mixed":
      return "Mixte (biens + services)";
    default:
      return cat;
  }
}

function isExpired(validUntil: string, status: string): boolean {
  if (status === "accepted" || status === "rejected") return false;
  return new Date(validUntil) < new Date();
}

// ── Page ──

export default function QuoteDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const { data, loading, error } = useApi<{ quote: Quote }>(
    id ? `/api/quotes/${id}` : null,
  );

  const [deleting, setDeleting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [actionError, setActionError] = useState("");

  const quote = data?.quote;

  async function handleDelete() {
    if (!quote) return;
    if (!confirm("Supprimer ce devis ? Cette action est irr\u00e9versible.")) return;

    setActionError("");
    setDeleting(true);
    try {
      await apiFetch(`/api/quotes/${quote.id}`, { method: "DELETE" });
      router.push("/dashboard/quotes");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConvert() {
    if (!quote) return;
    if (!confirm("Convertir ce devis en facture ?")) return;

    setActionError("");
    setConverting(true);
    try {
      const result = await apiFetch<{ invoice: { id: string } }>(
        `/api/quotes/${quote.id}/convert`,
        { method: "POST" },
      );
      router.push(`/dashboard/invoices/${result.invoice.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de la conversion");
    } finally {
      setConverting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3aed]" />
      </div>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Devis
        </Link>
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {error || "Devis introuvable"}
        </div>
      </div>
    );
  }

  const expired = isExpired(quote.validUntil, quote.status);

  // Compute VAT breakdown from lines
  const vatMap = new Map<number, { base: number; vat: number }>();
  for (const line of quote.lines) {
    const rate = Number(line.vatRate);
    const existing = vatMap.get(rate) ?? { base: 0, vat: 0 };
    existing.base += Number(line.totalHT);
    existing.vat += Number(line.totalVAT);
    vatMap.set(rate, existing);
  }
  const vatBreakdown = Array.from(vatMap.entries())
    .map(([rate, { base, vat }]) => ({ rate, base, vat }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Devis
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold font-mono text-[#7c3aed]">
            {quote.quoteNumber}
          </h1>
          <StatusBadge status={expired ? "expired" : quote.status} />
          <span className="text-sm text-muted-foreground">{formatDate(quote.date)}</span>
        </div>
      </div>

      {actionError && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{actionError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client card */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Link
                  href={`/dashboard/clients/${quote.client.id}`}
                  className="font-medium text-[#7c3aed] hover:underline"
                >
                  {clientName(quote.client)}
                </Link>
                {quote.client.siret && (
                  <p className="text-sm text-muted-foreground font-mono">
                    SIRET {quote.client.siret}
                  </p>
                )}
                {quote.client.email && (
                  <p className="text-sm text-muted-foreground">{quote.client.email}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quote info */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader>
              <CardTitle className="text-base">Informations du devis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Date du devis</p>
                  <p className="text-sm font-mono">{formatDate(quote.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Date de validit&eacute;
                  </p>
                  <p
                    className={`text-sm font-mono ${expired ? "text-red-600 font-semibold" : ""}`}
                  >
                    {formatDate(quote.validUntil)}
                    {expired && (
                      <span className="text-xs ml-1 text-red-500">(expir&eacute;)</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Cat&eacute;gorie d&apos;op&eacute;ration
                  </p>
                  <p className="text-sm">{categoryLabel(quote.operationCategory)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines table */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader>
              <CardTitle className="text-base">Lignes du devis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">D&eacute;signation</TableHead>
                    <TableHead className="text-right">Qt&eacute;</TableHead>
                    <TableHead className="text-right">Prix unit. HT</TableHead>
                    <TableHead className="text-right">TVA %</TableHead>
                    <TableHead className="text-right">Total HT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.lines
                    .sort((a, b) => a.position - b.position)
                    .map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(line.quantity)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(line.unitPriceHT)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(line.vatRate)} %
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(line.totalHT)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card className="animate-fade-in-up stagger-4">
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div>
          <div
            className="sticky top-24 rounded-2xl p-6 space-y-5 animate-fade-in-up stagger-2"
            style={{ border: "1px solid #ede8f5", background: "#faf8ff" }}
          >
            <h3 className="font-bold text-gray-900" style={{ fontSize: 16 }}>
              R&eacute;capitulatif
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span className="font-mono font-medium">
                  {formatCurrency(quote.totalHT)}
                </span>
              </div>
              {vatBreakdown.map((v) => (
                <div key={v.rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {v.rate} %</span>
                  <span className="font-mono text-gray-500">{formatCurrency(v.vat)}</span>
                </div>
              ))}
              <div className="border-t border-violet-200 pt-3 flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">Total TTC</span>
                <span
                  className="font-mono font-bold text-[#7c3aed]"
                  style={{ fontSize: 24 }}
                >
                  {formatCurrency(quote.totalTTC)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-violet-200">
              <p className="text-xs text-gray-400">
                Devis valable jusqu&apos;au{" "}
                <span
                  className={`font-mono font-medium ${expired ? "text-red-600" : "text-gray-600"}`}
                >
                  {formatDate(quote.validUntil)}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              {/* Draft actions */}
              {quote.status === "draft" && (
                <>
                  <Link href={`/dashboard/quotes/${quote.id}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Suppression..." : "Supprimer"}
                  </Button>
                </>
              )}

              {/* Convert to invoice (sent or accepted, not yet converted) */}
              {(quote.status === "sent" || quote.status === "accepted") &&
                !quote.convertedToInvoiceId && (
                  <Button
                    className="w-full"
                    onClick={handleConvert}
                    disabled={converting}
                  >
                    {converting ? "Conversion..." : "Convertir en facture"}
                  </Button>
                )}

              {/* View linked invoice */}
              {quote.convertedToInvoiceId && (
                <Link
                  href={`/dashboard/invoices/${quote.convertedToInvoiceId}`}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    Voir la facture
                  </Button>
                </Link>
              )}

              {/* Duplicate */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert("La duplication sera bient\u00f4t disponible.")}
              >
                Dupliquer
              </Button>

              {/* Send */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert("L\u2019envoi par email sera bient\u00f4t disponible.")}
              >
                Envoyer par email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
