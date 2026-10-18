/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  History,
  Truck,
  User,
  Calendar,
  Navigation,
  Fuel,
  Wrench,
  AlertTriangle,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm, formatTons } from '../utils/formatters';

type EventTypeFilter = 'Todos' | 'Viajes' | 'Combustible' | 'Averías' | 'Mantenimiento';

export const HistoryScreen: React.FC = () => {
  const {
    trucks,
    drivers,
    trips,
    fuelRecords,
    breakdowns,
    maintenances,
    navigateTo,
  } = useFleet();

  const [selectedTruckId, setSelectedTruckId] = useState<string>('Todos');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('Todos');
  const [eventType, setEventType] = useState<EventTypeFilter>('Todos');

  // Aggregated chronological events
  interface TimelineEvent {
    id: string;
    type: 'trip' | 'fuel' | 'breakdown' | 'maintenance';
    date: string;
    title: string;
    subtitle: string;
    detail: string;
    truckPlate: string;
    driverName?: string;
    costCop?: number;
    icon: any;
    color: string;
  }

  const events: TimelineEvent[] = [];

  // 1. Trips
  trips.forEach((t) => {
    const truck = trucks.find((trk) => trk.id === t.truckId);
    const driver = drivers.find((d) => d.id === t.driverId);
    if (selectedTruckId !== 'Todos' && t.truckId !== selectedTruckId) return;
    if (selectedDriverId !== 'Todos' && t.driverId !== selectedDriverId) return;
    if (eventType !== 'Todos' && eventType !== 'Viajes') return;

    events.push({
      id: `ev-trip-${t.id}`,
      type: 'trip',
      date: t.date,
      title: `Viaje ${t.code}`,
      subtitle: `${t.origin} → ${t.destination}`,
      detail: `${t.distanceKm} km · ${formatTons(t.totalTons)} · Conductor: ${driver?.fullName || '—'}`,
      truckPlate: truck?.plate || '—',
      driverName: driver?.fullName,
      icon: Navigation,
      color: 'bg-[#FFE3CC] text-[#F47B20]',
    });
  });

  // 2. Fuel
  fuelRecords.forEach((f) => {
    const truck = trucks.find((trk) => trk.id === f.truckId);
    if (selectedTruckId !== 'Todos' && f.truckId !== selectedTruckId) return;
    if (selectedDriverId !== 'Todos') return; // Fuel doesn't map strictly to driver
    if (eventType !== 'Todos' && eventType !== 'Combustible') return;

    events.push({
      id: `ev-fuel-${f.id}`,
      type: 'fuel',
      date: f.date,
      title: `Tanqueo de combustible`,
      subtitle: `${f.liters} L ${f.fuelType} · ${f.gasStation}`,
      detail: `Odómetro: ${formatKm(f.currentMileage)} · Factura: ${f.invoiceNumber}`,
      truckPlate: truck?.plate || '—',
      costCop: f.totalCostCop,
      icon: Fuel,
      color: 'bg-amber-100 text-amber-700',
    });
  });

  // 3. Breakdowns
  breakdowns.forEach((b) => {
    const truck = trucks.find((trk) => trk.id === b.truckId);
    if (selectedTruckId !== 'Todos' && b.truckId !== selectedTruckId) return;
    if (selectedDriverId !== 'Todos') return;
    if (eventType !== 'Todos' && eventType !== 'Averías') return;

    events.push({
      id: `ev-brk-${b.id}`,
      type: 'breakdown',
      date: b.date,
      title: `Avería: ${b.type}`,
      subtitle: b.description,
      detail: `Gravedad: ${b.severity} · Estado: ${b.status} · ${b.workshop || ''}`,
      truckPlate: truck?.plate || '—',
      costCop: b.repairCostCop,
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-700',
    });
  });

  // 4. Maintenance
  maintenances.forEach((m) => {
    const truck = trucks.find((trk) => trk.id === m.truckId);
    if (selectedTruckId !== 'Todos' && m.truckId !== selectedTruckId) return;
    if (selectedDriverId !== 'Todos') return;
    if (eventType !== 'Todos' && eventType !== 'Mantenimiento') return;

    events.push({
      id: `ev-mnt-${m.id}`,
      type: 'maintenance',
      date: m.date,
      title: `Mantenimiento Preventivo: ${m.type}`,
      subtitle: m.description,
      detail: `${formatKm(m.mileage)} · Taller: ${m.workshop}`,
      truckPlate: truck?.plate || '—',
      costCop: m.costCop,
      icon: Wrench,
      color: 'bg-emerald-100 text-emerald-700',
    });
  });

  // Sort chronologically descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered truck summary stats
  const truckTripsCount = trips.filter((t) => selectedTruckId === 'Todos' || t.truckId === selectedTruckId).length;
  const truckKm = trips
    .filter((t) => selectedTruckId === 'Todos' || t.truckId === selectedTruckId)
    .reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const truckTons = trips
    .filter((t) => selectedTruckId === 'Todos' || t.truckId === selectedTruckId)
    .reduce((acc, t) => acc + (t.totalTons || 0), 0);
  const truckFuelExpense = fuelRecords
    .filter((f) => selectedTruckId === 'Todos' || f.truckId === selectedTruckId)
    .reduce((acc, f) => acc + f.totalCostCop, 0);
  const truckRepairExpense = breakdowns
    .filter((b) => selectedTruckId === 'Todos' || b.truckId === selectedTruckId)
    .reduce((acc, b) => acc + (b.repairCostCop || 0), 0);

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Historial Centralizado" subtitle="Trazabilidad operacional completa" />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* FILTER BAR CONTROLS */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
            Filtros del Historial
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">
                Filtrar por Camión
              </label>
              <select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] bg-stone-50"
              >
                <option value="Todos">Todos los camiones</option>
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.plate} ({t.brand})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1">
                Filtrar por Conductor
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-stone-50"
              >
                <option value="Todos">Todos los conductores</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">
              Tipo de Evento
            </label>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['Todos', 'Viajes', 'Combustible', 'Averías', 'Mantenimiento'] as EventTypeFilter[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setEventType(type)}
                    className={`py-1 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      eventType === type
                        ? 'bg-[#5A3825] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY STATS FOR SELECTION */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block">Viajes</span>
            <span className="text-sm font-black text-[#5A3825] tabular-nums">
              {truckTripsCount}
            </span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block">Kilómetros</span>
            <span className="text-sm font-black text-[#5A3825] tabular-nums">
              {formatKm(truckKm)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block">Toneladas</span>
            <span className="text-sm font-black text-[#5A3825] tabular-nums">
              {formatTons(truckTons)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block">Combustible</span>
            <span className="text-xs font-black text-[#5A3825] truncate tabular-nums block">
              {formatCOP(truckFuelExpense)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] text-stone-500 block">Reparaciones</span>
            <span className="text-xs font-black text-rose-700 truncate tabular-nums block">
              {formatCOP(truckRepairExpense)}
            </span>
          </div>
        </div>

        {/* TIMELINE LIST */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-2">
            Línea de Tiempo ({events.length} eventos)
          </h3>

          {events.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              No hay registros para los filtros seleccionados.
            </p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
              {events.map((ev) => {
                const Icon = ev.icon;
                return (
                  <div key={ev.id} className="relative flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 z-10 ${ev.color} shadow-2xs`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 bg-[#FFF8F2] p-3 rounded-2xl border border-[#FFE3CC]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2B2B2B]">
                            {ev.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black text-[10px]">
                            {ev.truckPlate}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-400">
                          {formatDateCO(ev.date)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-stone-700 line-clamp-2">
                        {ev.subtitle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 pt-1 border-t border-[#FFE3CC]/80">
                        <span className="truncate max-w-xs">{ev.detail}</span>
                        {ev.costCop ? (
                          <span className="font-bold text-[#5A3825] tabular-nums">
                            {formatCOP(ev.costCop)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
