/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  AlertTriangle,
  Wrench,
  DollarSign,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm } from '../utils/formatters';
import { BreakdownSeverity, BreakdownStatus } from '../types';

export const BreakdownsScreen: React.FC = () => {
  const { breakdowns, trucks, navigateTo } = useFleet();
  const [statusFilter, setStatusFilter] = useState<'Todos' | BreakdownStatus>('Todos');

  const filteredBreakdowns = breakdowns.filter((b) => {
    if (statusFilter === 'Todos') return true;
    return b.status === statusFilter;
  });

  const openBreakdownsCount = breakdowns.filter((b) => b.status !== 'Solucionada').length;
  const solvedBreakdownsCount = breakdowns.filter((b) => b.status === 'Solucionada').length;
  const affectedTrucksCount = new Set(
    breakdowns.filter((b) => b.status !== 'Solucionada').map((b) => b.truckId)
  ).size;
  const totalRepairCosts = breakdowns.reduce((acc, b) => acc + (b.repairCostCop || 0), 0);

  const severityStyles: Record<BreakdownSeverity, { badge: string; border: string }> = {
    Leve: { badge: 'bg-stone-100 text-stone-700', border: 'border-stone-200' },
    Moderada: { badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
    Grave: { badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
    Crítica: { badge: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
  };

  const statusStyles: Record<BreakdownStatus, string> = {
    Pendiente: 'bg-rose-50 text-rose-700 border-rose-200',
    'En reparación': 'bg-amber-50 text-amber-700 border-amber-200',
    Solucionada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Averías"
        subtitle="Control mecánico y reparaciones"
        rightAction={
          <button
            onClick={() => navigateTo('breakdown_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Reportar</span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* DASHBOARD INDICATORS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Averías Abiertas
            </span>
            <span className="text-lg font-black text-rose-600 block mt-1 tabular-nums">
              {openBreakdownsCount}
            </span>
            <span className="text-[10px] text-stone-400">Sin solucionar</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Solucionadas
            </span>
            <span className="text-lg font-black text-emerald-600 block mt-1 tabular-nums">
              {solvedBreakdownsCount}
            </span>
            <span className="text-[10px] text-stone-400">Atendidas en taller</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Camiones Afectados
            </span>
            <span className="text-lg font-black text-[#5A3825] block mt-1 tabular-nums">
              {affectedTrucksCount}
            </span>
            <span className="text-[10px] text-stone-400">Vehículos detenidos</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Costo Acumulado
            </span>
            <span className="text-sm sm:text-base font-black text-[#5A3825] block truncate mt-1 tabular-nums">
              {formatCOP(totalRepairCosts)}
            </span>
            <span className="text-[10px] text-stone-400">Repuestos y talleres</span>
          </div>
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todos', 'Pendiente', 'En reparación', 'Solucionada'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`py-1 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-[#5A3825] text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* BREAKDOWNS LIST */}
        <div className="space-y-3">
          {filteredBreakdowns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
              <p className="text-xs text-stone-500 font-medium">
                No hay averías registradas con el filtro seleccionado.
              </p>
            </div>
          ) : (
            filteredBreakdowns.map((brk) => {
              const truck = trucks.find((t) => t.id === brk.truckId);
              const sev = severityStyles[brk.severity];
              const st = statusStyles[brk.status];

              return (
                <div
                  key={brk.id}
                  onClick={() => navigateTo('breakdown_detail', { breakdownId: brk.id })}
                  className={`bg-white rounded-3xl p-4 border shadow-xs hover:border-[#F47B20] cursor-pointer transition-all active:scale-[0.99] ${sev.border}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black text-xs tracking-wider">
                        {truck?.plate || '—'}
                      </span>
                      <h3 className="text-xs font-extrabold text-[#2B2B2B]">
                        {brk.type}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sev.badge}`}>
                        {brk.severity}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st}`}>
                        {brk.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed mb-3">
                    {brk.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 bg-[#FFF8F2] p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span>{formatDateCO(brk.date)}</span>
                      <span>·</span>
                      <span>{formatKm(brk.mileage)}</span>
                      {brk.workshop && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[120px] font-medium text-stone-700">
                            {brk.workshop}
                          </span>
                        </>
                      )}
                    </div>

                    {brk.repairCostCop ? (
                      <span className="font-bold text-[#5A3825] tabular-nums">
                        {formatCOP(brk.repairCostCop)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic">
                        Costo por cotizar
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
