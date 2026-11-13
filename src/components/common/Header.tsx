import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  CloudCheck,
  CloudAlert,
  Bell,
  Languages,
  X,
  Package,
  Layers,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface HeaderProps {
  onSelectProduct?: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectProduct }) => {
  const {
    t,
    settings,
    isOnline,
    syncStatus,
    triggerSyncNow,
    notifications,
    dismissNotification,
    language,
    setLanguage,
    products,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveModule,
    currentUser,
    setShowLoginModal,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products by name, quality, size/weight, barcode, code
  const searchResults = React.useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return [];

    return products.filter((prod) => {
      if (prod.name.toLowerCase().includes(q)) return true;
      if (prod.code.toLowerCase().includes(q)) return true;
      if (prod.barcode && prod.barcode.toLowerCase().includes(q)) return true;
      if (prod.category.toLowerCase().includes(q)) return true;
      // Search in qualities and variants
      for (const quality of prod.qualities) {
        if (quality.name.toLowerCase().includes(q)) return true;
        for (const v of quality.variants) {
          if (String(v.size_weight).includes(q) || v.unit.toLowerCase().includes(q)) return true;
          if (v.barcode && v.barcode.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [products, globalSearchQuery]);

  const handleProductClick = (product: Product) => {
    setShowSearchResults(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      setActiveModule('product');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 text-slate-100">
      {/* Zone 1: Logo & Store Name */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
          BM
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight truncate max-w-[160px] sm:max-w-xs">
              {settings.business_name}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? t('syncStatusOnline') : t('syncStatusOffline')}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Global Search Bar */}
      <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-950 text-slate-200 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-xl border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-500"
          />
          {globalSearchQuery && (
            <button
              onClick={() => {
                setGlobalSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Dropdown */}
        {showSearchResults && globalSearchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{searchResults.length} {searchResults.length === 1 ? 'item found' : 'items found'}</span>
              <span className="text-[11px] text-slate-500">Tap to inspect or sell</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching product found for "{globalSearchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {searchResults.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-slate-800/70 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60 flex items-center justify-center">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">
                          {prod.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>
                          {prod.qualities.map((q) => q.name).join(' · ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                        {prod.qualities[0]?.variants[0] && (
                          <span className="text-emerald-400 font-medium">
                            {settings.currency}{prod.qualities[0].variants[0].selling_price} / {prod.qualities[0].variants[0].size_weight} {prod.qualities[0].variants[0].unit}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          Stock: {prod.qualities.reduce((acc, q) => acc + q.variants.reduce((vAcc, v) => vAcc + v.stock_quantity, 0), 0)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: Account, Sync Button, Language Switcher, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Firebase Account & Permissions Button */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          title={
            currentUser
              ? `Signed in as ${currentUser.name} (${currentUser.role})`
              : 'Account & Access'
          }
        >
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] flex items-center justify-center border border-emerald-500/40">
                {currentUser.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="font-semibold text-white max-w-[90px] truncate hidden sm:inline">
                {currentUser.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 hover:text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Account</span>
            </div>
          )}
        </button>

        {/* Sync Status Button */}
        <button
          onClick={triggerSyncNow}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
          title="Cloud Synchronization"
        >
          {syncStatus === 'synced' ? (
            <CloudCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <CloudAlert className="w-4 h-4 text-amber-400" />
          )}
          <span className="hidden sm:inline">
            {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? t('syncStatusSynced') : t('syncNow')}
          </span>
        </button>

        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
          title="Switch Language (ভাষা পরিবর্তন)"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">{language === 'en' ? 'বাং' : 'EN'}</span>
        </button>

        {/* Notifications Icon & Drawer */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-semibold text-white">{t('notifications')}</span>
                <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No new notifications</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="text-slate-200 leading-tight">{n.title}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
