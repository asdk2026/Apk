import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Receipt,
  Plus,
  ScanBarcode,
  Boxes,
  Wallet,
  BarChart3,
  Search,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductDetailsModal } from '../product/ProductDetailsModal';
import { ProductFormModal } from '../product/ProductFormModal';

interface HomeDashboardProps {
  onOpenPosWithProduct?: (product: Product) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onOpenPosWithProduct }) => {
  const {
    t,
    settings,
    products,
    invoices,
    customers,
    setActiveModule,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Today's Date String in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Today's Metrics
  const todayInvoices = useMemo(
    () => invoices.filter((inv) => inv.date.startsWith(todayStr) && inv.payment_status !== 'cancelled'),
    [invoices, todayStr]
  );

  const todaySalesAmount = useMemo(
    () => todayInvoices.reduce((acc, inv) => acc + inv.grand_total, 0),
    [todayInvoices]
  );

  const todayCashCollected = useMemo(
    () => todayInvoices.reduce((acc, inv) => acc + inv.paid_amount, 0),
    [todayInvoices]
  );

  const totalOutstandingDue = useMemo(
    () => customers.reduce((acc, c) => acc + c.outstanding_due, 0),
    [customers]
  );

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const lowStockItems = useMemo(() => {
    const list: {
      productId: string;
      productName: string;
      category: string;
      qualityName: string;
      variantId: string;
      sizeWeight: number;
      unit: string;
      stockQuantity: number;
      threshold: number;
    }[] = [];

    for (const p of products) {
      for (const q of p.qualities) {
        for (const v of q.variants) {
          const threshold = v.min_stock_alert || settings.low_stock_threshold;
          if (v.stock_quantity <= threshold) {
            list.push({
              productId: p.id,
              productName: p.name,
              category: p.category,
              qualityName: q.name,
              variantId: v.id,
              sizeWeight: v.size_weight,
              unit: v.unit,
              stockQuantity: v.stock_quantity,
              threshold,
            });
          }
        }
      }
    }
    return list;
  }, [products, settings.low_stock_threshold]);

  const lowStockCount = lowStockItems.length;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products for compact vertical list
  const filteredProducts = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return products.filter((prod) => {
      if (selectedCategory !== 'All' && prod.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      if (prod.name.toLowerCase().includes(q)) return true;
      if (prod.code.toLowerCase().includes(q)) return true;
      if (prod.barcode && prod.barcode.toLowerCase().includes(q)) return true;
      for (const quality of prod.qualities) {
        if (quality.name.toLowerCase().includes(q)) return true;
        for (const v of quality.variants) {
          if (String(v.size_weight).includes(q) || v.unit.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [products, searchFilter, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Low Stock Alert Notification Banner */}
      {lowStockCount > 0 && !bannerDismissed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-white">
                    {t('lowStockBannerTitle')}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                    {lowStockCount} {lowStockCount === 1 ? 'ITEM' : 'ITEMS'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {lowStockCount} {t('lowStockBannerSubtitle')}.
                </p>

                {/* Specific items chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <span
                      key={`${item.productId}-${item.variantId}`}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 border border-amber-500/30 text-[11px] text-slate-200"
                    >
                      <span className="font-medium text-white truncate max-w-[140px]">
                        {item.productName}
                      </span>
                      <span className="text-slate-400">
                        ({item.sizeWeight} {item.unit})
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        {item.stockQuantity} left
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (min {item.threshold})
                      </span>
                    </span>
                  ))}
                  {lowStockItems.length > 4 && (
                    <span className="text-xs text-amber-400 font-medium self-center pl-1">
                      +{lowStockItems.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 self-end md:self-center">
              <button
                onClick={() => setActiveModule('purchases')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              >
                <span>{t('restockNow')}</span>
              </button>
              <button
                onClick={() => setActiveModule('stock')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition-colors"
              >
                <span>{t('viewLowStock')}</span>
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss"
                aria-label="Dismiss Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Quick KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{t('todaySales')}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white">
            {settings.currency}{todaySalesAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {todayInvoices.length} {todayInvoices.length === 1 ? 'sale today' : 'sales today'}
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{t('totalCollected')}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-teal-400">
            {settings.currency}{todayCashCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cash In Hand</div>
        </div>

        {/* Outstanding Due */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{t('totalDue')}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400">
            {settings.currency}{totalOutstandingDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Customer Receivables</div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setActiveModule('stock')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 shadow-sm relative overflow-hidden cursor-pointer transition-all group"
          title="Click to inspect low stock items"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors">
              {t('lowStockAlerts')}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-rose-400">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Variants below limit</span>
            <span className="text-amber-400 text-[10px] font-medium group-hover:underline">View &rarr;</span>
          </div>
        </div>
      </div>

      {/* 2. Fast Navigation Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {t('quickShortcut')}
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {/* New Invoice POS */}
          <button
            onClick={() => setActiveModule('invoice')}
            className="p-3 rounded-xl bg-gradient-to-br from-emerald-600/25 to-teal-700/20 border border-emerald-500/30 hover:border-emerald-500 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center mb-1.5 shadow-md group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5 font-bold" />
            </div>
            <span className="text-xs font-bold text-white">{t('invoice')}</span>
            <span className="text-[10px] text-emerald-400 font-mono">POS</span>
          </button>

          {/* Add Product */}
          <button
            onClick={() => setShowAddModal(true)}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center mb-1.5 group-hover:text-emerald-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('addProduct')}</span>
          </button>

          {/* Barcode Scanner */}
          <button
            onClick={() => setActiveModule('barcode')}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center mb-1.5 group-hover:text-teal-400 transition-colors">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('barcode')}</span>
          </button>

          {/* Stock Balances */}
          <button
            onClick={() => setActiveModule('stock')}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center mb-1.5 group-hover:text-blue-400 transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('stock')}</span>
          </button>

          {/* Due Management */}
          <button
            onClick={() => setActiveModule('due')}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center mb-1.5 group-hover:text-amber-400 transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('due')}</span>
          </button>

          {/* Record Expense */}
          <button
            onClick={() => setActiveModule('expenses')}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center text-center transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center mb-1.5 group-hover:text-purple-400 transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('expenses')}</span>
          </button>
        </div>
      </div>

      {/* 3. Product Catalog (Section 3 Requirement) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>{t('allProductsCatalog')}</span>
              <span className="text-xs font-normal text-slate-400">({filteredProducts.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any product to inspect variants, pricing, or initiate instant POS sale.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addProduct')}</span>
            </button>
            <button
              onClick={() => setActiveModule('product')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Filter and In-List Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, quality, size..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? t('allCategories') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Vertical Product List (Conforming exactly to Section 3 spec) */}
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No products match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try another keyword or add a new product</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const maxQualitiesToShow = 3;
              const qualitiesToShow = product.qualities.slice(0, maxQualitiesToShow);
              const remainingQualitiesCount = product.qualities.length - maxQualitiesToShow;

              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/90 transition-all cursor-pointer flex flex-col sm:flex-row gap-3.5 group shadow-xs"
                >
                  {/* LEFT: Small Product Image */}
                  <div className="w-full sm:w-28 h-28 sm:h-28 rounded-xl bg-slate-800/80 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-500" />
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-slate-300 px-1.5 py-0.5 rounded">
                      {product.code}
                    </span>
                  </div>

                  {/* RIGHT: Product Name, Qualities, Sizes with Prices */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Name and Category Kicker */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                            {product.name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {product.category} {product.brand ? `· ${product.brand}` : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Total Stock</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {product.qualities.reduce(
                              (acc, q) =>
                                acc +
                                q.variants.reduce((vAcc, v) => vAcc + v.stock_quantity, 0),
                              0
                            )}{' '}
                            units
                          </span>
                        </div>
                      </div>

                      {/* Qualities and Sizes Hierarchy */}
                      <div className="mt-2.5 space-y-2">
                        {qualitiesToShow.map((quality) => (
                          <div
                            key={quality.id}
                            className="text-xs bg-slate-950/40 p-2 rounded-lg border border-slate-800/80"
                          >
                            <span className="font-semibold text-slate-300 text-[11px] block mb-1">
                              {quality.name}:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {quality.variants.map((v) => (
                                <div
                                  key={v.id}
                                  className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-700/60 font-mono text-[11px]"
                                >
                                  <span className="text-slate-200">
                                    {v.size_weight} {v.unit}
                                  </span>
                                  <span className="text-slate-600">-</span>
                                  <span className="font-bold text-emerald-400">
                                    {settings.currency}{v.selling_price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* More qualities indicator */}
                        {remainingQualitiesCount > 0 && (
                          <span className="inline-block text-[11px] text-emerald-400 font-medium pl-1">
                            +{remainingQualitiesCount} {t('moreQualities')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={(prod) => {
            setSelectedProduct(null);
            setEditingProduct(prod);
          }}
          onDelete={(id) => {
            deleteProduct(id);
            setSelectedProduct(null);
          }}
          onSell={(prod) => {
            if (onOpenPosWithProduct) {
              onOpenPosWithProduct(prod);
            } else {
              setActiveModule('invoice');
            }
          }}
        />
      )}

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductFormModal
          initialProduct={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={(data) => {
            addProduct(data);
          }}
          onUpdate={(prod) => {
            updateProduct(prod);
          }}
        />
      )}
    </div>
  );
};
