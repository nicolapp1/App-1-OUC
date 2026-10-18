/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  Filter,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm } from '../utils/formatters';
import { MaintenanceStatus } from '../types';

export const MaintenanceScreen: React.FC = () => {
  const { maintenances, trucks, navigateTo } = useFleet();
  const [selectedTruckFilter, setSelectedTruckFilter] = useState('Todos');

  const filteredMaintenances = maintenances.filter((m) => {
    if (selectedTruckFilter === 'Todos') return true;
    return m.truckId === selectedTruckFilter;
  });

  const totalMaintenanceCost = maintenances.reduce((acc, m) => acc + m.costCop, 0);

  const statusStyles: Record<MaintenanceStatus, string> = {
    'Al día': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Próximo: 'bg-amber-50 text-amber-800 border-amber-200',
    Vencido: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Mantenimiento Preventivo"
        subtitle="Planes periódicos de flota"
        rightAction={
          <button
            onClick={() => navigateTo('maintenance_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mantenimiento</span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Servicios Realizados
            </span>
            <span className="text-lg font-black text-[#5A3825] block mt-1 tabular-nums">
              {maintenances.length}
            </span>
            <span className="text-[10px] text-stone-400">En flota total</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Inversión Preventiva
            </span>
            <span className="text-base sm:text-lg font-black text-[#5A3825] block truncate mt-1 tabular-nums">
              {formatCOP(totalMaintenanceCost)}
            </span>
            <span className="text-[10px] text-stone-400">Total acumulado</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-stone-500 font-medium block">
              Próximos a Vencer
            </span>
            <span className="text-lg font-black text-amber-600 block mt-1 tabular-nums">
              {maintenances.filter((m) => m.status === 'Próximo' || m.status === 'Vencido').length}
            </span>
            <span className="text-[10px] text-stone-400">Atención requerida</span>
          </div>
        </div>

        {/* TRUCK FILTER */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
            <button
              onClick={() => setSelectedTruckFilter('Todos')}
              className={`py-1 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTruckFilter === 'Todos'
                  ? 'bg-[#5A3825] text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Todos los camiones
            </button>
            {trucks.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTruckFilter(t.id)}
                className={`py-1 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTruckFilter === t.id
                    ? 'bg-[#5A3825] text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {t.plate}
              </button>
            ))}
          </div>
        </div>

        {/* MAINTENANCES LIST */}
        <div className="space-y-3">
          {filteredMaintenances.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
              <p className="text-xs text-stone-500 font-medium">
                No hay mantenimientos registrados con el filtro aplicado.
              </p>
            </div>
          ) : (
            filteredMaintenances.map((mnt) => {
              const truck = trucks.find((t) => t.id === mnt.truckId);
              const badgeStyle = statusStyles[mnt.status];

              return (
                <div
                  key={mnt.id}
                  className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black text-xs">
                        {truck?.plate || '—'}
                      </span>
                      <div>
                        <h3 className="text-xs font-extrabold text-[#2B2B2B]">
                          {mnt.type}
                        </h3>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {truck?.brand} {truck?.model}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}
                    >
                      {mnt.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed">
                    {mnt.description}
                  </p>

                  <div className="bg-[#FFF8F2] p-2.5 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">
                        Realizado el {formatDateCO(mnt.date)} a los {formatKm(mnt.mileage)}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-800">
                        {mnt.workshop}
                      </span>
                    </div>
                    <span className="font-black text-[#5A3825] tabular-nums">
                      {formatCOP(mnt.costCop)}
                    </span>
                  </div>

                  {/* Next recommended */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#F47B20]" />
                      Próxima revisión: {formatDateCO(mnt.nextRecommendedDate)}
                    </span>
                    <span className="font-bold text-[#5A3825]">
                      Alcanzando: {formatKm(mnt.nextRecommendedMileage)}
                    </span>
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
