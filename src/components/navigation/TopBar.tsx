/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { ArrowLeft, Bell, Smartphone, Monitor } from 'lucide-react';
import { OasisLogo } from '../common/OasisLogo';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  onBack,
  subtitle,
  rightAction,
}) => {
  const {
    currentScreen,
    goBack,
    navigateTo,
    kpis,
    viewportMode,
    setViewportMode,
    user,
  } = useFleet();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const isHome = currentScreen === 'dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3 min-h-[56px] transition-all">
      {/* Left Slot: Back button or Company Logo + Title */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 -ml-1 flex items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 active:scale-95 transition-transform shrink-0"
            aria-label="Regresar"
          >
            <ArrowLeft className="w-5 h-5 text-[#5A3825]" />
          </button>
        ) : isHome ? (
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center shrink-0 active:scale-95 transition-transform"
            aria-label="Ir a inicio"
          >
            <OasisLogo variant="icon-only" size="sm" />
          </button>
        ) : null}

        {/* Center / Page Title */}
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <h1 className="text-sm sm:text-base font-black text-[#5A3825] leading-tight truncate">
            {title || 'Oasis Flota'}
          </h1>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium leading-tight truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right Slot: Custom action OR Notification & Profile triggers */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {rightAction ? (
          rightAction
        ) : (
          <>
            {/* Viewport switch tool for testing ease (only when wide viewport) */}
            <button
              onClick={() => setViewportMode(viewportMode === 'mobile' ? 'responsive' : 'mobile')}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors"
              title={viewportMode === 'mobile' ? 'Cambiar a vista expandida' : 'Cambiar a vista móvil (390px)'}
            >
              {viewportMode === 'mobile' ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-[#F47B20]" />
                  <span>Expandir</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#5A3825]" />
                  <span>390px</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigateTo('notifications')}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 active:scale-95 transition-transform"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-stone-700" />
              {kpis.unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-[#F47B20] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {kpis.unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar button */}
            <button
              onClick={() => navigateTo('profile')}
              className="w-9 h-9 rounded-xl bg-[#5A3825] text-white font-bold text-xs flex items-center justify-center hover:opacity-95 active:scale-95 ring-2 ring-[#FFE3CC] transition-transform ml-0.5"
              title="Mi Perfil"
            >
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
