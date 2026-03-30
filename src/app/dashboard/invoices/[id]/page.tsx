"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

interface InvoiceLine {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unitPriceHT: string;
  vatRate: string;
  totalHT: string;
  totalVAT: string;
  totalTTC: string;
  unit: string | null;
}

interface InvoiceClient {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  type: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  operationCategory: string;
  totalHT: string;
  totalVAT: string;
  totalTTC: string;
  discount: string | null;
  discountType: string | null;
  notes: string | null;
  pdfUrl: string | null;
  paStatus: string | null;
  createdAt: string;
  client: InvoiceClient;
  lines: InvoiceLine[];
}

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  a_reception: "A réception",
  "30_days": "30 jours",
  "45_days_end_of_month": "45 jours fin de mois",
  "60_days": "60 jours",
};

const OPERATION_CATEGORY_LABELS: Record<string, string> = {
  goods: "Livraison de biens",
  services: "Prestation de services",
  mixed: "Mixte",
};

const TYPE_LABELS: Record<string, string> = {
  invoice: "Facture",
  credit_note: "Avoir",
  deposit: "Acompte",
};

function clientName(c: InvoiceClient) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status === "paid" || status === "draft") return false;
  return new Date(dueDate) < new Date();
}

export default function InvoiceDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname.split("/").pop();

  const { data: invoiceData, loading, error, refetch } = useApi<{ invoice: Invoice }>(
    id ? `/api/invoices/${id}` : null
  );
  const invoice = invoiceData?.invoice ?? null;

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleFinalize() {
    if (!id) return;
    setActionLoading("finalize");
    try {
      await apiFetch(`/api/invoices/${id}/finalize`, { method: "POST" });
      refetch();
    } catch {
      // error handled by apiFetch
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDuplicate() {
    if (!id) return;
    setActionLoading("duplicate");
    try {
      const result = await apiFetch<{ id: string }>(`/api/invoices/${id}/duplicate`, {
        method: "POST",
      });
      router.push(`/dashboard/invoices/${result.id}`);
    } catch {
      // error handled by apiFetch
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Supprimer ce brouillon ? Cette action est irréversible.")) return;
    setActionLoading("delete");
    try {
      await apiFetch(`/api/invoices/${id}`, { method: "DELETE" });
      router.push("/dashboard/invoices");
    } catch {
      // error handled by apiFetch
    } finally {
      setActionLoading(null);
    }
  }

  function handleMarkPaid() {
    alert("Bientôt disponible");
  }

  // --- VAT breakdown ---
  function getVatBreakdown(lines: InvoiceLine[]) {
    const map = new Map<string, number>();
    for (const line of lines) {
      const rate = line.vatRate;
      map.set(rate, (map.get(rate) || 0) + parseFloat(line.totalVAT));
    }
    return Array.from(map.entries())
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .map(([rate, amount]) => ({ rate, amount }));
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Chargement...
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/dashboard/invoices">
          <Button variant="outline">Retour aux factures</Button>
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  const vatBreakdown = getVatBreakdown(invoice.lines);
  const sortedLines = [...invoice.lines].sort((a, b) => a.position - b.position);
  const overdue = isOverdue(invoice.dueDate, invoice.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/invoices"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Factures
          </Link>
          <h1 className="text-2xl font-bold font-mono text-primary">
            {invoice.invoiceNumber}
          </h1>
          <StatusBadge status={invoice.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Créée le {formatDate(invoice.createdAt)}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client card */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/dashboard/clients/${invoice.client.id}`}
                className="text-base font-semibold text-primary hover:underline"
              >
                {clientName(invoice.client)}
              </Link>
              {invoice.client.siret && (
                <p className="text-sm text-muted-foreground">
                  SIRET : <span className="font-mono">{invoice.client.siret}</span>
                </p>
              )}
              {invoice.client.email && (
                <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-muted-foreground">
                  {invoice.client.address}
                  {invoice.client.postalCode && `, ${invoice.client.postalCode}`}
                  {invoice.client.city && ` ${invoice.client.city}`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invoice info card */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Date d&apos;émission</p>
                  <p className="text-sm font-mono">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Échéance</p>
                  <p className={`text-sm font-mono ${overdue ? "text-red-600 font-semibold" : ""}`}>
                    {formatDate(invoice.dueDate)}
                    {overdue && <span className="ml-1 text-xs">(en retard)</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conditions de paiement</p>
                  <p className="text-sm">
                    {PAYMENT_TERMS_LABELS[invoice.paymentTerms] ?? invoice.paymentTerms}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Catégorie</p>
                  <p className="text-sm">
                    {OPERATION_CATEGORY_LABELS[invoice.operationCategory] ?? invoice.operationCategory}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm">{TYPE_LABELS[invoice.type] ?? invoice.type}</p>
                </div>
              </div>
              {invoice.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lines table */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lignes de facturation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Prix unit. HT</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">TVA %</TableHead>
                    <TableHead className="text-right">Total HT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucune ligne
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-sm">
                          {line.description}
                          {line.unit && (
                            <span className="text-xs text-muted-foreground ml-1">({line.unit})</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {parseFloat(line.quantity).toLocaleString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm hidden sm:table-cell">
                          {formatCurrency(line.unitPriceHT)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm hidden sm:table-cell">
                          {parseFloat(line.vatRate).toLocaleString("fr-FR")} %
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(line.totalHT)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Totals recap */}
          <Card
            className="animate-fade-in-up stagger-2 lg:sticky lg:top-6"
            style={{ backgroundColor: "#faf8ff", borderColor: "#ede8f5" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total HT</span>
                <span className="font-mono text-sm font-medium">
                  {formatCurrency(invoice.totalHT)}
                </span>
              </div>

              {vatBreakdown.map(({ rate, amount }) => (
                <div key={rate} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    TVA {parseFloat(rate).toLocaleString("fr-FR")} %
                  </span>
                  <span className="font-mono text-sm">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}

              {invoice.discount && parseFloat(invoice.discount) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Remise{invoice.discountType === "percentage" ? " (%)" : ""}
                  </span>
                  <span className="font-mono text-sm text-red-600">
                    -{invoice.discountType === "percentage"
                      ? `${invoice.discount} %`
                      : formatCurrency(invoice.discount)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Total TTC</span>
                  <span className="font-mono text-2xl font-bold text-primary">
                    {formatCurrency(invoice.totalTTC)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Pénalités de retard : 3x le taux d&apos;intérêt légal
                </p>
                <p className="text-xs text-muted-foreground">
                  Indemnité de recouvrement : 40 €
                </p>
                <p className="text-xs text-muted-foreground">
                  Escompte : Néant
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoice.pdfUrl && (
                <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Télécharger PDF
                  </Button>
                </a>
              )}

              {invoice.status === "draft" && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleFinalize}
                    disabled={actionLoading === "finalize"}
                  >
                    {actionLoading === "finalize" ? "Finalisation..." : "Finaliser et transmettre"}
                  </Button>
                  <Link href={`/dashboard/invoices/${id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={actionLoading === "delete"}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    {actionLoading === "delete" ? "Suppression..." : "Supprimer"}
                  </Button>
                </>
              )}

              {["pending", "sent", "transmitted", "accepted"].includes(invoice.status) && (
                <Button variant="outline" className="w-full justify-start" onClick={handleMarkPaid}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Marquer payée
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDuplicate}
                disabled={actionLoading === "duplicate"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                {actionLoading === "duplicate" ? "Duplication..." : "Dupliquer"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
