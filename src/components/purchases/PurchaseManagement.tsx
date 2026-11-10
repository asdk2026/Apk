import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Calendar,
  Save,
  Printer,
  DollarSign,
  Package,
  Layers,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase, PurchaseItem, Product, ProductQuality, ProductVariant } from '../../types';

export const PurchaseManagement: React.FC = () => {
  const {
    t,
    settings,
    products,
    suppliers,
    purchases,
    recordPurchase,
    recordSupplierPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [inspectPurchase, setInspectPurchase] = useState<Purchase | null>(null);

  // New Purchase Form state
  const [supplierMode, setSupplierMode] = useState<string>('supp_01');
  const [supplierName, setSupplierName] = useState('Meghna Food & Consumers Ltd');
  const [supplierPhone, setSupplierPhone] = useState('01713-112233');

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Item selector in form
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [itemCost, setItemCost] = useState<number>(80);
  const [itemQty, setItemQty] = useState<number>(10);

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const currentQuality = useMemo(
    () => currentProduct?.qualities[selectedQualityIndex],
    [currentProduct, selectedQualityIndex]
  );

  const currentVariant = useMemo(
    () => currentQuality?.variants[selectedVariantIndex],
    [currentQuality, selectedVariantIndex]
  );

  // When selected product changes
  const handleProductSelectChange = (pId: string) => {
    setSelectedProductId(pId);
    setSelectedQualityIndex(0);
    setSelectedVariantIndex(0);
    const p = products.find((prod) => prod.id === pId);
    if (p && p.qualities[0]?.variants[0]) {
      setItemCost(p.qualities[0].variants[0].purchase_price);
    }
  };

  const handleAddItemToPurchase = () => {
    if (!currentProduct || !currentQuality || !currentVariant) return;

    const newItem: PurchaseItem = {
      id: `pitem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      product_id: currentProduct.id,
      product_name: currentProduct.name,
      quality_name: currentQuality.name,
      size_weight: currentVariant.size_weight,
      unit: currentVariant.unit,
      purchase_price: itemCost,
      quantity: itemQty,
      line_total: itemCost * itemQty,
    };

    setPurchaseItems([...purchaseItems, newItem]);
  };

  const handleRemovePurchaseItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter((i) => i.id !== id));
  };

  // Totals
  const subtotal = useMemo(
    () => purchaseItems.reduce((acc, i) => acc + i.line_total, 0),
    [purchaseItems]
  );

  const grandTotal = Math.max(0, subtotal - discount + additionalCharges);
  const supplierDue = Math.max(0, grandTotal - paidAmount);

  const handleSupplierSelectChange = (sId: string) => {
    setSupplierMode(sId);
    const found = suppliers.find((s) => s.id === sId);
    if (found) {
      setSupplierName(found.name);
      setSupplierPhone(found.phone);
    } else {
      setSupplierName('');
      setSupplierPhone('');
    }
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Please add at least one product item to this purchase order.');
      return;
    }

    recordPurchase({
      business_id: settings.business_id,
      purchase_date: new Date().toISOString(),
      supplier_id: supplierMode === 'custom' ? undefined : supplierMode,
      supplier_name: supplierName || 'Direct Vendor',
      supplier_phone: supplierPhone,
      items: purchaseItems,
      subtotal,
      discount,
      additional_charges: additionalCharges,
      grand_total: grandTotal,
      paid_amount: paidAmount,
      supplier_due: supplierDue,
      payment_status:
        supplierDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'due',
      notes,
    });

    alert('Purchase recorded successfully and stock has been automatically updated!');
    setShowAddPurchaseModal(false);
    setPurchaseItems([]);
    setDiscount(0);
    setAdditionalCharges(0);
    setPaidAmount(0);
    setNotes('');
  };

  // Filtered purchases list
  const filteredPurchases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return purchases.filter((pur) => {
      if (!q) return true;
      if (pur.purchase_number.toLowerCase().includes(q)) return true;
      if (pur.supplier_name.toLowerCase().includes(q)) return true;
      if (pur.supplier_phone.includes(q)) return true;
      return false;
    });
  }, [purchases, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            <span>{t('purchases')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procure inventory stock from suppliers, log cost prices, and manage supplier due balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddPurchaseModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addPurchase')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by purchase number or supplier name..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Purchases List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Truck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No purchase vouchers found</p>
            <p className="text-xs text-slate-500 mt-1">Click "+ Record Purchase" to receive new inventory shipments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('purchaseNumber')}</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">{t('supplierName')}</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Total (৳)</th>
                  <th className="py-3 px-4 text-right">Paid (৳)</th>
                  <th className="py-3 px-4 text-right">Supplier Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {pur.purchase_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(pur.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{pur.supplier_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{pur.supplier_phone}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {pur.items.length}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {settings.currency}{pur.grand_total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-400">
                      {settings.currency}{pur.paid_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={pur.supplier_due > 0 ? 'text-amber-400' : 'text-slate-400'}>
                        {settings.currency}{pur.supplier_due.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          pur.payment_status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {pur.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Purchase Modal */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">{t('addPurchase')}</h3>
              </div>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
              {/* Supplier info */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <span className="font-semibold text-white block">Supplier Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Select Supplier</label>
                    <select
                      value={supplierMode}
                      onChange={(e) => handleSupplierSelectChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      <option value="custom">+ Other Vendor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      required
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Supplier Phone</label>
                    <input
                      type="text"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Add items to purchase */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <span className="font-semibold text-white block">Add Received Products</span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Product</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelectChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Quality</label>
                    <select
                      value={selectedQualityIndex}
                      onChange={(e) => setSelectedQualityIndex(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      {currentProduct?.qualities.map((q, idx) => (
                        <option key={q.id} value={idx}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Size / Variant</label>
                    <select
                      value={selectedVariantIndex}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value, 10);
                        setSelectedVariantIndex(idx);
                        if (currentQuality?.variants[idx]) {
                          setItemCost(currentQuality.variants[idx].purchase_price);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                    >
                      {currentQuality?.variants.map((v, idx) => (
                        <option key={v.id} value={idx}>
                          {v.size_weight} {v.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cost (৳)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={itemCost}
                      onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400">Received Quantity:</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value, 10) || 1)}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToPurchase}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                {/* Items in purchase */}
                {purchaseItems.length > 0 && (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 mt-3">
                    {purchaseItems.map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{item.product_name}</span>
                          <span className="text-[11px] text-slate-400">
                            {item.quality_name} · {item.size_weight} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-300">
                            {settings.currency}{item.purchase_price} &times; {item.quantity} = <strong className="text-white">{settings.currency}{item.line_total}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePurchaseItem(item.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Totals */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-mono text-white font-bold">{settings.currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Discount (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Additional Charges (৳):</span>
                  <input
                    type="number"
                    min="0"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono"
                  />
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-700">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-400">{settings.currency}{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-300 font-semibold">Amount Paid to Supplier:</span>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono font-bold text-teal-400"
                  />
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span className={supplierDue > 0 ? 'text-amber-400' : 'text-slate-400'}>Supplier Due:</span>
                  <span className={`font-mono ${supplierDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {settings.currency}{supplierDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
                >
                  Confirm & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
