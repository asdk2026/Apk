import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
  User,
  LockKeyhole,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROOT_ADMIN_EMAIL } from '../../utils/permissions';

export const FirebaseAuthGate: React.FC = () => {
  const {
    loginWithEmail,
    loginWithGoogle,
    bootstrapRootAdmin,
    authError,
    clearAuthError,
    language,
    setLanguage,
    settings,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'root_setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('Primary Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const displayError = localError || authError;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const res = await loginWithEmail(email, password);
    setSubmitting(false);
    if (!res.success && res.error) {
      setLocalError(res.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setSuccessMsg(null);
    setSubmitting(true);
    const res = await loginWithGoogle();
    setSubmitting(false);
    if (!res.success && res.error) {
      setLocalError(res.error);
    }
  };

  const handleRootAdminBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setSuccessMsg(null);

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const res = await bootstrapRootAdmin(ROOT_ADMIN_EMAIL, password, adminName);
    setSubmitting(false);
    if (res.success) {
      setSuccessMsg('Root Admin account initialized in Firebase!');
    } else if (res.error) {
      setLocalError(res.error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Subtle decorative radial accent */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08),transparent_60%)]" />

      {/* Top right language switch */}
      <div className="fixed top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-5 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            BM
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {settings.business_name || 'Business Mind'}
          </h1>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'ফায়ারবেস অ্যাডমিন নিয়ন্ত্রিত লগইন সিস্টেম'
              : 'Firebase Admin-Controlled Authentication & RBAC'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Admin-only Registration Notice */}
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-xs">
            <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 block">
                {language === 'bn' ? 'শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট খুলতে পারবেন' : 'Admin-Only Account Creation'}
              </strong>
              <span className="text-[11px] text-slate-300">
                {language === 'bn'
                  ? 'পাবলিক সাইন-আপ বন্ধ আছে। অ্যাডমিনের তৈরি করা ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।'
                  : 'Public registration is disabled. Sign in with credentials issued by your Administrator.'}
              </span>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/50 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-3 transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'bn' ? 'স্টাফ / অ্যাডমিন লগইন' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('root_setup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`py-3 transition-colors border-b-2 ${
                mode === 'root_setup'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'bn' ? 'প্রাথমিক অ্যাডমিন সেটআপ' : 'Root Admin Setup'}
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {displayError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{displayError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'login' ? (
              <>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@example.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">
                      {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>
                      {submitting
                        ? language === 'bn'
                          ? 'যাচাই করা হচ্ছে...'
                          : 'Signing In...'
                        : language === 'bn'
                        ? 'সাইন ইন করুন'
                        : 'Sign In'}
                    </span>
                  </button>
                </form>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Or Authorized Google Account
                  </span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-white border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Continue with Google (Admin / Authorized Staff)</span>
                </button>
              </>
            ) : (
              /* Strictly locked Root Admin one-time setup */
              <form onSubmit={handleRootAdminBootstrap} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  {language === 'bn'
                    ? `প্রথমবার ব্যবহারের জন্য রুট অ্যাডমিন (${ROOT_ADMIN_EMAIL}) হিসেবে ফায়ারবেস পাসওয়ার্ড সেট করুন। একবার তৈরি হলে আর এখান থেকে অ্যাকাউন্ট খোলা যাবে না।`
                    : `Initialize the primary Root Admin (${ROOT_ADMIN_EMAIL}) Firebase Auth password once. Other accounts can only be created inside the Admin Panel after login.`}
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Root Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      readOnly
                      value={ROOT_ADMIN_EMAIL}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-emerald-300 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Admin Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Set Root Admin Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create strong password"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'Creating Root Admin...' : 'Initialize Root Admin Account'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
