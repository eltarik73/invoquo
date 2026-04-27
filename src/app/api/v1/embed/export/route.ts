import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { verifyEmbedToken } from "@/lib/embed-auth";
import { parseMonth, parsePeriod } from "@/modules/export/lib/period";
import { buildMonthlyXlsx } from "@/modules/export/lib/xlsx-monthly";
import { buildMonthlyRecapPdf } from "@/modules/export/lib/pdf-recap-monthly";

// GET /api/v1/embed/export
//   ?format=csv|fec|xlsx|pdf-recap
//   &month=YYYY-MM        (raccourci: filtre sur 1 mois)
//   ou &periodStart=YYYY-MM-DD&periodEnd=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const embedToken = request.headers.get("x-embed-token");
    if (!embedToken) return apiError("Token manquant", 401);

    const payload = await verifyEmbedToken(embedToken);
    if (!payload) return apiError("Token invalide", 401);

    if (!payload.modules.includes("export")) {
      return apiError("Module export non autorise", 403);
    }

    const tenantId = payload.sub;
    const sp = request.nextUrl.searchParams;
    const format = (sp.get("format") || "csv").toLowerCase();
    const monthParam = sp.get("month");

    // Resolution intervalle de dates
    let startDate: Date;
    let endDate: Date;
    let monthLabel: string | null = null;
    if (monthParam) {
      try {
        const parsed = parseMonth(monthParam);
        startDate = parsed.startDate;
        endDate = parsed.endDate;
        monthLabel = parsed.label;
      } catch (e) {
        return apiError((e as Error).message, 400);
      }
    } else {
      const parsed = parsePeriod(sp.get("periodStart"), sp.get("periodEnd"));
      startDate = parsed.startDate;
      endDate = parsed.endDate;
    }

    // Recuperation tenant pour entete des exports XLSX/PDF
    const tenant = format === "xlsx" || format === "pdf-recap"
      ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { companyName: true, siret: true } })
      : null;

    // Fetch invoices + quotes pour la periode
    const [invoices, quotes] = await Promise.all([
      prisma.invoice.findMany({
        where: { tenantId, date: { gte: startDate, lte: endDate }, status: { not: "draft" } },
        include: { client: true, lines: { orderBy: { position: "asc" } } },
        orderBy: { date: "asc" },
      }),
      prisma.quote.findMany({
        where: { tenantId, date: { gte: startDate, lte: endDate }, status: { not: "draft" } },
        include: { client: true, lines: { orderBy: { position: "asc" } } },
        orderBy: { date: "asc" },
      }),
    ]);

    // === XLSX ===
    if (format === "xlsx") {
      const buffer = await buildMonthlyXlsx({
        tenantName: tenant?.companyName || "Mon entreprise",
        tenantSiret: tenant?.siret || "",
        monthLabel: monthLabel || `${startDate.toISOString().slice(0,10)} au ${endDate.toISOString().slice(0,10)}`,
        invoices,
        quotes,
      });
      const filename = monthLabel
        ? `recap_${monthLabel.replace(/\s+/g, "_")}.xlsx`
        : `export_${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}.xlsx`;
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // === PDF RECAP ===
    if (format === "pdf-recap") {
      const pdfBytes = await buildMonthlyRecapPdf({
        tenantName: tenant?.companyName || "Mon entreprise",
        tenantSiret: tenant?.siret || "",
        monthLabel: monthLabel || `${startDate.toISOString().slice(0,10)} au ${endDate.toISOString().slice(0,10)}`,
        invoices,
        quotes,
      });
      const filename = monthLabel
        ? `recap_${monthLabel.replace(/\s+/g, "_")}.pdf`
        : `recap_${startDate.toISOString().slice(0,10)}_${endDate.toISOString().slice(0,10)}.pdf`;
      // Wrap Uint8Array dans Buffer pour satisfaire Response BodyInit en build prod
      return new Response(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // === FEC (Fichier Ecritures Comptables) ===
    if (format === "fec") {
      const rows: string[] = [
        "JournalCode\tJournalLib\tEcritureNum\tEcritureDate\tCompteNum\tCompteLib\tCompAuxNum\tCompAuxLib\tPieceRef\tPieceDate\tEcritureLib\tDebit\tCredit\tEcrtureLettrage\tDateLettrage\tValidDate\tMontantdevise\tIdevise",
      ];
      let ecritureNum = 1;
      for (const inv of invoices) {
        const dateStr = new Date(inv.date).toISOString().slice(0, 10).replace(/-/g, "");
        const cName = inv.client?.companyName || [inv.client?.firstName, inv.client?.lastName].filter(Boolean).join(" ") || "Client";
        const clientNum = `411${String(ecritureNum).padStart(4, "0")}`;
        const num = String(ecritureNum).padStart(6, "0");
        rows.push(`VE\tVentes\t${num}\t${dateStr}\t411000\tClients\t${clientNum}\t${cName}\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} ${cName}\t${Number(inv.totalTTC).toFixed(2)}\t0.00\t\t\t${dateStr}\t${Number(inv.totalTTC).toFixed(2)}\tEUR`);
        rows.push(`VE\tVentes\t${num}\t${dateStr}\t706000\tPrestations de services\t\t\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} ${cName}\t0.00\t${Number(inv.totalHT).toFixed(2)}\t\t\t${dateStr}\t${Number(inv.totalHT).toFixed(2)}\tEUR`);
        if (Number(inv.totalVAT) > 0) {
          rows.push(`VE\tVentes\t${num}\t${dateStr}\t445710\tTVA collectee\t\t\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} TVA\t0.00\t${Number(inv.totalVAT).toFixed(2)}\t\t\t${dateStr}\t${Number(inv.totalVAT).toFixed(2)}\tEUR`);
        }
        ecritureNum++;
      }
      const content = rows.join("\n");
      return new Response(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="FEC_${tenantId}_${startDate.getFullYear()}.txt"`,
        },
      });
    }

    // === CSV (default) ===
    const sep = ";";
    const csvRows: string[] = [
      ["Type", "Numero", "Date", "Client", "Objet", "Total HT", "TVA", "Total TTC", "Statut"].join(sep),
    ];
    for (const inv of invoices) {
      const cName = inv.client?.companyName || [inv.client?.firstName, inv.client?.lastName].filter(Boolean).join(" ") || "";
      const typeName = inv.type === "credit_note" ? "Avoir" : inv.type === "deposit" ? "Acompte" : "Facture";
      csvRows.push([typeName, inv.invoiceNumber, new Date(inv.date).toLocaleDateString("fr-FR"), cName, inv.operationCategory || "", Number(inv.totalHT).toFixed(2), Number(inv.totalVAT).toFixed(2), Number(inv.totalTTC).toFixed(2), inv.status].join(sep));
    }
    for (const q of quotes) {
      const cName = q.client?.companyName || [q.client?.firstName, q.client?.lastName].filter(Boolean).join(" ") || "";
      csvRows.push(["Devis", q.quoteNumber, new Date(q.date).toLocaleDateString("fr-FR"), cName, q.operationCategory || "", Number(q.totalHT).toFixed(2), Number(q.totalVAT).toFixed(2), Number(q.totalTTC).toFixed(2), q.status].join(sep));
    }
    const content = "﻿" + csvRows.join("\n");
    const csvFilename = monthLabel
      ? `export_${monthLabel.replace(/\s+/g, "_")}.csv`
      : `export_${startDate.toISOString().slice(0, 7)}_${endDate.toISOString().slice(0, 7)}.csv`;
    return new Response(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvFilename}"`,
      },
    });
  } catch (e) {
    console.error("Export embed error:", e);
    return apiError("Erreur interne", 500);
  }
}
