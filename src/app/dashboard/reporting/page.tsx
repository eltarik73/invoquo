"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/components/format";
import { useApi } from "@/hooks/use-api";

// --- Types ---

interface RevenueMonth {
  month: string;
  totalHT: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface TopClient {
  clientId: string;
  clientName: string;
  totalHT: number;
  count: number;
}

interface VatBreakdown {
  rate: number;
  totalHT: number;
  totalVAT: number;
}

interface ReportingData {
  revenue: RevenueMonth[];
  statuses: StatusBreakdown[];
  topClients: TopClient[];
  vatBreakdown: VatBreakdown[];
  totalHT: number;
  totalTTC: number;
  invoiceCount: number;
  previousTotalHT: number;
  previousInvoiceCount: number;
  paidAmount: number;
  overdueAmount: number;
  overdueCount: number;
}

const PERIODS = [
  { value: "current_month", label: "Ce mois" },
  { value: "last_month", label: "Mois dernier" },
  { value: "current_quarter", label: "Ce trimestre" },
  { value: "current_year", label: "Cette annee" },
  { value: "last_12_months", label: "12 derniers mois" },
];

const STATUS_LABELS: Record<string, string> = {
  paid: "Payées",
  transmitted: "Transmises",
  sent: "Envoyees",
  pending: "En attente",
  overdue: "En retard",
  rejected: "Rejetées",
  draft: "Brouillons",
};

const STATUS_COLORS: Record<string, string> = {
  paid: "#059669",
  transmitted: "#2563eb",
  sent: "#3b82f6",
  pending: "#d97706",
  overdue: "#dc2626",
  rejected: "#ef4444",
  draft: "#9ca3af",
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"];

// --- Comparison badge ---
function ComparisonBadge({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const positive = diff >= 0;
  return (
    <span className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-red-600"}`}>
      {positive ? "+" : ""}{pct}%{suffix}
    </span>
  );
}

// --- Bar chart ---
function BarChart({ data }: { data: RevenueMonth[] }) {
  const max = Math.max(...data.map((d) => d.totalHT), 1);
  const lastIndex = data.length - 1;

  return (
    <div className="flex items-end gap-2 h-52 px-2">
      {data.map((d, i) => {
        const height = (d.totalHT / max) * 100;
        const monthIndex = new Date(d.month + "-01").getMonth();
        const isCurrent = i === lastIndex;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              {d.totalHT > 0 ? (d.totalHT / 1000).toFixed(1) + "k" : ""}
            </span>
            <div
              className={`w-full rounded-t transition-all duration-500 ${isCurrent ? "bg-violet-500" : "bg-violet-100"}`}
              style={{ height: `${Math.max(height, 3)}%` }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">{MONTH_LABELS[monthIndex]}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Donut ---
function DonutChart({ data }: { data: StatusBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let cumulative = 0;
  const segments = data.filter((d) => d.count > 0).map((d) => {
    const pct = d.count / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 36 36" className="w-36 h-36 shrink-0">
        {segments.map((seg, i) => {
          const dashArray = `${seg.pct * 100} ${100 - seg.pct * 100}`;
          const dashOffset = -(seg.start * 100) + 25;
          return (
            <circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={STATUS_COLORS[seg.status] ?? "#9ca3af"} strokeWidth="3.5" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />
          );
        })}
        <text x="18" y="16.5" textAnchor="middle" className="fill-foreground text-[6px] font-bold font-mono">{total}</text>
        <text x="18" y="21" textAnchor="middle" className="fill-muted-foreground text-[3px]">factures</text>
      </svg>
      <div className="space-y-2 min-w-0">
        {segments.map((seg) => (
          <div key={seg.status} className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[seg.status] ?? "#9ca3af" }} />
            <span className="text-muted-foreground truncate">{STATUS_LABELS[seg.status] ?? seg.status}</span>
            <span className="font-mono font-medium ml-auto">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Page ---
export default function ReportingPage() {
  const [period, setPeriod] = useState("current_month");
  const { data } = useApi<ReportingData>(`/api/reporting/summary?period=${period}`);

  // TODO: replace with API data when route exists
  const r = useMemo<ReportingData>(() => {
    if (data) return data;
    return {
      revenue: Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, totalHT: [4200, 5800, 3600, 7100, 6200, 4800][i] };
      }),
      statuses: [
        { status: "paid", count: 12 },
        { status: "transmitted", count: 5 },
        { status: "pending", count: 3 },
        { status: "overdue", count: 2 },
        { status: "draft", count: 4 },
      ],
      topClients: [
        { clientId: "1", clientName: "Dupont Menuiserie", totalHT: 12400, count: 8 },
        { clientId: "2", clientName: "Martin Plomberie", totalHT: 8900, count: 5 },
        { clientId: "3", clientName: "SCI Les Ormes", totalHT: 6200, count: 3 },
        { clientId: "4", clientName: "Garage Lefebvre", totalHT: 4100, count: 4 },
        { clientId: "5", clientName: "Boulangerie Roy", totalHT: 2800, count: 2 },
      ],
      vatBreakdown: [
        { rate: 20, totalHT: 18500, totalVAT: 3700 },
        { rate: 10, totalHT: 8200, totalVAT: 820 },
        { rate: 5.5, totalHT: 3100, totalVAT: 170.5 },
      ],
      totalHT: 29800,
      totalTTC: 34490.5,
      invoiceCount: 26,
      previousTotalHT: 24500,
      previousInvoiceCount: 22,
      paidAmount: 21200,
      overdueAmount: 3400,
      overdueCount: 2,
    };
  }, [data]);

  const paidPct = r.totalHT > 0 ? Math.round((r.paidAmount / r.totalHT) * 100) : 0;
  const totalVAT = r.vatBreakdown.reduce((s, v) => s + v.totalVAT, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <h1 className="text-2xl font-bold">Reporting</h1>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in-up stagger-1">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">CA du mois (HT)</p>
            <p className="text-3xl font-bold font-mono mt-1">{formatCurrency(r.totalHT)}</p>
            <ComparisonBadge current={r.totalHT} previous={r.previousTotalHT} suffix=" vs mois préc." />
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-2">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Factures émises</p>
            <p className="text-3xl font-bold font-mono mt-1">{r.invoiceCount}</p>
            <ComparisonBadge current={r.invoiceCount} previous={r.previousInvoiceCount} suffix=" vs mois préc." />
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-3">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Encaissé</p>
            <p className="text-3xl font-bold font-mono mt-1">{formatCurrency(r.paidAmount)}</p>
            <span className="text-xs text-muted-foreground">{paidPct}% du CA</span>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-4">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Impayés</p>
            <p className="text-3xl font-bold font-mono mt-1 text-red-600">{formatCurrency(r.overdueAmount)}</p>
            <span className="text-xs text-red-600">{r.overdueCount} facture{r.overdueCount > 1 ? "s" : ""}</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CA mensuel */}
        <Card className="animate-fade-in-up stagger-5">
          <CardHeader><CardTitle className="text-base">CA mensuel (HT)</CardTitle></CardHeader>
          <CardContent><BarChart data={r.revenue} /></CardContent>
        </Card>

        {/* Donut statuts */}
        <Card className="animate-fade-in-up stagger-5">
          <CardHeader><CardTitle className="text-base">Répartition par statut</CardTitle></CardHeader>
          <CardContent><DonutChart data={r.statuses} /></CardContent>
        </Card>

        {/* Top 5 clients */}
        <Card className="animate-fade-in-up stagger-6">
          <CardHeader><CardTitle className="text-base">Top 5 clients</CardTitle></CardHeader>
          <CardContent>
            {r.topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucune donnée pour cette période</p>
            ) : (
              <div className="space-y-4">
                {r.topClients.map((c, i) => {
                  const maxRev = r.topClients[0]?.totalHT || 1;
                  const pct = (c.totalHT / maxRev) * 100;
                  return (
                    <div key={c.clientId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="font-medium truncate">{c.clientName}</span>
                        </div>
                        <span className="font-mono font-semibold ml-3 shrink-0">{formatCurrency(c.totalHT)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventilation TVA */}
        <Card className="animate-fade-in-up stagger-6">
          <CardHeader><CardTitle className="text-base">Ventilation TVA</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {r.vatBreakdown.map((v) => {
                const maxVat = Math.max(...r.vatBreakdown.map((b) => b.totalVAT), 1);
                const pct = (v.totalVAT / maxVat) * 100;
                return (
                  <div key={v.rate} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">TVA {v.rate} %</span>
                      <span className="font-mono font-semibold">{formatCurrency(v.totalVAT)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-300 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">Base HT : {formatCurrency(v.totalHT)}</p>
                  </div>
                );
              })}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-sm">Total TVA collectee</span>
                <span className="font-mono font-bold text-sm">{formatCurrency(totalVAT)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
