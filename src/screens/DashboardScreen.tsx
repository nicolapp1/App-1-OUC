/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  Truck,
  Users,
  Navigation,
  Fuel,
  Wrench,
  AlertTriangle,
  Clock,
  ChevronRight,
  PlusCircle,
  TrendingUp,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { formatCOP, formatTons } from '../utils/formatters';

export const DashboardScreen: React.FC = () => {
  const {
    kpis,
    navigateTo,
    notifications,
    trips,
    fuelRecords,
    breakdowns,
    maintenances,
    trucks,
    drivers,
    user,
  } = useFleet();

  // Get active alerts (filter highest priority first)
  const activeAlerts = notifications.slice(0, 4);

  // Recent activity aggregated feed
  const recentActivity = [
    {
      id: 'act-1',
      title: 'Nuevo viaje registrado',
      subtitle: `${trips[0]?.code || 'VJ-2026-104'} · ${trucks.find((t) => t.id === trips[0]?.truckId)?.plate || 'SZM-850'}`,
      detail: `${trips[0]?.destination || 'Obra Vereda El Carmelo, Cajibío'}`,
      time: 'Hoy, 07:30',
      icon: Navigation,
      color: 'text-[#F47B20] bg-[#FFE3CC]',
      screen: 'trips' as const,
    },
    {
      id: 'act-2',
      title: 'Combustible cargado',
      subtitle: `${trucks.find((t) => t.id === fuelRecords[0]?.truckId)?.plate || 'WGL-412'} · ${fuelRecords[0]?.liters || 110} L`,
      detail: formatCOP(fuelRecords[0]?.totalCostCop || 313500),
      time: 'Ayer, 18:30',
      icon: Fuel,
      color: 'text-amber-700 bg-amber-100',
      screen: 'fuel' as const,
    },
    {
      id: 'act-3',
      title: 'Avería en revisión',
      subtitle: `${trucks.find((t) => t.id === breakdowns[0]?.truckId)?.plate || 'TKR-293'} · ${breakdowns[0]?.type || 'Frenos'}`,
      detail: breakdowns[0]?.status || 'En reparación',
      time: '08/10/2026',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-100',
      screen: 'breakdowns' as const,
    },
    {
      id: 'act-4',
      title: 'Mantenimiento realizado',
      subtitle: `${trucks.find((t) => t.id === maintenances[0]?.truckId)?.plate || 'WGL-412'} · ${maintenances[0]?.type || 'Cambio de aceite'}`,
      detail: formatCOP(maintenances[0]?.costCop || 620000),
      time: '28/09/2026',
      icon: Wrench,
      color: 'text-emerald-700 bg-emerald-100',
      screen: 'maintenance' as const,
    },
  ];

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title={`Hola, ${user.name.split(' ')[0] || 'Administrador'}`}
        subtitle={`${user.company} · ${user.location.split(',')[0] || 'La Venta'}`}
      />

      <main className="px-4 py-4 space-y-5 max-w-5xl mx-auto">
        {/* WELCOME BANNER / OVERVIEW */}
        <div className="bg-gradient-to-br from-[#5A3825] to-[#7A4E32] rounded-3xl p-5 text-white shadow-lg shadow-[#5A3825]/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#F47B20]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFE3CC] block">
                Operaciones Hoy · 09/10/2026
              </span>
              <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">
                Flota en marcha
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-xs">
                {kpis.inTripTrucks} camiones en carretera · {kpis.availableTrucks} listos para despacho
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-[#F47B20] tracking-tight">
                {kpis.totalTrucks}
              </span>
              <span className="text-[10px] text-white/70 font-medium">
                Vehículos
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY FLEET KPIS */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              Estado de la Flota
            </h3>
            <button
              onClick={() => navigateTo('trucks')}
              className="text-xs font-bold text-[#F47B20] hover:underline flex items-center"
            >
              Ver camiones <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Camiones Registrados */}
            <div
              onClick={() => navigateTo('trucks')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-[#F47B20] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Registrados</span>
                <Truck className="w-4 h-4 text-[#5A3825]" />
              </div>
              <div className="text-xl font-black text-[#2B2B2B] tabular-nums">
                {kpis.totalTrucks}
              </div>
              <span className="text-[10px] text-stone-400">Total en flota</span>
            </div>

            {/* Camiones Disponibles */}
            <div
              onClick={() => navigateTo('trucks')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Disponibles</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600 tabular-nums">
                {kpis.availableTrucks}
              </div>
              <span className="text-[10px] text-emerald-700/80">Listos en patio</span>
            </div>

            {/* Camiones en Viaje */}
            <div
              onClick={() => navigateTo('trips')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-[#F47B20] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">En viaje</span>
                <Navigation className="w-4 h-4 text-[#F47B20]" />
              </div>
              <div className="text-xl font-black text-[#F47B20] tabular-nums">
                {kpis.inTripTrucks}
              </div>
              <span className="text-[10px] text-amber-700/80">En ruta de entrega</span>
            </div>

            {/* Camiones en Mantenimiento */}
            <div
              onClick={() => navigateTo('trucks')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Mantenimiento</span>
                <Wrench className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-600 tabular-nums">
                {kpis.inMaintenanceTrucks + kpis.outOfServiceTrucks}
              </div>
              <span className="text-[10px] text-rose-700/80">En taller / Inactivos</span>
            </div>

            {/* Conductores Activos */}
            <div
              onClick={() => navigateTo('drivers')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-[#5A3825] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Conductores</span>
                <Users className="w-4 h-4 text-[#5A3825]" />
              </div>
              <div className="text-xl font-black text-[#5A3825] tabular-nums">
                {kpis.activeDrivers}
              </div>
              <span className="text-[10px] text-stone-400">Personal activo</span>
            </div>

            {/* Viajes Realizados Este Mes */}
            <div
              onClick={() => navigateTo('trips')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-[#F47B20] transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Viajes del mes</span>
                <TrendingUp className="w-4 h-4 text-[#F47B20]" />
              </div>
              <div className="text-xl font-black text-[#2B2B2B] tabular-nums">
                {kpis.monthlyTripsCount}
              </div>
              <span className="text-[10px] text-stone-400">Octubre 2026</span>
            </div>
          </div>
        </section>

        {/* OPERATIONAL INDICATORS GROUP 2 */}
        <section>
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-2.5">
            Indicadores Operacionales del Mes
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Combustible consumido */}
            <div
              onClick={() => navigateTo('fuel')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium mb-1">
                <Fuel className="w-3.5 h-3.5 text-amber-600" />
                <span>Combustible</span>
              </div>
              <div className="text-lg font-black text-[#2B2B2B] tabular-nums">
                {kpis.monthlyFuelLiters} L
              </div>
              <span className="text-[10px] text-stone-400">
                Promedio: {kpis.avgFuelConsumptionKmPerL} km/L
              </span>
            </div>

            {/* Gastos de combustible */}
            <div
              onClick={() => navigateTo('fuel')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium mb-1">
                <Flame className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Gasto Combustible</span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#5A3825] truncate tabular-nums">
                {formatCOP(kpis.monthlyFuelExpense)}
              </div>
              <span className="text-[10px] text-stone-400">Total liquidado</span>
            </div>

            {/* Toneladas transportadas */}
            <div
              onClick={() => navigateTo('reports')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-[#F47B20] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Toneladas</span>
              </div>
              <div className="text-lg font-black text-[#2B2B2B] tabular-nums">
                {formatTons(kpis.monthlyTons)}
              </div>
              <span className="text-[10px] text-stone-400">Material movilizado</span>
            </div>

            {/* Averías pendientes */}
            <div
              onClick={() => navigateTo('breakdowns')}
              className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Averías Abiertas</span>
              </div>
              <div className="text-lg font-black text-rose-600 tabular-nums">
                {kpis.pendingBreakdownsCount}
              </div>
              <span className="text-[10px] text-rose-700/80">Requieren atención</span>
            </div>
          </div>
        </section>

        {/* ACCIONES RÁPIDAS (Quick Actions) */}
        <section>
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-2.5">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => navigateTo('trip_new')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-[#F47B20] shadow-xs active:scale-98 transition-all text-center min-h-[88px]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] flex items-center justify-center text-[#F47B20] mb-1.5">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A3825] leading-tight">
                Registrar viaje
              </span>
            </button>

            <button
              onClick={() => navigateTo('fuel_new')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-[#F47B20] shadow-xs active:scale-98 transition-all text-center min-h-[88px]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] flex items-center justify-center text-[#F47B20] mb-1.5">
                <Fuel className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A3825] leading-tight">
                Registrar combustible
              </span>
            </button>

            <button
              onClick={() => navigateTo('breakdown_new')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-rose-400 shadow-xs active:scale-98 transition-all text-center min-h-[88px]"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-1.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A3825] leading-tight">
                Reportar avería
              </span>
            </button>

            <button
              onClick={() => navigateTo('maintenance_new')}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-[#F47B20] shadow-xs active:scale-98 transition-all text-center min-h-[88px]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] flex items-center justify-center text-[#5A3825] mb-1.5">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5A3825] leading-tight">
                Registrar mantenimiento
              </span>
            </button>
          </div>
        </section>

        {/* ALERTAS IMPORTANTES (Warning Cards) */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#F47B20]" />
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                Alertas Importantes
              </h3>
            </div>
            <button
              onClick={() => navigateTo('notifications')}
              className="text-xs font-bold text-[#F47B20] hover:underline"
            >
              Ver todas ({notifications.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.map((alert) => {
              const isCritical = alert.priority === 'Crítica';
              return (
                <div
                  key={alert.id}
                  onClick={() => navigateTo('notifications')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isCritical
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : 'bg-[#FFF8F2] border-[#FFE3CC] hover:border-[#F47B20]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-[#FFE3CC] text-[#F47B20]'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            isCritical ? 'text-rose-900' : 'text-[#5A3825]'
                          }`}
                        >
                          {alert.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isCritical
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-[#FFE3CC] text-[#7A4E32]'
                          }`}
                        >
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 self-center" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              Actividad Reciente
            </h3>
            <button
              onClick={() => navigateTo('history')}
              className="text-xs font-bold text-[#F47B20] hover:underline"
            >
              Historial completo
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 shadow-xs overflow-hidden">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => navigateTo(item.screen)}
                  className="p-3.5 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2B2B2B]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#5A3825] block">
                      {item.detail}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
