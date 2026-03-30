"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useApi } from "@/hooks/use-api";

const STATUS_TABS = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "A traiter" },
  { value: "validated", label: "Validées" },
  { value: "rejected", label: "Rejetées" },
];

interface ReceivedInvoice {
  id: string;
  supplierName: string;
  supplierSiret: string | null;
  invoiceNumber: string | null;
  date: string | null;
  dueDate: string | null;
  totalHT: string | null;
  totalTTC: string | null;
  status: string;
  receivedAt: string;
}

interface ReceivedList {
  data: ReceivedInvoice[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ReceivedPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const statusParam = status === "all" ? "" : `&status=${status}`;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const url = `/api/received-invoices?page=${page}&limit=20${statusParam}${searchParam}`;

  const { data, loading } = useApi<ReceivedList>(url);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Factures reçues</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Factures transmises par vos fournisseurs via la Plateforme Agréée
        </p>
      </div>

      <div className="space-y-4 animate-fade-in-up stagger-1">
        <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Input
          placeholder="Rechercher par fournisseur, numero..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
      </div>

      <Card className="animate-fade-in-up stagger-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead className="hidden sm:table-cell">Numéro</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !data ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : !data?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground">
                      Aucune facture recue
                    </p>
                    <Link href="/dashboard/settings">
                      <Button variant="outline" size="sm" className="mt-3">
                        Verifier ma connexion PA
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{inv.supplierName}</p>
                      {inv.supplierSiret && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {inv.supplierSiret}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">
                      {inv.invoiceNumber ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                      {formatDate(inv.date)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {inv.dueDate ? (
                        <span className={new Date(inv.dueDate) < new Date() && inv.status === "pending" ? "text-red-600 font-medium" : "text-muted-foreground"}>
                          {formatDate(inv.dueDate)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatCurrency(inv.totalTTC)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {data.total} facture{data.total > 1 ? "s" : ""} recue{data.total > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Precedent
                </Button>
                <span className="text-sm text-muted-foreground">{page} / {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
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
