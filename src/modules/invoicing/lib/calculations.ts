interface LineInput {
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

interface CalculatedLine {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
}

interface VatBreakdown {
  rate: number;
  baseHT: number;
  amount: number;
}

interface InvoiceTotals {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  vatBreakdown: VatBreakdown[];
}

/**
 * Calculate totals for a single invoice line.
 */
export function calculateLine(line: LineInput): CalculatedLine {
  const totalHT = round2(line.quantity * line.unitPriceHT);
  const totalVAT = round2(totalHT * (line.vatRate / 100));
  const totalTTC = round2(totalHT + totalVAT);
  return { totalHT, totalVAT, totalTTC };
}

/**
 * Calculate invoice totals from all lines, with optional discount.
 */
export function calculateInvoiceTotals(
  lines: LineInput[],
  discount?: { amount: number; type: "percentage" | "fixed" },
): InvoiceTotals {
  // Calculate per-line totals
  const calculated = lines.map((line) => ({
    ...line,
    ...calculateLine(line),
  }));

  // Sum base totals
  let totalHT = calculated.reduce((sum, l) => sum + l.totalHT, 0);

  // Apply discount on HT
  if (discount) {
    if (discount.type === "percentage") {
      totalHT = round2(totalHT * (1 - discount.amount / 100));
    } else {
      totalHT = round2(totalHT - discount.amount);
    }
    if (totalHT < 0) totalHT = 0;
  }

  // VAT breakdown by rate
  const vatMap = new Map<number, { baseHT: number; amount: number }>();
  for (const line of calculated) {
    const existing = vatMap.get(line.vatRate) ?? { baseHT: 0, amount: 0 };

    // If discount, proportionally reduce each line's contribution
    let lineHT = line.totalHT;
    if (discount && totalHT > 0) {
      const originalTotalHT = calculated.reduce((s, l) => s + l.totalHT, 0);
      const ratio = originalTotalHT > 0 ? totalHT / originalTotalHT : 0;
      lineHT = round2(line.totalHT * ratio);
    }

    const lineVAT = round2(lineHT * (line.vatRate / 100));
    existing.baseHT = round2(existing.baseHT + lineHT);
    existing.amount = round2(existing.amount + lineVAT);
    vatMap.set(line.vatRate, existing);
  }

  const vatBreakdown: VatBreakdown[] = Array.from(vatMap.entries())
    .map(([rate, { baseHT, amount }]) => ({ rate, baseHT, amount }))
    .sort((a, b) => b.rate - a.rate);

  const totalVAT = round2(vatBreakdown.reduce((sum, v) => sum + v.amount, 0));
  const totalTTC = round2(totalHT + totalVAT);

  return { totalHT, totalVAT, totalTTC, vatBreakdown };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
