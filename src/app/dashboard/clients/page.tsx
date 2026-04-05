"use client";

import { useState, useRef, useCallback } from "react";
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

interface SiretResult {
  siret: string;
  siren: string;
  companyName: string;
  address: string;
  postalCode: string;
  city: string;
  vatNumber: string;
  apeCode: string | null;
  isActive: boolean;
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

  // New client form — 2-step with SIRET lookup
  const [step, setStep] = useState<"search" | "form">("search");
  const [siretSearch, setSiretSearch] = useState("");
  const [siretResults, setSiretResults] = useState<SiretResult[]>([]);
  const [siretLoading, setSiretLoading] = useState(false);

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
    vatNumber: "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchSiret = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) { setSiretResults([]); return; }
    setSiretLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch<{ results: SiretResult[] }>(`/api/lookup/siret?q=${encodeURIComponent(value)}`);
        setSiretResults(data.results || []);
      } catch { setSiretResults([]); }
      finally { setSiretLoading(false); }
    }, 400);
  }, []);

  function selectSiretResult(r: SiretResult) {
    setNewClient((p) => ({
      ...p,
      type: "company",
      companyName: r.companyName,
      siret: r.siret,
      address: r.address,
      postalCode: r.postalCode,
      city: r.city,
      vatNumber: r.vatNumber,
    }));
    setSiretResults([]);
    setStep("form");
  }

  function startManual() {
    setNewClient((p) => ({ ...p, type: "company", companyName: siretSearch }));
    setStep("form");
  }

  function startIndividual() {
    setNewClient((p) => ({ ...p, type: "individual" }));
    setStep("form");
  }

  function resetForm() {
    setStep("search");
    setSiretSearch("");
    setSiretResults([]);
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
      vatNumber: "",
    });
    setCreateError("");
  }

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
          vatNumber: newClient.vatNumber || undefined,
        }),
      });
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  const canCreate = newClient.type === "individual"
    ? (newClient.firstName.trim() || newClient.lastName.trim())
    : newClient.companyName.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouveau client
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>

            {createError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {createError}
              </div>
            )}

            {/* STEP 1: Recherche SIRET */}
            {step === "search" && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Rechercher l&apos;entreprise</label>
                  <Input
                    value={siretSearch}
                    onChange={(e) => { setSiretSearch(e.target.value); searchSiret(e.target.value); }}
                    placeholder="Tapez un nom d'entreprise ou un SIRET..."
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">Données officielles INSEE — auto-remplissage garanti</p>
                </div>

                {siretLoading && <p className="text-xs text-gray-400 px-1">Recherche en cours...</p>}

                {siretResults.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    {siretResults.map((r) => (
                      <button key={r.siret} type="button" className="w-full text-left px-4 py-3 text-sm hover:bg-violet-50 border-b border-border last:border-0 transition-colors" onClick={() => selectSiretResult(r)}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{r.companyName}</span>
                          {r.isActive ? (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Fermée</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{r.siret} · {r.city}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={startManual}>
                    Saisir manuellement
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={startIndividual}>
                    Particulier
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Formulaire */}
            {step === "form" && (
              <div className="space-y-4 pt-2">
                {newClient.type === "company" && newClient.siret && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                    <div className="text-xs">
                      <span className="font-medium text-emerald-900">Entreprise trouvée</span>
                      <span className="text-emerald-700 ml-1.5 font-mono">{newClient.siret}</span>
                    </div>
                  </div>
                )}

                {newClient.type === "individual" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Prénom</label>
                      <Input value={newClient.firstName} onChange={(e) => setNewClient((p) => ({ ...p, firstName: e.target.value }))} autoFocus />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Nom *</label>
                      <Input value={newClient.lastName} onChange={(e) => setNewClient((p) => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Raison sociale *</label>
                    <Input value={newClient.companyName} onChange={(e) => setNewClient((p) => ({ ...p, companyName: e.target.value }))} autoFocus={!newClient.companyName} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={newClient.email} onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))} placeholder="contact@client.fr" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input value={newClient.phone} onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>

                {/* Champs secondaires — collapsible */}
                <details className="group">
                  <summary className="text-xs text-violet-600 font-medium cursor-pointer hover:underline list-none flex items-center gap-1">
                    <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    Plus d&apos;informations
                  </summary>
                  <div className="space-y-3 pt-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Adresse</label>
                      <Input value={newClient.address} onChange={(e) => setNewClient((p) => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Code postal</label>
                        <Input value={newClient.postalCode} onChange={(e) => setNewClient((p) => ({ ...p, postalCode: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Ville</label>
                        <Input value={newClient.city} onChange={(e) => setNewClient((p) => ({ ...p, city: e.target.value }))} />
                      </div>
                    </div>
                    {newClient.type === "company" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">N° TVA intracom.</label>
                        <Input value={newClient.vatNumber} onChange={(e) => setNewClient((p) => ({ ...p, vatNumber: e.target.value }))} className="font-mono" />
                      </div>
                    )}
                  </div>
                </details>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreate} disabled={creating || !canCreate} className="flex-1">
                    {creating ? "Création..." : "Créer le client"}
                  </Button>
                  <Button variant="outline" onClick={() => { setStep("search"); setSiretResults([]); }}>Retour</Button>
                </div>
              </div>
            )}
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
          <SelectTrigger className="w-48">
            <SelectValue>{() => ({ all: "Toutes sources", direct: "Direct", bativio: "Bativio", klikgo: "Klik&Go" }[source])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sources</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="bativio">Bativio</SelectItem>
            <SelectItem value="klikgo">Klik&amp;Go</SelectItem>
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
                  Précédent
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
