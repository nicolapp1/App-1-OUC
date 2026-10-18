/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  TrendingUp,
  Percent,
  DollarSign,
  Fuel,
  Wrench,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatCOP, formatKm, formatTons } from '../utils/formatters';

export const KpisScreen: React.FC = () => {
  const { trucks, trips, fuelRecords, breakdowns, maintenances, kpis, goBack } = useFleet();

  // Computations
  const totalKmDriven = trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const totalFuelCost = fuelRecords.reduce((acc, f) => acc + f.totalCostCop, 0);
  const totalMaintCost = maintenances.reduce((acc, m) => acc + m.costCop, 0) +
    breakdowns.reduce((acc, b) => acc + (b.repairCostCop || 0), 0);
  const totalOperatingCost = totalFuelCost + totalMaintCost;

  const costPerKm = totalKmDriven > 0 ? Math.round(totalFuelCost / totalKmDriven) : 1850;
  const costPerTruck = trucks.length > 0 ? Math.round(totalOperatingCost / trucks.length) : 0;
  const maintCostPerTruck = trucks.length > 0 ? Math.round(totalMaintCost / trucks.length) : 0;
  const tonsPerTrip = trips.length > 0 ? Number((kpis.monthlyTons / trips.length).toFixed(1)) : 8.5;
  const avgBreakdowns = trucks.length > 0 ? Number((breakdowns.length / trucks.length).toFixed(1)) : 0.6;
  const fleetAvailability = trucks.length > 0 ? Math.round((kpis.availableTrucks / trucks.length) * 100) : 80;
  const vehicleUtilization = trucks.length > 0 ? Math.round(((kpis.availableTrucks + kpis.inTripTrucks) / trucks.length) * 100) : 85;

  const indicators = [
    {
      id: 'kpi-1',
      title: 'Disponibilidad de Flota',
      value: `${fleetAvailability}%`,
      subtitle: `${kpis.availableTrucks} de ${trucks.length} camiones listos`,
      explanation: 'Porcentaje de camiones en patio sin averías pendientes ni mantenimientos activos, disponibles inmediatamente para ser despachados.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'kpi-2',
      title: 'Costo de Combustible por Km',
      value: `${formatCOP(costPerKm)} / km`,
      subtitle: 'Promedio general de la flota',
      explanation: 'Gasto total de diésel dividido entre el total de kilómetros recorridos este mes. Permite auditar qué rutas generan mayor gasto energético.',
      icon: Fuel,
      color: 'text-[#F47B20] bg-[#FFF8F2]',
    },
    {
      id: 'kpi-3',
      title: 'Costo Operativo Promedio por Camión',
      value: formatCOP(costPerTruck),
      subtitle: 'Combustible + Mantenimiento + Averías',
      explanation: 'Suma consolidada de costos de abastecimiento y talleres dividida entre el parque automotor activo de la ferretería.',
      icon: DollarSign,
      color: 'text-[#5A3825] bg-stone-100',
    },
    {
      id: 'kpi-4',
      title: 'Toneladas Promedio por Despacho',
      value: formatTons(tonsPerTrip),
      subtitle: `${trips.length} viajes contabilizados`,
      explanation: 'Eficiencia de cubicaje y carga por viaje. Un valor alto indica que los camiones viajan cerca de su capacidad máxima autorizada.',
      icon: TrendingUp,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'kpi-5',
      title: 'Costo de Mantenimiento por Camión',
      value: formatCOP(maintCostPerTruck),
      subtitle: 'Preventivos y correctivos',
      explanation: 'Gasto directo en talleres mecánicos, cambio de lubricantes y repuestos distribuido por cada vehículo.',
      icon: Wrench,
      color: 'text-stone-700 bg-stone-100',
    },
    {
      id: 'kpi-6',
      title: 'Utilización Operativa de Flota',
      value: `${vehicleUtilization}%`,
      subtitle: 'Vehículos en servicio activo',
      explanation: 'Porcentaje de vehículos que no están inmovilizados ni fuera de servicio, generando valor operacional en carretera o patios.',
      icon: Percent,
      color: 'text-blue-700 bg-blue-50',
    },
  ];

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Indicadores de Gestión" subtitle="Métricas de desempeño directivo" showBack onBack={goBack} />

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <h2 className="text-sm font-extrabold text-[#5A3825] mb-1">
            Tablero de Decisión Operacional
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Indicadores estandarizados para monitorear costos por tonelada, gasto por kilómetro y eficiencia del transporte en Ferretería El Oasis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {indicators.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                      {ind.title}
                    </span>
                    <div className={`p-2 rounded-xl ${ind.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-xl font-black text-[#2B2B2B] tabular-nums mb-1">
                    {ind.value}
                  </div>
                  <span className="text-[11px] font-semibold text-[#F47B20] block mb-3">
                    {ind.subtitle}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-start gap-2 bg-[#FFF8F2]/60 p-2.5 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-600 leading-relaxed">
                    {ind.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
