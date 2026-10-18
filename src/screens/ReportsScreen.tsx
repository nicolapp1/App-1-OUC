/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  FileText,
  Download,
  Filter,
  Truck,
  Users,
  Fuel,
  Wrench,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm, formatTons } from '../utils/formatters';

export const ReportsScreen: React.FC = () => {
  const { trucks, drivers, trips, fuelRecords, breakdowns, maintenances, kpis, showToast } = useFleet();
  const [activeReportTab, setActiveReportTab] = useState<'flota' | 'conductores' | 'combustible' | 'averias' | 'mantenimiento'>('flota');

  // Export to Excel / CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReportTab === 'flota') {
      csvContent += 'Placa,Marca,Modelo,Tipo,Capacidad Tons,Kilometraje,Estado,Combustible\n';
      trucks.forEach((t) => {
        csvContent += `${t.plate},${t.brand},${t.model},${t.vehicleType},${t.maxCapacityTons},${t.currentMileage},${t.status},${t.fuelType}\n`;
      });
    } else if (activeReportTab === 'conductores') {
      csvContent += 'Nombre,Cedula,Rol,Licencia Categoria,Vencimiento Licencia,Estado,Telefono\n';
      drivers.forEach((d) => {
        csvContent += `"${d.fullName}",${d.documentNumber},${d.role},${d.licenseCategory},${d.licenseExpDate},${d.status},${d.phone}\n`;
      });
    } else if (activeReportTab === 'combustible') {
      csvContent += 'Camion,Fecha,Litros,Precio Litro COP,Total COP,Estacion,Factura\n';
      fuelRecords.forEach((f) => {
        const trk = trucks.find((t) => t.id === f.truckId);
        csvContent += `${trk?.plate || ''},${f.date},${f.liters},${f.pricePerLiterCop},${f.totalCostCop},"${f.gasStation}",${f.invoiceNumber}\n`;
      });
    } else if (activeReportTab === 'averias') {
      csvContent += 'Camion,Fecha,Tipo,Gravedad,Estado,Costo Reparacion COP,Taller\n';
      breakdowns.forEach((b) => {
        const trk = trucks.find((t) => t.id === b.truckId);
        csvContent += `${trk?.plate || ''},${b.date},"${b.type}",${b.severity},${b.status},${b.repairCostCop || 0},"${b.workshop || ''}"\n`;
      });
    } else {
      csvContent += 'Camion,Fecha,Tipo Mantenimiento,Kilometraje,Costo COP,Taller,Estado\n';
      maintenances.forEach((m) => {
        const trk = trucks.find((t) => t.id === m.truckId);
        csvContent += `${trk?.plate || ''},${m.date},"${m.type}",${m.mileage},${m.costCop},"${m.workshop}",${m.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_oasis_${activeReportTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Archivo Excel (.CSV) de ${activeReportTab} exportado con éxito`, 'success');
  };

  const handleExportPDF = () => {
    showToast('Generando reporte en formato PDF para impresión...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Reportes y Analíticas"
        subtitle="Exportación y resúmenes ejecutivos"
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 bg-[#F47B20] hover:bg-[#E06810] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
              title="Exportar a PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* REPORT TYPE SELECTOR TABS */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-stone-200/60 p-1 rounded-2xl">
          {[
            { id: 'flota', label: 'Flota' },
            { id: 'conductores', label: 'Conductores' },
            { id: 'combustible', label: 'Combustible' },
            { id: 'averias', label: 'Averías' },
            { id: 'mantenimiento', label: 'Mantenimiento' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeReportTab === tab.id
                  ? 'bg-white text-[#5A3825] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FLOTA REPORT */}
        {activeReportTab === 'flota' && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
                Disponibilidad y Uso de Camiones
              </h3>
              <div className="divide-y divide-stone-100">
                {trucks.map((truck) => {
                  const tripsOfTruck = trips.filter((t) => t.truckId === truck.id);
                  const kmOfTruck = tripsOfTruck.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
                  const tonsOfTruck = tripsOfTruck.reduce((acc, t) => acc + (t.totalTons || 0), 0);

                  return (
                    <div key={truck.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black text-xs">
                            {truck.plate}
                          </span>
                          <span className="font-bold text-[#2B2B2B]">
                            {truck.brand} {truck.model}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {tripsOfTruck.length} viajes este mes · {formatKm(kmOfTruck)} recorridos
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-[#5A3825] block tabular-nums">
                          {formatTons(tonsOfTruck)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Estado: {truck.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONDUCTORES REPORT */}
        {activeReportTab === 'conductores' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
              Rendimiento por Conductor
            </h3>
            <div className="divide-y divide-stone-100">
              {drivers.map((driver) => {
                const driverTrips = trips.filter((t) => t.driverId === driver.id);
                const km = driverTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
                const tons = driverTrips.reduce((acc, t) => acc + (t.totalTons || 0), 0);

                return (
                  <div key={driver.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2B2B2B] block">
                        {driver.fullName}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {driver.role} · Licencia {driver.licenseCategory}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#5A3825] block">
                        {driverTrips.length} viajes · {formatKm(km)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatTons(tons)} transportadas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMBUSTIBLE REPORT */}
        {activeReportTab === 'combustible' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
              Gasto Consolidado de Combustible
            </h3>
            <div className="divide-y divide-stone-100">
              {trucks.map((truck) => {
                const fuels = fuelRecords.filter((f) => f.truckId === truck.id);
                const liters = fuels.reduce((acc, f) => acc + f.liters, 0);
                const cost = fuels.reduce((acc, f) => acc + f.totalCostCop, 0);

                return (
                  <div key={truck.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2B2B2B] block">
                        Camión {truck.plate}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {fuels.length} recargas · {liters} Litros
                      </span>
                    </div>
                    <span className="font-black text-[#5A3825] tabular-nums">
                      {formatCOP(cost)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AVERÍAS REPORT */}
        {activeReportTab === 'averias' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
              Frecuencia y Costos de Averías
            </h3>
            <div className="divide-y divide-stone-100">
              {breakdowns.map((b) => {
                const truck = trucks.find((t) => t.id === b.truckId);
                return (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2B2B2B] block">
                        {b.type} — Camión {truck?.plate}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {formatDateCO(b.date)} · {b.severity} · {b.status}
                      </span>
                    </div>
                    <span className="font-black text-rose-700 tabular-nums">
                      {formatCOP(b.repairCostCop || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MANTENIMIENTO REPORT */}
        {activeReportTab === 'mantenimiento' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
              Mantenimientos Preventivos Realizados
            </h3>
            <div className="divide-y divide-stone-100">
              {maintenances.map((m) => {
                const truck = trucks.find((t) => t.id === m.truckId);
                return (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2B2B2B] block">
                        {m.type} — Camión {truck?.plate}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {formatDateCO(m.date)} · {m.workshop}
                      </span>
                    </div>
                    <span className="font-black text-emerald-700 tabular-nums">
                      {formatCOP(m.costCop)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
