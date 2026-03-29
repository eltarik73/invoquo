/**
 * Journal des Evenements Techniques (JET) — NF525 Securisation.
 *
 * Trace 100% des actions dans une chaine HMAC-SHA256.
 * Le JET est lui-meme signe et chaine = impossible de supprimer
 * un evenement sans casser la chaine.
 *
 * Chaine de signature JET :
 * idInterne + '_' + dateEvenement + '_' + typeEvenement + '_' + idUtilisateur + '_' +
 * description + '_' + idObjetConcerne + '_' + typeObjetConcerne + '_' +
 * hashPrecedent + '_' + SHA1(siret+publicKey)
 */

import { signHMAC, getLastHash, getNextIdInterne } from "./hmac";

interface JETInput {
  tenantId: string;
  siret: string;
  userId: string;
  type: string;
  description: string;
  objetId?: string;
  objetType?: string;
  details?: Record<string, unknown>;
  secretKey: Buffer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logJET(tx: any, input: JETInput) {
  const idInterne = await getNextIdInterne(
    tx,
    "IscaTracabilite",
    input.siret,
  );
  const prevHash = await getLastHash(tx.iscaTracabilite, input.siret);
  const dateEvenement = new Date();

  const sign = signHMAC(
    [
      idInterne.toString(),
      dateEvenement.toISOString(),
      input.type,
      input.userId,
      input.description,
      input.objetId || "",
      input.objetType || "",
    ],
    prevHash,
    input.siret,
    input.secretKey,
  );

  return tx.iscaTracabilite.create({
    data: {
      tenantId: input.tenantId,
      siret: input.siret,
      idInterne,
      dateEvenement,
      typeEvenement: input.type,
      idUtilisateur: input.userId,
      description: input.description,
      idObjetConcerne: input.objetId,
      typeObjetConcerne: input.objetType,
      detailsJson: input.details ? JSON.stringify(input.details) : null,
      thehash: sign.hash,
    },
  });
}
