/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  DollarSign,
  Calendar,
  Truck,
  Trash2,
  FileText,
  Paperclip,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm } from '../utils/formatters';

export const BreakdownDetailScreen: React.FC = () => {
  const {
    selectedBreakdownId,
    breakdowns,
    trucks,
    solveBreakdown,
    deleteBreakdown,
    goBack,
    navigateTo,
  } = useFleet();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [solveModalOpen, setSolveModalOpen] = useState(false);

  // Solve form state
  const [solutionDescription, setSolutionDescription] = useState('Reparación exitosa con piezas originales');
  const [workshop, setWorkshop] = useState('Taller Diésel Los Andes');
  const [repairCostCop, setRepairCostCop] = useState<number>(450000);
  const [solutionDate, setSolutionDate] = useState('2026-10-09');

  const breakdown = breakdowns.find((b) => b.id === selectedBreakdownId) || breakdowns[0];

  if (!breakdown) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-stone-500">Avería no encontrada.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-[#F47B20] text-white rounded-xl text-xs">
          Regresar
        </button>
      </div>
    );
  }

  const truck = trucks.find((t) => t.id === breakdown.truckId);
  const truckOtherBreakdowns = breakdowns.filter((b) => b.truckId === breakdown.truckId && b.id !== breakdown.id);

  const handleSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solveBreakdown(breakdown.id, {
      solutionDescription,
      workshop,
      repairCostCop: Number(repairCostCop),
      solutionDate,
    });
    setSolveModalOpen(false);
  };

  const handleDelete = () => {
    deleteBreakdown(breakdown.id);
    goBack();
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title={`Avería: ${breakdown.type}`}
        subtitle={`Camión ${truck?.plate || '—'}`}
        showBack
        onBack={goBack}
        rightAction={
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* MAIN STATUS CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black text-xs">
                {truck?.plate}
              </span>
              <span className="text-xs font-bold text-[#5A3825]">
                {breakdown.type}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                Gravedad: {breakdown.severity}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  breakdown.status === 'Solucionada'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {breakdown.status}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
              Descripción de la falla
            </span>
            <p className="text-xs text-stone-800 leading-relaxed bg-[#FFF8F2] p-3 rounded-2xl border border-[#FFE3CC]">
              {breakdown.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-stone-50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-500 block">Fecha del reporte</span>
              <span className="font-bold text-[#2B2B2B]">{formatDateCO(breakdown.date)}</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-500 block">Odómetro al fallar</span>
              <span className="font-bold text-[#2B2B2B]">{formatKm(breakdown.mileage)}</span>
            </div>
          </div>

          {breakdown.attachmentName && (
            <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-stone-50 p-2.5 rounded-2xl">
              <Paperclip className="w-4 h-4 text-[#F47B20]" />
              <span>Evidencia: {breakdown.attachmentName}</span>
            </div>
          )}

          {breakdown.status !== 'Solucionada' && (
            <div className="pt-2">
              <button
                onClick={() => setSolveModalOpen(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar Avería como Solucionada</span>
              </button>
            </div>
          )}
        </div>

        {/* SOLUTION DETAILS (IF SOLVED) */}
        {breakdown.status === 'Solucionada' && (
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Resolución y Reparación Completada
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-bold block mb-0.5">
                  Trabajo realizado:
                </span>
                <p className="text-stone-800 font-medium">
                  {breakdown.solutionDescription || 'Mantenimiento correctivo aplicado.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 p-2.5 rounded-2xl">
                  <span className="text-[10px] text-stone-500 block">Taller / Responsable</span>
                  <span className="font-bold text-[#2B2B2B]">
                    {breakdown.workshop || 'Taller autorizado'}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-2xl">
                  <span className="text-[10px] text-stone-500 block">Costo de Reparación</span>
                  <span className="font-black text-[#5A3825] tabular-nums">
                    {formatCOP(breakdown.repairCostCop || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHRONOLOGICAL TRUCK BREAKDOWN HISTORY */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-[#F47B20]" />
            Historial de Averías de este Camión ({truckOtherBreakdowns.length + 1})
          </h3>

          <div className="divide-y divide-stone-100">
            {truckOtherBreakdowns.length === 0 ? (
              <p className="text-xs text-stone-400">No hay otros reportes históricos para este vehículo.</p>
            ) : (
              truckOtherBreakdowns.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigateTo('breakdown_detail', { breakdownId: b.id })}
                  className="py-2.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-[#2B2B2B] block">
                      {b.type} · {formatDateCO(b.date)}
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                      {b.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SOLVE MODAL */}
      {solveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#5A3825] mb-1">
              Finalizar Reparación de Avería
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Registra la solución técnica, taller y costo antes de habilitar el camión nuevamente.
            </p>

            <form onSubmit={handleSolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Descripción de la solución *
                </label>
                <textarea
                  rows={2}
                  required
                  value={solutionDescription}
                  onChange={(e) => setSolutionDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Taller o responsable
                  </label>
                  <input
                    type="text"
                    required
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Costo de reparación ($ COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={repairCostCop}
                    onChange={(e) => setRepairCostCop(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSolveModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Confirmar Solución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Deseas eliminar este registro de avería?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
