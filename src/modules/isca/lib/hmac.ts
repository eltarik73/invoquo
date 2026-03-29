/**
 * Signature HMAC-SHA256 double couche conforme NF525.
 *
 * Algorithme :
 * 1. Construire la chaine source : champs metier joints par '_' + '_' + hashPrecedent
 * 2. Ajouter la cle publique editeur : chaine + '_' + SHA1(siret + SOFTWARE_PUBLIC_KEY)
 * 3. Signer en HMAC-SHA256 avec la cle secrete du tenant
 *
 * Les montants sont arrondis a 6 decimales : round(value * 1000000) / 1000000
 */

import { createHmac, createHash } from "crypto";
import { getSoftwarePublicKey } from "./keys";

/**
 * Arrondir a 6 decimales (precision ISCA).
 */
export function roundISCA(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return (Math.round(num * 1000000) / 1000000).toString();
}

/**
 * SHA1 de la cle publique editeur liee au SIRET.
 */
export function editorKeyHash(siret: string): string {
  return createHash("sha1")
    .update(siret + getSoftwarePublicKey())
    .digest("hex");
}

/**
 * Signature HMAC-SHA256 double couche.
 */
export function signHMAC(
  chainFields: string[],
  previousHash: string,
  siret: string,
  secretKey: Buffer,
): { hash: string; hashSource: string } {
  // Etape 1 : chaine source = champs metier + hash precedent
  const chainSource = [...chainFields, previousHash].join("_");

  // Etape 2 : ajouter cle publique editeur
  const fullChain = chainSource + "_" + editorKeyHash(siret);

  // Etape 3 : signer en HMAC-SHA256
  const hash = createHmac("sha256", secretKey)
    .update(fullChain)
    .digest("hex");

  return { hash, hashSource: fullChain };
}

/**
 * Verifier une signature.
 */
export function verifyHMAC(
  hashSource: string,
  expectedHash: string,
  secretKey: Buffer,
): boolean {
  const computed = createHmac("sha256", secretKey)
    .update(hashSource)
    .digest("hex");
  // Comparaison en temps constant pour eviter les timing attacks
  if (computed.length !== expectedHash.length) return false;
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Recuperer le dernier hash d'une chaine (pour le chainage).
 */
export async function getLastHash(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaModel: any,
  siret: string,
): Promise<string> {
  const last = await prismaModel.findFirst({
    where: { siret },
    orderBy: { idInterne: "desc" },
    select: { thehash: true },
  });
  return last?.thehash || "";
}

/**
 * Recuperer le prochain idInterne avec advisory lock pour eviter les trous.
 * DOIT etre appele dans une transaction Prisma interactive.
 */
export async function getNextIdInterne(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  tableName: string,
  siret: string,
): Promise<number> {
  const lockId = createHash("md5")
    .update(siret + tableName)
    .digest()
    .readInt32BE(0);

  await tx.$queryRawUnsafe(
    `SELECT pg_advisory_xact_lock(${lockId})::text`,
  );

  const maxResult: Array<{ max_id: number | null }> =
    await tx.$queryRawUnsafe(
      `SELECT COALESCE(MAX("idInterne"), 0) as max_id FROM "${tableName}" WHERE siret = '${siret.replace(/'/g, "''")}'`,
    );

  return (maxResult[0]?.max_id || 0) + 1;
}
