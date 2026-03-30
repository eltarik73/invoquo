"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  date: string;
  totalTTC: string;
}

interface ClientQuote {
  id: string;
  quoteNumber: string;
  status: string;
  date: string;
  totalTTC: string;
}

interface Client {
  id: string;
  type: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  siren: string | null;
  vatNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  deliveryAddress: string | null;
  deliveryPostalCode: string | null;
  deliveryCity: string | null;
  source: string;
  notes: string | null;
  createdAt: string;
  invoices: ClientInvoice[];
  quotes: ClientQuote[];
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  bativio: "Bativio",
  klikgo: "Klik&Go",
};

const SOURCE_COLORS: Record<string, string> = {
  direct: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  bativio: "bg-blue-50 text-blue-700 hover:bg-blue-50",
  klikgo: "bg-violet-50 text-violet-700 hover:bg-violet-50",
};

function clientDisplayName(c: Client) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

export default function ClientDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const id = pathname.split("/").pop();

  const { data: client, loading, error } = useApi<Client>(
    id ? `/api/clients/${id}` : null
  );

  const [actionLoading, setActionLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Supprimer ce client ? Cette action est irréversible.")) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
      router.push("/dashboard/clients");
    } catch {
      // error handled by apiFetch
    } finally {
      setActionLoading(false);
    }
  }

  function handleEdit() {
    alert("Bientôt disponible");
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
        <Link href="/dashboard/clients">
          <Button variant="outline">Retour aux clients</Button>
        </Link>
      </div>
    );
  }

  if (!client) return null;

  // --- Stats ---
  const invoiceCount = client.invoices.length;
  const quoteCount = client.quotes.length;
  const caTotal = client.invoices
    .filter((inv) => ["paid", "pending", "transmitted", "sent", "accepted"].includes(inv.status))
    .reduce((sum, inv) => sum + parseFloat(inv.totalTTC), 0);
  const impayes = client.invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + parseFloat(inv.totalTTC), 0);

  const recentInvoices = [...client.invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  const recentQuotes = [...client.quotes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const hasDeliveryAddress =
    client.deliveryAddress &&
    (client.deliveryAddress !== client.address ||
      client.deliveryCity !== client.city ||
      client.deliveryPostalCode !== client.postalCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/clients"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Clients
          </Link>
          <h1 className="text-2xl font-bold">{clientDisplayName(client)}</h1>
          <Badge
            variant="secondary"
            className={SOURCE_COLORS[client.source] ?? "bg-gray-100 text-gray-700"}
          >
            {SOURCE_LABELS[client.source] ?? client.source}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Client depuis le {formatDate(client.createdAt)}
          </p>
          <Link href={`/dashboard/invoices/new?clientId=${id}`}>
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nouvelle facture
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info card */}
          <Card className="animate-fade-in-up stagger-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm">{client.type === "company" ? "Entreprise" : "Particulier"}</p>
                </div>
                {client.siret && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SIRET</p>
                    <p className="text-sm font-mono">{client.siret}</p>
                  </div>
                )}
                {client.siren && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SIREN</p>
                    <p className="text-sm font-mono">{client.siren}</p>
                  </div>
                )}
                {client.vatNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">N° TVA intracom.</p>
                    <p className="text-sm font-mono">{client.vatNumber}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                    <p className="text-sm">{client.phone}</p>
                  </div>
                )}
              </div>

              {(client.address || client.city) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Adresse</p>
                  <p className="text-sm">
                    {client.address}
                    {client.postalCode && `, ${client.postalCode}`}
                    {client.city && ` ${client.city}`}
                  </p>
                </div>
              )}

              {hasDeliveryAddress && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Adresse de livraison</p>
                  <p className="text-sm">
                    {client.deliveryAddress}
                    {client.deliveryPostalCode && `, ${client.deliveryPostalCode}`}
                    {client.deliveryCity && ` ${client.deliveryCity}`}
                  </p>
                </div>
              )}

              {client.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-line">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent invoices */}
          <Card className="animate-fade-in-up stagger-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dernières factures</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Montant TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucune facture
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/invoices/${inv.id}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                          {formatDate(inv.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {formatCurrency(inv.totalTTC)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent quotes */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Derniers devis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Montant TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucun devis
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/quotes/${quote.id}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                            {quote.quoteNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={quote.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                          {formatDate(quote.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {formatCurrency(quote.totalTTC)}
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
          {/* Stats card */}
          <Card
            className="animate-fade-in-up stagger-2 lg:sticky lg:top-6"
            style={{ backgroundColor: "#faf8ff", borderColor: "#ede8f5" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total factures</span>
                <span className="font-mono text-sm font-semibold">{invoiceCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CA total</span>
                <span className="font-mono text-sm font-semibold">{formatCurrency(caTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Impayés</span>
                <span className={`font-mono text-sm font-semibold ${impayes > 0 ? "text-red-600" : ""}`}>
                  {formatCurrency(impayes)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total devis</span>
                <span className="font-mono text-sm font-semibold">{quoteCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="animate-fade-in-up stagger-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                </svg>
                Modifier
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {actionLoading ? "Suppression..." : "Supprimer"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
