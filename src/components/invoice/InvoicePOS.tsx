import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  User,
  CreditCard,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Package,
  Layers,
  ArrowRightLeft,
  Minus,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant, ProductQuality, InvoiceItem, Invoice } from '../../types';
import {
  calculateWeightFromPrice,
  calculatePriceFromWeight,
  calculateLineTotal,
  calculateInvoiceSummary,
} from '../../utils/pricing';
import { ProductSelectModal } from './ProductSelectModal';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

interface EditableInvoiceItem extends InvoiceItem {
  lastEditedField?: 'price' | 'weight';
}

export const InvoicePOS: React.FC = () => {
  const {
    t,
    settings,
    customers,
    createInvoice,
    hasActionPermission,
  } = useApp();

  const canEditPrice = hasActionPermission('canEditInvoicePrice');
  const canApplyDiscount = hasActionPermission('canApplyDiscount');

  // Selected Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [customCustomerName, setCustomCustomerName] = useState('Walk-in Customer');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('N/A');
  const [customCustomerAddress, setCustomCustomerAddress] = useState('');

  // Line items state
  const [items, setItems] = useState<EditableInvoiceItem[]>([]);

  // Financial adjustments
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.tax_rate || 0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');

  // Modals
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

  // When customer dropdown changes
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    if (custId === 'walk-in') {
      setCustomCustomerName('Walk-in Customer');
      setCustomCustomerPhone('N/A');
      setCustomCustomerAddress('');
    } else {
      const found = customers.find((c) => c.id === custId);
      if (found) {
        setCustomCustomerName(found.name);
        setCustomCustomerPhone(found.phone);
        setCustomCustomerAddress(found.address || '');
      }
    }
  };

  // Add product variant to invoice
  const handleAddProductVariant = (
    product: Product,
    quality: ProductQuality,
    variant: ProductVariant
  ) => {
    const newItem: EditableInvoiceItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: product.id,
      product_name: product.name,
      quality_id: quality.id,
      quality_name: quality.name,
      variant_id: variant.id,
      base_size_weight: variant.size_weight,
      base_price: variant.selling_price,
      unit: variant.unit,
      selected_size_weight: variant.size_weight,
      unit_price: variant.selling_price,
      package_quantity: 1,
      line_total: variant.selling_price,
      purchase_cost: variant.purchase_price,
      lastEditedField: 'weight',
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Remove line item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  /**
   * CRITICAL FEATURE 1: EDITABLE BASE PRICE
   * When user clicks & edits the product's Base Price:
   * 1. Updates item.base_price.
   * 2. Recalculates unit_price and size/weight according to existing bidirectional logic.
   * 3. Recalculates line_total = unit_price * package_quantity.
   */
  const handleBasePriceChange = (itemId: string, newBasePrice: number) => {
    const validBasePrice = Math.max(0, newBasePrice);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        if (item.lastEditedField === 'price' && item.unit_price > 0 && validBasePrice > 0) {
          const calculatedWeight = calculateWeightFromPrice(
            item.unit_price,
            validBasePrice,
            item.base_size_weight,
            3
          );
          const lineTotal = calculateLineTotal(item.unit_price, item.package_quantity);
          return {
            ...item,
            base_price: validBasePrice,
            selected_size_weight: calculatedWeight,
            line_total: lineTotal,
          };
        } else {
          const calculatedPrice = calculatePriceFromWeight(
            item.selected_size_weight,
            validBasePrice,
            item.base_size_weight,
            2
          );
          const lineTotal = calculateLineTotal(calculatedPrice, item.package_quantity);
          return {
            ...item,
            base_price: validBasePrice,
            unit_price: calculatedPrice,
            line_total: lineTotal,
          };
        }
      })
    );
  };

  /**
   * CRITICAL FEATURE 5.D: BIDIRECTIONAL PRICE AND SIZE/WEIGHT CALCULATION
   * User edits Price -> automatically calculates Weight.
   */
  const handlePriceChange = (itemId: string, enteredPrice: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const calculatedWeight = calculateWeightFromPrice(
          enteredPrice,
          item.base_price,
          item.base_size_weight,
          3
        );

        const lineTotal = calculateLineTotal(enteredPrice, item.package_quantity);

        return {
          ...item,
          unit_price: enteredPrice,
          selected_size_weight: calculatedWeight,
          line_total: lineTotal,
          lastEditedField: 'price',
        };
      })
    );
  };

  /**
   * CRITICAL FEATURE 5.D: BIDIRECTIONAL PRICE AND SIZE/WEIGHT CALCULATION
   * User edits Size/Weight -> automatically calculates Price.
   */
  const handleWeightChange = (itemId: string, enteredWeight: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const calculatedPrice = calculatePriceFromWeight(
          enteredWeight,
          item.base_price,
          item.base_size_weight,
          2
        );

        const lineTotal = calculateLineTotal(calculatedPrice, item.package_quantity);

        return {
          ...item,
          selected_size_weight: enteredWeight,
          unit_price: calculatedPrice,
          line_total: lineTotal,
          lastEditedField: 'weight',
        };
      })
    );
  };

  // Change package quantity multiplier (enforces min 1, updates line total)
  const handlePackageQuantityChange = (itemId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const safeQty = Math.max(1, isNaN(qty) ? 1 : qty);
        const lineTotal = calculateLineTotal(item.unit_price, safeQty);
        return {
          ...item,
          package_quantity: safeQty,
          line_total: lineTotal,
        };
      })
    );
  };

  // Calculations
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.line_total, 0),
    [items]
  );

  const summary = useMemo(
    () =>
      calculateInvoiceSummary(
        subtotal,
        discountType,
        discountValue,
        additionalCharges,
        taxRate,
        paidAmount
      ),
    [subtotal, discountType, discountValue, additionalCharges, taxRate, paidAmount]
  );

  // Auto-fill paid amount button (Pay Full)
  const handlePayFull = () => {
    setPaidAmount(summary.grandTotal);
  };

  // Reset / Clear POS
  const handleReset = () => {
    if (items.length > 0 && !confirm('Clear current invoice items?')) return;
    setItems([]);
    setSelectedCustomerId('walk-in');
    setCustomCustomerName('Walk-in Customer');
    setCustomCustomerPhone('N/A');
    setCustomCustomerAddress('');
    setDiscountValue(0);
    setAdditionalCharges(0);
    setPaidAmount(0);
    setNotes('');
  };

  // Submit invoice
  const handleSubmitInvoice = (andPrint: boolean = false) => {
    if (items.length === 0) {
      alert('Please add at least one product to the invoice.');
      return;
    }

    const payload = {
      business_id: settings.business_id,
      date: new Date().toISOString(),
      customer_id: selectedCustomerId === 'walk-in' ? undefined : selectedCustomerId,
      customer_name: customCustomerName,
      customer_phone: customCustomerPhone,
      customer_address: customCustomerAddress,
      items: items.map(({ lastEditedField, ...item }) => item),
      subtotal: summary.subtotal,
      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: summary.discountAmount,
      additional_charges: additionalCharges,
      tax_rate: taxRate,
      tax_amount: summary.taxAmount,
      grand_total: summary.grandTotal,
      paid_amount: paidAmount,
      due_amount: summary.dueAmount,
      payment_method: paymentMethod,
      payment_status:
        summary.dueAmount === 0
          ? ('paid' as const)
          : paidAmount > 0
          ? ('partial' as const)
          : ('due' as const),
      notes,
    };

    const created = createInvoice(payload);

    if (andPrint) {
      setSavedInvoice(created);
    } else {
      alert(`Invoice #${created.invoice_number} saved successfully!`);
      handleReset();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>{t('invoice')} - Point of Sale (POS)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time bidirectional pricing calculation, multi-variant billing, and instant stock deduction.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reset')}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left POS Line Items & Products | Right Customer & Billing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Customer Selection & Line Items (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Customer Selection Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                {t('customerSelection')}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedCustomerId === 'walk-in' ? 'Walk-in Mode' : 'Registered Customer'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="walk-in">{t('walkInCustomer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Due: {settings.currency}{c.outstanding_due}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t('customerName')}
                </label>
                <input
                  type="text"
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t('customerPhone')}
                </label>
                <input
                  type="text"
                  value={customCustomerPhone}
                  onChange={(e) => setCustomCustomerPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items Container with Bidirectional Calculation Note */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Invoice Items ({items.length})</span>
                </h3>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  {t('bidirectionalNote')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowProductSelect(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('selectProduct')}</span>
              </button>
            </div>

            {/* Empty state */}
            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">{t('emptyCart')}</p>
                <button
                  onClick={() => setShowProductSelect(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('selectProduct')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3 text-xs"
                  >
                    {/* Item Title and Quality */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="font-bold text-sm text-white truncate">
                            {item.product_name}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 pl-0 sm:pl-7">
                          <span className="font-medium text-emerald-300">
                            {item.quality_name}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-400">
                            Base: {item.base_size_weight} {item.unit}
                          </span>
                          <span>·</span>
                          {/* Clickable & Editable Base Price */}
                          <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500/70 focus-within:border-amber-500 rounded-lg px-2 py-0.5 transition-colors group">
                            <span className="text-[10px] text-amber-400 font-medium">Base Price:</span>
                            <span className="text-slate-400 text-xs font-mono">{settings.currency}</span>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              readOnly={!canEditPrice}
                              disabled={!canEditPrice}
                              value={item.base_price}
                              onChange={(e) =>
                                canEditPrice &&
                                handleBasePriceChange(item.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-16 bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none focus:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                              title={
                                canEditPrice
                                  ? 'Click to edit Base Price directly'
                                  : 'Price editing restricted by Admin'
                              }
                            />
                            {canEditPrice && (
                              <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 shrink-0 pointer-events-none" />
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Interactive Calculation Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 pl-0 sm:pl-7">
                      {/* Weight / Size Input (Editable) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                          <span>{t('sizeWeight')} ({item.unit})</span>
                          <span title="Bidirectional synced">
                            <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={item.selected_size_weight}
                            onChange={(e) =>
                              handleWeightChange(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Unit Price Input (Editable - Bidirectionally recalculates weight) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                          <span>{t('unitPrice')} ({settings.currency})</span>
                          <span title="Bidirectional synced">
                            <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                          </span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          readOnly={!canEditPrice}
                          disabled={!canEditPrice}
                          value={item.unit_price}
                          onChange={(e) =>
                            canEditPrice &&
                            handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                          }
                          title={canEditPrice ? 'Editable Unit Price' : 'Price editing restricted by Admin'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Package Quantity Multiplier with (-) and (+) buttons */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                          <span>{t('pkgQty')} (Multiplier)</span>
                          <span className="text-[9px] text-slate-500 font-mono">min 1</span>
                        </label>
                        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 overflow-hidden focus-within:border-emerald-500">
                          <button
                            type="button"
                            onClick={() => handlePackageQuantityChange(item.id, item.package_quantity - 1)}
                            disabled={item.package_quantity <= 1}
                            className="w-7 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold text-sm shrink-0 border-r border-slate-800"
                            title="Decrease Package Qty (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={item.package_quantity}
                            onChange={(e) =>
                              handlePackageQuantityChange(item.id, Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            className="w-full bg-transparent px-1 py-1.5 text-xs text-center text-white font-mono font-bold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handlePackageQuantityChange(item.id, item.package_quantity + 1)}
                            className="w-7 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-sm shrink-0 border-l border-slate-800"
                            title="Increase Package Qty (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total & Total Calculated Size/Weight */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                          <span>{t('lineTotal')}</span>
                          <span className="text-[9px] text-emerald-400 font-mono">
                            {(item.selected_size_weight * item.package_quantity).toFixed(2)} {item.unit}
                          </span>
                        </label>
                        <div className="h-8 rounded-lg bg-slate-950 px-2.5 py-1.5 flex flex-col justify-center items-end border border-slate-800">
                          <span className="font-mono font-bold text-xs sm:text-sm text-white">
                            {settings.currency}{item.line_total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShowProductSelect(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Product</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Billing Summary & Checkout Actions (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm sticky top-16">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
              Billing & Payment Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('subtotal')}:</span>
                <span className="font-mono text-white font-semibold">
                  {settings.currency}{summary.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Discount Input */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    {t('discount')}: {!canApplyDiscount && <span className="text-[10px] text-amber-400">(Restricted)</span>}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded">
                    <button
                      type="button"
                      disabled={!canApplyDiscount}
                      onClick={() => canApplyDiscount && setDiscountType('fixed')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold disabled:opacity-50 ${
                        discountType === 'fixed'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400'
                      }`}
                    >
                      ৳
                    </button>
                    <button
                      type="button"
                      disabled={!canApplyDiscount}
                      onClick={() => canApplyDiscount && setDiscountType('percentage')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold disabled:opacity-50 ${
                        discountType === 'percentage'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={!canApplyDiscount}
                  value={discountValue}
                  onChange={(e) =>
                    canApplyDiscount && setDiscountValue(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Discount value"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-right disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Additional Charges */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('additionalCharges')}:</span>
                <input
                  type="number"
                  min="0"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                />
              </div>

              {/* Tax Rate */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('tax')} ({taxRate}%):</span>
                <span className="font-mono text-slate-300">
                  +{settings.currency}{summary.taxAmount.toFixed(2)}
                </span>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                <span>{t('grandTotal')}:</span>
                <span className="font-mono text-lg text-emerald-400">
                  {settings.currency}{summary.grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <label className="text-slate-400 text-[11px] block">{t('paymentMethod')}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Cash', 'bKash / MFS', 'Nagad', 'Card', 'Bank'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                        paymentMethod === method
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Amount & Due Calculation */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{t('paidAmount')}:</span>
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Pay Full (100%)
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono font-bold text-right"
                />
              </div>

              {/* Remaining Due */}
              <div className="flex justify-between items-center text-xs font-bold pt-1">
                <span className={summary.dueAmount > 0 ? 'text-amber-400' : 'text-slate-400'}>
                  {t('dueAmount')}:
                </span>
                <span className={`font-mono text-sm ${summary.dueAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {settings.currency}{summary.dueAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmitInvoice(true)}
                disabled={items.length === 0}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>{t('saveAndPrint')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmitInvoice(false)}
                disabled={items.length === 0}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-750 text-white flex items-center justify-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{t('saveInvoice')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select Product Modal */}
      {showProductSelect && (
        <ProductSelectModal
          onClose={() => setShowProductSelect(false)}
          onSelect={(prod, qual, variant) => {
            handleAddProductVariant(prod, qual, variant);
          }}
        />
      )}

      {/* Invoice Receipt Modal */}
      {savedInvoice && (
        <InvoiceReceiptModal
          invoice={savedInvoice}
          onClose={() => {
            setSavedInvoice(null);
            handleReset();
          }}
          onNewInvoice={() => {
            setSavedInvoice(null);
            handleReset();
          }}
        />
      )}
    </div>
  );
};
