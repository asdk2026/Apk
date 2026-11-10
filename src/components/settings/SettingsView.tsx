import React, { useState } from 'react';
import {
  Settings,
  Building,
  Languages,
  Moon,
  Sun,
  CloudCheck,
  CloudAlert,
  Database,
  Download,
  Upload,
  Shield,
  Receipt,
  Boxes,
  Save,
  CheckCircle,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../utils/i18n';
import { AndroidWebModal } from '../common/AndroidWebModal';

export const SettingsView: React.FC = () => {
  const {
    t,
    settings,
    updateSettings,
    language,
    setLanguage,
    theme,
    setTheme,
    isOnline,
    syncStatus,
    triggerSyncNow,
    syncLogs,
    exportDatabaseJson,
    importDatabaseJson,
    currentUser,
    users,
    setShowLoginModal,
  } = useApp();

  // Local form states
  const [businessName, setBusinessName] = useState(settings.business_name);
  const [ownerName, setOwnerName] = useState(settings.owner_name);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(settings.tax_rate);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoice_footer);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.low_stock_threshold);
  const [allowNegativeStock, setAllowNegativeStock] = useState(settings.allow_negative_stock);
  const [autoSync, setAutoSync] = useState(settings.auto_sync);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  // Active Role tab
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Admin' | 'Manager' | 'Sales Staff'>('Owner');

  // Save changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      business_name: businessName,
      owner_name: ownerName,
      phone,
      email,
      address,
      currency,
      tax_rate: taxRate,
      invoice_prefix: invoicePrefix,
      invoice_footer: invoiceFooter,
      low_stock_threshold: lowStockThreshold,
      allow_negative_stock: allowNegativeStock,
      auto_sync: autoSync,
    });
    alert('Settings saved successfully!');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusinessMind_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importDatabaseJson(text);
          if (success) {
            alert('Database restored successfully from JSON backup!');
            window.location.reload();
          } else {
            alert('Invalid backup file. Please provide a valid Business Mind JSON export.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>{t('settings')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business profile, language, appearance, offline cloud synchronization, and database backups.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section A: Business Profile */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">{t('businessProfile')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{t('ownerName')}</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{t('businessEmail')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">{t('businessAddress')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">{t('currency')}</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Tax / VAT (%)</label>
              <input
                type="number"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section B & C: Language & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Languages className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">{t('language')}</h3>
            </div>
            <p className="text-xs text-slate-400">
              Select your interface language (English or বাংলা).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                  language === 'en'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                  language === 'bn'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                বাংলা (Bengali)
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <h3 className="font-bold text-sm text-white">{t('appearance')}</h3>
            </div>
            <p className="text-xs text-slate-400">
              Toggle between high-contrast Dark charcoal and clean Light theme.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t('themeDark')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t('themeLight')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section D: Cloud Sync & Offline Architecture */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CloudCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">{t('cloudSync')}</h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isOnline ? 'Online / Cloud Ready' : 'Offline Mode Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Sync Status</span>
              <span className="font-semibold text-white mt-0.5 block capitalize">
                {syncStatus === 'synced' ? t('syncStatusSynced') : t('syncStatusPending')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Last Cloud Sync</span>
              <span className="font-mono text-slate-300 mt-0.5 block">
                {settings.last_sync_time ? new Date(settings.last_sync_time).toLocaleTimeString() : 'Pending'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">{t('autoSync')}</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  {autoSync ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSync(!autoSync)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  autoSync ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    autoSync ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400 max-w-md">
              Local changes are safely recorded in offline IndexedDB. When online, transactions automatically sync without duplication.
            </p>
            <button
              type="button"
              onClick={triggerSyncNow}
              disabled={syncStatus === 'syncing'}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
            >
              {syncStatus === 'syncing' ? 'Syncing...' : t('syncNow')}
            </button>
          </div>
        </div>

        {/* Section D2: Android & Web Application Deployment */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">{t('androidWebApp')}</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
              PWA & Native APK Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="text-slate-400 block text-[11px]">Target Platforms</span>
              <span className="font-semibold text-white block">Android, Web, Tablets</span>
              <span className="text-[10px] text-slate-500 block">Responsive layout + touch POS</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="text-slate-400 block text-[11px]">Offline Persistence</span>
              <span className="font-semibold text-emerald-400 block">100% IndexedDB Active</span>
              <span className="text-[10px] text-slate-500 block">Zero-latency offline sales</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="text-slate-400 block text-[11px]">Hardware Access</span>
              <span className="font-semibold text-teal-400 block">Camera Barcode Scanner</span>
              <span className="text-[10px] text-slate-500 block">Thermal receipt printing</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400 max-w-lg">
              {t('installAppDesc')} Includes Web App Manifest, Service Worker precaching, and Google Bubblewrap / Capacitor APK packaging guides.
            </p>
            <button
              type="button"
              onClick={() => setShowAndroidModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('installApp')}</span>
            </button>
          </div>
        </div>

        {/* Section E: Database Backup & Restore */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">{t('backupAndRestore')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white block">Export Database Backup</span>
              <p className="text-slate-400 text-[11px]">
                Download a complete, offline-safe JSON backup of your entire store catalog, invoices, and customers.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-650 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('exportBackup')}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <span className="font-bold text-white block">Import / Restore Backup</span>
              <p className="text-slate-400 text-[11px]">
                Upload a previously saved Business Mind JSON backup file to restore database records.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-650 text-white transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('importBackup')}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section F: Invoice & Stock Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Invoice Settings</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Stock Configuration</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Default Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-semibold text-white block">Allow Negative Stock</span>
                  <span className="text-[10px] text-slate-500">Allow sales even if stock count is zero</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowNegativeStock(!allowNegativeStock)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    allowNegativeStock ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      allowNegativeStock ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section H: Admin Panel Account & Staff Access Control */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Admin Panel Account & Staff Access</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              Sign In / Switch Staff Account
            </button>
          </div>

          {/* Active Administrator Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
                AA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Primary Admin Account</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    SUPER ADMIN
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px]">
                  <span className="text-slate-300 font-mono">
                    Username / Email: <strong className="text-white">abdullah286205@gmail.com</strong>
                  </span>
                  <span className="text-slate-400 font-mono">
                    Password: <strong className="text-emerald-400">123456</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Configured & Active</span>
              </span>
            </div>
          </div>

          {/* Staff Accounts Registered */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-300 block">Registered Staff Users</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{u.name}</span>
                    <span className="text-slate-400 text-[11px] font-mono block truncate">{u.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Roles Selector */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Role Permissions Matrix</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Owner', 'Admin', 'Manager', 'Sales Staff'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selectedRole === role
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs block">{role}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {role === 'Owner'
                      ? 'Full Root Access'
                      : role === 'Admin'
                      ? 'Managerial & Reports'
                      : role === 'Manager'
                      ? 'Stock & Inventory'
                      : 'POS Terminal Only'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t('save')} Configuration</span>
          </button>
        </div>
      </form>

      {/* Android & Web App Installation Modal */}
      <AndroidWebModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
      />
    </div>
  );
};
