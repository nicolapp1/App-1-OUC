/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { Plus, Search, Filter, Fuel, Gauge, Weight, AlertCircle } from 'lucide-react';
import { formatKm, formatTons } from '../utils/formatters';
import { TruckStatus } from '../types';

export const TrucksScreen: React.FC = () => {
  const { trucks, navigateTo } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | TruckStatus>('Todos');

  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      truck.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.vehicleType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || truck.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<TruckStatus, { bg: string; text: string; badge: string }> = {
    Disponible: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    'En viaje': {
      bg: 'bg-[#FFF8F2] text-[#F47B20] border-[#FFE3CC]',
      text: 'text-[#F47B20]',
      badge: 'bg-[#FFE3CC] text-[#7A4E32]',
    },
    'En mantenimiento': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800',
    },
    'Fuera de servicio': {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800',
    },
    Inactivo: {
      bg: 'bg-stone-50 text-stone-800 border-stone-200',
      text: 'text-stone-700',
      badge: 'bg-stone-100 text-stone-700',
    },
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Vehículos de Flota"
        subtitle={`${trucks.length} vehículos registrados · Ferretería El Oasis`}
        rightAction={
          <button
            onClick={() => navigateTo('truck_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
        }
      />

      <div className="px-4 py-3.5 space-y-3 max-w-5xl mx-auto">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa, marca, modelo o tipo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todos', 'Disponible', 'En viaje', 'En mantenimiento', 'Fuera de servicio'] as const).map(
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

        {/* Truck List Cards */}
        {filteredTrucks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
            <p className="text-xs text-stone-500 font-medium">
              No se encontraron camiones con los criterios seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTrucks.map((truck) => {
              const style = statusStyles[truck.status];
              const isSoatAlert = truck.soatStatus === 'Próxima a vencer' || truck.soatStatus === 'Vencida';
              const isRtmAlert = truck.rtmStatus === 'Próxima a vencer' || truck.rtmStatus === 'Vencida';

              return (
                <div
                  key={truck.id}
                  onClick={() => navigateTo('truck_detail', { truckId: truck.id })}
                  className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs hover:border-[#F47B20] cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Colombian License Plate Badge */}
                        <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black tracking-wider text-xs shadow-2xs">
                          {truck.plate}
                        </div>
                        <span className="text-xs font-extrabold text-[#2B2B2B]">
                          {truck.brand} {truck.model}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                        {truck.vehicleType} · Año {truck.year}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${style.badge}`}>
                      {truck.status}
                    </span>
                  </div>

                  {/* Truck Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-[#FFF8F2] p-2.5 rounded-2xl text-[11px] mb-2.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-500 uppercase font-medium flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#F47B20]" />
                        Kilometraje
                      </span>
                      <span className="font-bold text-[#5A3825] tabular-nums mt-0.5">
                        {formatKm(truck.currentMileage)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-500 uppercase font-medium flex items-center gap-1">
                        <Weight className="w-3 h-3 text-[#F47B20]" />
                        Capacidad
                      </span>
                      <span className="font-bold text-[#5A3825] tabular-nums mt-0.5">
                        {truck.maxCapacityTons ? formatTons(truck.maxCapacityTons) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] text-stone-500 uppercase font-medium flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-[#F47B20]" />
                        Combustible
                      </span>
                      <span className="font-bold text-[#5A3825] mt-0.5">
                        {truck.fuelType}
                      </span>
                    </div>
                  </div>

                  {/* Legal Document Status Warning Flags */}
                  {(isSoatAlert || isRtmAlert) && (
                    <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-[10px]">
                      {isSoatAlert && (
                        <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          SOAT: {truck.soatStatus}
                        </span>
                      )}
                      {isRtmAlert && (
                        <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          RTM: {truck.rtmStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
