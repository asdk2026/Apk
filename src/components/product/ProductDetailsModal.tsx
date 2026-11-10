import React from 'react';
import {
  X,
  Edit2,
  Trash2,
  Package,
  Layers,
  Scale,
  ShoppingCart,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onSell?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onEdit,
  onDelete,
  onSell,
}) => {
  const { t, settings } = useApp();

  if (!product) return null;

  const totalStock = product.qualities.reduce(
    (acc, q) => acc + q.variants.reduce((vAcc, v) => vAcc + v.stock_quantity, 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white truncate">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-200">
          {/* Top Info Banner with Image */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-44 h-36 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-slate-600" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-white text-base block">{product.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <span className="text-slate-400 text-[11px] block">{t('productCode')}</span>
                  <span className="font-mono font-semibold text-emerald-400">{product.code}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <span className="text-slate-400 text-[11px] block">{t('barcodeLabel')}</span>
                  <span className="font-mono text-slate-200">{product.barcode || 'N/A'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <span className="text-slate-400 text-[11px] block">{t('category')}</span>
                  <span className="font-medium text-slate-200">{product.category}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <span className="text-slate-400 text-[11px] block">{t('availableStock')}</span>
                  <span className={`font-mono font-bold ${totalStock <= settings.low_stock_threshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {totalStock} units
                  </span>
                </div>
              </div>
              {product.description && (
                <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                  "{product.description}"
                </p>
              )}
            </div>
          </div>

          {/* Qualities and Size/Weight Pricing Matrix */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">{t('qualitiesAndVariants')}</h3>
            </div>

            <div className="space-y-3">
              {product.qualities.map((quality) => (
                <div
                  key={quality.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      {quality.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {quality.variants.length} {quality.variants.length === 1 ? 'size' : 'sizes'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {quality.variants.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <span>{v.size_weight} {v.unit}</span>
                            {v.stock_quantity <= (v.min_stock_alert || settings.low_stock_threshold) && (
                              <span title="Low stock">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Cost: {settings.currency}{v.purchase_price}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm block">
                            {settings.currency}{v.selling_price}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stock: {v.stock_quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created: {new Date(product.created_at).toLocaleDateString()}
            </span>
            <span>Last Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('edit')}</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                  onDelete(product.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('delete')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onSell && (
              <button
                onClick={() => {
                  onSell(product);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t('addToInvoice')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
