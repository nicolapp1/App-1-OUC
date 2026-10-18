/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { Plus, Search, Filter, Navigation, Calendar, User, Truck, Clock, ArrowRight } from 'lucide-react';
import { formatDateCO, formatTons } from '../utils/formatters';
import { TripStatus } from '../types';

export const TripsScreen: React.FC = () => {
  const { trips, trucks, drivers, navigateTo } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | TripStatus>('Todos');

  const filteredTrips = trips.filter((trip) => {
    const truck = trucks.find((t) => t.id === trip.truckId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    const matchesSearch =
      trip.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck && truck.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver && driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'Todos' ||
      trip.status === statusFilter ||
      (statusFilter === 'En proceso' && trip.status === 'En curso') ||
      (statusFilter === 'Completado' && trip.status === 'Entregado');
    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<TripStatus, string> = {
    'En proceso': 'bg-[#FFE3CC] text-[#7A4E32] border-[#F47B20]/40',
    'En curso': 'bg-[#FFE3CC] text-[#7A4E32] border-[#F47B20]/40',
    Completado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Entregado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'No entregado': 'bg-rose-50 text-rose-800 border-rose-200',
    Programado: 'bg-stone-100 text-stone-700 border-stone-200',
    Cancelado: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Viajes"
        subtitle={`${trips.length} despachos registrados`}
        rightAction={
          <button
            onClick={() => navigateTo('trip_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar</span>
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
            placeholder="Buscar por código, destino, camión o conductor..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todos', 'Programado', 'En proceso', 'Completado', 'Cancelado'] as const).map(
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

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
            <p className="text-xs text-stone-500 font-medium">
              No hay viajes que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => {
              const truck = trucks.find((t) => t.id === trip.truckId);
              const driver = drivers.find((d) => d.id === trip.driverId);
              const badgeStyle = statusStyles[trip.status];

              return (
                <div
                  key={trip.id}
                  onClick={() => navigateTo('trip_detail', { tripId: trip.id })}
                  className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs hover:border-[#F47B20] cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#5A3825]">
                        {trip.code}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {formatDateCO(trip.date)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badgeStyle}`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2B2B2B]">
                      <span className="truncate max-w-[140px] sm:max-w-xs">{trip.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#F47B20] shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-xs text-[#F47B20]">
                        {trip.destination}
                      </span>
                    </div>
                  </div>

                  {/* Truck & Driver strip */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FFF8F2] p-2.5 rounded-2xl mb-2">
                    <div className="flex items-center gap-1.5 text-stone-700 truncate">
                      <Truck className="w-3.5 h-3.5 text-[#5A3825] shrink-0" />
                      <span className="font-bold text-[#5A3825]">{truck?.plate || '—'}</span>
                      <span className="text-[10px] text-stone-500 truncate">
                        ({truck?.vehicleType})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 truncate">
                      <User className="w-3.5 h-3.5 text-[#5A3825] shrink-0" />
                      <span className="truncate font-medium">{driver?.fullName || '—'}</span>
                    </div>
                  </div>

                  {/* Materials & Tonnage Preview */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="text-stone-500 text-[10px] truncate max-w-[200px]">
                      {trip.materials.map((m) => `${m.name} (${m.quantity} ${m.unit})`).join(' · ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5A3825] tabular-nums">
                        {formatTons(trip.totalTons)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {trip.distanceKm} km
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
