import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

interface CompanyResult {
  siret: string;
  siren: string;
  companyName: string;
  address: string;
  postalCode: string;
  city: string;
  legalForm: string | null;
  vatNumber: string;
  apeCode: string | null;
  isActive: boolean;
}

function computeVatNumber(siren: string): string {
  const s = parseInt(siren, 10);
  if (isNaN(s)) return "";
  const key = ((12 + 3 * (s % 97)) % 97).toString().padStart(2, "0");
  return `FR${key} ${siren}`;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) return apiError("Requête trop courte", 400);

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(q.trim())}&per_page=5`,
    );

    if (!res.ok) return apiSuccess({ results: [] });

    const data = await res.json();
    const results: CompanyResult[] = (data.results || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any) => ({
        siret: r.siege?.siret || "",
        siren: r.siren || "",
        companyName: r.nom_complet || "",
        address: r.siege?.adresse || [r.siege?.numero_voie, r.siege?.type_voie, r.siege?.libelle_voie].filter(Boolean).join(" ") || "",
        postalCode: r.siege?.code_postal || "",
        city: r.siege?.libelle_commune || "",
        legalForm: r.nature_juridique || null,
        vatNumber: computeVatNumber(r.siren || ""),
        apeCode: r.activite_principale || null,
        isActive: r.etat_administratif === "A",
      }),
    );

    return apiSuccess({ results });
  } catch {
    return apiSuccess({ results: [] });
  }
}
