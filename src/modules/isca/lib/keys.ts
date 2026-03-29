/**
 * Gestion des cles ISCA par tenant.
 *
 * Architecture double couche :
 * - SOFTWARE_PUBLIC_KEY : constante, identique pour toutes les instances,
 *   lie la signature a l'editeur Invoquo
 * - SECRET_KEY : unique par tenant, 256 bits, stockee chiffree AES-256-GCM en BDD
 *
 * La cle secrete ne transite JAMAIS en clair. Elle est :
 * 1. Generee aleatoirement (32 bytes = 256 bits)
 * 2. Chiffree avec AES-256-GCM en utilisant ISCA_ENCRYPTION_KEY (env var)
 * 3. Stockee en BDD (encryptedSecret + iv + authTag)
 * 4. Dechiffree uniquement en memoire, le temps de signer
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";
import { prisma } from "@/lib/prisma";

const SOFTWARE_PUBLIC_KEY =
  process.env.ISCA_SOFTWARE_PUBLIC_KEY || "INVOQUO_EDITOR_KEY_V1";

const ENCRYPTION_KEY = Buffer.from(
  process.env.ISCA_ENCRYPTION_KEY || "0".repeat(64),
  "hex",
);

export async function generateTenantKey(tenantId: string): Promise<void> {
  const secretKey = randomBytes(32);

  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(secretKey),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  await prisma.iscaKey.create({
    data: {
      tenantId,
      encryptedSecret: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    },
  });
}

export async function getTenantSecretKey(tenantId: string): Promise<Buffer> {
  const iscaKey = await prisma.iscaKey.findUnique({
    where: { tenantId },
  });
  if (!iscaKey) {
    throw new Error(`ISCA key not found for tenant ${tenantId}`);
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    Buffer.from(iscaKey.iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(iscaKey.authTag, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(iscaKey.encryptedSecret, "hex")),
    decipher.final(),
  ]);
}

export function getSoftwarePublicKey(): string {
  return SOFTWARE_PUBLIC_KEY;
}
