/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { Plus, Search, Filter, Phone, Award, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDateCO } from '../utils/formatters';
import { DriverStatus } from '../types';

export const DriversScreen: React.FC = () => {
  const { drivers, navigateTo } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | DriverStatus>('Todos');

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.documentNumber.includes(searchTerm) ||
      (driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'Todos' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<DriverStatus, { bg: string; text: string }> = {
    Activo: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
    Inactivo: { bg: 'bg-stone-100 text-stone-600 border-stone-200', text: 'text-stone-600' },
    'En licencia': { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' },
    'Contrato vencido': { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Conductores"
        subtitle={`${drivers.length} registrados`}
        rightAction={
          <button
            onClick={() => navigateTo('driver_new')}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F47B20]/20 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
        }
      />

      <div className="px-4 py-3.5 space-y-3 max-w-5xl mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula o licencia..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#F47B20] focus:border-transparent shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todos', 'Activo', 'Inactivo', 'En licencia', 'Contrato vencido'] as const).map(
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

        {/* Driver List */}
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
            <p className="text-xs text-stone-500 font-medium">
              No se encontraron conductores con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDrivers.map((driver) => {
              const statusStyle = statusColors[driver.status];
              const isLicenseWarning =
                driver.licenseStatus === 'Próxima a vencer' || driver.licenseStatus === 'Vencida';

              return (
                <div
                  key={driver.id}
                  onClick={() => navigateTo('driver_detail', { driverId: driver.id })}
                  className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs hover:border-[#F47B20] cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF8F2] border border-[#FFE3CC] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#5A3825] text-sm">
                      {driver.avatarUrl ? (
                        <img
                          src={driver.avatarUrl}
                          alt={driver.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        driver.fullName.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Driver Basic Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-[#2B2B2B] truncate group-hover:text-[#F47B20] transition-colors">
                          {driver.fullName}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusStyle.bg}`}
                        >
                          {driver.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                        <span>C.C. {driver.documentNumber}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#5A3825]">{driver.role}</span>
                      </div>

                      {/* License & Contract Info */}
                      <div className="bg-[#FFF8F2] rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#F47B20]" />
                          <span className="font-bold text-[#5A3825]">
                            Licencia {driver.licenseCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isLicenseWarning ? (
                            <span className="flex items-center gap-1 text-rose-600 font-bold">
                              <AlertCircle className="w-3 h-3" />
                              {driver.licenseStatus}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              Vence {formatDateCO(driver.licenseExpDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Medical Fitness hint */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[10px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#5A3825]" />
                          {driver.medicalFitness}
                        </span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <Phone className="w-3 h-3" />
                          {driver.phone}
                        </span>
                      </div>
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
