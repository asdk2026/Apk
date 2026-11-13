import React from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  LogOut,
  X,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MODULE_PERMISSION_LIST, ACTION_PERMISSION_LIST } from '../../utils/permissions';

export const AdminLoginModal: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    logout,
    showLoginModal,
    setShowLoginModal,
    setActiveModule,
    language,
  } = useApp();

  if (!showLoginModal || !currentUser) return null;

  const isBn = language === 'bn';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isBn ? 'ফায়ারবেস অ্যাকাউন্ট ও অ্যাক্সেস' : 'Firebase Account & Access'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Real-Time Firestore RBAC Session
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLoginModal(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Currently Signed In
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>{currentUser.role}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white text-sm truncate">
                  {currentUser.name}
                </h3>
                <p className="text-slate-400 font-mono text-[11px] truncate">
                  {currentUser.email}
                </p>
                {currentUser.last_login && (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Active session since {new Date(currentUser.last_login).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Permissions Summary */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isBn ? 'আপনার অনুমোদিত মডিউল' : 'Permitted Modules'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MODULE_PERMISSION_LIST.map((mod) => {
                const allowed = isAdmin || Boolean(currentUser.permissions?.modules?.[mod.key]);
                return (
                  <span
                    key={mod.key}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border ${
                      allowed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 line-through'
                    }`}
                  >
                    {allowed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-600" />
                    )}
                    <span>{isBn ? mod.labelBn : mod.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {isBn ? 'অ্যাকশন পারমিশন' : 'Action Permissions'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTION_PERMISSION_LIST.map((act) => {
                const allowed = isAdmin || Boolean(currentUser.permissions?.actions?.[act.key]);
                return (
                  <span
                    key={act.key}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border ${
                      allowed
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 line-through'
                    }`}
                  >
                    {allowed ? (
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-600" />
                    )}
                    <span>{isBn ? act.labelBn : act.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveModule('admin');
                  setShowLoginModal(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>{isBn ? 'অ্যাডমিন প্যানেল খুলুন (ইউজার ও অ্যাক্সেস)' : 'Open Firebase Admin & Access Control'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                logout();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="flex-1 py-2.5 px-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
