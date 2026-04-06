import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { verifyEmbedToken } from "@/lib/embed-auth";

// GET /api/v1/embed/export?format=csv|fec&periodStart=YYYY-MM-DD&periodEnd=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const embedToken = request.headers.get("x-embed-token");
    if (!embedToken) return apiError("Token manquant", 401);

    const payload = await verifyEmbedToken(embedToken);
    if (!payload) return apiError("Token invalide", 401);

    if (!payload.modules.includes("export")) {
      return apiError("Module export non autoris\u00e9", 403);
    }

    const tenantId = payload.sub;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv";
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = periodEnd ? new Date(periodEnd + "T23:59:59Z") : new Date();

    // Fetch invoices + quotes for the period
    const [invoices, quotes] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          tenantId,
          date: { gte: startDate, lte: endDate },
          status: { not: "draft" },
        },
        include: {
          client: true,
          lines: { orderBy: { position: "asc" } },
        },
        orderBy: { date: "asc" },
      }),
      prisma.quote.findMany({
        where: {
          tenantId,
          date: { gte: startDate, lte: endDate },
          status: { not: "draft" },
        },
        include: {
          client: true,
          lines: { orderBy: { position: "asc" } },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    if (format === "fec") {
      // FEC = Fichier des Ecritures Comptables (French fiscal format)
      // Format: JournalCode;JournalLib;EcritureNum;EcritureDate;CompteNum;CompteLib;CompAuxNum;CompAuxLib;PieceRef;PieceDate;EcritureLib;Debit;Credit;EcrtureLettrage;DateLettrage;ValidDate;Montantdevise;Idevise
      const rows: string[] = [
        "JournalCode\tJournalLib\tEcritureNum\tEcritureDate\tCompteNum\tCompteLib\tCompAuxNum\tCompAuxLib\tPieceRef\tPieceDate\tEcritureLib\tDebit\tCredit\tEcrtureLettrage\tDateLettrage\tValidDate\tMontantdevise\tIdevise",
      ];

      let ecritureNum = 1;
      for (const inv of invoices) {
        const dateStr = new Date(inv.date).toISOString().slice(0, 10).replace(/-/g, "");
        const clientName = inv.client?.companyName || [inv.client?.firstName, inv.client?.lastName].filter(Boolean).join(" ") || "Client";
        const clientNum = `411${String(ecritureNum).padStart(4, "0")}`;
        const num = String(ecritureNum).padStart(6, "0");

        // Client debit (TTC)
        rows.push(`VE\tVentes\t${num}\t${dateStr}\t411000\tClients\t${clientNum}\t${clientName}\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} ${clientName}\t${Number(inv.totalTTC).toFixed(2)}\t0.00\t\t\t${dateStr}\t${Number(inv.totalTTC).toFixed(2)}\tEUR`);

        // Revenue credit (HT)
        rows.push(`VE\tVentes\t${num}\t${dateStr}\t706000\tPrestations de services\t\t\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} ${clientName}\t0.00\t${Number(inv.totalHT).toFixed(2)}\t\t\t${dateStr}\t${Number(inv.totalHT).toFixed(2)}\tEUR`);

        // TVA credit
        if (Number(inv.totalVAT) > 0) {
          rows.push(`VE\tVentes\t${num}\t${dateStr}\t445710\tTVA collect\u00e9e\t\t\t${inv.invoiceNumber}\t${dateStr}\t${inv.invoiceNumber} TVA\t0.00\t${Number(inv.totalVAT).toFixed(2)}\t\t\t${dateStr}\t${Number(inv.totalVAT).toFixed(2)}\tEUR`);
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

    // CSV format (default)
    const sep = ";";
    const csvRows: string[] = [
      ["Type", "Num\u00e9ro", "Date", "Client", "Objet", "Total HT", "TVA", "Total TTC", "Statut"].join(sep),
    ];

    for (const inv of invoices) {
      const clientName = inv.client?.companyName || [inv.client?.firstName, inv.client?.lastName].filter(Boolean).join(" ") || "";
      const typeName = inv.type === "credit_note" ? "Avoir" : inv.type === "deposit" ? "Acompte" : "Facture";
      csvRows.push([typeName, inv.invoiceNumber, new Date(inv.date).toLocaleDateString("fr-FR"), clientName, inv.operationCategory || "", Number(inv.totalHT).toFixed(2), Number(inv.totalVAT).toFixed(2), Number(inv.totalTTC).toFixed(2), inv.status].join(sep));
    }

    for (const q of quotes) {
      const clientName = q.client?.companyName || [q.client?.firstName, q.client?.lastName].filter(Boolean).join(" ") || "";
      csvRows.push(["Devis", q.quoteNumber, new Date(q.date).toLocaleDateString("fr-FR"), clientName, q.operationCategory || "", Number(q.totalHT).toFixed(2), Number(q.totalVAT).toFixed(2), Number(q.totalTTC).toFixed(2), q.status].join(sep));
    }

    const content = "\uFEFF" + csvRows.join("\n");
    return new Response(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export_${startDate.toISOString().slice(0, 7)}_${endDate.toISOString().slice(0, 7)}.csv"`,
      },
    });
  } catch (e) {
    console.error("Export embed error:", e);
    return apiError("Erreur interne", 500);
  }
}
