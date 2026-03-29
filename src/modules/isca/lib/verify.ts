/**
 * Verification d'integrite HMAC — NF525 Securisation.
 *
 * Recalcule chaque signature sur les 5 tables signees
 * et compare avec le hash stocke.
 */

import { prisma } from "@/lib/prisma";
import { signHMAC, roundISCA, editorKeyHash } from "./hmac";
import { getTenantSecretKey } from "./keys";
function d(v: unknown): string {
  if (v === null || v === undefined) return roundISCA(0);
  return roundISCA(Number(v));
}

interface VerifyResult {
  table: string;
  total: number;
  valid: number;
  invalid: number;
  errors: Array<{ idInterne: number; expected: string; computed: string }>;
}

async function verifyChain(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: any[],
  buildFields: (record: any) => string[],
  siret: string,
  secretKey: Buffer,
  tableName: string,
): Promise<VerifyResult> {
  const result: VerifyResult = {
    table: tableName,
    total: records.length,
    valid: 0,
    invalid: 0,
    errors: [],
  };

  let previousHash = "";

  for (const record of records) {
    const fields = buildFields(record);
    const sign = signHMAC(fields, previousHash, siret, secretKey);

    if (sign.hash === record.thehash) {
      result.valid++;
    } else {
      result.invalid++;
      result.errors.push({
        idInterne: record.idInterne,
        expected: record.thehash,
        computed: sign.hash,
      });
    }

    previousHash = record.thehash;
  }

  return result;
}

export async function verifyTenant(
  tenantId: string,
  siret: string,
): Promise<VerifyResult[]> {
  const secretKey = await getTenantSecretKey(tenantId);
  const results: VerifyResult[] = [];

  // Commandes
  const commandes = await prisma.iscaCommande.findMany({
    where: { siret },
    orderBy: { idInterne: "asc" },
  });
  results.push(
    await verifyChain(
      commandes,
      (c) => [
        c.idInterne.toString(),
        c.dateCreation.toISOString(),
        c.idUtilisateur,
        c.idCaisse,
        c.statut,
        d(c.montantTotalHT),
        d(c.montantTotalTTC),
        d(c.montantTVA),
        c.typeOperation,
        c.referenceFacture || "",
      ],
      siret,
      secretKey,
      "IscaCommande",
    ),
  );

  // Articles
  const articles = await prisma.iscaArticle.findMany({
    where: { siret },
    orderBy: { idInterne: "asc" },
  });
  results.push(
    await verifyChain(
      articles,
      (a) => [
        a.commandeId,
        a.dateCreation.toISOString(),
        a.commandeId,
        a.idUtilisateur,
        d(a.prixInitial),
        d(a.tauxTva),
        d(a.montantTvaDeductible),
        d(a.tauxReduction),
        d(a.montantReduction),
        d(a.prixFinal),
        d(a.quantite),
        a.nom,
        d(a.prixFinalHT),
      ],
      siret,
      secretKey,
      "IscaArticle",
    ),
  );

  // Paiements
  const paiements = await prisma.iscaPaiement.findMany({
    where: { siret },
    orderBy: { idInterne: "asc" },
  });
  results.push(
    await verifyChain(
      paiements,
      (p) => [
        p.commandeId,
        p.idUtilisateur,
        p.idCaisse,
        p.datePaiement.toISOString(),
        p.typePaiement,
        d(p.montantPaye),
        d(p.montantVerse),
      ],
      siret,
      secretKey,
      "IscaPaiement",
    ),
  );

  // Fermetures
  const fermetures = await prisma.iscaFermeture.findMany({
    where: { siret },
    orderBy: { idInterne: "asc" },
  });
  results.push(
    await verifyChain(
      fermetures,
      (f) => [
        f.idInterne.toString(),
        f.type,
        f.dateDebut.toISOString(),
        f.dateFin.toISOString(),
        f.dateFermeture.toISOString(),
        d(f.totalVentes),
        d(f.totalAnnulations),
        d(f.totalRemboursements),
        d(f.totalTVA),
        d(f.totalHT),
        d(f.totalTTC),
        f.nombreTransactions.toString(),
        d(f.grandTotalVentes),
        d(f.grandTotalTVA),
        d(f.grandTotalTTC),
        f.grandNombreTransactions.toString(),
      ],
      siret,
      secretKey,
      "IscaFermeture",
    ),
  );

  // Tracabilite (JET)
  const tracabilite = await prisma.iscaTracabilite.findMany({
    where: { siret },
    orderBy: { idInterne: "asc" },
  });
  results.push(
    await verifyChain(
      tracabilite,
      (t) => [
        t.idInterne.toString(),
        t.dateEvenement.toISOString(),
        t.typeEvenement,
        t.idUtilisateur,
        t.description,
        t.idObjetConcerne || "",
        t.typeObjetConcerne || "",
      ],
      siret,
      secretKey,
      "IscaTracabilite",
    ),
  );

  return results;
}
