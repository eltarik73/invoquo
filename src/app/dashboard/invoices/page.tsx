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

const STATUS_TABS = [
  { value: "all", label: "Toutes" },
  { value: "draft", label: "Brouillons" },
  { value: "pending", label: "En attente" },
  { value: "transmitted", label: "Transmises" },
  { value: "paid", label: "Payees" },
  { value: "overdue", label: "En retard" },
  { value: "rejected", label: "Rejetees" },
];

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  type: string;
  totalHT: string;
  totalTTC: string;
  date: string;
  dueDate: string;
  client: {
    id: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface InvoiceList {
  data: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

function clientName(c: Invoice["client"]) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

export default function InvoicesPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const statusParam = status === "all" ? "" : `&status=${status}`;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const url = `/api/invoices?page=${page}&limit=20&sort=createdAt&order=desc${statusParam}${searchParam}`;

  const { data, loading, refetch } = useApi<InvoiceList>(url);

  async function handleDuplicate(id: string) {
    try {
      await apiFetch(`/api/invoices/${id}/duplicate`, { method: "POST" });
      refetch();
    } catch {
      // error handled by apiFetch
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold">Factures</h1>
        <Link href="/dashboard/invoices/new">
          <Button className="w-full sm:w-auto">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle facture
          </Button>
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="space-y-4 animate-fade-in-up stagger-1">
        <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
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

      {/* Table */}
      <Card className="animate-fade-in-up stagger-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead className="hidden sm:table-cell">Client</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Echeance</TableHead>
                <TableHead>Statut</TableHead>
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
                    Aucune facture trouvee
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((inv) => (
                  <TableRow key={inv.id} className="group">
                    <TableCell>
                      <Link href={`/dashboard/invoices/${inv.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                        {clientName(inv.client)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {clientName(inv.client)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">
                      {formatDate(inv.date)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatCurrency(inv.totalTTC)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                          </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/dashboard/invoices/${inv.id}`} className="w-full">Voir</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(inv.id)}>
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/api/invoices/${inv.id}/pdf`} target="_blank" className="w-full">
                              Telecharger PDF
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {data.total} facture{data.total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Precedent
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
