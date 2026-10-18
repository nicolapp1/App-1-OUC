/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useFleet();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-[#5A3825] text-white border-stone-800',
    warning: 'bg-[#FFF8F2] text-[#5A3825] border-[#F47B20]',
    error: 'bg-rose-50 text-rose-900 border-rose-300',
    info: 'bg-stone-900 text-white border-stone-800',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  const iconColor = {
    success: 'text-[#F47B20]',
    warning: 'text-[#F47B20]',
    error: 'text-rose-600',
    info: 'text-amber-400',
  }[toast.type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm pointer-events-none transition-all duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl shadow-black/10 ${bgStyles}`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
        <span className="text-xs font-semibold leading-snug">{toast.text}</span>
      </div>
    </div>
  );
};
