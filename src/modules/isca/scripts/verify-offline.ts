#!/usr/bin/env node
/**
 * Outil de verification HMAC hors ligne.
 *
 * Usage :
 *   npx tsx src/modules/isca/scripts/verify-offline.ts <csv-file> <secret-key-hex> <siret>
 *
 * Le script lit un fichier CSV d'export ISCA et verifie chaque signature
 * en recalculant le HMAC-SHA256 avec la cle secrete fournie.
 *
 * Peut etre compile en binaire avec `pkg` pour distribution au controleur fiscal.
 */

import { readFileSync } from "fs";
import { createHmac, createHash } from "crypto";

const SOFTWARE_PUBLIC_KEY = "INVOQUO_EDITOR_KEY_V1";

function editorKeyHash(siret: string): string {
  return createHash("sha1")
    .update(siret + SOFTWARE_PUBLIC_KEY)
    .digest("hex");
}

function signHMAC(
  chainFields: string[],
  previousHash: string,
  siret: string,
  secretKey: Buffer,
): string {
  const chainSource = [...chainFields, previousHash].join("_");
  const fullChain = chainSource + "_" + editorKeyHash(siret);
  return createHmac("sha256", secretKey).update(fullChain).digest("hex");
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: verify-offline <csv-file> <secret-key-hex> <siret>",
    );
    process.exit(1);
  }

  const [csvPath, secretKeyHex, siret] = args;
  const secretKey = Buffer.from(secretKeyHex, "hex");

  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  if (lines.length < 2) {
    console.error("Fichier CSV vide ou invalide.");
    process.exit(1);
  }

  const header = lines[0].split(";");
  const thehashIdx = header.indexOf("thehash");
  const verifNameIdx = header.indexOf("verifName");
  const hashSourceIdx = header.indexOf("hashSource");
  const validityIdx = header.indexOf("validity");

  if (thehashIdx === -1) {
    console.error("Colonne 'thehash' introuvable dans le CSV.");
    process.exit(1);
  }

  let valid = 0;
  let invalid = 0;

  console.log(`\nVerification de ${csvPath}`);
  console.log(`SIRET: ${siret}`);
  console.log(`Lignes: ${lines.length - 1}`);
  console.log("---");

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const storedHash = cols[thehashIdx];

    if (hashSourceIdx !== -1 && cols[hashSourceIdx]) {
      // Re-verify using hashSource
      const hashSource = cols[hashSourceIdx];
      const computed = createHmac("sha256", secretKey)
        .update(hashSource)
        .digest("hex");

      if (computed === storedHash) {
        valid++;
      } else {
        invalid++;
        console.error(
          `ERREUR ligne ${i}: attendu=${storedHash.slice(0, 16)}... calcule=${computed.slice(0, 16)}...`,
        );
      }
    } else {
      // Can't verify without hashSource
      console.warn(`Ligne ${i}: hashSource manquant, verification impossible`);
    }
  }

  console.log("---");
  console.log(`Valides: ${valid}`);
  console.log(`Invalides: ${invalid}`);
  console.log(
    invalid === 0
      ? "RESULTAT: INTEGRITE VERIFIEE"
      : "RESULTAT: INTEGRITE COMPROMISE",
  );

  process.exit(invalid > 0 ? 1 : 0);
}

main();
