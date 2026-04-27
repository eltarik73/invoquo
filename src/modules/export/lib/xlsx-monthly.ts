import ExcelJS from "exceljs";

// Types compatibles Prisma sans importer le client (evite cycle)
type InvoiceRow = {
  invoiceNumber: string;
  date: Date;
  type: string;
  status: string;
  totalHT: { toString(): string } | number;
  totalVAT: { toString(): string } | number;
  totalTTC: { toString(): string } | number;
  operationCategory?: string | null;
  paymentTerms?: string | null;
  dueDate?: Date | null;
  client?: { companyName?: string | null; firstName?: string | null; lastName?: string | null; siret?: string | null; email?: string | null } | null;
};
type QuoteRow = {
  quoteNumber: string;
  date: Date;
  status: string;
  totalHT: { toString(): string } | number;
  totalVAT: { toString(): string } | number;
  totalTTC: { toString(): string } | number;
  operationCategory?: string | null;
  validUntil?: Date | null;
  client?: { companyName?: string | null; firstName?: string | null; lastName?: string | null; siret?: string | null; email?: string | null } | null;
};

const num = (v: unknown): number => Number(v ?? 0);
const clientName = (c: InvoiceRow["client"] | QuoteRow["client"]) => c?.companyName || [c?.firstName, c?.lastName].filter(Boolean).join(" ") || "";
const fmtDate = (d: Date | null | undefined) => d ? new Date(d).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "";
const fmtType = (t: string) => t === "credit_note" ? "Avoir" : t === "deposit" ? "Acompte" : "Facture";
const fmtStatus = (s: string) => ({
  draft: "Brouillon", pending: "En attente", sent: "Envoyee", transmitted: "Transmise",
  paid: "Payee", overdue: "En retard", rejected: "Refusee", accepted: "Acceptee", expired: "Expiree",
} as Record<string, string>)[s] || s;

/**
 * Genere un classeur Excel avec 3 feuilles : Factures, Devis, Synthese.
 * Retourne un Buffer pret a etre envoye en HTTP.
 */
export async function buildMonthlyXlsx(opts: {
  tenantName: string;
  tenantSiret: string;
  monthLabel: string; // ex: "avril 2026"
  invoices: InvoiceRow[];
  quotes: QuoteRow[];
}): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Invoquo via Bativio";
  wb.created = new Date();
  wb.lastModifiedBy = "Invoquo";

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC4531A" } },
    alignment: { vertical: "middle", horizontal: "left" },
    border: { bottom: { style: "thin", color: { argb: "FF8B3A12" } } },
  };
  const totalRowStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 11, color: { argb: "FF3D2E1F" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2EAE0" } },
    border: { top: { style: "medium", color: { argb: "FFC4531A" } } },
  };

  // ====== FEUILLE 1 : FACTURES ======
  const wsInv = wb.addWorksheet("Factures", { properties: { tabColor: { argb: "FFC4531A" } } });
  wsInv.columns = [
    { header: "Numero", key: "num", width: 16 },
    { header: "Type", key: "type", width: 10 },
    { header: "Date", key: "date", width: 12 },
    { header: "Echeance", key: "due", width: 12 },
    { header: "Client", key: "client", width: 30 },
    { header: "SIRET client", key: "siret", width: 16 },
    { header: "Objet", key: "obj", width: 30 },
    { header: "Total HT", key: "ht", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "TVA", key: "vat", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "Total TTC", key: "ttc", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "Statut", key: "status", width: 14 },
  ];
  wsInv.getRow(1).eachCell(c => Object.assign(c, headerStyle));
  wsInv.views = [{ state: "frozen", ySplit: 1 }];

  let totalInvHT = 0, totalInvVAT = 0, totalInvTTC = 0;
  for (const inv of opts.invoices) {
    const row = wsInv.addRow({
      num: inv.invoiceNumber,
      type: fmtType(inv.type),
      date: fmtDate(inv.date),
      due: fmtDate(inv.dueDate || null),
      client: clientName(inv.client),
      siret: inv.client?.siret || "",
      obj: inv.operationCategory || "",
      ht: num(inv.totalHT),
      vat: num(inv.totalVAT),
      ttc: num(inv.totalTTC),
      status: fmtStatus(inv.status),
    });
    totalInvHT += num(inv.totalHT);
    totalInvVAT += num(inv.totalVAT);
    totalInvTTC += num(inv.totalTTC);
    // Statut colore
    const statusCell = row.getCell("status");
    if (inv.status === "paid") statusCell.font = { color: { argb: "FF4A6741" }, bold: true };
    else if (inv.status === "overdue") statusCell.font = { color: { argb: "FFC4531A" }, bold: true };
  }
  if (opts.invoices.length > 0) {
    const totalRow = wsInv.addRow({ num: "TOTAL", ht: totalInvHT, vat: totalInvVAT, ttc: totalInvTTC });
    totalRow.eachCell(c => Object.assign(c, totalRowStyle));
  } else {
    wsInv.addRow({ num: "Aucune facture sur la periode" });
  }

  // ====== FEUILLE 2 : DEVIS ======
  const wsQ = wb.addWorksheet("Devis", { properties: { tabColor: { argb: "FFD4956B" } } });
  wsQ.columns = [
    { header: "Numero", key: "num", width: 16 },
    { header: "Date", key: "date", width: 12 },
    { header: "Validite", key: "valid", width: 12 },
    { header: "Client", key: "client", width: 30 },
    { header: "SIRET client", key: "siret", width: 16 },
    { header: "Objet", key: "obj", width: 30 },
    { header: "Total HT", key: "ht", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "TVA", key: "vat", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "Total TTC", key: "ttc", width: 12, style: { numFmt: '#,##0.00 "EUR"' } },
    { header: "Statut", key: "status", width: 14 },
  ];
  wsQ.getRow(1).eachCell(c => Object.assign(c, headerStyle));
  wsQ.views = [{ state: "frozen", ySplit: 1 }];

  let totalQHT = 0, totalQVAT = 0, totalQTTC = 0, qAccepted = 0, qSent = 0;
  for (const q of opts.quotes) {
    wsQ.addRow({
      num: q.quoteNumber,
      date: fmtDate(q.date),
      valid: fmtDate(q.validUntil || null),
      client: clientName(q.client),
      siret: q.client?.siret || "",
      obj: q.operationCategory || "",
      ht: num(q.totalHT),
      vat: num(q.totalVAT),
      ttc: num(q.totalTTC),
      status: fmtStatus(q.status),
    });
    totalQHT += num(q.totalHT);
    totalQVAT += num(q.totalVAT);
    totalQTTC += num(q.totalTTC);
    if (q.status === "accepted") qAccepted++;
    if (q.status === "sent") qSent++;
  }
  if (opts.quotes.length > 0) {
    const totalRow = wsQ.addRow({ num: "TOTAL", ht: totalQHT, vat: totalQVAT, ttc: totalQTTC });
    totalRow.eachCell(c => Object.assign(c, totalRowStyle));
  } else {
    wsQ.addRow({ num: "Aucun devis sur la periode" });
  }

  // ====== FEUILLE 3 : SYNTHESE ======
  const wsS = wb.addWorksheet("Synthese", { properties: { tabColor: { argb: "FF4A6741" } } });
  wsS.columns = [{ width: 36 }, { width: 22 }];
  wsS.addRow([`Synthese ${opts.monthLabel}`]).font = { bold: true, size: 16, color: { argb: "FF3D2E1F" } };
  wsS.addRow([opts.tenantName + " - SIRET " + opts.tenantSiret]).font = { italic: true, color: { argb: "FF9C958D" } };
  wsS.addRow([]);
  wsS.addRow(["FACTURATION"]).font = { bold: true, size: 13, color: { argb: "FFC4531A" } };
  wsS.addRow(["Nombre de factures", opts.invoices.length]);
  wsS.addRow(["Total HT facture", totalInvHT]).getCell(2).numFmt = '#,##0.00 "EUR"';
  wsS.addRow(["Total TVA collectee", totalInvVAT]).getCell(2).numFmt = '#,##0.00 "EUR"';
  wsS.addRow(["Total TTC facture", totalInvTTC]).getCell(2).numFmt = '#,##0.00 "EUR"';
  const paidInv = opts.invoices.filter(i => i.status === "paid");
  const overdueInv = opts.invoices.filter(i => i.status === "overdue");
  wsS.addRow(["Factures payees", paidInv.length]);
  wsS.addRow(["Total encaisse (TTC)", paidInv.reduce((a, i) => a + num(i.totalTTC), 0)]).getCell(2).numFmt = '#,##0.00 "EUR"';
  wsS.addRow(["Factures en retard", overdueInv.length]);
  wsS.addRow(["Total impaye en retard (TTC)", overdueInv.reduce((a, i) => a + num(i.totalTTC), 0)]).getCell(2).numFmt = '#,##0.00 "EUR"';
  wsS.addRow([]);
  wsS.addRow(["DEVIS"]).font = { bold: true, size: 13, color: { argb: "FFC4531A" } };
  wsS.addRow(["Nombre de devis emis", opts.quotes.length]);
  wsS.addRow(["Devis envoyes (en attente)", qSent]);
  wsS.addRow(["Devis acceptes", qAccepted]);
  wsS.addRow(["Total HT devis acceptes", opts.quotes.filter(q => q.status === "accepted").reduce((a, q) => a + num(q.totalHT), 0)]).getCell(2).numFmt = '#,##0.00 "EUR"';
  wsS.addRow(["Taux de conversion", opts.quotes.length > 0 ? Math.round(qAccepted / opts.quotes.length * 100) + " %" : "n/a"]);
  wsS.addRow([]);
  wsS.addRow([`Document genere le ${new Date().toLocaleDateString("fr-FR")} a ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} via Bativio + Invoquo`]).font = { italic: true, size: 9, color: { argb: "FF9C958D" } };

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
