import React, { useState, useRef, useEffect } from 'react';
import {
  ScanBarcode,
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductQuality, ProductVariant } from '../../types';

interface BarcodeScannerViewProps {
  onAddProductToInvoice?: (
    product: Product,
    quality: ProductQuality,
    variant: ProductVariant
  ) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({
  onAddProductToInvoice,
}) => {
  const { t, settings, products, setActiveModule } = useApp();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Matched Result
  const [foundMatch, setFoundMatch] = useState<{
    product: Product;
    quality: ProductQuality;
    variant: ProductVariant;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Search local database for barcode
  const handleBarcodeLookup = (codeToSearch: string) => {
    const raw = codeToSearch.trim();
    if (!raw) return;
    setHasSearched(true);

    let match: {
      product: Product;
      quality: ProductQuality;
      variant: ProductVariant;
    } | null = null;

    // Check variant barcodes first, then product level barcode or code
    for (const prod of products) {
      if (prod.barcode === raw || prod.code.toLowerCase() === raw.toLowerCase()) {
        const q = prod.qualities[0];
        const v = q?.variants[0];
        if (q && v) {
          match = { product: prod, quality: q, variant: v };
          break;
        }
      }

      for (const qual of prod.qualities) {
        for (const v of qual.variants) {
          if (v.barcode === raw) {
            match = { product: prod, quality: qual, variant: v };
            break;
          }
        }
        if (match) break;
      }
      if (match) break;
    }

    setFoundMatch(match);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBarcodeLookup(barcodeInput);
  };

  // Quick Barcode Chips (for easy testing without physical camera)
  const quickTestBarcodes = [
    { label: '89411001 (Miniket Rice)', code: '89411001' },
    { label: '89411002 (Soybean Oil)', code: '89411002' },
    { label: '89411003 (Masoor Dal)', code: '89411003' },
    { label: '89411004 (Mirzapore Tea)', code: '89411004' },
    { label: '89411005 (Teer Atta)', code: '89411005' },
  ];

  // Camera Barcode Scanning lifecycle
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Camera stream unavailable or permission denied. You can enter or scan via USB barcode reader below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ScanBarcode className="w-6 h-6 text-emerald-400" />
          <span>{t('barcodeScanner')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan product barcodes with phone camera or external Bluetooth/USB laser scanners for instant POS lookup.
        </p>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Box: Camera or Manual Entry */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-xs text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Camera & Laser Scanner Interface</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
              Offline Ready
            </span>
          </div>

          {/* Camera Viewfinder */}
          <div className="relative w-full h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Red laser target line */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                <div className="absolute bottom-2 inset-x-2 text-center text-[10px] text-white bg-black/60 py-1 rounded backdrop-blur-xs">
                  Position barcode inside the target box
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <ScanBarcode className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Camera is inactive</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tap below to activate mobile camera or type barcode</p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              {cameraError}
            </p>
          )}

          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t('cameraScan')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors border border-rose-500/30"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* Manual / USB Scanner Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400">
              {t('enterOrScanBarcode')}
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan with USB reader or type barcode..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-20 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              >
                Lookup
              </button>
            </div>
          </form>

          {/* Quick Demo Barcodes for easy testing */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 font-semibold block">Quick Test Samples:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickTestBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setBarcodeInput(item.code);
                    handleBarcodeLookup(item.code);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors border border-slate-700/60"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Box: Scan Result Details */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="font-semibold text-xs text-white">Match Information</span>
              {foundMatch && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('productFound')}
                </span>
              )}
            </div>

            {!hasSearched ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                Scan or enter any product barcode to preview pricing, variant stock, and add directly to POS invoice.
              </div>
            ) : !foundMatch ? (
              <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300 font-semibold">{t('productNotFound')}</p>
                <p className="text-[11px] text-slate-400">
                  Barcode "{barcodeInput}" is not assigned to any inventory item.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Product matched card */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {foundMatch.product.image_url ? (
                        <img
                          src={foundMatch.product.image_url}
                          alt={foundMatch.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-7 h-7 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {foundMatch.product.code}
                      </span>
                      <h3 className="font-bold text-sm text-white truncate">
                        {foundMatch.product.name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {foundMatch.product.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-700">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('qualityName')}</span>
                      <span className="font-semibold text-emerald-300">{foundMatch.quality.name}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('sizeWeight')}</span>
                      <span className="font-bold text-white font-mono">
                        {foundMatch.variant.size_weight} {foundMatch.variant.unit}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('sellingPrice')}</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {settings.currency}{foundMatch.variant.selling_price}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('availableStock')}</span>
                      <span className="font-bold text-white font-mono">
                        {foundMatch.variant.stock_quantity} units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available other sizes for this product */}
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">All Variants in Catalog:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {foundMatch.product.qualities.flatMap((q) =>
                      q.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300"
                        >
                          {q.name} ({v.size_weight} {v.unit}) - {settings.currency}{v.selling_price}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action button */}
          {foundMatch && (
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (onAddProductToInvoice) {
                    onAddProductToInvoice(
                      foundMatch.product,
                      foundMatch.quality,
                      foundMatch.variant
                    );
                  }
                  setActiveModule('invoice');
                }}
                className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToInvoice')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
