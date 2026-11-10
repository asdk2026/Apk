import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AndroidWebModal } from './AndroidWebModal';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={
          className ||
          (variant === 'compact'
            ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all shadow-xs'
            : 'w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-lg border border-emerald-500/30 transition-all')
        }
        title="Install Android & Web App"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">
          {variant === 'compact' ? 'App' : 'Android & Web App'}
        </span>
      </button>

      <AndroidWebModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
