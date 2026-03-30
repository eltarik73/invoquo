"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useApi, apiFetch } from "@/hooks/use-api";

interface Client {
  id: string;
  type: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string;
  createdAt: string;
}

interface ClientList {
  data: Client[];
  total: number;
  page: number;
  totalPages: number;
}

function clientName(c: Client) {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "-";
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  bativio: "Bativio",
  klikgo: "Klik&Go",
};

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New client form
  const [newClient, setNewClient] = useState({
    type: "company" as "company" | "individual",
    companyName: "",
    firstName: "",
    lastName: "",
    siret: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const sourceParam = source === "all" ? "" : `&source=${source}`;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const url = `/api/clients?page=${page}&limit=20&sort=createdAt&order=desc${sourceParam}${searchParam}`;

  const { data, loading, refetch } = useApi<ClientList>(url);

  async function handleCreate() {
    setCreateError("");
    setCreating(true);

    try {
      await apiFetch("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          type: newClient.type,
          companyName: newClient.companyName || undefined,
          firstName: newClient.firstName || undefined,
          lastName: newClient.lastName || undefined,
          siret: newClient.siret || undefined,
          email: newClient.email || undefined,
          phone: newClient.phone || undefined,
          address: newClient.address || undefined,
          postalCode: newClient.postalCode || undefined,
          city: newClient.city || undefined,
        }),
      });
      setDialogOpen(false);
      setNewClient({
        type: "company",
        companyName: "",
        firstName: "",
        lastName: "",
        siret: "",
        email: "",
        phone: "",
        address: "",
        postalCode: "",
        city: "",
      });
      refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau client
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {createError && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {createError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newClient.type}
                  onValueChange={(v) =>
                    v && setNewClient((p) => ({ ...p, type: v as "company" | "individual" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Entreprise</SelectItem>
                    <SelectItem value="individual">Particulier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newClient.type === "company" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Raison sociale</label>
                    <Input
                      value={newClient.companyName}
                      onChange={(e) => setNewClient((p) => ({ ...p, companyName: e.target.value }))}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SIRET</label>
                    <Input
                      value={newClient.siret}
                      onChange={(e) => setNewClient((p) => ({ ...p, siret: e.target.value.replace(/\D/g, "") }))}
                      placeholder="14 chiffres"
                      maxLength={14}
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prenom</label>
                    <Input
                      value={newClient.firstName}
                      onChange={(e) => setNewClient((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={newClient.lastName}
                      onChange={(e) => setNewClient((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telephone</label>
                  <Input
                    value={newClient.phone}
                    onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input
                  value={newClient.address}
                  onChange={(e) => setNewClient((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code postal</label>
                  <Input
                    value={newClient.postalCode}
                    onChange={(e) => setNewClient((p) => ({ ...p, postalCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ville</label>
                  <Input
                    value={newClient.city}
                    onChange={(e) => setNewClient((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
              </div>

              <Button className="w-full" disabled={creating} onClick={handleCreate}>
                {creating ? "Creation..." : "Creer le client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-1">
        <Input
          placeholder="Rechercher par nom, email, SIRET..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <Select value={source} onValueChange={(v) => { if (v) { setSource(v); setPage(1); } }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sources</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="bativio">Bativio</SelectItem>
            <SelectItem value="klikgo">Klik&Go</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="animate-fade-in-up stagger-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">SIRET</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Ville</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !data ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : !data?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {clientName(client)}
                      </Link>
                      <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                        {client.siret ?? client.email ?? ""}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                      {client.siret ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {client.email ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {client.city ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {SOURCE_LABELS[client.source] ?? client.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {data.total} client{data.total > 1 ? "s" : ""}
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
