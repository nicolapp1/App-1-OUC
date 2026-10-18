/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { OasisLogo } from '../components/common/OasisLogo';

export const SplashScreen: React.FC = () => {
  const { navigateTo, isLoggedIn } = useFleet();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigateTo('dashboard');
      } else {
        navigateTo('login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigateTo]);

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-between p-6 sm:p-8 text-center select-none relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FFE3CC]/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#F47B20]/10 blur-3xl pointer-events-none" />

      <div className="w-full pt-4 sm:pt-8" />

      {/* Center Brand Identity with clean responsive layout */}
      <div className="w-full max-w-sm px-4 flex flex-col items-center justify-center my-auto animate-in fade-in zoom-in-95 duration-500">
        <OasisLogo
          size="lg"
          showSubtitle
          showSlogan={false}
          showContacts={false}
          className="w-full drop-shadow-xs"
        />

        <div className="mt-5 text-center">
          <span className="inline-block text-[11px] font-black tracking-widest uppercase px-3.5 py-1 bg-[#5A3825] text-white rounded-full shadow-xs">
            OASIS FLOTA
          </span>
          <p className="text-xs font-semibold text-[#7A4E32] mt-2 tracking-wide">
            Gestión Integral de Flota y Despachos
          </p>
        </div>

        {/* Animated Loading Dots */}
        <div className="mt-7 flex items-center justify-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#F47B20] animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#F47B20] animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#F47B20] animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      {/* Footer corporate notice */}
      <div className="pb-4 sm:pb-6 text-center">
        <span className="text-xs font-black text-[#5A3825] tracking-wider uppercase block">
          Ferretería El Oasis S.A.S.
        </span>
        <p className="text-[11px] text-stone-500 mt-0.5">
          La Venta, Cajibío, Cauca · Colombia
        </p>
        <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
          Oasis Flota v2.4 · Sistema Operativo de Transporte
        </span>
      </div>
    </div>
  );
};
