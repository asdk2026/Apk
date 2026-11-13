import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Plus,
  Minus,
  X,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StockManagement: React.FC = () => {
  const {
    t,
    settings,
    products,
    stockMovements,
    adjustStock,
    hasActionPermission,
  } = useApp();

  const canAdjustStock = hasActionPermission('canAdjustStock');
  const canViewCost = hasActionPermission('canViewProfitLoss');

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    currentStock: number;
    unit: string;
  } | null>(null);

  const [adjustmentQty, setAdjustmentQty] = useState<number>(1);
  const [adjustmentType, setAdjustmentType] = useState<'adjustment_in' | 'adjustment_out' | 'damaged'>('adjustment_in');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  // Flattened variant stock records
  const allVariants = useMemo(() => {
    const list: {
      productId: string;
      productName: string;
      productCode: string;
      category: string;
      qualityName: string;
      variantId: string;
      sizeWeight: number;
      unit: string;
      stockQuantity: number;
      purchasePrice: number;
      sellingPrice: number;
      minStockAlert: number;
      isLowStock: boolean;
    }[] = [];

    products.forEach((p) => {
      p.qualities.forEach((q) => {
        q.variants.forEach((v) => {
          const threshold = v.min_stock_alert || settings.low_stock_threshold;
          list.push({
            productId: p.id,
            productName: p.name,
            productCode: p.code,
            category: p.category,
            qualityName: q.name,
            variantId: v.id,
            sizeWeight: v.size_weight,
            unit: v.unit,
            stockQuantity: v.stock_quantity,
            purchasePrice: v.purchase_price,
            sellingPrice: v.selling_price,
            minStockAlert: threshold,
            isLowStock: v.stock_quantity <= threshold,
          });
        });
      });
    });

    return list;
  }, [products, settings.low_stock_threshold]);

  // Filtered variant records
  const filteredVariants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVariants.filter((item) => {
      if (lowStockOnly && !item.isLowStock) return false;
      if (!q) return true;
      if (item.productName.toLowerCase().includes(q)) return true;
      if (item.productCode.toLowerCase().includes(q)) return true;
      if (item.qualityName.toLowerCase().includes(q)) return true;
      if (item.category.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [allVariants, searchQuery, lowStockOnly]);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustmentQty <= 0) return;
    adjustStock(
      adjustingItem.productId,
      adjustingItem.variantId,
      adjustmentQty,
      adjustmentType,
      adjustmentNotes
    );
    alert('Stock adjusted successfully!');
    setAdjustingItem(null);
    setAdjustmentQty(1);
    setAdjustmentNotes('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <span>{t('stock')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Variant-level inventory management, live stock alerts, and audit trails.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'inventory'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('stockOverview')}
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'movements'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('stockMovements')} ({stockMovements.length})
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search & Low Stock Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search variant stock by name, code, quality..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                lowStockOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('lowStockAlerts')} Only</span>
            </button>
          </div>

          {/* Variants Stock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('productName')}</th>
                    <th className="py-3 px-4">{t('qualityName')}</th>
                    <th className="py-3 px-4">{t('sizeWeight')}</th>
                    {canViewCost && <th className="py-3 px-4 text-right">Cost Price</th>}
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">{t('availableStock')}</th>
                    {canAdjustStock && <th className="py-3 px-4 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredVariants.map((item) => (
                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.productCode}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-300">
                        {item.qualityName}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {item.sizeWeight} {item.unit}
                      </td>
                      {canViewCost && (
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {settings.currency}{item.purchasePrice}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {settings.currency}{item.sellingPrice}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            item.isLowStock ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.stockQuantity} {item.unit}
                          {item.isLowStock && <AlertTriangle className="w-3 h-3" />}
                        </span>
                      </td>
                      {canAdjustStock && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() =>
                              setAdjustingItem({
                                productId: item.productId,
                                productName: item.productName,
                                variantId: item.variantId,
                                variantName: `${item.qualityName} (${item.sizeWeight} ${item.unit})`,
                                currentStock: item.stockQuantity,
                                unit: item.unit,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] inline-flex items-center gap-1"
                          >
                            <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
                            <span>{t('stockAdjustment')}</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Movements Log */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {stockMovements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No stock movements recorded yet. Movements automatically appear upon POS sales, purchases, or adjustments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Product & Variant</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-center">Prev &rarr; New</th>
                    <th className="py-3 px-4">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {stockMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{mov.product_name}</span>
                        <span className="text-[10px] text-slate-400">{mov.variant_info}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            mov.type === 'sale'
                              ? 'bg-rose-500/15 text-rose-400'
                              : mov.type === 'purchase'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-300'
                          }`}
                        >
                          {mov.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {mov.type === 'sale' || mov.type === 'adjustment_out' || mov.type === 'damaged' ? '-' : '+'}
                        {mov.quantity}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {mov.previous_stock} &rarr; <strong className="text-white">{mov.new_stock}</strong>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {mov.reference_id || mov.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-sm text-white">{t('stockAdjustment')}</h3>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-sm text-white block">{adjustingItem.productName}</span>
                <span className="text-emerald-400 font-medium block">{adjustingItem.variantName}</span>
                <span className="text-slate-400 font-mono block mt-1">
                  Current Stock: {adjustingItem.currentStock} {adjustingItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="adjustment_in">{t('stockIn')} (+ Add Stock)</option>
                  <option value="adjustment_out">{t('stockOut')} (- Deduct Stock)</option>
                  <option value="damaged">{t('damagedStock')} (- Write-off Damaged)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quantity ({adjustingItem.unit}) *</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="e.g. Expired batch or physical warehouse audit"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
