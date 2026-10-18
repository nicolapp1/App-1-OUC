/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = '¿Deseas eliminar este registro?',
  message = 'Esta acción eliminará permanentemente la información seleccionada del sistema de flota.',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#5A3825] text-center mb-2">
          {title}
        </h3>
        <p className="text-xs text-stone-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 active:scale-98 transition-colors min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs active:scale-98 transition-colors min-h-[44px] ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                : 'bg-[#F47B20] hover:bg-[#E06810]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
