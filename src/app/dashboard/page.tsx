"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/components/format";
import { useApi } from "@/hooks/use-api";

interface DashboardData {
  data: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalTTC: string;
    date: string;
    client: { companyName: string | null; firstName: string | null; lastName: string | null };
  }[];
  total: number;
}

interface ReceivedData {
  data: {
    id: string;
    supplierName: string;
    invoiceNumber: string | null;
    totalTTC: string | null;
    status: string;
    receivedAt: string;
  }[];
  total: number;
}

interface PaStatus {
  connected: boolean;
  status: string;
  lastSync: string | null;
}

function clientName(c: { companyName: string | null; firstName: string | null; lastName: string | null }) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

export default function DashboardPage() {
  const { data: invoices } = useApi<DashboardData>("/api/invoices?limit=5&sort=createdAt&order=desc");
  const { data: received } = useApi<ReceivedData>("/api/received-invoices?limit=5");
  const { data: paStatus } = useApi<PaStatus>("/api/pa/status");

  const totalInvoices = invoices?.total ?? 0;
  const totalReceived = received?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bienvenue sur votre espace de facturation
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button size="lg" className="animate-fade-in-up stagger-1 w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in-up stagger-1">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Factures emises</p>
            <p className="text-3xl font-bold font-mono mt-1">{totalInvoices}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-2">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Factures recues</p>
            <p className="text-3xl font-bold font-mono mt-1">{totalReceived}</p>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-3">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Plateforme Agreee</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${paStatus?.connected ? "bg-emerald-500" : "bg-gray-300"}`} />
              <span className="text-sm font-medium">
                {paStatus?.connected ? "Connectee" : "Non connectee"}
              </span>
            </div>
            {paStatus?.lastSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Derniere synchro : {formatDate(paStatus.lastSync)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Conformite</p>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-emerald-700">En regle</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices + Received */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last emitted invoices */}
        <Card className="animate-fade-in-up stagger-5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Dernieres factures</CardTitle>
            <Link href="/dashboard/invoices" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {!invoices?.data?.length ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Aucune facture pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.data.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/dashboard/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {inv.invoiceNumber}
                        </span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {clientName(inv.client)} - {formatDate(inv.date)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold ml-4 shrink-0">
                      {formatCurrency(inv.totalTTC)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last received invoices */}
        <Card className="animate-fade-in-up stagger-6">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Factures recues (PA)</CardTitle>
            <Link href="/dashboard/received" className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {!received?.data?.length ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {paStatus?.connected
                    ? "Aucune facture recue pour le moment"
                    : "Connectez votre Plateforme Agreee pour recevoir vos factures"}
                </p>
                {!paStatus?.connected && (
                  <Link href="/dashboard/settings">
                    <Button variant="outline" size="sm" className="mt-3">
                      Connecter ma PA
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {received.data.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/dashboard/received/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {inv.supplierName}
                        </span>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {inv.invoiceNumber ?? "N/A"} - {formatDate(inv.receivedAt)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold ml-4 shrink-0">
                      {formatCurrency(inv.totalTTC)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
