import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Package,
  Layers,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Product, ProductVariant, ProductQuality } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductSelectModalProps {
  onClose: () => void;
  onSelect: (
    product: Product,
    quality: ProductQuality,
    variant: ProductVariant
  ) => void;
}

export const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
  onClose,
  onSelect,
}) => {
  const { t, settings, products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedCategoryId !== 'All' && p.category !== selectedCategoryId) return false;
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.code.toLowerCase().includes(q)) return true;
      if (p.barcode && p.barcode.toLowerCase().includes(q)) return true;
      for (const qual of p.qualities) {
        if (qual.name.toLowerCase().includes(q)) return true;
        for (const v of qual.variants) {
          if (String(v.size_weight).includes(q) || v.unit.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [products, searchQuery, selectedCategoryId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white">{t('selectProduct')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product by name, barcode, quality, size..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryId(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategoryId === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? t('allCategories') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product & Variant Selection List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching products found.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-3"
              >
                {/* Product Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white truncate">
                        {product.name}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {product.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{product.category}</span>
                  </div>
                </div>

                {/* Qualities & Size Variants options */}
                <div className="space-y-2 pt-1 border-t border-slate-700/50">
                  {product.qualities.map((quality) => (
                    <div key={quality.id} className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        {quality.name}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {quality.variants.map((v) => {
                          const isLowStock = v.stock_quantity <= (v.min_stock_alert || settings.low_stock_threshold);
                          const isOutOfStock = v.stock_quantity <= 0;

                          return (
                            <button
                              key={v.id}
                              onClick={() => {
                                onSelect(product, quality, v);
                                onClose();
                              }}
                              className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all group ${
                                isOutOfStock
                                  ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                                  : 'bg-slate-900 border-slate-700/70 hover:border-emerald-500 hover:bg-slate-900/90'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-xs text-white group-hover:text-emerald-400 block">
                                  {v.size_weight} {v.unit}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Stock: {v.stock_quantity}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-xs text-emerald-400 block">
                                  {settings.currency}{v.selling_price}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold group-hover:text-emerald-300">
                                  + Select
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
