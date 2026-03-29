/**
 * Export fiscal ISCA — NF525 Archivage.
 *
 * Genere une archive ZIP conforme avec 7 fichiers :
 * 1. Commandes.csv
 * 2. Articles.csv
 * 3. Paiements.csv
 * 4. Fermetures.csv
 * 5. Tracabilite.csv
 * 6. Signatures.txt
 * 7. Rapport.txt
 *
 * Chaque ligne CSV contient 4 champs de verification :
 * thehash, verifName (recalcule), hashSource, validity
 */

import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { signHMAC, roundISCA, editorKeyHash } from "./hmac";
import { getTenantSecretKey } from "./keys";
function d(v: unknown): string {
  if (v === null || v === undefined) return roundISCA(0);
  return roundISCA(Number(v));
}

function csvEscape(val: string | number | null | undefined): string {
  const s = String(val ?? "");
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvLine(fields: string[]): string {
  return fields.map(csvEscape).join(";");
}

interface ExportOptions {
  tenantId: string;
  siret: string;
  dateFrom: Date;
  dateTo: Date;
}

interface ExportFile {
  name: string;
  content: string;
}

export async function generateExportFiles(
  opts: ExportOptions,
): Promise<ExportFile[]> {
  const secretKey = await getTenantSecretKey(opts.tenantId);
  const files: ExportFile[] = [];
  const fileSigs: Array<{ name: string; hash: string }> = [];

  // Helper: recalculate hash and produce verification fields
  function verifyRow(
    fields: string[],
    previousHash: string,
    storedHash: string,
  ): { verifName: string; hashSource: string; validity: string } {
    const sign = signHMAC(fields, previousHash, opts.siret, secretKey);
    const validity =
      sign.hash === storedHash
        ? "Valid HMAC SHA256"
        : "**** ERROR *****";
    return { verifName: sign.hash, hashSource: sign.hashSource, validity };
  }

  // --- Commandes ---
  const commandes = await prisma.iscaCommande.findMany({
    where: {
      siret: opts.siret,
      dateCreation: { gte: opts.dateFrom, lt: opts.dateTo },
    },
    orderBy: { idInterne: "asc" },
  });

  let prevHash = "";
  const cmdHeader = "idInterne;dateCreation;idUtilisateur;idCaisse;statut;montantTotalHT;montantTotalTTC;montantTVA;typeOperation;referenceFacture;thehash;verifName;hashSource;validity";
  const cmdRows = commandes.map((c) => {
    const fields = [
      c.idInterne.toString(), c.dateCreation.toISOString(), c.idUtilisateur,
      c.idCaisse, c.statut, d(c.montantTotalHT), d(c.montantTotalTTC),
      d(c.montantTVA), c.typeOperation, c.referenceFacture || "",
    ];
    const v = verifyRow(fields, prevHash, c.thehash);
    prevHash = c.thehash;
    return csvLine([...fields, c.thehash, v.verifName, v.hashSource, v.validity]);
  });
  const cmdContent = cmdHeader + "\n" + cmdRows.join("\n");
  files.push({ name: "Commandes.csv", content: cmdContent });

  // --- Articles ---
  const articles = await prisma.iscaArticle.findMany({
    where: {
      siret: opts.siret,
      dateCreation: { gte: opts.dateFrom, lt: opts.dateTo },
    },
    orderBy: { idInterne: "asc" },
  });

  prevHash = "";
  const artHeader = "idInterne;dateCreation;commandeId;idUtilisateur;nom;quantite;prixInitial;tauxTva;montantTvaDeductible;tauxReduction;montantReduction;prixFinalHT;prixFinal;thehash;verifName;hashSource;validity";
  const artRows = articles.map((a) => {
    const fields = [
      a.commandeId, a.dateCreation.toISOString(), a.commandeId, a.idUtilisateur,
      d(a.prixInitial), d(a.tauxTva), d(a.montantTvaDeductible),
      d(a.tauxReduction), d(a.montantReduction), d(a.prixFinal),
      d(a.quantite), a.nom, d(a.prixFinalHT),
    ];
    const v = verifyRow(fields, prevHash, a.thehash);
    prevHash = a.thehash;
    return csvLine([
      a.idInterne.toString(), a.dateCreation.toISOString(), a.commandeId,
      a.idUtilisateur, a.nom, d(a.quantite), d(a.prixInitial), d(a.tauxTva),
      d(a.montantTvaDeductible), d(a.tauxReduction), d(a.montantReduction),
      d(a.prixFinalHT), d(a.prixFinal), a.thehash, v.verifName, v.hashSource, v.validity,
    ]);
  });
  const artContent = artHeader + "\n" + artRows.join("\n");
  files.push({ name: "Articles.csv", content: artContent });

  // --- Paiements ---
  const paiements = await prisma.iscaPaiement.findMany({
    where: {
      siret: opts.siret,
      datePaiement: { gte: opts.dateFrom, lt: opts.dateTo },
    },
    orderBy: { idInterne: "asc" },
  });

  prevHash = "";
  const payHeader = "idInterne;commandeId;idUtilisateur;idCaisse;typePaiement;datePaiement;montantPaye;montantVerse;thehash;verifName;hashSource;validity";
  const payRows = paiements.map((p) => {
    const fields = [
      p.commandeId, p.idUtilisateur, p.idCaisse, p.datePaiement.toISOString(),
      p.typePaiement, d(p.montantPaye), d(p.montantVerse),
    ];
    const v = verifyRow(fields, prevHash, p.thehash);
    prevHash = p.thehash;
    return csvLine([
      p.idInterne.toString(), p.commandeId, p.idUtilisateur, p.idCaisse,
      p.typePaiement, p.datePaiement.toISOString(), d(p.montantPaye),
      d(p.montantVerse), p.thehash, v.verifName, v.hashSource, v.validity,
    ]);
  });
  const payContent = payHeader + "\n" + payRows.join("\n");
  files.push({ name: "Paiements.csv", content: payContent });

  // --- Fermetures ---
  const fermetures = await prisma.iscaFermeture.findMany({
    where: {
      siret: opts.siret,
      dateFermeture: { gte: opts.dateFrom, lt: opts.dateTo },
    },
    orderBy: { idInterne: "asc" },
  });

  prevHash = "";
  const ferHeader = "idInterne;type;dateDebut;dateFin;dateFermeture;totalVentes;totalAnnulations;totalRemboursements;totalTVA;totalHT;totalTTC;nombreTransactions;grandTotalVentes;grandTotalTVA;grandTotalTTC;grandNombreTransactions;thehash;verifName;hashSource;validity";
  const ferRows = fermetures.map((f) => {
    const fields = [
      f.idInterne.toString(), f.type, f.dateDebut.toISOString(), f.dateFin.toISOString(),
      f.dateFermeture.toISOString(), d(f.totalVentes), d(f.totalAnnulations),
      d(f.totalRemboursements), d(f.totalTVA), d(f.totalHT), d(f.totalTTC),
      f.nombreTransactions.toString(), d(f.grandTotalVentes), d(f.grandTotalTVA),
      d(f.grandTotalTTC), f.grandNombreTransactions.toString(),
    ];
    const v = verifyRow(fields, prevHash, f.thehash);
    prevHash = f.thehash;
    return csvLine([...fields, f.thehash, v.verifName, v.hashSource, v.validity]);
  });
  const ferContent = ferHeader + "\n" + ferRows.join("\n");
  files.push({ name: "Fermetures.csv", content: ferContent });

  // --- Tracabilite (JET) ---
  const tracabilite = await prisma.iscaTracabilite.findMany({
    where: {
      siret: opts.siret,
      dateEvenement: { gte: opts.dateFrom, lt: opts.dateTo },
    },
    orderBy: { idInterne: "asc" },
  });

  prevHash = "";
  const jetHeader = "idInterne;dateEvenement;typeEvenement;idUtilisateur;description;idObjetConcerne;typeObjetConcerne;thehash;verifName;hashSource;validity";
  const jetRows = tracabilite.map((t) => {
    const fields = [
      t.idInterne.toString(), t.dateEvenement.toISOString(), t.typeEvenement,
      t.idUtilisateur, t.description, t.idObjetConcerne || "", t.typeObjetConcerne || "",
    ];
    const v = verifyRow(fields, prevHash, t.thehash);
    prevHash = t.thehash;
    return csvLine([...fields, t.thehash, v.verifName, v.hashSource, v.validity]);
  });
  const jetContent = jetHeader + "\n" + jetRows.join("\n");
  files.push({ name: "Tracabilite.csv", content: jetContent });

  // --- Signatures.txt ---
  for (const f of files) {
    const hash = createHmac("sha256", secretKey)
      .update(f.content)
      .digest("hex");
    fileSigs.push({ name: f.name, hash });
  }
  const sigContent = fileSigs
    .map((s) => `${s.name}: ${s.hash}`)
    .join("\n");
  files.push({ name: "Signatures.txt", content: sigContent });

  // --- Rapport.txt ---
  const rapport = [
    "=== RAPPORT D'EXPORT FISCAL ISCA ===",
    "",
    `Logiciel: Invoquo`,
    `SIRET: ${opts.siret}`,
    `Periode: ${opts.dateFrom.toISOString()} — ${opts.dateTo.toISOString()}`,
    `Date d'export: ${new Date().toISOString()}`,
    "",
    "Enregistrements:",
    `  Commandes: ${commandes.length}`,
    `  Articles: ${articles.length}`,
    `  Paiements: ${paiements.length}`,
    `  Fermetures: ${fermetures.length}`,
    `  Tracabilite (JET): ${tracabilite.length}`,
    "",
    `Cle publique editeur: ${editorKeyHash(opts.siret)}`,
    "",
    "Ce fichier est genere automatiquement par Invoquo.",
    "Les signatures HMAC-SHA256 garantissent l'integrite des donnees.",
  ].join("\n");
  files.push({ name: "Rapport.txt", content: rapport });

  return files;
}
