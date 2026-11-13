import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ProductFormModal } from './ProductFormModal';

interface ProductManagementProps {
  onOpenPosWithProduct?: (prod: Product) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ onOpenPosWithProduct }) => {
  const {
    t,
    settings,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    setActiveModule,
    hasActionPermission,
  } = useApp();

  const canAddEdit = hasActionPermission('canAddEditProduct');
  const canDelete = hasActionPermission('canDeleteProduct');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedQualityFilter, setSelectedQualityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'>('name_asc');

  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Categories & Qualities list for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const allQualityNames = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.qualities.forEach((q) => set.add(q.name));
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (
        selectedQualityFilter !== 'All' &&
        !p.qualities.some((qual) => qual.name === selectedQualityFilter)
      ) {
        return false;
      }
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

    // Sorting
    list = [...list].sort((a, b) => {
      const minPriceA = Math.min(...a.qualities.flatMap((q) => q.variants.map((v) => v.selling_price)));
      const minPriceB = Math.min(...b.qualities.flatMap((q) => q.variants.map((v) => v.selling_price)));

      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price_asc') return minPriceA - minPriceB;
      if (sortBy === 'price_desc') return minPriceB - minPriceA;
      return 0;
    });

    return list;
  }, [products, searchQuery, selectedCategory, selectedQualityFilter, sortBy]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>{t('product')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-variant inventory, price bases, SKU barcodes, and measurement units.
          </p>
        </div>

        {canAddEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, barcode, size..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? t('allCategories') : c}
                </option>
              ))}
            </select>
          </div>

          {/* Quality filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedQualityFilter}
              onChange={(e) => setSelectedQualityFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {allQualityNames.map((q) => (
                <option key={q} value={q}>
                  {q === 'All' ? t('allQualities') : q}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low-High)</option>
              <option value="price_desc">Price (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid / Table */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search filters or click "+ Add New Product" to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const totalStock = product.qualities.reduce(
              (acc, q) => acc + q.variants.reduce((vAcc, v) => vAcc + v.stock_quantity, 0),
              0
            );

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between shadow-xs transition-all group"
              >
                <div>
                  {/* Top Image + Info Header */}
                  <div className="flex gap-3 items-start mb-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-7 h-7 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {product.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {product.barcode || 'NO BARCODE'}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white truncate mt-1 group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-xs text-slate-400 truncate block">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Qualities & Size Variants Preview */}
                  <div className="space-y-2 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                      <span className="font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {product.qualities.length} {product.qualities.length === 1 ? 'Quality' : 'Qualities'}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        Stock: {totalStock}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {product.qualities.slice(0, 2).map((q) => (
                        <div key={q.id}>
                          <span className="text-[11px] font-semibold text-slate-300 block">
                            {q.name}:
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {q.variants.map((v) => (
                              <span
                                key={v.id}
                                className="inline-block bg-slate-900 border border-slate-700/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-300"
                              >
                                {v.size_weight}{v.unit} - <strong className="text-emerald-400">{settings.currency}{v.selling_price}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {product.qualities.length > 2 && (
                        <span className="text-[10px] text-emerald-400 block pt-0.5">
                          +{product.qualities.length - 2} more qualities
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewProduct(product)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title={t('view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canAddEdit && (
                      <>
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300"
                          title={t('edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(product.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title={t('duplicate')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete product ${product.name}?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenPosWithProduct) {
                        onOpenPosWithProduct(product);
                      } else {
                        setActiveModule('invoice');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                  >
                    POS Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details View Modal */}
      {viewProduct && (
        <ProductDetailsModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={(prod) => {
            setViewProduct(null);
            setEditProduct(prod);
          }}
          onDelete={(id) => {
            deleteProduct(id);
            setViewProduct(null);
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

      {/* Add / Edit Form Modal */}
      {(showAddModal || editProduct) && (
        <ProductFormModal
          initialProduct={editProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditProduct(null);
          }}
          onSave={(data) => addProduct(data)}
          onUpdate={(prod) => updateProduct(prod)}
        />
      )}
    </div>
  );
};
