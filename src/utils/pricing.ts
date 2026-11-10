/**
 * Business Mind - Bidirectional Pricing and Weight Calculation Engine
 * Pure logic module with zero DOM dependencies.
 */

export interface UnitCategory {
  category: 'mass' | 'volume' | 'length' | 'count' | 'discrete';
  toStandardFactor: number; // e.g., 1 kg -> 1, 1 g -> 0.001
}

export const UNIT_MAP: Record<string, UnitCategory> = {
  kg: { category: 'mass', toStandardFactor: 1 },
  g: { category: 'mass', toStandardFactor: 0.001 },
  gm: { category: 'mass', toStandardFactor: 0.001 },
  l: { category: 'volume', toStandardFactor: 1 },
  liter: { category: 'volume', toStandardFactor: 1 },
  ml: { category: 'volume', toStandardFactor: 0.001 },
  m: { category: 'length', toStandardFactor: 1 },
  meter: { category: 'length', toStandardFactor: 1 },
  cm: { category: 'length', toStandardFactor: 0.01 },
  ft: { category: 'length', toStandardFactor: 0.3048 },
  feet: { category: 'length', toStandardFactor: 0.3048 },
  in: { category: 'length', toStandardFactor: 0.0254 },
  inch: { category: 'length', toStandardFactor: 0.0254 },
  yard: { category: 'length', toStandardFactor: 0.9144 },
  pcs: { category: 'count', toStandardFactor: 1 },
  piece: { category: 'count', toStandardFactor: 1 },
  dozen: { category: 'count', toStandardFactor: 12 },
  box: { category: 'discrete', toStandardFactor: 1 },
  packet: { category: 'discrete', toStandardFactor: 1 },
};

/**
 * Check if two units are compatible for proportional unit scaling.
 */
export function areUnitsCompatible(unitA: string, unitB: string): boolean {
  const normA = unitA.trim().toLowerCase();
  const normB = unitB.trim().toLowerCase();
  if (normA === normB) return true;
  const defA = UNIT_MAP[normA];
  const defB = UNIT_MAP[normB];
  if (!defA || !defB) return false;
  return defA.category === defB.category;
}

/**
 * Convert quantity from source unit to target unit if compatible.
 */
export function convertUnitQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number {
  const normA = fromUnit.trim().toLowerCase();
  const normB = toUnit.trim().toLowerCase();
  if (normA === normB) return quantity;
  const defA = UNIT_MAP[normA];
  const defB = UNIT_MAP[normB];
  if (!defA || !defB || defA.category !== defB.category) {
    return quantity; // Fallback without conversion if incompatible
  }
  const inStandard = quantity * defA.toStandardFactor;
  return inStandard / defB.toStandardFactor;
}

/**
 * Bidirectional Rule 1: Calculate Size/Weight from entered Price.
 * Formula: Weight = (Entered Price / Base Price) * Base Weight
 */
export function calculateWeightFromPrice(
  enteredPrice: number,
  basePrice: number,
  baseWeight: number,
  precision: number = 3
): number {
  if (basePrice <= 0 || baseWeight <= 0 || enteredPrice < 0) {
    return 0;
  }
  const weight = (enteredPrice / basePrice) * baseWeight;
  return Number(weight.toFixed(precision));
}

/**
 * Bidirectional Rule 2: Calculate Price from entered Size/Weight.
 * Formula: Price = (Entered Weight / Base Weight) * Base Price
 */
export function calculatePriceFromWeight(
  enteredWeight: number,
  basePrice: number,
  baseWeight: number,
  precision: number = 2
): number {
  if (basePrice <= 0 || baseWeight <= 0 || enteredWeight < 0) {
    return 0;
  }
  const price = (enteredWeight / baseWeight) * basePrice;
  return Number(price.toFixed(precision));
}

/**
 * Calculate line item total.
 * Package Quantity is a separate multiplier.
 */
export function calculateLineTotal(
  unitPrice: number,
  packageQuantity: number,
  precision: number = 2
): number {
  const total = (unitPrice || 0) * (packageQuantity || 1);
  return Number(total.toFixed(precision));
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  dueAmount: number;
}

/**
 * Exact invoice financial calculations.
 */
export function calculateInvoiceSummary(
  subtotal: number,
  discountType: 'fixed' | 'percentage',
  discountValue: number,
  additionalCharges: number = 0,
  taxRate: number = 0,
  paidAmount: number = 0
): InvoiceTotals {
  const safeSubtotal = Math.max(0, subtotal || 0);
  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = (safeSubtotal * Math.max(0, discountValue || 0)) / 100;
  } else {
    discountAmount = Math.max(0, discountValue || 0);
  }

  // Discount cannot exceed subtotal
  discountAmount = Math.min(safeSubtotal, discountAmount);
  const taxableAmount = Math.max(0, safeSubtotal - discountAmount);

  const safeTaxRate = Math.max(0, taxRate || 0);
  const taxAmount = (taxableAmount * safeTaxRate) / 100;

  const safeCharges = Math.max(0, additionalCharges || 0);
  const grandTotal = Number((taxableAmount + taxAmount + safeCharges).toFixed(2));

  const safePaid = Math.max(0, paidAmount || 0);
  const dueAmount = Number(Math.max(0, grandTotal - safePaid).toFixed(2));

  return {
    subtotal: Number(safeSubtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grandTotal,
    dueAmount,
  };
}

/**
 * Profit and loss breakdown
 */
export interface PnLSummary {
  grossSales: number;
  salesReturns: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
}

export function calculatePnL(
  grossSales: number,
  salesReturns: number,
  cogs: number,
  operatingExpenses: number
): PnLSummary {
  const netSales = Math.max(0, grossSales - salesReturns);
  const grossProfit = netSales - cogs;
  const netProfit = grossProfit - operatingExpenses;
  const profitMarginPercent =
    netSales > 0 ? Number(((netProfit / netSales) * 100).toFixed(2)) : 0;

  return {
    grossSales: Number(grossSales.toFixed(2)),
    salesReturns: Number(salesReturns.toFixed(2)),
    netSales: Number(netSales.toFixed(2)),
    cogs: Number(cogs.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    operatingExpenses: Number(operatingExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    profitMarginPercent,
  };
}
