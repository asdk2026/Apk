import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWeightFromPrice,
  calculatePriceFromWeight,
  calculateLineTotal,
  calculateInvoiceSummary,
  calculatePnL,
  convertUnitQuantity,
  areUnitsCompatible,
} from './pricing';

test('Bidirectional Rule: User enters price -> calculates weight correctly', () => {
  // Base: 1 KG = ৳100
  // Enter ৳50 -> 0.5 KG
  assert.equal(calculateWeightFromPrice(50, 100, 1), 0.5);

  // Enter ৳150 -> 1.5 KG
  assert.equal(calculateWeightFromPrice(150, 100, 1), 1.5);

  // Enter ৳200 -> 2.0 KG
  assert.equal(calculateWeightFromPrice(200, 100, 1), 2.0);

  // Base: 5 KG = ৳480
  // Enter ৳96 -> 1 KG
  assert.equal(calculateWeightFromPrice(96, 480, 5), 1.0);
});

test('Bidirectional Rule: User enters weight -> calculates price correctly', () => {
  // Base: 1 KG = ৳100
  // Enter 0.5 KG -> ৳50
  assert.equal(calculatePriceFromWeight(0.5, 100, 1), 50);

  // Enter 1.5 KG -> ৳150
  assert.equal(calculatePriceFromWeight(1.5, 100, 1), 150);

  // Enter 2 KG -> ৳200
  assert.equal(calculatePriceFromWeight(2, 100, 1), 200);

  // Base: 5 KG = ৳480
  // Enter 1 KG -> ৳96
  assert.equal(calculatePriceFromWeight(1, 480, 5), 96);
});

test('Unit compatibility and conversions', () => {
  assert.equal(areUnitsCompatible('kg', 'g'), true);
  assert.equal(areUnitsCompatible('L', 'ml'), true);
  assert.equal(areUnitsCompatible('m', 'cm'), true);
  assert.equal(areUnitsCompatible('kg', 'L'), false);

  // 1 kg = 1000 g
  assert.equal(convertUnitQuantity(1, 'kg', 'g'), 1000);
  assert.equal(convertUnitQuantity(500, 'g', 'kg'), 0.5);
});

test('Line total with package quantity as separate multiplier', () => {
  // Unit price ৳50 for 0.5 kg bag, buying 3 bags = ৳150
  assert.equal(calculateLineTotal(50, 3), 150);
  assert.equal(calculateLineTotal(100, 1), 100);
});

test('Invoice calculations: subtotal, discount, tax, charges, paid, due', () => {
  // Subtotal 1000, 10% discount, 50 additional charges, 5% tax, paid 800
  // Net after discount: 900
  // Tax (5% of 900): 45
  // Grand Total: 900 + 45 + 50 = 995
  // Due: 995 - 800 = 195
  const summary = calculateInvoiceSummary(1000, 'percentage', 10, 50, 5, 800);
  assert.equal(summary.subtotal, 1000);
  assert.equal(summary.discountAmount, 100);
  assert.equal(summary.taxableAmount, 900);
  assert.equal(summary.taxAmount, 45);
  assert.equal(summary.grandTotal, 995);
  assert.equal(summary.dueAmount, 195);
});

test('Profit and loss calculations', () => {
  const pnl = calculatePnL(10000, 500, 6000, 1500);
  // Net sales = 10000 - 500 = 9500
  // Gross profit = 9500 - 6000 = 3500
  // Net profit = 3500 - 1500 = 2000
  // Margin = (2000 / 9500) * 100 = 21.05%
  assert.equal(pnl.netSales, 9500);
  assert.equal(pnl.grossProfit, 3500);
  assert.equal(pnl.netProfit, 2000);
  assert.equal(pnl.profitMarginPercent, 21.05);
});
