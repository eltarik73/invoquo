"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/components/format";
import { useApi, apiFetch } from "@/hooks/use-api";

interface ExportRecord {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  fileName: string;
  fileUrl: string | null;
  fileSize: number | null;
  status: string;
  createdAt: string;
}

interface ExportList {
  data: ExportRecord[];
  total: number;
}

const TYPE_LABELS: Record<string, string> = {
  fec: "FEC",
  csv: "CSV",
  pdf_report: "Rapport PDF",
  facturx_archive: "Factur-X",
};

const EXPORT_FORMATS = [
  {
    type: "fec",
    title: "FEC (Fichier des Ecritures Comptables)",
    description: "Format obligatoire pour la presentation de la comptabilite informatisee lors d'un controle fiscal.",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    button: "Generer le FEC",
  },
  {
    type: "csv",
    title: "CSV / Excel",
    description: "Export des factures, paiements et clients pour votre comptable ou tableur.",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v.75" />
      </svg>
    ),
    button: "Telecharger CSV",
  },
  {
    type: "pdf_report",
    title: "Rapport PDF mensuel",
    description: "Synthese mensuelle avec CA, TVA, top clients et graphiques — pret pour votre comptable.",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    button: "Generer PDF",
  },
  {
    type: "facturx_archive",
    title: "Archive Factur-X",
    description: "Telecharger toutes les factures emises et recues au format Factur-X (PDF+XML).",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    button: "Telecharger ZIP",
  },
];

// TODO: replace with API data
const MOCK_HISTORY: ExportRecord[] = [
  { id: "1", type: "fec", periodStart: "2026-01-01", periodEnd: "2026-03-31", fileName: "FEC-2026-T1.txt", fileUrl: "#", fileSize: 24500, status: "completed", createdAt: "2026-03-28T10:30:00Z" },
  { id: "2", type: "pdf_report", periodStart: "2026-02-01", periodEnd: "2026-02-28", fileName: "Rapport-Fevrier-2026.pdf", fileUrl: "#", fileSize: 185000, status: "completed", createdAt: "2026-03-01T09:00:00Z" },
  { id: "3", type: "csv", periodStart: "2026-01-01", periodEnd: "2026-03-31", fileName: "Export-Factures-T1.csv", fileUrl: "#", fileSize: 12300, status: "completed", createdAt: "2026-03-15T14:20:00Z" },
];

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function ExportPage() {
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
  );
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [generating, setGenerating] = useState<string | null>(null);

  const { data: history, refetch } = useApi<ExportList>("/api/exports?limit=10");
  const historyData = history?.data ?? MOCK_HISTORY;

  async function handleExport(type: string) {
    setGenerating(type);
    try {
      await apiFetch(`/api/exports/${type}`, {
        method: "POST",
        body: JSON.stringify({ periodStart, periodEnd }),
      });
      refetch();
    } catch {
      // handled
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Export comptable</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Exportez vos donnees de facturation pour votre comptabilite
        </p>
      </div>

      {/* Period */}
      <Card className="animate-fade-in-up stagger-1">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-medium shrink-0">Periode :</span>
            <div className="flex items-center gap-2">
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-40" />
              <span className="text-muted-foreground text-sm">au</span>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export format cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 animate-fade-in-up stagger-1">
          Formats d&apos;export disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPORT_FORMATS.map((format, i) => (
            <button
              key={format.type}
              onClick={() => handleExport(format.type)}
              disabled={generating === format.type}
              className={`animate-fade-in-up stagger-${Math.min(i + 2, 6)} text-left rounded-xl border border-border p-5 transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm disabled:opacity-60`}
            >
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-lg ${format.bgColor} flex items-center justify-center shrink-0 ${format.iconColor}`}>
                  {format.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{format.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{format.description}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-primary">
                    {generating === format.type ? (
                      "Generation en cours..."
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {format.button}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <Card className="animate-fade-in-up stagger-6">
        <CardHeader>
          <CardTitle className="text-base">Historique des exports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export</TableHead>
                <TableHead className="hidden sm:table-cell">Periode</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aucun export genere pour le moment
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{exp.fileName}</p>
                      {exp.fileSize && <p className="text-xs text-muted-foreground">{formatSize(exp.fileSize)}</p>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">
                      {formatDate(exp.periodStart)} - {formatDate(exp.periodEnd)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{TYPE_LABELS[exp.type] ?? exp.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                      {formatDate(exp.createdAt)}
                    </TableCell>
                    <TableCell>
                      {exp.status === "completed" && (
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
