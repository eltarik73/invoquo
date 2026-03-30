"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi, apiFetch } from "@/hooks/use-api";

// === Types ===
interface TenantSettings {
  siret: string; siren: string; companyName: string; legalForm: string | null; capital: string | null;
  address: string; postalCode: string; city: string; vatNumber: string | null; apeCode: string | null;
  insuranceNumber: string | null; insuranceProvider: string | null; insuranceCoverage: string | null;
  rcs: string | null; phone: string | null; email: string | null; website: string | null;
  templateId: string; accentColor: string; logoUrl: string | null;
  headerLine1: string | null; headerLine2: string | null; footerLine1: string | null; footerLine2: string | null; footerLine3: string | null;
  invoicePrefix: string; quotePrefix: string; creditNotePrefix: string;
  nextInvoiceNum: number; nextQuoteNum: number; nextCreditNum: number;
  iban: string | null; bic: string | null; bankName: string | null; bankAccountHolder: string | null; showBankOnInvoice: boolean;
  defaultPaymentTerms: string; defaultLatePenaltyRate: string; defaultEarlyPaymentDiscount: string;
  vatOnDebits: boolean; isMemberAssociation: boolean; isVatExempt: boolean;
  cgvText: string | null; attachCgv: boolean;
  emailSubjectTemplate: string | null; emailBodyTemplate: string | null;
  reminderSubjectTemplate: string | null; reminderBodyTemplate: string | null;
  autoReminder: boolean; reminderDays: number; paStatus: string;
}

const SETTINGS_TABS = [
  { value: "plan", label: "Abonnement" },
  { value: "template", label: "Modèle" },
  { value: "company", label: "Entreprise" },
  { value: "legal", label: "Mentions" },
  { value: "numbering", label: "Numérotation" },
  { value: "bank", label: "Banque" },
  { value: "emails", label: "Emails" },
];

const ACCENT_COLORS = [
  { value: "#7c3aed", label: "Violet" },
  { value: "#2563eb", label: "Bleu" },
  { value: "#059669", label: "Vert" },
  { value: "#C4531A", label: "Terre" },
  { value: "#dc2626", label: "Rouge" },
  { value: "#0f172a", label: "Noir" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#be185d", label: "Rose" },
];

const TEMPLATES = [
  { id: "classic", name: "Classique", desc: "Logo en haut a gauche, ligne de couleur horizontale, tableau standard." },
  { id: "modern", name: "Moderne", desc: "Grand bandeau de couleur pleine, en-tetes de tableau colores." },
  { id: "minimal", name: "Epure", desc: "Minimaliste, petites capitales, tout est dans la typo." },
  { id: "lateral", name: "Lateral", desc: "Bande de couleur verticale a gauche avec vos coordonnees." },
  { id: "bold", name: "Audacieux", desc: "En-tete fond sombre, nom en blanc, couleur d'accent." },
];

// === Defaults ===
const DEFAULTS: TenantSettings = {
  siret: "912 345 678 00012", siren: "912345678", companyName: "Mon Entreprise", legalForm: "EI", capital: null,
  address: "12 rue des Artisans", postalCode: "75001", city: "Paris", vatNumber: "FR91912345678",
  apeCode: "4321A", insuranceNumber: null, insuranceProvider: null, insuranceCoverage: null,
  rcs: null, phone: null, email: null, website: null, templateId: "classic", accentColor: "#7c3aed",
  logoUrl: null, headerLine1: null, headerLine2: null, footerLine1: null, footerLine2: null, footerLine3: null,
  invoicePrefix: "F-", quotePrefix: "D-", creditNotePrefix: "AV-",
  nextInvoiceNum: 1, nextQuoteNum: 1, nextCreditNum: 1,
  iban: null, bic: null, bankName: null, bankAccountHolder: null, showBankOnInvoice: true,
  defaultPaymentTerms: "30_days", defaultLatePenaltyRate: "3x_legal_rate", defaultEarlyPaymentDiscount: "Neant",
  vatOnDebits: false, isMemberAssociation: false, isVatExempt: false,
  cgvText: null, attachCgv: false,
  emailSubjectTemplate: "Facture {numero} — {entreprise}", emailBodyTemplate: "Bonjour {client_prenom},\n\nVeuillez trouver ci-joint la facture {numero} d'un montant de {montant_ttc}.\n\nCordialement,\n{entreprise}",
  reminderSubjectTemplate: "Rappel — Facture {numero}", reminderBodyTemplate: "Bonjour {client_prenom},\n\nSauf erreur, la facture {numero} d'un montant de {montant_ttc} reste impayee.\n\nMerci de proceder au reglement.\n\nCordialement,\n{entreprise}",
  autoReminder: false, reminderDays: 7, paStatus: "disconnected",
};

// === Template miniature ===
function TemplateMini({ id, accentColor, selected, onClick }: { id: string; accentColor: string; selected: boolean; onClick: () => void }) {
  const cls = `cursor-pointer rounded-lg border-2 p-0.5 transition-all ${selected ? "border-violet-500 ring-2 ring-violet-200" : "border-border hover:border-gray-300"}`;
  return (
    <button onClick={onClick} className={cls}>
      <div className="aspect-[210/297] bg-white rounded overflow-hidden relative">
        {id === "classic" && (<><div className="h-1" style={{ background: accentColor }} /><div className="p-2"><div className="h-1.5 w-10 rounded-full" style={{ background: accentColor }} /><div className="h-1 w-14 bg-gray-200 rounded-full mt-1" /><div className="mt-3 space-y-[2px]"><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /></div><div className="mt-2 flex justify-end"><div className="h-1.5 w-8 rounded-sm" style={{ background: accentColor, opacity: 0.3 }} /></div></div></>)}
        {id === "modern" && (<><div className="h-5 flex items-center px-2" style={{ background: accentColor }}><div className="h-1 w-8 bg-white/60 rounded-full" /></div><div className="p-2"><div className="h-[2px] w-full rounded-full mt-1" style={{ background: accentColor, opacity: 0.15 }} /><div className="mt-1 space-y-[2px]"><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /></div></div></>)}
        {id === "minimal" && (<div className="p-3"><div className="h-1 w-8 rounded-full" style={{ background: accentColor }} /><div className="text-[3px] text-gray-400 mt-1">FACTURE</div><div className="mt-3 space-y-[2px]"><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-2/3 bg-gray-100" /></div></div>)}
        {id === "lateral" && (<div className="flex h-full"><div className="w-1/4 p-1" style={{ background: accentColor }}><div className="h-1 w-full bg-white/40 rounded-full" /><div className="h-0.5 w-full bg-white/20 rounded-full mt-0.5" /></div><div className="flex-1 p-2"><div className="h-1 w-12 bg-gray-200 rounded-full" /><div className="mt-2 space-y-[2px]"><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /></div></div></div>)}
        {id === "bold" && (<><div className="h-8 p-1.5 flex flex-col justify-end bg-gray-900"><div className="h-1.5 w-10 rounded-full" style={{ background: accentColor }} /><div className="h-0.5 w-6 bg-white/40 rounded-full mt-0.5" /></div><div className="h-[2px] w-full" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} /><div className="p-2 space-y-[2px]"><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /><div className="h-[2px] w-full bg-gray-100" /></div></>)}
      </div>
    </button>
  );
}

// === Template live preview ===
function TemplatePreview({ templateId, accentColor, s }: { templateId: string; accentColor: string; s: TenantSettings }) {
  const company = s.headerLine1 || s.companyName || "Mon Entreprise";
  const sub = s.headerLine2 || "";
  const lines = [
    { desc: "Prestation de conseil", qty: "5", pu: "80,00", total: "400,00" },
    { desc: "Deplacement sur site", qty: "1", pu: "50,00", total: "50,00" },
    { desc: "Fournitures", qty: "3", pu: "25,00", total: "75,00" },
  ];
  const footer1 = s.footerLine1 || `${s.companyName} · SIRET ${s.siret} · APE ${s.apeCode || "4321A"}`;
  const footer2 = s.footerLine2 || `TVA ${s.vatNumber || "FR91912345678"}`;

  return (
    <div className="aspect-[210/297] bg-white rounded-lg border border-border overflow-hidden shadow-sm text-[7px] leading-tight flex flex-col">
      {/* Header */}
      {templateId === "classic" && (<><div className="h-1" style={{ background: accentColor }} /><div className="p-3 flex justify-between"><div><p className="text-[9px] font-bold" style={{ color: accentColor }}>{company}</p>{sub && <p className="text-muted-foreground">{sub}</p>}<p className="text-muted-foreground mt-0.5">{s.address}, {s.postalCode} {s.city}</p></div><div className="text-right"><p className="text-[10px] font-bold">FACTURE</p><p className="font-mono">F-2026-001</p><p className="text-muted-foreground mt-0.5">29/03/2026</p></div></div></>)}
      {templateId === "modern" && (<><div className="p-3 pb-2" style={{ background: accentColor }}><div className="flex justify-between items-start text-white"><div><p className="text-[9px] font-bold">{company}</p>{sub && <p className="text-white/70 text-[6px]">{sub}</p>}<p className="text-white/60 mt-0.5">{s.address}, {s.postalCode} {s.city}</p></div><div className="text-right"><p className="text-[10px] font-bold">FACTURE</p><p className="font-mono text-white/80">F-2026-001</p></div></div></div><div className="px-3 pt-1 text-muted-foreground">29/03/2026</div></>)}
      {templateId === "minimal" && (<div className="p-4"><p className="text-[9px] font-bold" style={{ color: accentColor }}>{company}</p>{sub && <p className="text-muted-foreground text-[6px]">{sub}</p>}<div className="flex justify-between mt-2"><p className="text-muted-foreground">{s.address}, {s.postalCode} {s.city}</p><div className="text-right"><p className="text-[5px] text-gray-400 tracking-[0.15em] uppercase">Facture</p><p className="font-mono font-bold">F-2026-001</p><p className="text-muted-foreground">29/03/2026</p></div></div></div>)}
      {templateId === "lateral" && (<div className="flex flex-1"><div className="w-[28%] p-2 text-white text-[6px] flex flex-col" style={{ background: accentColor }}><p className="text-[8px] font-bold">{company}</p>{sub && <p className="opacity-70 mt-0.5">{sub}</p>}<p className="mt-1 opacity-70">{s.address}</p><p className="opacity-70">{s.postalCode} {s.city}</p><p className="mt-2 opacity-60">SIRET {s.siret}</p><p className="opacity-60">TVA {s.vatNumber || "FR91912345678"}</p><div className="mt-auto opacity-60">{s.phone || ""}<br/>{s.email || ""}</div></div><div className="flex-1 p-3 flex flex-col"><div><p className="text-[10px] font-bold">FACTURE</p><p className="font-mono">F-2026-001</p><p className="text-muted-foreground">29/03/2026</p></div></div></div>)}
      {templateId === "bold" && (<><div className="p-3 pb-2 bg-gray-900"><p className="text-[11px] font-bold text-white">{company}</p>{sub && <p className="text-white/50 text-[6px]">{sub}</p>}<div className="flex justify-between items-end mt-1"><p className="text-white/50">{s.address}, {s.postalCode} {s.city}</p><div className="text-right"><p className="text-[10px] font-bold" style={{ color: accentColor }}>F-2026-001</p><p className="text-white/60">29/03/2026</p></div></div></div><div className="h-[2px]" style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}40)` }} /></>)}

      {/* Body (shared) */}
      <div className={`${templateId === "lateral" ? "hidden" : ""} px-3 pt-2 flex-1 flex flex-col`}>
        <div className="border border-gray-200 rounded p-1.5 mb-2">
          <p className="text-[5px] text-gray-400 uppercase tracking-wider font-bold">Client</p>
          <p className="font-medium">Dupont Menuiserie</p>
          <p className="text-muted-foreground">45 avenue de la Republique, 69001 Lyon</p>
          <p className="text-muted-foreground font-mono">SIRET 987 654 321 00034</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className={templateId === "modern" ? "" : "border-b border-gray-200"} style={templateId === "modern" ? { background: accentColor + "15" } : undefined}>
              <th className="text-left py-0.5 font-medium">Designation</th>
              <th className="text-center py-0.5 font-medium w-6">Qte</th>
              <th className="text-right py-0.5 font-medium w-10">PU HT</th>
              <th className="text-right py-0.5 font-medium w-10">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (<tr key={i} className="border-b border-gray-100"><td className="py-0.5">{l.desc}</td><td className="text-center py-0.5 font-mono">{l.qty}</td><td className="text-right py-0.5 font-mono">{l.pu}</td><td className="text-right py-0.5 font-mono">{l.total}</td></tr>))}
          </tbody>
        </table>
        <div className="mt-1.5 flex justify-end">
          <div className="w-28 space-y-0.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-mono">525,00</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TVA 20%</span><span className="font-mono">105,00</span></div>
            <div className="flex justify-between font-bold border-t border-gray-200 pt-0.5" style={{ color: accentColor }}><span>Total TTC</span><span className="font-mono">630,00 EUR</span></div>
          </div>
        </div>
        {s.showBankOnInvoice && s.iban && (<div className="mt-1.5 text-[5px] text-muted-foreground border-t border-gray-100 pt-1"><p>IBAN : {s.iban} — BIC : {s.bic || ""}</p></div>)}
        <div className="mt-auto pt-1.5 border-t border-gray-100 text-[5px] text-muted-foreground"><p>{footer1}</p><p>{footer2}</p>{s.footerLine3 && <p>{s.footerLine3}</p>}</div>
      </div>
    </div>
  );
}

// === Tab components ===
function TemplateTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [templateId, setTemplateId] = useState(s.templateId);
  const [accentColor, setAccentColor] = useState(s.accentColor);
  const [customColor, setCustomColor] = useState(false);
  const [headerLine1, setHeaderLine1] = useState(s.headerLine1 ?? "");
  const [headerLine2, setHeaderLine2] = useState(s.headerLine2 ?? "");
  const [footerLine1, setFooterLine1] = useState(s.footerLine1 ?? "");
  const [footerLine2, setFooterLine2] = useState(s.footerLine2 ?? "");
  const [footerLine3, setFooterLine3] = useState(s.footerLine3 ?? "");

  const previewSettings = { ...s, headerLine1, headerLine2, footerLine1, footerLine2, footerLine3, accentColor, templateId };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Choisissez votre modele</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TEMPLATES.map((t) => <TemplateMini key={t.id} id={t.id} accentColor={accentColor} selected={templateId === t.id} onClick={() => setTemplateId(t.id)} />)}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{TEMPLATES.find((t) => t.id === templateId)?.desc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Couleur d&apos;accent</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button key={c.value} onClick={() => { setAccentColor(c.value); setCustomColor(false); }} className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"}`} style={{ background: c.value }} title={c.label} />
              ))}
              <button onClick={() => setCustomColor(true)} className={`w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 ${customColor ? "border-gray-900" : ""}`}>+</button>
            </div>
            {customColor && (
              <div className="flex items-center gap-3 mt-3">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-md border cursor-pointer" />
                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-28 font-mono text-sm" maxLength={7} />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-violet-300 transition-colors cursor-pointer">
              <svg className="w-8 h-8 mx-auto text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
              <p className="text-sm text-muted-foreground mt-2">Glisser votre logo ou cliquer</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG. Max 2 Mo.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">En-tete</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><label className="text-xs font-medium">Ligne principale</label><Input value={headerLine1} onChange={(e) => setHeaderLine1(e.target.value)} placeholder="Ex: Tarik Boudefar — Electricien" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Sous-titre</label><Input value={headerLine2} onChange={(e) => setHeaderLine2(e.target.value)} placeholder="Ex: Specialise domotique et renovation" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pied de page</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><label className="text-xs font-medium">Ligne 1</label><Input value={footerLine1} onChange={(e) => setFooterLine1(e.target.value)} placeholder="Ex: Tarik Boudefar · SIRET 912 345 678 00012 · APE 4321A" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Ligne 2</label><Input value={footerLine2} onChange={(e) => setFooterLine2(e.target.value)} placeholder="Ex: TVA FR 91 912345678 · RCS Chambery" /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Ligne 3 (facultatif)</label><Input value={footerLine3} onChange={(e) => setFooterLine3(e.target.value)} /></div>
            <p className="text-xs text-muted-foreground">Ces informations apparaissent en bas de chaque facture et devis.</p>
          </CardContent>
        </Card>
        <Button onClick={() => onSave({ templateId, accentColor, headerLine1: headerLine1 || null, headerLine2: headerLine2 || null, footerLine1: footerLine1 || null, footerLine2: footerLine2 || null, footerLine3: footerLine3 || null })}>Enregistrer</Button>
      </div>
      <div className="lg:sticky lg:top-8 self-start">
        <Card><CardHeader><CardTitle className="text-base">Apercu en direct</CardTitle></CardHeader><CardContent><TemplatePreview templateId={templateId} accentColor={accentColor} s={previewSettings} /></CardContent></Card>
      </div>
    </div>
  );
}

function CompanyTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ companyName: s.companyName, legalForm: s.legalForm ?? "", capital: s.capital ?? "", address: s.address, postalCode: s.postalCode, city: s.city, phone: s.phone ?? "", email: s.email ?? "", website: s.website ?? "", vatNumber: s.vatNumber ?? "", apeCode: s.apeCode ?? "", insuranceProvider: s.insuranceProvider ?? "", insuranceNumber: s.insuranceNumber ?? "", insuranceCoverage: s.insuranceCoverage ?? "", rcs: s.rcs ?? "" });
  const u = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Card><CardHeader><CardTitle className="text-base">Mon entreprise</CardTitle></CardHeader><CardContent className="space-y-4 max-w-xl">
      <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">Raison sociale / Nom</label><Input value={f.companyName} onChange={(e) => u("companyName", e.target.value)} /></div>
      <div className="space-y-1"><label className="text-sm font-medium">Forme juridique</label><Select value={f.legalForm} onValueChange={(v) => v && u("legalForm", v)}><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger><SelectContent><SelectItem value="EI">EI</SelectItem><SelectItem value="AE">Auto-entrepreneur</SelectItem><SelectItem value="EURL">EURL</SelectItem><SelectItem value="SARL">SARL</SelectItem><SelectItem value="SAS">SAS</SelectItem><SelectItem value="SASU">SASU</SelectItem></SelectContent></Select></div></div>
      <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">SIRET</label><Input value={s.siret} disabled className="bg-muted font-mono" /></div><div className="space-y-1"><label className="text-sm font-medium">SIREN</label><Input value={s.siren} disabled className="bg-muted font-mono" /></div></div>
      <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">N° TVA intracommunautaire</label><Input value={f.vatNumber} onChange={(e) => u("vatNumber", e.target.value)} /></div><div className="space-y-1"><label className="text-sm font-medium">Code APE / NAF</label><Input value={f.apeCode} onChange={(e) => u("apeCode", e.target.value)} /></div></div>
      <div className="space-y-1"><label className="text-sm font-medium">Adresse</label><Input value={f.address} onChange={(e) => u("address", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">Code postal</label><Input value={f.postalCode} onChange={(e) => u("postalCode", e.target.value)} /></div><div className="space-y-1"><label className="text-sm font-medium">Ville</label><Input value={f.city} onChange={(e) => u("city", e.target.value)} /></div></div>
      <div className="border-t border-border pt-4 mt-4"><h3 className="text-sm font-semibold mb-3">Informations professionnelles</h3>
        <div className="space-y-3"><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">N° assurance decennale</label><Input value={f.insuranceNumber} onChange={(e) => u("insuranceNumber", e.target.value)} /></div><div className="space-y-1"><label className="text-sm font-medium">Nom assureur</label><Input value={f.insuranceProvider} onChange={(e) => u("insuranceProvider", e.target.value)} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">Couverture geographique</label><Input value={f.insuranceCoverage} onChange={(e) => u("insuranceCoverage", e.target.value)} placeholder="France entiere" /></div><div className="space-y-1"><label className="text-sm font-medium">RCS</label><Input value={f.rcs} onChange={(e) => u("rcs", e.target.value)} /></div></div>
        {(f.legalForm === "SARL" || f.legalForm === "SAS" || f.legalForm === "SASU" || f.legalForm === "EURL") && (<div className="space-y-1"><label className="text-sm font-medium">Capital social</label><Input value={f.capital} onChange={(e) => u("capital", e.target.value)} placeholder="10 000 EUR" /></div>)}</div></div>
      <Button onClick={() => onSave(f)}>Enregistrer</Button>
    </CardContent></Card>
  );
}

function LegalTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [isVatExempt, setIsVatExempt] = useState(s.isVatExempt);
  const [vatOnDebits, setVatOnDebits] = useState(s.vatOnDebits);
  const [isMemberAssociation, setIsMemberAssociation] = useState(s.isMemberAssociation);
  const [penaltyRate, setPenaltyRate] = useState(s.defaultLatePenaltyRate);
  const [earlyDiscount, setEarlyDiscount] = useState(s.defaultEarlyPaymentDiscount);
  const [cgvText, setCgvText] = useState(s.cgvText ?? "");
  const [attachCgv, setAttachCgv] = useState(s.attachCgv);
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">Ces mentions sont automatiquement ajoutees a toutes vos factures. Certaines sont obligatoires et ne peuvent pas etre desactivees.</div>
      <Card><CardHeader><CardTitle className="text-base">Mentions obligatoires</CardTitle></CardHeader><CardContent className="space-y-4">
        <label className="flex items-start gap-3"><input type="checkbox" checked disabled className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div className="flex-1"><span className="text-sm">Penalites de retard</span><Select value={penaltyRate} onValueChange={(v) => v && setPenaltyRate(v)}><SelectTrigger className="mt-1 w-60"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3x_legal_rate">3 fois le taux legal</SelectItem><SelectItem value="10_percent">10 %</SelectItem><SelectItem value="12_percent">12 %</SelectItem><SelectItem value="15_percent">15 %</SelectItem></SelectContent></Select></div></label>
        <label className="flex items-center gap-3"><input type="checkbox" checked disabled className="w-4 h-4 rounded accent-violet-500" /><span className="text-sm">Indemnite forfaitaire de recouvrement — <span className="font-medium">40 EUR (obligatoire)</span></span></label>
        <label className="flex items-start gap-3"><input type="checkbox" checked disabled className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div className="flex-1"><span className="text-sm">Escompte pour paiement anticipe</span><Input value={earlyDiscount} onChange={(e) => setEarlyDiscount(e.target.value)} className="mt-1 w-60" /></div></label>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Mentions conditionnelles</CardTitle></CardHeader><CardContent className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={s.insuranceNumber ? true : false} disabled={!s.insuranceNumber} className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div><span className="text-sm">Assurance decennale</span>{s.insuranceNumber ? <p className="text-xs text-muted-foreground mt-0.5">{s.insuranceProvider} n° {s.insuranceNumber}</p> : <p className="text-xs text-muted-foreground mt-0.5">Renseignez vos informations dans l&apos;onglet Entreprise</p>}</div></label>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={isMemberAssociation} onChange={(e) => setIsMemberAssociation(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div><span className="text-sm">Membre d&apos;une association agreee</span><p className="text-xs text-muted-foreground mt-0.5">Le reglement par cheque et carte bancaire est accepte</p></div></label>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={isVatExempt} onChange={(e) => setIsVatExempt(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div><span className="text-sm">TVA non applicable, art. 293 B du CGI</span><p className="text-xs text-muted-foreground mt-0.5">Pour les auto-entrepreneurs en franchise en base de TVA</p></div></label>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={vatOnDebits} onChange={(e) => setVatOnDebits(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div><span className="text-sm">TVA sur les debits</span><p className="text-xs text-muted-foreground mt-0.5">Option pour le paiement de la TVA d&apos;apres les debits</p></div></label>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Conditions Generales de Vente</CardTitle></CardHeader><CardContent className="space-y-3">
        <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]" value={cgvText} onChange={(e) => setCgvText(e.target.value)} placeholder="Saisissez vos CGV ici..." />
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={attachCgv} onChange={(e) => setAttachCgv(e.target.checked)} className="w-4 h-4 rounded accent-violet-500" /><span className="text-sm">Joindre les CGV en PDF a chaque facture et devis</span></label>
      </CardContent></Card>
      <Button onClick={() => onSave({ isVatExempt, vatOnDebits, isMemberAssociation, defaultLatePenaltyRate: penaltyRate, defaultEarlyPaymentDiscount: earlyDiscount, cgvText: cgvText || null, attachCgv })}>Enregistrer</Button>
    </div>
  );
}

function NumberingTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [invoicePrefix, setInvoicePrefix] = useState(s.invoicePrefix);
  const [quotePrefix, setQuotePrefix] = useState(s.quotePrefix);
  const [creditNotePrefix, setCreditNotePrefix] = useState(s.creditNotePrefix);
  const y = new Date().getFullYear();
  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">La numerotation doit etre sequentielle et sans rupture (obligation legale). Le format ne peut pas etre modifie retroactivement.</div>
      <Card><CardHeader><CardTitle className="text-base">Prefixes et numerotation</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="space-y-2"><label className="text-sm font-medium">Prefixe factures</label><div className="flex items-center gap-3"><Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="w-24" /><span className="text-sm text-muted-foreground">Prochain :</span><span className="font-mono text-sm bg-muted px-2 py-1 rounded">{invoicePrefix}{y}-{String(s.nextInvoiceNum).padStart(3, "0")}</span></div></div>
        <div className="space-y-2"><label className="text-sm font-medium">Prefixe devis</label><div className="flex items-center gap-3"><Input value={quotePrefix} onChange={(e) => setQuotePrefix(e.target.value)} className="w-24" /><span className="text-sm text-muted-foreground">Prochain :</span><span className="font-mono text-sm bg-muted px-2 py-1 rounded">{quotePrefix}{y}-{String(s.nextQuoteNum).padStart(3, "0")}</span></div></div>
        <div className="space-y-2"><label className="text-sm font-medium">Prefixe avoirs</label><div className="flex items-center gap-3"><Input value={creditNotePrefix} onChange={(e) => setCreditNotePrefix(e.target.value)} className="w-24" /><span className="text-sm text-muted-foreground">Prochain :</span><span className="font-mono text-sm bg-muted px-2 py-1 rounded">{creditNotePrefix}{y}-{String(s.nextCreditNum).padStart(3, "0")}</span></div></div>
        <p className="text-xs text-muted-foreground">Le prochain numero est calcule automatiquement. Il ne peut pas etre modifie manuellement.</p>
      </CardContent></Card>
      <Button onClick={() => onSave({ invoicePrefix, quotePrefix, creditNotePrefix })}>Enregistrer</Button>
    </div>
  );
}

function BankTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ bankAccountHolder: s.bankAccountHolder ?? "", iban: s.iban ?? "", bic: s.bic ?? "", bankName: s.bankName ?? "", showBankOnInvoice: s.showBankOnInvoice });
  const u = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">Ces informations seront affichees sur vos factures pour faciliter le paiement.</div>
      <Card><CardHeader><CardTitle className="text-base">Coordonnees bancaires</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-1"><label className="text-sm font-medium">Titulaire du compte</label><Input value={f.bankAccountHolder} onChange={(e) => u("bankAccountHolder", e.target.value)} /></div>
        <div className="space-y-1"><label className="text-sm font-medium">IBAN</label><Input value={f.iban} onChange={(e) => u("iban", e.target.value)} className="font-mono" placeholder="FR76 1234 5678 9012 3456 7890 123" /></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-sm font-medium">BIC / SWIFT</label><Input value={f.bic} onChange={(e) => u("bic", e.target.value)} className="font-mono" placeholder="BNPAFRPP" /></div><div className="space-y-1"><label className="text-sm font-medium">Banque</label><Input value={f.bankName} onChange={(e) => u("bankName", e.target.value)} /></div></div>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={f.showBankOnInvoice} onChange={(e) => u("showBankOnInvoice", e.target.checked)} className="w-4 h-4 rounded accent-violet-500" /><span className="text-sm">Afficher les coordonnees bancaires sur les factures</span></label>
      </CardContent></Card>
      <Button onClick={() => onSave(f)}>Enregistrer</Button>
    </div>
  );
}

function EmailsTab({ s, onSave }: { s: TenantSettings; onSave: (d: Record<string, unknown>) => void }) {
  const [subject, setSubject] = useState(s.emailSubjectTemplate ?? "");
  const [body, setBody] = useState(s.emailBodyTemplate ?? "");
  const [reminderSubject, setReminderSubject] = useState(s.reminderSubjectTemplate ?? "");
  const [reminderBody, setReminderBody] = useState(s.reminderBodyTemplate ?? "");
  const [autoReminder, setAutoReminder] = useState(s.autoReminder);
  const [reminderDays, setReminderDays] = useState(s.reminderDays);
  const vars = ["{numero}", "{client_prenom}", "{client_nom}", "{montant_ttc}", "{montant_ht}", "{date_echeance}", "{mon_nom}", "{entreprise}"];
  return (
    <div className="space-y-6 max-w-2xl">
      <Card><CardHeader><CardTitle className="text-base">Email d&apos;envoi de facture</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="space-y-1"><label className="text-sm font-medium">Objet</label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div className="space-y-1"><label className="text-sm font-medium">Message d&apos;accompagnement</label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[140px]" value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="bg-muted rounded-lg p-3"><p className="text-xs font-medium text-muted-foreground mb-2">Variables disponibles</p><div className="flex flex-wrap gap-1.5">{vars.map((v) => <span key={v} className="text-xs font-mono bg-white border border-border px-2 py-0.5 rounded">{v}</span>)}</div></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Email de relance</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="space-y-1"><label className="text-sm font-medium">Objet</label><Input value={reminderSubject} onChange={(e) => setReminderSubject(e.target.value)} /></div>
        <div className="space-y-1"><label className="text-sm font-medium">Message de relance</label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px]" value={reminderBody} onChange={(e) => setReminderBody(e.target.value)} /></div>
        <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={autoReminder} onChange={(e) => setAutoReminder(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-violet-500" /><div><span className="text-sm font-medium">Relances automatiques</span><p className="text-xs text-muted-foreground">Envoie automatiquement un rappel apres l&apos;echeance</p></div></label>
        {autoReminder && <div className="flex items-center gap-2 pl-7"><Input type="number" min={1} max={90} value={reminderDays} onChange={(e) => setReminderDays(parseInt(e.target.value) || 7)} className="w-20" /><span className="text-sm text-muted-foreground">jours apres l&apos;echeance</span></div>}
      </CardContent></Card>
      <Button onClick={() => onSave({ emailSubjectTemplate: subject, emailBodyTemplate: body, reminderSubjectTemplate: reminderSubject, reminderBodyTemplate: reminderBody, autoReminder, reminderDays })}>Enregistrer</Button>
    </div>
  );
}

// === Plan Tab ===
function PlanTab() {
  const { data: tenant } = useApi<{ plan: string; trialEndsAt: string | null; stripeSubId: string | null; planSource: string }>("/api/settings");
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = tenant?.plan || "essentiel";
  const trialEndsAt = tenant?.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
  const isTrial = trialEndsAt && trialEndsAt > new Date();
  const trialDaysLeft = isTrial ? Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000) : 0;
  const isBativio = tenant?.planSource === "bativio" || tenant?.planSource === "klikgo";

  async function handleCheckout(plan: string) {
    setLoading(plan);
    try {
      const res = await apiFetch<{ url: string }>("/api/stripe/checkout", { method: "POST", body: JSON.stringify({ plan }) });
      if (res.url) window.location.href = res.url;
    } catch { /* handled */ }
    finally { setLoading(null); }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await apiFetch<{ url: string }>("/api/stripe/portal", { method: "POST" });
      if (res.url) window.location.href = res.url;
    } catch { /* handled */ }
    finally { setLoading(null); }
  }

  const plans = [
    { id: "essentiel", label: "Essentiel", price: "19", features: ["Réception PA illimitée", "Dashboard de suivi", "Notifications email", "Export basique"] },
    { id: "standard", label: "Standard", price: "29", features: ["Tout l'Essentiel", "Émission PA illimitée", "Import Factur-X", "E-reporting automatique", "Suivi statuts PA"] },
    { id: "pro", label: "Pro", price: "39", features: ["Tout le Standard", "Création factures et devis", "5 templates personnalisables", "Export FEC, CSV, PDF", "Reporting", "Relances auto"] },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Current plan banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{plans.find((p) => p.id === currentPlan)?.label || "Essentiel"}</h3>
                <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Plan actuel</span>
                {isTrial && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Essai gratuit — {trialDaysLeft}j restants</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isTrial ? "Accès complet pendant votre période d'essai" : `${plans.find((p) => p.id === currentPlan)?.price || "19"} €/mois HT`}
              </p>
            </div>
            {tenant?.stripeSubId && (
              <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading === "portal"}>
                {loading === "portal" ? "Chargement..." : "Gérer mon abonnement"}
              </Button>
            )}
          </div>
          {isBativio && (
            <p className="text-xs text-muted-foreground mt-3 bg-muted rounded-lg px-3 py-2">
              Votre abonnement est géré par {tenant?.planSource === "bativio" ? "Bativio" : "Klik&Go"}. Contactez votre prestataire pour changer de plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan cards */}
      {!isBativio && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPopular = plan.id === "standard";
            return (
              <div key={plan.id} className={`rounded-2xl border p-6 flex flex-col ${isPopular ? "border-violet-500 ring-2 ring-violet-200 relative" : "border-gray-200"}`}>
                {isPopular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">Populaire</div>}
                <h4 className="font-bold text-gray-900">{plan.label}</h4>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold font-mono">{plan.price}</span>
                  <span className="text-gray-500 text-sm"> €/mois HT</span>
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>Plan actuel</Button>
                  ) : (
                    <Button className="w-full" variant={isPopular ? "default" : "outline"} disabled={loading === plan.id} onClick={() => handleCheckout(plan.id)}>
                      {loading === plan.id ? "Redirection..." : `Passer au ${plan.label}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === Main ===
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("plan");
  const { data: settings, refetch } = useApi<TenantSettings>("/api/settings");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true); setSaved(false);
    try { await apiFetch("/api/settings", { method: "PUT", body: JSON.stringify(data) }); refetch(); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch { /* handled */ } finally { setSaving(false); }
  }

  const s: TenantSettings = settings ?? DEFAULTS;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Parametres</h1>
        <p className="text-muted-foreground text-sm mt-1">Configurez votre espace de facturation</p>
        {saving && <p className="text-sm text-violet-600 mt-1">Enregistrement...</p>}
        {saved && <p className="text-sm text-emerald-600 mt-1">Enregistré avec succès</p>}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)} className="animate-fade-in-up stagger-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          {SETTINGS_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">{tab.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="animate-fade-in-up stagger-2">
        {activeTab === "plan" && <PlanTab />}
        {activeTab === "template" && <TemplateTab s={s} onSave={handleSave} />}
        {activeTab === "company" && <CompanyTab s={s} onSave={handleSave} />}
        {activeTab === "legal" && <LegalTab s={s} onSave={handleSave} />}
        {activeTab === "numbering" && <NumberingTab s={s} onSave={handleSave} />}
        {activeTab === "bank" && <BankTab s={s} onSave={handleSave} />}
        {activeTab === "emails" && <EmailsTab s={s} onSave={handleSave} />}
      </div>
    </div>
  );
}
