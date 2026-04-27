import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";

type InvoiceRow = {
  invoiceNumber: string;
  date: Date;
  type: string;
  status: string;
  totalHT: { toString(): string } | number;
  totalVAT: { toString(): string } | number;
  totalTTC: { toString(): string } | number;
  client?: { companyName?: string | null; firstName?: string | null; lastName?: string | null } | null;
};
type QuoteRow = {
  quoteNumber: string;
  date: Date;
  status: string;
  totalHT: { toString(): string } | number;
  totalVAT: { toString(): string } | number;
  totalTTC: { toString(): string } | number;
  client?: { companyName?: string | null; firstName?: string | null; lastName?: string | null } | null;
};

const num = (v: unknown): number => Number(v ?? 0);
// fmtEur: format manuel pour eviter les caracteres "espace fine insecable" (0x202f)
// que les fonts StandardFonts WinAnsi de pdf-lib ne savent pas encoder.
const fmtEur = (v: number): string => {
  const fixed = Math.abs(v).toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  // Insertion d'espaces classiques (0x20) tous les 3 chiffres
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = v < 0 ? "-" : "";
  return `${sign}${grouped},${decPart} EUR`;
};
// fmtDate manuel jj/mm/aaaa pour eviter caracteres exotiques (eviter aussi 0x202f)
const fmtDate = (d: Date | null | undefined) => {
  if (!d) return "";
  const dd = new Date(d);
  return `${String(dd.getUTCDate()).padStart(2,"0")}/${String(dd.getUTCMonth()+1).padStart(2,"0")}/${dd.getUTCFullYear()}`;
};
const clientName = (c: InvoiceRow["client"] | QuoteRow["client"]) => c?.companyName || [c?.firstName, c?.lastName].filter(Boolean).join(" ") || "";
const fmtType = (t: string) => t === "credit_note" ? "Avoir" : t === "deposit" ? "Acompte" : "Facture";
const fmtStatus = (s: string) => ({
  draft: "Brouillon", pending: "En attente", sent: "Envoyee", transmitted: "Transmise",
  paid: "Payee", overdue: "En retard", rejected: "Refusee", accepted: "Acceptee", expired: "Expiree",
} as Record<string, string>)[s] || s;

// Tronque une chaine pour entrer dans une largeur de colonne
function ellipsize(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.substring(0, max - 1) + "...";
}

// Couleurs Bativio (palette terre)
const COLOR = {
  terre: rgb(196/255, 83/255, 26/255),
  bois: rgb(61/255, 46/255, 31/255),
  pierre: rgb(156/255, 149/255, 141/255),
  sable: rgb(232/255, 213/255, 192/255),
  sableLight: rgb(242/255, 234/255, 224/255),
  mousse: rgb(74/255, 103/255, 65/255),
  noir: rgb(0, 0, 0),
  blanc: rgb(1, 1, 1),
};

/**
 * Genere un PDF synthese mensuelle, format A4, sans image/logo.
 * Retourne un Uint8Array pret a etre envoye en HTTP.
 */
export async function buildMonthlyRecapPdf(opts: {
  tenantName: string;
  tenantSiret: string;
  monthLabel: string;
  invoices: InvoiceRow[];
  quotes: QuoteRow[];
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Recap mensuel ${opts.monthLabel}`);
  pdf.setAuthor(opts.tenantName);
  pdf.setCreator("Invoquo via Bativio");
  pdf.setProducer("pdf-lib");

  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const fontSerif = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const PAGE_W = PageSizes.A4[0];
  const PAGE_H = PageSizes.A4[1];
  const MARGIN_X = 40;
  const MARGIN_TOP = 50;
  const MARGIN_BOTTOM = 50;

  let page = pdf.addPage(PageSizes.A4);
  let y = PAGE_H - MARGIN_TOP;

  // Helper pour ecrire texte avec wrap auto sur nouvelle page
  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      drawFooter();
      page = pdf.addPage(PageSizes.A4);
      y = PAGE_H - MARGIN_TOP;
    }
  };

  const drawFooter = () => {
    const now = new Date();
    const dStr = `${String(now.getUTCDate()).padStart(2,"0")}/${String(now.getUTCMonth()+1).padStart(2,"0")}/${now.getUTCFullYear()}`;
    const tStr = `${String(now.getUTCHours()).padStart(2,"0")}:${String(now.getUTCMinutes()).padStart(2,"0")} UTC`;
    page.drawText(`Document genere le ${dStr} a ${tStr} via Bativio + Invoquo`, {
      x: MARGIN_X, y: 25, size: 8, font: fontItalic, color: COLOR.pierre,
    });
  };

  // === EN-TETE ===
  page.drawText("RECAP MENSUEL", { x: MARGIN_X, y, size: 22, font: fontSerif, color: COLOR.bois });
  y -= 28;
  page.drawText(opts.monthLabel.toUpperCase(), { x: MARGIN_X, y, size: 14, font: fontBold, color: COLOR.terre });
  y -= 24;

  // Bandeau entreprise
  page.drawRectangle({ x: MARGIN_X, y: y - 32, width: PAGE_W - 2 * MARGIN_X, height: 32, color: COLOR.sableLight });
  page.drawText(opts.tenantName, { x: MARGIN_X + 12, y: y - 14, size: 11, font: fontBold, color: COLOR.bois });
  page.drawText(`SIRET ${opts.tenantSiret}`, { x: MARGIN_X + 12, y: y - 27, size: 9, font: fontReg, color: COLOR.pierre });
  y -= 50;

  // === KPIs ===
  const totalHT = opts.invoices.reduce((a, i) => a + num(i.totalHT), 0);
  const totalVAT = opts.invoices.reduce((a, i) => a + num(i.totalVAT), 0);
  const totalTTC = opts.invoices.reduce((a, i) => a + num(i.totalTTC), 0);
  const paidInv = opts.invoices.filter(i => i.status === "paid");
  const overdueInv = opts.invoices.filter(i => i.status === "overdue");
  const encaisse = paidInv.reduce((a, i) => a + num(i.totalTTC), 0);
  const impaye = overdueInv.reduce((a, i) => a + num(i.totalTTC), 0);
  const qAccepted = opts.quotes.filter(q => q.status === "accepted");
  const qAcceptedHT = qAccepted.reduce((a, q) => a + num(q.totalHT), 0);

  page.drawText("INDICATEURS CLES", { x: MARGIN_X, y, size: 12, font: fontBold, color: COLOR.terre });
  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 1, color: COLOR.terre });
  y -= 16;

  // KPIs en grille 2x4
  const kpis = [
    { label: "Chiffre d'affaires HT", value: fmtEur(totalHT) },
    { label: "TVA collectee", value: fmtEur(totalVAT) },
    { label: "Chiffre d'affaires TTC", value: fmtEur(totalTTC), highlight: true },
    { label: "Total encaisse (paye)", value: fmtEur(encaisse) },
    { label: "Nombre de factures", value: String(opts.invoices.length) },
    { label: "Factures payees", value: `${paidInv.length} / ${opts.invoices.length}` },
    { label: "Factures en retard", value: String(overdueInv.length), warning: overdueInv.length > 0 },
    { label: "Impayes en retard", value: fmtEur(impaye), warning: impaye > 0 },
  ];
  const colW = (PAGE_W - 2 * MARGIN_X) / 4;
  for (let i = 0; i < kpis.length; i++) {
    const col = i % 4;
    if (col === 0 && i > 0) y -= 50;
    const x = MARGIN_X + col * colW;
    const k = kpis[i];
    page.drawText(k.label.toUpperCase(), { x, y, size: 7, font: fontReg, color: COLOR.pierre });
    page.drawText(k.value, {
      x, y: y - 16, size: k.highlight ? 14 : 11,
      font: k.highlight ? fontBold : fontBold,
      color: k.warning ? COLOR.terre : (k.highlight ? COLOR.terre : COLOR.bois),
    });
  }
  y -= 70;

  // Devis bloc compact
  page.drawText("DEVIS", { x: MARGIN_X, y, size: 12, font: fontBold, color: COLOR.terre });
  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 1, color: COLOR.terre });
  y -= 16;
  const qkpis = [
    { label: "Devis emis", value: String(opts.quotes.length) },
    { label: "Devis acceptes", value: String(qAccepted.length) },
    { label: "Montant accepte (HT)", value: fmtEur(qAcceptedHT) },
    { label: "Taux conversion", value: opts.quotes.length > 0 ? Math.round(qAccepted.length / opts.quotes.length * 100) + " %" : "n/a" },
  ];
  for (let i = 0; i < qkpis.length; i++) {
    const x = MARGIN_X + i * colW;
    page.drawText(qkpis[i].label.toUpperCase(), { x, y, size: 7, font: fontReg, color: COLOR.pierre });
    page.drawText(qkpis[i].value, { x, y: y - 16, size: 11, font: fontBold, color: COLOR.bois });
  }
  y -= 50;

  // === TABLEAU FACTURES ===
  ensureSpace(60);
  page.drawText("DETAIL DES FACTURES", { x: MARGIN_X, y, size: 12, font: fontBold, color: COLOR.terre });
  y -= 8;
  page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 1, color: COLOR.terre });
  y -= 16;

  // En-tete tableau
  const colsInv = [
    { label: "Numero", x: MARGIN_X, w: 80 },
    { label: "Date", x: MARGIN_X + 80, w: 60 },
    { label: "Client", x: MARGIN_X + 140, w: 180 },
    { label: "TTC", x: MARGIN_X + 320, w: 80 },
    { label: "Statut", x: MARGIN_X + 400, w: 110 },
  ];
  page.drawRectangle({ x: MARGIN_X - 4, y: y - 4, width: PAGE_W - 2 * MARGIN_X + 8, height: 18, color: COLOR.sableLight });
  for (const col of colsInv) {
    page.drawText(col.label, { x: col.x, y, size: 8, font: fontBold, color: COLOR.bois });
  }
  y -= 18;

  if (opts.invoices.length === 0) {
    page.drawText("Aucune facture sur la periode", { x: MARGIN_X, y, size: 9, font: fontItalic, color: COLOR.pierre });
    y -= 16;
  } else {
    for (const inv of opts.invoices) {
      ensureSpace(16);
      page.drawText(ellipsize(inv.invoiceNumber, 14), { x: colsInv[0].x, y, size: 8, font: fontReg, color: COLOR.bois });
      page.drawText(fmtDate(inv.date), { x: colsInv[1].x, y, size: 8, font: fontReg, color: COLOR.bois });
      page.drawText(ellipsize(clientName(inv.client) || "(sans client)", 32), { x: colsInv[2].x, y, size: 8, font: fontReg, color: COLOR.bois });
      const lblType = fmtType(inv.type);
      const ttcLbl = lblType === "Avoir" ? `-${fmtEur(num(inv.totalTTC))}` : fmtEur(num(inv.totalTTC));
      page.drawText(ttcLbl, { x: colsInv[3].x, y, size: 8, font: fontBold, color: COLOR.bois });
      const statusColor = inv.status === "paid" ? COLOR.mousse : inv.status === "overdue" ? COLOR.terre : COLOR.pierre;
      page.drawText(fmtStatus(inv.status), { x: colsInv[4].x, y, size: 8, font: fontReg, color: statusColor });
      y -= 13;
    }
    // Ligne total
    ensureSpace(20);
    y -= 4;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 1, color: COLOR.terre });
    y -= 12;
    page.drawText("TOTAL FACTURE TTC", { x: MARGIN_X, y, size: 9, font: fontBold, color: COLOR.bois });
    page.drawText(fmtEur(totalTTC), { x: colsInv[3].x, y, size: 9, font: fontBold, color: COLOR.terre });
    y -= 20;
  }

  // === TABLEAU DEVIS ===
  if (opts.quotes.length > 0) {
    ensureSpace(60);
    y -= 8;
    page.drawText("DETAIL DES DEVIS", { x: MARGIN_X, y, size: 12, font: fontBold, color: COLOR.terre });
    y -= 8;
    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_W - MARGIN_X, y }, thickness: 1, color: COLOR.terre });
    y -= 16;
    page.drawRectangle({ x: MARGIN_X - 4, y: y - 4, width: PAGE_W - 2 * MARGIN_X + 8, height: 18, color: COLOR.sableLight });
    for (const col of colsInv) {
      page.drawText(col.label, { x: col.x, y, size: 8, font: fontBold, color: COLOR.bois });
    }
    y -= 18;
    for (const q of opts.quotes) {
      ensureSpace(16);
      page.drawText(ellipsize(q.quoteNumber, 14), { x: colsInv[0].x, y, size: 8, font: fontReg, color: COLOR.bois });
      page.drawText(fmtDate(q.date), { x: colsInv[1].x, y, size: 8, font: fontReg, color: COLOR.bois });
      page.drawText(ellipsize(clientName(q.client) || "(sans client)", 32), { x: colsInv[2].x, y, size: 8, font: fontReg, color: COLOR.bois });
      page.drawText(fmtEur(num(q.totalTTC)), { x: colsInv[3].x, y, size: 8, font: fontReg, color: COLOR.bois });
      const statusColor = q.status === "accepted" ? COLOR.mousse : q.status === "rejected" ? COLOR.terre : COLOR.pierre;
      page.drawText(fmtStatus(q.status), { x: colsInv[4].x, y, size: 8, font: fontReg, color: statusColor });
      y -= 13;
    }
  }

  drawFooter();
  return await pdf.save();
}
