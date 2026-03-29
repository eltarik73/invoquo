/**
 * Attestation individuelle de conformite — BOI-LETTRE-000242.
 *
 * PDF 2 volets genere avec @react-pdf/renderer :
 * - Volet 1 (editeur) : pre-rempli avec les infos Invoquo
 * - Volet 2 (utilisateur) : a completer avec les infos tenant
 */

import { createHash } from "crypto";

interface AttestationInput {
  tenantSiret: string;
  tenantCompanyName: string;
  editorName: string;
  editorCompany: string;
  softwareVersion: string;
  releaseDate: string;
}

/**
 * Generate a unique, deterministic license number per tenant.
 */
export function generateLicenseNumber(tenantId: string): string {
  const hash = createHash("sha256")
    .update("INVOQUO_LICENSE_" + tenantId)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `INV-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
}

/**
 * Generate attestation data for PDF rendering.
 * The actual PDF is rendered with @react-pdf/renderer on the server.
 */
export function generateAttestationData(input: AttestationInput) {
  const licenseNumber = generateLicenseNumber(input.tenantSiret);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return {
    volet1: {
      title: "ATTESTATION INDIVIDUELLE DE CONFORMITE",
      subtitle:
        "Delivree en application de l'article 286, I, 3° bis du code general des impots",
      editorName: input.editorName,
      editorCompany: input.editorCompany,
      software: "Invoquo",
      version: input.softwareVersion,
      licenseNumber,
      releaseDate: input.releaseDate,
      statement:
        "Atteste que le logiciel ci-dessus satisfait aux conditions d'inalterabilite, de securisation, de conservation et d'archivage des donnees prevues au 3° bis du I de l'article 286 du code general des impots.",
      date: today,
    },
    volet2: {
      title: "A COMPLETER PAR L'UTILISATEUR DU LOGICIEL",
      tenantCompanyName: input.tenantCompanyName,
      tenantSiret: input.tenantSiret,
      licenseNumber,
      fields: [
        { label: "Nom / Prenom", value: "" },
        { label: "Raison sociale", value: input.tenantCompanyName },
        { label: "SIRET", value: input.tenantSiret },
        { label: "Date d'acquisition", value: "" },
        { label: "Signature", value: "" },
      ],
    },
  };
}
