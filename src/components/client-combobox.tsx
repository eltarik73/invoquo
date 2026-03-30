"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return parts.join(" · ") || (c.type === "individual" ? "Particulier" : "");
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

  // ── New client form state ──
  const [newType, setNewType] = useState<"company" | "individual">("company");
  const [newName, setNewName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newSiret, setNewSiret] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newVat, setNewVat] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── SIRET lookup ──
  const [siretResults, setSiretResults] = useState<SiretResult[]>([]);
  const [siretStatus, setSiretStatus] = useState<"idle" | "loading" | "found" | "closed" | "not_found">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const lookupSiret = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) { setSiretResults([]); setSiretStatus("idle"); return; }

    setSiretStatus("loading");
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch<{ results: SiretResult[] }>(`/api/lookup/siret?q=${encodeURIComponent(value)}`);
        setSiretResults(data.results || []);

        if (value.length === 14 && /^\d{14}$/.test(value)) {
          const match = (data.results || []).find((r) => r.siret === value);
          if (match) {
            if (match.isActive) {
              setSiretStatus("found");
              setNewName(match.companyName);
              setNewAddress(match.address);
              setNewPostalCode(match.postalCode);
              setNewCity(match.city);
              setNewVat(match.vatNumber);
            } else {
              setSiretStatus("closed");
            }
          } else {
            setSiretStatus("not_found");
          }
        } else {
          setSiretStatus(data.results?.length ? "idle" : "not_found");
        }
      } catch {
        setSiretStatus("idle");
        setSiretResults([]);
      }
    }, 500);
  }, []);

  function selectSuggestion(r: SiretResult) {
    setNewSiret(r.siret);
    setNewName(r.companyName);
    setNewAddress(r.address);
    setNewPostalCode(r.postalCode);
    setNewCity(r.city);
    setNewVat(r.vatNumber);
    setSiretStatus(r.isActive ? "found" : "closed");
    setSiretResults([]);
  }

  function resetForm() {
    setNewType("company"); setNewName(""); setNewFirstName(""); setNewLastName("");
    setNewSiret(""); setNewEmail(""); setNewPhone(""); setNewAddress("");
    setNewPostalCode(""); setNewCity(""); setNewVat(""); setNewNotes("");
    setCreateError(""); setSiretResults([]); setSiretStatus("idle");
  }

  async function handleCreate() {
    setCreateError("");
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        type: newType,
        email: newEmail || undefined,
        phone: newPhone || undefined,
        address: newAddress || undefined,
        postalCode: newPostalCode || undefined,
        city: newCity || undefined,
        notes: newNotes || undefined,
        vatNumber: newVat || undefined,
      };
      if (newType === "company") {
        body.companyName = newName;
        body.siret = newSiret || undefined;
      } else {
        body.firstName = newFirstName;
        body.lastName = newLastName;
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

  const canCreate = newType === "company" ? newName.trim().length > 0 : (newFirstName.trim() || newLastName.trim());

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
              <Input ref={inputRef} placeholder="Rechercher par nom, SIRET..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-sm" />
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
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    {createError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</div>}

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Type</label>
                      <Select value={newType} onValueChange={(v) => v && setNewType(v as "company" | "individual")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Entreprise</SelectItem>
                          <SelectItem value="individual">Particulier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newType === "company" ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">SIRET</label>
                          <Input value={newSiret} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 14); setNewSiret(v); lookupSiret(v); }} placeholder="Tapez un SIRET ou un nom d'entreprise" maxLength={14} inputMode="numeric" />
                          {siretStatus === "loading" && <p className="text-xs text-gray-400">Recherche...</p>}
                          {siretStatus === "found" && <p className="text-xs text-emerald-600 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>{newName}</p>}
                          {siretStatus === "closed" && <p className="text-xs text-amber-600">⚠ Entreprise fermée</p>}
                          {siretStatus === "not_found" && newSiret.length === 14 && <p className="text-xs text-red-500">SIRET non trouvé dans la base INSEE</p>}
                          {siretResults.length > 0 && siretStatus !== "found" && (
                            <div className="border border-border rounded-lg mt-1 max-h-32 overflow-y-auto">
                              {siretResults.map((r) => (
                                <button key={r.siret} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-violet-50 border-b border-border last:border-0" onClick={() => selectSuggestion(r)}>
                                  <span className="font-medium">{r.companyName}</span>
                                  <span className="text-xs text-muted-foreground ml-2 font-mono">{r.siret}</span>
                                  {!r.isActive && <span className="text-xs text-amber-600 ml-1">(fermée)</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Raison sociale *</label>
                          <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">N° TVA intracommunautaire</label>
                          <Input value={newVat} onChange={(e) => setNewVat(e.target.value)} className="font-mono" />
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="text-sm font-medium">Prénom</label><Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} /></div>
                        <div className="space-y-1"><label className="text-sm font-medium">Nom *</label><Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} /></div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="text-sm font-medium">Email</label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
                      <div className="space-y-1"><label className="text-sm font-medium">Téléphone</label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-sm font-medium">Adresse</label><Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="text-sm font-medium">Code postal</label><Input value={newPostalCode} onChange={(e) => setNewPostalCode(e.target.value)} /></div>
                      <div className="space-y-1"><label className="text-sm font-medium">Ville</label><Input value={newCity} onChange={(e) => setNewCity(e.target.value)} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-sm font-medium">Notes</label><Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optionnel" /></div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleCreate} disabled={creating || !canCreate} className="flex-1">{creating ? "Création..." : "Créer le client"}</Button>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
