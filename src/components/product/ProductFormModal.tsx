import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Layers,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { Product, ProductQuality, MeasurementUnit } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdate?: (product: Product) => void;
}

const COMMON_UNITS: MeasurementUnit[] = [
  'kg',
  'g',
  'L',
  'ml',
  'pcs',
  'dozen',
  'box',
  'packet',
  'ft',
  'in',
  'm',
  'yard',
];

const CATEGORIES = [
  'Grains & Rice',
  'Edible Oils',
  'Pulses & Lentils',
  'Beverages',
  'Flour & Bakery',
  'Spices & Seasoning',
  'Dairy & Eggs',
  'Snacks & Confectionery',
  'Personal Care',
  'Household & Cleaning',
  'General Grocery',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  onClose,
  onSave,
  onUpdate,
}) => {
  const { t, settings } = useApp();

  const [name, setName] = useState(initialProduct?.name || '');
  const [code, setCode] = useState(initialProduct?.code || `SKU-${Date.now().toString().slice(-6)}`);
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Grains & Rice');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url || '');

  // Qualities and size variants
  const [qualities, setQualities] = useState<ProductQuality[]>(
    initialProduct?.qualities || [
      {
        id: `q_${Date.now()}`,
        name: 'Standard Quality',
        variants: [
          {
            id: `v_${Date.now()}_1`,
            quality_id: `q_${Date.now()}`,
            size_weight: 1,
            unit: 'kg',
            purchase_price: 80,
            selling_price: 100,
            stock_quantity: 50,
            min_stock_alert: 10,
          },
        ],
      },
    ]
  );

  // Quality actions
  const handleAddQuality = () => {
    const qId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setQualities([
      ...qualities,
      {
        id: qId,
        name: `Quality ${qualities.length + 1}`,
        variants: [
          {
            id: `v_${Date.now()}_1`,
            quality_id: qId,
            size_weight: 1,
            unit: 'kg',
            purchase_price: 0,
            selling_price: 0,
            stock_quantity: 0,
            min_stock_alert: 10,
          },
        ],
      },
    ]);
  };

  const handleRemoveQuality = (qId: string) => {
    if (qualities.length <= 1) {
      alert('A product must contain at least one quality.');
      return;
    }
    setQualities(qualities.filter((q) => q.id !== qId));
  };

  const handleQualityNameChange = (qId: string, newName: string) => {
    setQualities(
      qualities.map((q) => (q.id === qId ? { ...q, name: newName } : q))
    );
  };

  // Variant actions
  const handleAddVariant = (qId: string) => {
    setQualities(
      qualities.map((q) => {
        if (q.id !== qId) return q;
        const lastVariant = q.variants[q.variants.length - 1];
        const newV = {
          id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          quality_id: qId,
          size_weight: lastVariant ? lastVariant.size_weight * 2 : 1,
          unit: lastVariant ? lastVariant.unit : 'kg',
          purchase_price: lastVariant ? lastVariant.purchase_price * 2 : 0,
          selling_price: lastVariant ? lastVariant.selling_price * 2 : 0,
          stock_quantity: 20,
          min_stock_alert: 10,
        };
        return { ...q, variants: [...q.variants, newV] };
      })
    );
  };

  const handleRemoveVariant = (qId: string, vId: string) => {
    setQualities(
      qualities.map((q) => {
        if (q.id !== qId) return q;
        if (q.variants.length <= 1) {
          alert('Each quality must have at least one size variant.');
          return q;
        }
        return { ...q, variants: q.variants.filter((v) => v.id !== vId) };
      })
    );
  };

  const handleVariantChange = (
    qId: string,
    vId: string,
    field: string,
    val: any
  ) => {
    setQualities(
      qualities.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          variants: q.variants.map((v) => {
            if (v.id !== vId) return v;
            return { ...v, [field]: val };
          }),
        };
      })
    );
  };

  // Image Upload / Sample URL simulation
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const payload = {
      business_id: settings.business_id,
      name: name.trim(),
      code: code.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: barcode.trim(),
      category: category || 'General Grocery',
      brand: brand.trim(),
      description: description.trim(),
      image_url: imageUrl,
      qualities,
    };

    if (initialProduct && onUpdate) {
      onUpdate({
        ...initialProduct,
        ...payload,
      });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white">
              {initialProduct ? t('editProduct') : t('addProduct')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-200">
          {/* Section A & B: Image & Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Image Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t('productImage')}
              </label>
              <div className="w-full h-40 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      <label className="p-2 rounded-lg bg-slate-800 text-white cursor-pointer hover:bg-slate-700 text-xs">
                        {t('uploadImage')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 text-xs"
                      >
                        {t('removeImage')}
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs text-slate-400 font-medium">
                      Click to upload photo
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Core Info Fields */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('productName')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Premium Miniket Rice"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('productCode')}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SKU Code"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('barcodeLabel')}
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Barcode (EAN-13 / UPC)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('brand')}
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand name (optional)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t('description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product specifications, source, packaging notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Section C: Product Qualities & Unlimited Variants */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  {t('qualitiesAndVariants')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddQuality}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addQuality')}</span>
              </button>
            </div>

            <div className="space-y-4">
              {qualities.map((quality, qIndex) => (
                <div
                  key={quality.id}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Quality #{qIndex + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={quality.name}
                      onChange={(e) => handleQualityNameChange(quality.id, e.target.value)}
                      placeholder="e.g., Premium / Grade-A / Standard"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveQuality(quality.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                      title="Remove this quality"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size / Weight Variants Table */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 px-1">
                      <span className="col-span-3">{t('sizeWeight')}</span>
                      <span className="col-span-2">{t('unit')}</span>
                      <span className="col-span-2">{t('purchasePrice')} (৳)</span>
                      <span className="col-span-2">{t('sellingPrice')} (৳)</span>
                      <span className="col-span-2">{t('stockQuantity')}</span>
                      <span className="col-span-1 text-center">Action</span>
                    </div>

                    {quality.variants.map((v) => (
                      <div
                        key={v.id}
                        className="grid grid-cols-12 gap-2 items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                      >
                        {/* Size/Weight Number */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            required
                            value={v.size_weight}
                            onChange={(e) =>
                              handleVariantChange(
                                quality.id,
                                v.id,
                                'size_weight',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        {/* Measurement Unit */}
                        <div className="col-span-2">
                          <select
                            value={v.unit}
                            onChange={(e) =>
                              handleVariantChange(quality.id, v.id, 'unit', e.target.value)
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Purchase Price */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={v.purchase_price}
                            onChange={(e) =>
                              handleVariantChange(
                                quality.id,
                                v.id,
                                'purchase_price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        {/* Selling Price */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            required
                            value={v.selling_price}
                            onChange={(e) =>
                              handleVariantChange(
                                quality.id,
                                v.id,
                                'selling_price',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold"
                          />
                        </div>

                        {/* Stock Qty */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={v.stock_quantity}
                            onChange={(e) =>
                              handleVariantChange(
                                quality.id,
                                v.id,
                                'stock_quantity',
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        {/* Delete variant */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(quality.id, v.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Remove size"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddVariant(quality.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 mt-2 px-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('addSizeWeight')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
