import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  MoreHorizontal,
  History,
  Users,
  Boxes,
  Truck,
  CreditCard,
  TrendingUp,
  BarChart3,
  ScanBarcode,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNavigationModule } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeModule, setActiveModule, t } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreModules: { id: AppNavigationModule; labelKey: keyof typeof import('../../utils/i18n').translations['en']; icon: React.ElementType }[] = [
    { id: 'sales_history', labelKey: 'salesHistory', icon: History },
    { id: 'customers', labelKey: 'customers', icon: Users },
    { id: 'stock', labelKey: 'stock', icon: Boxes },
    { id: 'purchases', labelKey: 'purchases', icon: Truck },
    { id: 'due', labelKey: 'due', icon: CreditCard },
    { id: 'pnl', labelKey: 'pnl', icon: TrendingUp },
    { id: 'reports', labelKey: 'reports', icon: BarChart3 },
    { id: 'barcode', labelKey: 'barcode', icon: ScanBarcode },
    { id: 'expenses', labelKey: 'expenses', icon: Wallet },
  ];

  const handleSelect = (mod: AppNavigationModule) => {
    setActiveModule(mod);
    setShowMoreMenu(false);
  };

  const isMoreActive = moreModules.some((m) => m.id === activeModule);

  return (
    <>
      {/* More Bottom Sheet Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 text-sm">{t('more')}</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-3">
              {moreModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center min-h-[72px] ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-medium leading-tight line-clamp-1">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden px-2 py-1 flex items-center justify-around h-16 safe-area-pb">
        {/* Home */}
        <button
          onClick={() => setActiveModule('home')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeModule === 'home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">{t('home')}</span>
        </button>

        {/* Product */}
        <button
          onClick={() => setActiveModule('product')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeModule === 'product' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">{t('product')}</span>
        </button>

        {/* Invoice POS Highlighted CTA */}
        <button
          onClick={() => setActiveModule('invoice')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative ${
            activeModule === 'invoice' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg -mt-4 ring-4 ring-slate-900 font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold mt-0.5">{t('invoice')}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveModule('settings')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeModule === 'settings' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">{t('settings')}</span>
        </button>

        {/* More */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            isMoreActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">{t('more')}</span>
        </button>
      </nav>
    </>
  );
};
