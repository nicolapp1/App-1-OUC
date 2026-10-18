/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  Fuel,
  TrendingUp,
  AlertTriangle,
  Plus,
  Flame,
  Truck,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm } from '../utils/formatters';

export const FuelScreen: React.FC = () => {
  const { fuelRecords, trucks, kpis, navigateTo } = useFleet();
  const [selectedTruckFilter, setSelectedTruckFilter] = useState<string>('Todos');

  const filteredFuels = fuelRecords.filter((f) => {
    if (selectedTruckFilter === 'Todos') return true;
    return f.truckId === selectedTruckFilter;
  });

  // Calculate truck consumption stats
  const truckConsumptionMap: Record<string, { plate: string; liters: number; cost: number }> = {};
  trucks.forEach((t) => {
    truckConsumptionMap[t.id] = { plate: t.plate, liters: 0, cost: 0 };
  });

  fuelRecords.forEach((f) => {
    if (truckConsumptionMap[f.truckId]) {
      truckConsumptionMap[f.truckId].liters += f.liters;
      truckConsumptionMap[f.truckId].cost += f.totalCostCop;
    }
  });

  const truckConsumptionList = Object.values(truckConsumptionMap).sort((a, b) => b.liters - a.liters);
  const highestConsumer = truckConsumptionList[0];
  const lowestConsumer = truckConsumptionList.filter((t) => t.liters > 0).slice(-1)[0];
  const maxLitersBar = Math.max(...truckConsumptionList.map((t) => t.liters), 1);

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Combustible"
        subtitle="Control y rendimientos de flota"
        rightAction={
          <button
            onClick={() => navigateTo('fuel_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tanqueo</span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Gasto Mensual
            </span>
            <span className="text-sm sm:text-base font-black text-[#5A3825] block truncate mt-1 tabular-nums">
              {formatCOP(kpis.monthlyFuelExpense)}
            </span>
            <span className="text-[10px] text-stone-400">Total liquidado</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Litros Consumidos
            </span>
            <span className="text-base sm:text-lg font-black text-[#2B2B2B] block mt-1 tabular-nums">
              {kpis.monthlyFuelLiters} L
            </span>
            <span className="text-[10px] text-stone-400">Diésel corriente</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Consumo Promedio
            </span>
            <span className="text-base sm:text-lg font-black text-[#F47B20] block mt-1 tabular-nums">
              {kpis.avgFuelConsumptionKmPerL} km/L
            </span>
            <span className="text-[10px] text-stone-400">Rendimiento estimado</span>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 font-medium block">
              Mayor Consumo
            </span>
            <span className="text-base sm:text-lg font-black text-rose-600 block mt-1">
              {highestConsumer ? highestConsumer.plate : '—'}
            </span>
            <span className="text-[10px] text-stone-400">
              {highestConsumer ? `${highestConsumer.liters} L acumulados` : ''}
            </span>
          </div>
        </div>

        {/* ANOMALY ALERT */}
        <div className="bg-[#FFF8F2] border border-[#FFE3CC] rounded-3xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FFE3CC] text-[#F47B20] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#5A3825]">
              Alerta de Consumo Superior al Promedio
            </h4>
            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
              El camión <strong>WGL-412</strong> presenta un consumo 18% superior a su histórico. Se recomienda revisar inyección y calibración de llantas.
            </p>
          </div>
        </div>

        {/* CHART: CONSUMO POR CAMIÓN */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#F47B20]" />
            Consumo de Combustible por Camión (Litros)
          </h3>

          <div className="space-y-2.5 pt-1">
            {truckConsumptionList.map((item) => {
              const percentage = Math.round((item.liters / maxLitersBar) * 100);
              return (
                <div key={item.plate} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-bold text-[#2B2B2B]">
                      Camión {item.plate}
                    </span>
                    <span className="text-stone-500 tabular-nums">
                      {item.liters} L · {formatCOP(item.cost)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F47B20] to-[#E06810] rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REFILL HISTORY */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              Historial de Tanqueos ({filteredFuels.length})
            </h3>

            {/* Filter by Truck */}
            <select
              value={selectedTruckFilter}
              onChange={(e) => setSelectedTruckFilter(e.target.value)}
              className="text-[11px] font-bold text-[#5A3825] bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-[#F47B20]"
            >
              <option value="Todos">Todos los camiones</option>
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.plate}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredFuels.map((fuel) => {
              const truck = trucks.find((t) => t.id === fuel.truckId);
              return (
                <div key={fuel.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2B2B2B]">
                        {truck?.plate || '—'}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-400">
                        {formatDateCO(fuel.date)} · {fuel.time}
                      </span>
                    </div>
                    <span className="text-xs text-stone-600 block mt-0.5">
                      {fuel.liters} L {fuel.fuelType} · {fuel.gasStation}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Km: {formatKm(fuel.currentMileage)} · Factura: {fuel.invoiceNumber}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#5A3825] block tabular-nums">
                      {formatCOP(fuel.totalCostCop)}
                    </span>
                    {fuel.kmPerLiter && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {fuel.kmPerLiter} km/L
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
