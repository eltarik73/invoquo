interface PappersCompany {
  siren: string;
  siret: string;
  companyName: string;
  legalForm: string | null;
  capital: string | null;
  address: string;
  postalCode: string;
  city: string;
  vatNumber: string | null;
  apeCode: string | null;
  rcs: string | null;
}

export async function fetchCompanyBySiret(
  siret: string
): Promise<PappersCompany | null> {
  const apiKey = process.env.PAPPERS_API_KEY;
  if (!apiKey) {
    return fallbackFromSiret(siret);
  }

  const res = await fetch(
    `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${apiKey}`
  );

  if (!res.ok) return null;

  const data = await res.json();

  return {
    siren: data.siren ?? siret.slice(0, 9),
    siret,
    companyName:
      data.nom_entreprise ?? data.denomination ?? data.nom_complet ?? "",
    legalForm: data.forme_juridique ?? null,
    capital: data.capital_formate ?? null,
    address: data.siege?.adresse_ligne_1 ?? "",
    postalCode: data.siege?.code_postal ?? "",
    city: data.siege?.ville ?? "",
    vatNumber: data.numero_tva_intracommunautaire ?? null,
    apeCode: data.code_naf ?? null,
    rcs: data.numero_rcs ?? null,
  };
}

function fallbackFromSiret(siret: string): PappersCompany {
  return {
    siren: siret.slice(0, 9),
    siret,
    companyName: "",
    legalForm: null,
    capital: null,
    address: "",
    postalCode: "",
    city: "",
    vatNumber: null,
    apeCode: null,
    rcs: null,
  };
}
