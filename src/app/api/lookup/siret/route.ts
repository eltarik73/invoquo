import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const siret = req.nextUrl.searchParams.get("q");
  if (!siret || siret.length !== 14) return apiError("SIRET invalide", 400);

  if (!process.env.PAPPERS_API_KEY) {
    return apiSuccess({ companyName: null, message: "Cle API Pappers non configuree" });
  }

  try {
    const res = await fetch(
      `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${process.env.PAPPERS_API_KEY}`,
    );
    if (!res.ok) return apiSuccess({ companyName: null });

    const p = await res.json();
    return apiSuccess({
      companyName: p.denomination || p.nom_entreprise,
      siren: p.siren,
      address: p.siege?.adresse_ligne_1,
      postalCode: p.siege?.code_postal,
      city: p.siege?.ville,
      legalForm: p.forme_juridique,
      vatNumber: p.numero_tva_intracommunautaire,
      apeCode: p.code_naf ? `${p.code_naf} — ${p.libelle_code_naf}` : null,
    });
  } catch {
    return apiSuccess({ companyName: null });
  }
}
