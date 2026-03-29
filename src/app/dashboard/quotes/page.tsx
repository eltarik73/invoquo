"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/components/format";
import { useApi, apiFetch } from "@/hooks/use-api";

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  totalTTC: string;
  date: string;
  validUntil: string;
  convertedToInvoiceId: string | null;
  client: {
    id: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface QuoteList {
  data: Quote[];
  total: number;
  page: number;
  totalPages: number;
}

function clientName(c: Quote["client"]) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

function countByStatus(data: Quote[] | undefined, s: string) {
  if (!data) return 0;
  return data.filter((q) => q.status === s).length;
}

export default function QuotesPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [converting, setConverting] = useState<string | null>(null);

  const statusParam = status === "all" ? "" : `&status=${status}`;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const url = `/api/quotes?page=${page}&limit=20&sort=createdAt&order=desc${statusParam}${searchParam}`;

  // Fetch all for counts + filtered for display
  const { data: allData } = useApi<QuoteList>("/api/quotes?limit=1000");
  const { data, loading, refetch } = useApi<QuoteList>(url);

  const counts = {
    all: allData?.total ?? 0,
    draft: countByStatus(allData?.data, "draft"),
    sent: countByStatus(allData?.data, "sent"),
    accepted: countByStatus(allData?.data, "accepted"),
    rejected: countByStatus(allData?.data, "rejected"),
    expired: countByStatus(allData?.data, "expired"),
  };

  const STATUS_TABS = [
    { value: "all", label: "Tous", count: counts.all },
    { value: "draft", label: "Brouillons", count: counts.draft },
    { value: "sent", label: "En attente", count: counts.sent },
    { value: "accepted", label: "Acceptes", count: counts.accepted },
    { value: "rejected", label: "Refuses", count: counts.rejected },
    { value: "expired", label: "Expires", count: counts.expired },
  ];

  async function handleConvert(id: string) {
    setConverting(id);
    try {
      await apiFetch(`/api/quotes/${id}/convert`, { method: "POST" });
      refetch();
    } catch {
      // handled
    } finally {
      setConverting(null);
    }
  }

  const isEmpty = !loading && (!data?.data?.length) && !search && status === "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold">Devis</h1>
        <Link href="/dashboard/invoices/new">
          <Button size="lg" className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Tabs with counters */}
      <div className="space-y-4 animate-fade-in-up stagger-1">
        <Tabs value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm gap-1.5">
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-mono">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Input
          placeholder="Rechercher par numero, client..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card className="animate-fade-in-up stagger-2">
          <CardContent className="py-16 text-center">
            <svg className="w-16 h-16 mx-auto text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <h2 className="text-lg font-semibold mt-4">Aucun devis pour le moment</h2>
            <p className="text-muted-foreground text-sm mt-1">Creez votre premier devis pour commencer</p>
            <Link href="/dashboard/invoices/new">
              <Button className="mt-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Creer un devis
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Table */
        <Card className="animate-fade-in-up stagger-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° devis</TableHead>
                  <TableHead className="hidden sm:table-cell">Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Validite</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !data ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : !data?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Aucun devis trouve
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((q) => (
                    <TableRow key={q.id} className="group">
                      <TableCell>
                        <Link href={`/dashboard/quotes/${q.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                          {q.quoteNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground sm:hidden mt-0.5">{clientName(q.client)}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{clientName(q.client)}</TableCell>
                      <TableCell><StatusBadge status={q.status} /></TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">{formatDate(q.date)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm font-mono">
                        <span className={new Date(q.validUntil) < new Date() && q.status !== "accepted" ? "text-red-600" : "text-muted-foreground"}>
                          {formatDate(q.validUntil)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(q.totalTTC)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link href={`/dashboard/quotes/${q.id}`} className="w-full">Voir le detail</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem>Envoyer par email</DropdownMenuItem>
                            {q.status === "accepted" && !q.convertedToInvoiceId && (
                              <DropdownMenuItem onClick={() => handleConvert(q.id)} disabled={converting === q.id}>
                                {converting === q.id ? "Conversion..." : "Convertir en facture"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>Telecharger PDF</DropdownMenuItem>
                            {q.convertedToInvoiceId && (
                              <DropdownMenuItem>
                                <Link href={`/dashboard/invoices/${q.convertedToInvoiceId}`} className="w-full">Voir la facture</Link>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">{data.total} devis</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedent</Button>
                  <span className="text-sm text-muted-foreground">{page} / {data.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Suivant</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
