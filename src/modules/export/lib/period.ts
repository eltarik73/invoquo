/**
 * Parse un parametre month=YYYY-MM en intervalle [start, end] inclusif.
 * Si pas de month, retourne le mois courant.
 * Si month invalide, throws Error.
 */
export function parseMonth(monthParam: string | null): { startDate: Date; endDate: Date; year: number; month: number; label: string } {
  let year: number;
  let monthNum: number; // 1-12
  if (monthParam) {
    const match = /^(\d{4})-(\d{1,2})$/.exec(monthParam);
    if (!match) throw new Error("Parametre 'month' invalide. Format attendu : YYYY-MM");
    year = parseInt(match[1], 10);
    monthNum = parseInt(match[2], 10);
    if (monthNum < 1 || monthNum > 12) throw new Error("Mois doit etre entre 1 et 12");
  } else {
    const now = new Date();
    year = now.getUTCFullYear();
    monthNum = now.getUTCMonth() + 1;
  }
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999)); // last day of month
  const months = ["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
  return { startDate, endDate, year, month: monthNum, label: `${months[monthNum-1]} ${year}` };
}

/**
 * Parse periodStart/periodEnd ISO en intervalle [start, end].
 * Fallback : annee courante si rien.
 */
export function parsePeriod(periodStart: string | null, periodEnd: string | null): { startDate: Date; endDate: Date } {
  const startDate = periodStart ? new Date(periodStart) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = periodEnd ? new Date(periodEnd + "T23:59:59Z") : new Date();
  return { startDate, endDate };
}
