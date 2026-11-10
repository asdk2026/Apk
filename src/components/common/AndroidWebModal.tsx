import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Smartphone,
  Globe,
  Download,
  CheckCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Zap,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

interface AndroidWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidWebModal: React.FC<AndroidWebModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<'install' | 'apk_guide' | 'features'>('install');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const bubblewrapCode = `# 1. Install official Google Bubblewrap CLI
npm i -g @bubblewrap/cli

# 2. Initialize Android project from this PWA
bubblewrap init --manifest=${window.location.origin}/manifest.webmanifest

# 3. Build signed Android APK or Play Store AAB
bubblewrap build`;

  const capacitorCode = `# 1. Install Capacitor Android
npm i @capacitor/core @capacitor/android
npx cap init "Business Mind" "com.businessmind.app"

# 2. Add Android native platform
npx cap add android

# 3. Sync & open in Android Studio
npm run build
npx cap sync
npx cap open android`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Business Mind for Android & Web
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isInstalled ? 'Installed / Standalone' : isAndroid ? 'Android Detected' : 'Cross-Platform'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-featured offline-first retail ERP built for Android phones, tablets, and desktop browsers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Tap Install (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk_guide')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'apk_guide'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Build Android APK / AAB</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Android Capabilities</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* TAB 1: 1-Tap Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {/* Direct Install CTA banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Instant Home Screen Install</span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Install as a standalone app on your Android device or PC. Launches fullscreen with zero browser address bars.
                  </p>
                </div>

                {isInstalled ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    <span>Already Installed!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) onClose();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App Now</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    Use Chrome menu &rarr; <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>
                  </div>
                )}
              </div>

              {/* Step by step for Android & Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>Android Phone & Tablet</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Open this URL in Google Chrome on your Android device.</li>
                    <li>Tap the <strong>three dots (⋮)</strong> at the top right of Chrome.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>The Business Mind icon appears on your Android launcher and operates offline!</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Desktop Web (Chrome / Edge / Mac)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Look for the <strong>Install icon (⊕)</strong> on the right side of your browser URL bar.</li>
                    <li>Click <strong>Install</strong> to add Business Mind to your Desktop/Taskbar.</li>
                    <li>Runs in an isolated native window with full keyboard shortcuts and local storage.</li>
                  </ol>
                </div>
              </div>

              {/* Status Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-semibold text-white block">PWA Verification Status</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Manifest v3 Valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Service Worker Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>192px & 512px Icons</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>IndexedDB Offline</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Build Android APK / AAB */}
          {activeTab === 'apk_guide' && (
            <div className="space-y-4">
              <p className="text-slate-300 text-xs">
                To package Business Mind as a standalone Android APK (for sideloading) or Google Play Store AAB, you can use Google's official <strong>Bubblewrap (TWA)</strong> or <strong>Capacitor</strong>:
              </p>

              {/* Method 1: Google Bubblewrap (Recommended for PWA) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Method 1 (Recommended)
                    </span>
                    <span className="font-bold text-white text-xs">Google Bubblewrap (Trusted Web Activity)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(bubblewrapCode, 'bubblewrap')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copiedCmd === 'bubblewrap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'bubblewrap' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                  {bubblewrapCode}
                </pre>
                <p className="text-[11px] text-slate-400">
                  Bubblewrap packages this web app into a certified Android Studio project with full hardware camera access and offline caching.
                </p>
              </div>

              {/* Method 2: Capacitor Native Android */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      Method 2
                    </span>
                    <span className="font-bold text-white text-xs">Capacitor Native Android Build</span>
                  </div>
                  <button
                    onClick={() => handleCopy(capacitorCode, 'capacitor')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copiedCmd === 'capacitor' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCmd === 'capacitor' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-blue-300 overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                  {capacitorCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Features & Capabilities */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <HardDrive className="w-4 h-4" />
                  <span>100% Offline Architecture</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Every product, invoice, customer, and stock transaction is stored locally in IndexedDB. Sales and checkout work seamlessly without an internet connection.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Android Camera Barcode Scanner</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Utilizes standard WebRTC camera APIs on Android smartphones and tablets for live continuous barcode scanning directly into POS invoices.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Responsive Mobile Bottom Bar</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  On Android mobile screens (&lt; 1024px), a fixed bottom thumb-navigation bar provides 1-tap switching between Home, Products, POS, and More.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automatic Cloud Synchronization</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  As soon as your Android phone reconnects to Wi-Fi or mobile data (4G/5G), pending offline transactions sync securely to the cloud.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Package: <code className="text-emerald-400 font-mono">com.businessmind.app</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
