import React from 'react';
import {
  LayoutDashboard,
  Package,
  Receipt,
  History,
  Users,
  Boxes,
  Truck,
  CreditCard,
  TrendingUp,
  BarChart3,
  ScanBarcode,
  Wallet,
  Settings,
  CloudCheck,
  CloudAlert,
  Languages,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNavigationModule } from '../../types';

interface NavItem {
  id: AppNavigationModule;
  labelKey: keyof typeof import('../../utils/i18n').translations['en'];
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'home', icon: LayoutDashboard },
  { id: 'product', labelKey: 'product', icon: Package },
  { id: 'invoice', labelKey: 'invoice', icon: Receipt },
  { id: 'sales_history', labelKey: 'salesHistory', icon: History },
  { id: 'customers', labelKey: 'customers', icon: Users },
  { id: 'stock', labelKey: 'stock', icon: Boxes },
  { id: 'purchases', labelKey: 'purchases', icon: Truck },
  { id: 'due', labelKey: 'due', icon: CreditCard },
  { id: 'pnl', labelKey: 'pnl', icon: TrendingUp },
  { id: 'reports', labelKey: 'reports', icon: BarChart3 },
  { id: 'barcode', labelKey: 'barcode', icon: ScanBarcode },
  { id: 'expenses', labelKey: 'expenses', icon: Wallet },
  { id: 'settings', labelKey: 'settings', icon: Settings },
  { id: 'admin', labelKey: 'adminPanel', icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    t,
    isOnline,
    syncStatus,
    triggerSyncNow,
    language,
    setLanguage,
    settings,
    currentUser,
    hasModuleAccess,
    setShowLoginModal,
  } = useApp();

  const visibleNavItems = NAV_ITEMS.filter((item) => hasModuleAccess(item.id));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-200 select-none shrink-0 h-screen sticky top-0">
      {/* Brand & Store Profile */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
            BM
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight text-white truncate">
              {settings.business_name || t('appName')}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {t('appTagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{t(item.labelKey)}</span>
              {item.id === 'invoice' && (
                <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  POS
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Staff Account & Admin Profile */}
      <div className="px-3 py-2 border-t border-slate-800/60 bg-slate-900/50">
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750 transition-colors text-left group"
          title="Manage Staff Accounts / Sign Out"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30 shrink-0">
            {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-white truncate group-hover:text-emerald-300">
                {currentUser ? currentUser.name : 'Not Signed In'}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono uppercase shrink-0">
                {currentUser ? currentUser.role : 'Guest'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {currentUser ? currentUser.email : ''}
            </p>
          </div>
        </button>
      </div>

      {/* Bottom Sync & Language Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{isOnline ? t('syncStatusOnline') : t('syncStatusOffline')}</span>
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            title="Switch Language"
          >
            <Languages className="w-3 h-3 text-emerald-400" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>

        <button
          onClick={triggerSyncNow}
          disabled={syncStatus === 'syncing'}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {syncStatus === 'synced' ? (
            <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CloudAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {syncStatus === 'syncing'
              ? 'Syncing...'
              : syncStatus === 'synced'
              ? t('syncStatusSynced')
              : t('syncNow')}
          </span>
        </button>
      </div>
    </aside>
  );
};
