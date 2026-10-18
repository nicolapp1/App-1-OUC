/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-3xl border border-stone-100 shadow-xs my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF8F2] flex items-center justify-center text-[#F47B20] mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-[#5A3825] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-stone-500 max-w-xs mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="py-2.5 px-5 bg-[#F47B20] hover:bg-[#E06810] text-white font-bold text-xs rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-98 transition-transform min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
