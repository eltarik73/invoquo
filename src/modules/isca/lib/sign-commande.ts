/**
 * Signe une commande et ses articles et paiements.
 *
 * Chaine de signature COMMANDE :
 * idInterne + '_' + dateCreation + '_' + idUtilisateur + '_' + idCaisse + '_' +
 * statut + '_' + montantTotalHT + '_' + montantTotalTTC + '_' + montantTVA + '_' +
 * typeOperation + '_' + referenceFacture + '_' + hashPrecedent + '_' + SHA1(siret+publicKey)
 *
 * Chaine de signature ARTICLE :
 * commandeId + '_' + dateCreation + '_' + commandeId + '_' + idUtilisateur + '_' +
 * prixInitial + '_' + tauxTva + '_' + montantTvaDeductible + '_' +
 * tauxReduction + '_' + montantReduction + '_' + prixFinal + '_' +
 * quantite + '_' + nom + '_' + prixFinalHT + '_' + hashPrecedent + '_' + SHA1(siret+publicKey)
 *
 * Chaine de signature PAIEMENT :
 * commandeId + '_' + idUtilisateur + '_' + idCaisse + '_' + datePaiement + '_' +
 * typePaiement + '_' + montantPaye + '_' + montantVerse + '_' +
 * hashPrecedent + '_' + SHA1(siret+publicKey)
 */

import { prisma } from "@/lib/prisma";
import { signHMAC, roundISCA, getLastHash, getNextIdInterne } from "./hmac";
import { getTenantSecretKey } from "./keys";
import { logJET } from "./jet";

interface ArticleInput {
  nom: string;
  quantite: number;
  prixInitial: number;
  tauxTva: number;
  tauxReduction?: number;
  montantReduction?: number;
}

interface PaiementInput {
  typePaiement: string;
  montantPaye: number;
  montantVerse: number;
}

interface SignCommandeInput {
  tenantId: string;
  siret: string;
  userId: string;
  caisse?: string;
  typeOperation: "VENTE" | "AVOIR" | "REMBOURSEMENT";
  referenceFacture?: string;
  articles: ArticleInput[];
  paiements: PaiementInput[];
}

interface ArticleCalcule extends ArticleInput {
  prixFinalHT: number;
  montantTva: number;
  prixFinal: number;
}

export async function signCommande(input: SignCommandeInput) {
  const secretKey = await getTenantSecretKey(input.tenantId);
  const caisse = input.caisse || "WEB";

  return prisma.$transaction(async (tx) => {
    // 1. Calculer les totaux
    const articlesCalcules: ArticleCalcule[] = input.articles.map((a) => {
      const reduction = a.montantReduction || 0;
      const prixFinalHT = a.prixInitial * a.quantite - reduction;
      const montantTva = prixFinalHT * (a.tauxTva / 100);
      const prixFinal = prixFinalHT + montantTva;
      return { ...a, prixFinalHT, montantTva, prixFinal };
    });

    const totalHT = articlesCalcules.reduce((s, a) => s + a.prixFinalHT, 0);
    const totalTVA = articlesCalcules.reduce((s, a) => s + a.montantTva, 0);
    const totalTTC = totalHT + totalTVA;

    // 2. Signer la commande
    const cmdIdInterne = await getNextIdInterne(
      tx,
      "IscaCommande",
      input.siret,
    );
    const cmdPrevHash = await getLastHash(tx.iscaCommande, input.siret);
    const dateCreation = new Date();

    const cmdSign = signHMAC(
      [
        cmdIdInterne.toString(),
        dateCreation.toISOString(),
        input.userId,
        caisse,
        "VALIDEE",
        roundISCA(totalHT),
        roundISCA(totalTTC),
        roundISCA(totalTVA),
        input.typeOperation,
        input.referenceFacture || "",
      ],
      cmdPrevHash,
      input.siret,
      secretKey,
    );

    const commande = await tx.iscaCommande.create({
      data: {
        tenantId: input.tenantId,
        siret: input.siret,
        idInterne: cmdIdInterne,
        dateCreation,
        idUtilisateur: input.userId,
        idCaisse: caisse,
        statut: "VALIDEE",
        montantTotalHT: totalHT,
        montantTotalTTC: totalTTC,
        montantTVA: totalTVA,
        typeOperation: input.typeOperation,
        referenceFacture: input.referenceFacture,
        thehash: cmdSign.hash,
      },
    });

    // 3. Signer chaque article individuellement
    for (const article of articlesCalcules) {
      const artIdInterne = await getNextIdInterne(
        tx,
        "IscaArticle",
        input.siret,
      );
      const artPrevHash = await getLastHash(tx.iscaArticle, input.siret);

      const artSign = signHMAC(
        [
          commande.id,
          dateCreation.toISOString(),
          commande.id,
          input.userId,
          roundISCA(article.prixInitial),
          roundISCA(article.tauxTva),
          roundISCA(article.montantTva),
          roundISCA(article.tauxReduction || 0),
          roundISCA(article.montantReduction || 0),
          roundISCA(article.prixFinal),
          roundISCA(article.quantite),
          article.nom,
          roundISCA(article.prixFinalHT),
        ],
        artPrevHash,
        input.siret,
        secretKey,
      );

      await tx.iscaArticle.create({
        data: {
          tenantId: input.tenantId,
          siret: input.siret,
          commandeId: commande.id,
          idInterne: artIdInterne,
          dateCreation,
          idUtilisateur: input.userId,
          nom: article.nom,
          quantite: article.quantite,
          prixInitial: article.prixInitial,
          tauxTva: article.tauxTva,
          montantTvaDeductible: article.montantTva,
          tauxReduction: article.tauxReduction || 0,
          montantReduction: article.montantReduction || 0,
          prixFinalHT: article.prixFinalHT,
          prixFinal: article.prixFinal,
          thehash: artSign.hash,
        },
      });
    }

    // 4. Signer chaque paiement
    for (const paiement of input.paiements) {
      const payIdInterne = await getNextIdInterne(
        tx,
        "IscaPaiement",
        input.siret,
      );
      const payPrevHash = await getLastHash(tx.iscaPaiement, input.siret);
      const datePaiement = new Date();

      const paySign = signHMAC(
        [
          commande.id,
          input.userId,
          caisse,
          datePaiement.toISOString(),
          paiement.typePaiement,
          roundISCA(paiement.montantPaye),
          roundISCA(paiement.montantVerse),
        ],
        payPrevHash,
        input.siret,
        secretKey,
      );

      await tx.iscaPaiement.create({
        data: {
          tenantId: input.tenantId,
          siret: input.siret,
          commandeId: commande.id,
          idInterne: payIdInterne,
          idUtilisateur: input.userId,
          idCaisse: caisse,
          typePaiement: paiement.typePaiement,
          datePaiement,
          montantPaye: paiement.montantPaye,
          montantVerse: paiement.montantVerse,
          thehash: paySign.hash,
        },
      });
    }

    // 5. Tracer dans le JET
    await logJET(tx, {
      tenantId: input.tenantId,
      siret: input.siret,
      userId: input.userId,
      type: "COMMANDE_VALIDEE",
      description: `Commande #${cmdIdInterne} validee — ${roundISCA(totalTTC)} EUR TTC — ${input.typeOperation}`,
      objetId: commande.id,
      objetType: "COMMANDE",
      secretKey,
    });

    return commande;
  });
}
