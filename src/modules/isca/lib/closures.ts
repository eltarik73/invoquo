/**
 * Clotures automatiques (Z/M/Y) — NF525 Conservation.
 *
 * - Z (quotidienne) : se declenche automatiquement a minuit
 * - M (mensuelle) : se declenche le 1er de chaque mois
 * - Y (annuelle) : se declenche au lendemain de la date de fin d'exercice
 *
 * Chaine de signature FERMETURE :
 * idInterne + '_' + type + '_' + dateDebut + '_' + dateFin + '_' + dateFermeture + '_' +
 * totalVentes + '_' + totalAnnulations + '_' + totalRemboursements + '_' +
 * totalTVA + '_' + totalHT + '_' + totalTTC + '_' + nombreTransactions + '_' +
 * grandTotalVentes + '_' + grandTotalTVA + '_' + grandTotalTTC + '_' + grandNombreTransactions + '_' +
 * hashPrecedent + '_' + SHA1(siret+publicKey)
 */

import { prisma } from "@/lib/prisma";
import {
  signHMAC,
  roundISCA,
  getLastHash,
  getNextIdInterne,
} from "./hmac";
import { getTenantSecretKey } from "./keys";
import { logJET } from "./jet";
type ClosureType = "Z" | "M" | "Y";

interface PeriodTotals {
  totalVentes: number;
  totalAnnulations: number;
  totalRemboursements: number;
  totalTVA: number;
  totalHT: number;
  totalTTC: number;
  nombreTransactions: number;
}

function toNum(d: unknown): number {
  if (d === null || d === undefined) return 0;
  return Number(d);
}

async function computePeriodTotals(
  siret: string,
  dateDebut: Date,
  dateFin: Date,
): Promise<PeriodTotals> {
  const commandes = await prisma.iscaCommande.findMany({
    where: {
      siret,
      dateCreation: { gte: dateDebut, lt: dateFin },
      statut: "VALIDEE",
    },
    select: {
      montantTotalHT: true,
      montantTotalTTC: true,
      montantTVA: true,
      typeOperation: true,
    },
  });

  let totalVentes = 0;
  let totalAnnulations = 0;
  let totalRemboursements = 0;
  let totalTVA = 0;
  let totalHT = 0;
  let totalTTC = 0;

  for (const c of commandes) {
    const ht = toNum(c.montantTotalHT);
    const ttc = toNum(c.montantTotalTTC);
    const tva = toNum(c.montantTVA);

    if (c.typeOperation === "VENTE") {
      totalVentes += ttc;
    } else if (c.typeOperation === "AVOIR") {
      totalAnnulations += ttc;
    } else if (c.typeOperation === "REMBOURSEMENT") {
      totalRemboursements += ttc;
    }

    totalTVA += tva;
    totalHT += ht;
    totalTTC += ttc;
  }

  return {
    totalVentes,
    totalAnnulations,
    totalRemboursements,
    totalTVA,
    totalHT,
    totalTTC,
    nombreTransactions: commandes.length,
  };
}

async function computeGrandTotals(siret: string): Promise<{
  grandTotalVentes: number;
  grandTotalTVA: number;
  grandTotalTTC: number;
  grandNombreTransactions: number;
}> {
  const commandes = await prisma.iscaCommande.findMany({
    where: { siret, statut: "VALIDEE" },
    select: {
      montantTotalTTC: true,
      montantTVA: true,
      typeOperation: true,
    },
  });

  let grandTotalVentes = 0;
  let grandTotalTVA = 0;
  let grandTotalTTC = 0;

  for (const c of commandes) {
    const ttc = toNum(c.montantTotalTTC);
    const tva = toNum(c.montantTVA);
    if (c.typeOperation === "VENTE") grandTotalVentes += ttc;
    grandTotalTVA += tva;
    grandTotalTTC += ttc;
  }

  return {
    grandTotalVentes,
    grandTotalTVA,
    grandTotalTTC,
    grandNombreTransactions: commandes.length,
  };
}

export async function createClosure(
  tenantId: string,
  siret: string,
  type: ClosureType,
  dateDebut: Date,
  dateFin: Date,
  userId: string,
) {
  // Check if closure already exists
  const existing = await prisma.iscaFermeture.findUnique({
    where: { siret_type_dateDebut: { siret, type, dateDebut } },
  });
  if (existing) return existing;

  const secretKey = await getTenantSecretKey(tenantId);
  const period = await computePeriodTotals(siret, dateDebut, dateFin);
  const grand = await computeGrandTotals(siret);

  return prisma.$transaction(async (tx) => {
    const idInterne = await getNextIdInterne(
      tx,
      "IscaFermeture",
      siret,
    );
    const prevHash = await getLastHash(tx.iscaFermeture, siret);
    const dateFermeture = new Date();

    const sign = signHMAC(
      [
        idInterne.toString(),
        type,
        dateDebut.toISOString(),
        dateFin.toISOString(),
        dateFermeture.toISOString(),
        roundISCA(period.totalVentes),
        roundISCA(period.totalAnnulations),
        roundISCA(period.totalRemboursements),
        roundISCA(period.totalTVA),
        roundISCA(period.totalHT),
        roundISCA(period.totalTTC),
        period.nombreTransactions.toString(),
        roundISCA(grand.grandTotalVentes),
        roundISCA(grand.grandTotalTVA),
        roundISCA(grand.grandTotalTTC),
        grand.grandNombreTransactions.toString(),
      ],
      prevHash,
      siret,
      secretKey,
    );

    const fermeture = await tx.iscaFermeture.create({
      data: {
        tenantId,
        siret,
        idInterne,
        type,
        dateDebut,
        dateFin,
        dateFermeture,
        totalVentes: period.totalVentes,
        totalAnnulations: period.totalAnnulations,
        totalRemboursements: period.totalRemboursements,
        totalTVA: period.totalTVA,
        totalHT: period.totalHT,
        totalTTC: period.totalTTC,
        nombreTransactions: period.nombreTransactions,
        grandTotalVentes: grand.grandTotalVentes,
        grandTotalTVA: grand.grandTotalTVA,
        grandTotalTTC: grand.grandTotalTTC,
        grandNombreTransactions: grand.grandNombreTransactions,
        thehash: sign.hash,
      },
    });

    const jetType =
      type === "Z"
        ? "FERMETURE_Z"
        : type === "M"
          ? "FERMETURE_M"
          : "FERMETURE_Y";

    await logJET(tx, {
      tenantId,
      siret,
      userId,
      type: jetType,
      description: `Cloture ${type} #${idInterne} — ${period.nombreTransactions} transactions — ${roundISCA(period.totalTTC)} EUR TTC`,
      objetId: fermeture.id,
      objetType: "FERMETURE",
      secretKey,
    });

    return fermeture;
  });
}

/**
 * Run pending closures for a tenant.
 * Called by BullMQ job every hour.
 */
export async function runPendingClosures(
  tenantId: string,
  siret: string,
  userId: string,
) {
  const now = new Date();

  // Z — yesterday
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

  await createClosure(
    tenantId,
    siret,
    "Z",
    yesterdayStart,
    yesterdayEnd,
    userId,
  );

  // M — last month (if we're past the 1st)
  if (now.getDate() >= 1) {
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    if (lastMonthStart.getTime() < now.getTime()) {
      await createClosure(
        tenantId,
        siret,
        "M",
        lastMonthStart,
        lastMonthEnd,
        userId,
      );
    }
  }

  // Y — last year (if we're in January+)
  if (now.getMonth() >= 0) {
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear(), 0, 1);

    if (lastYearEnd.getTime() <= now.getTime()) {
      await createClosure(
        tenantId,
        siret,
        "Y",
        lastYearStart,
        lastYearEnd,
        userId,
      );
    }
  }
}
