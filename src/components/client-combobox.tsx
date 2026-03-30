"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/hooks/use-api";

export interface Client {
  id: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  email: string | null;
  type: string;
  city?: string | null;
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

interface ClientComboboxProps {
  clients: Client[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreated: () => void;
  hasError?: boolean;
}

function clientLabel(c: Client): string {
  return c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom";
}

function clientSub(c: Client): string {
  const parts: string[] = [];
  if (c.siret) parts.push(c.siret);
  if (c.city) parts.push(c.city);
  return parts.join(" · ");
}

export function ClientCombobox({ clients, selectedId, onSelect, onCreated, hasError }: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return clientLabel(c).toLowerCase().includes(q) || (c.siret || "").includes(q) || (c.email || "").toLowerCase().includes(q);
  });

  const selected = clients.find((c) => c.id === selectedId);

  // ── New client form — simplified ──
  const [step, setStep] = useState<"search" | "form">("search");
  const [siretSearch, setSiretSearch] = useState("");
  const [siretResults, setSiretResults] = useState<SiretResult[]>([]);
  const [siretLoading, setSiretLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newVat, setNewVat] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [isIndividual, setIsIndividual] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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
    setNewName(r.companyName);
    setNewSiret(r.siret);
    setNewAddress(r.address);
    setNewPostalCode(r.postalCode);
    setNewCity(r.city);
    setNewVat(r.vatNumber);
    setIsIndividual(false);
    setSiretResults([]);
    setStep("form");
  }

  function startManual() {
    setNewName(siretSearch);
    setStep("form");
  }

  function startIndividual() {
    setIsIndividual(true);
    setStep("form");
  }

  function resetForm() {
    setStep("search"); setSiretSearch(""); setSiretResults([]);
    setNewName(""); setNewSiret(""); setNewEmail(""); setNewPhone("");
    setNewAddress(""); setNewPostalCode(""); setNewCity(""); setNewVat("");
    setNewFirstName(""); setNewLastName(""); setIsIndividual(false);
    setCreateError("");
  }

  async function handleCreate() {
    setCreateError("");
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        type: isIndividual ? "individual" : "company",
        email: newEmail || undefined,
        phone: newPhone || undefined,
        address: newAddress || undefined,
        postalCode: newPostalCode || undefined,
        city: newCity || undefined,
        vatNumber: newVat || undefined,
      };
      if (isIndividual) {
        body.firstName = newFirstName;
        body.lastName = newLastName;
      } else {
        body.companyName = newName;
        body.siret = newSiret || undefined;
      }

      const res = await apiFetch<{ client: Client }>("/api/clients", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onSelect(res.client.id);
      onCreated();
      setDialogOpen(false);
      setOpen(false);
      resetForm();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  const canCreate = isIndividual
    ? (newFirstName.trim() || newLastName.trim())
    : newName.trim().length > 0;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`w-full flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors text-left ${hasError ? "border-red-400" : "border-input"}`}
      >
        {selected ? (
          <div className="truncate">
            <span className="font-medium">{clientLabel(selected)}</span>
            {clientSub(selected) && <span className="text-muted-foreground ml-2 text-xs font-mono">{clientSub(selected)}</span>}
          </div>
        ) : (
          <span className="text-muted-foreground">Sélectionner un client...</span>
        )}
        <svg className="w-4 h-4 text-muted-foreground shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-border">
              <Input ref={inputRef} placeholder="Rechercher par nom ou SIRET..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">Aucun client trouvé</p>
              ) : (
                filtered.map((c) => (
                  <button key={c.id} type="button" className={`w-full text-left px-3 py-2.5 text-sm hover:bg-violet-50 transition-colors ${c.id === selectedId ? "bg-violet-50" : ""}`} onClick={() => { onSelect(c.id); setOpen(false); setSearch(""); }}>
                    <span className="font-medium text-gray-900">{clientLabel(c)}</span>
                    {clientSub(c) && <span className="text-muted-foreground ml-2 text-xs font-mono">{clientSub(c)}</span>}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-border p-2">
              <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
                <DialogTrigger className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-md transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Nouveau client
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>

                  {createError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</div>}

                  {/* STEP 1 : recherche SIRET ou nom */}
                  {step === "search" && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
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

                  {/* STEP 2 : formulaire pré-rempli */}
                  {step === "form" && (
                    <div className="space-y-3 pt-2">
                      {!isIndividual && newSiret && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                          <div className="text-xs">
                            <span className="font-medium text-emerald-900">Entreprise trouvée</span>
                            <span className="text-emerald-700 ml-1.5 font-mono">{newSiret}</span>
                          </div>
                        </div>
                      )}

                      {isIndividual ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><label className="text-sm font-medium">Prénom</label><Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} autoFocus /></div>
                          <div className="space-y-1"><label className="text-sm font-medium">Nom *</label><Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} /></div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Raison sociale *</label>
                          <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus={!newName} />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="contact@client.fr" />
                      </div>

                      {/* Champs secondaires — collapsible */}
                      <details className="group">
                        <summary className="text-xs text-violet-600 font-medium cursor-pointer hover:underline list-none flex items-center gap-1">
                          <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                          Plus d&apos;informations
                        </summary>
                        <div className="space-y-3 pt-3">
                          <div className="space-y-1"><label className="text-sm font-medium">Téléphone</label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
                          <div className="space-y-1"><label className="text-sm font-medium">Adresse</label><Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-sm font-medium">Code postal</label><Input value={newPostalCode} onChange={(e) => setNewPostalCode(e.target.value)} /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Ville</label><Input value={newCity} onChange={(e) => setNewCity(e.target.value)} /></div>
                          </div>
                          {!isIndividual && (
                            <div className="space-y-1"><label className="text-sm font-medium">N° TVA intracom.</label><Input value={newVat} onChange={(e) => setNewVat(e.target.value)} className="font-mono" /></div>
                          )}
                        </div>
                      </details>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleCreate} disabled={creating || !canCreate} className="flex-1">
                          {creating ? "Création..." : "Créer le client"}
                        </Button>
                        <Button variant="outline" onClick={() => setStep("search")}>Retour</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
