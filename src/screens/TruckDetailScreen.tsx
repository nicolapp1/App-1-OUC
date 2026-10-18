/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Truck,
  Gauge,
  Weight,
  Fuel,
  Navigation,
  Wrench,
  AlertTriangle,
  FileCheck,
  Calendar,
  Trash2,
  PlusCircle,
  Clock,
  Edit3,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatCOP, formatDateCO, formatKm, formatTons, getDaysRemaining } from '../utils/formatters';
import { FuelType, TruckStatus, ExpirationStatus } from '../types';

export const TruckDetailScreen: React.FC = () => {
  const {
    selectedTruckId,
    trucks,
    trips,
    fuelRecords,
    breakdowns,
    maintenances,
    updateTruck,
    deleteTruck,
    goBack,
    navigateTo,
    showToast,
  } = useFleet();

  const [activeTab, setActiveTab] = useState<
    'resumen' | 'viajes' | 'combustible' | 'averias' | 'mantenimiento' | 'documentos' | 'historial'
  >('resumen');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const truck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];

  // Edit form state
  const [editPlate, setEditPlate] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState<number | ''>(1995);
  const [editVehicleTypeCategory, setEditVehicleTypeCategory] = useState<string>('Volqueta');
  const [editCustomVehicleType, setEditCustomVehicleType] = useState<string>('');
  const [editMaxCapacityTons, setEditMaxCapacityTons] = useState<number | ''>(15.0);
  const [editCurrentMileage, setEditCurrentMileage] = useState<number | ''>(150000);
  const [editFuelType, setEditFuelType] = useState<FuelType>('Diésel');
  const [editStatus, setEditStatus] = useState<TruckStatus>('Disponible');
  const [editSoatPolicy, setEditSoatPolicy] = useState('');
  const [editSoatIssueDate, setEditSoatIssueDate] = useState('');
  const [editSoatExpDate, setEditSoatExpDate] = useState('');
  const [editRtmCertificate, setEditRtmCertificate] = useState('');
  const [editRtmIssueDate, setEditRtmIssueDate] = useState('');
  const [editRtmExpDate, setEditRtmExpDate] = useState('');
  const [editObservations, setEditObservations] = useState('');

  if (!truck) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-stone-500">Vehículo no encontrado.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-[#F47B20] text-white rounded-xl text-xs">
          Regresar
        </button>
      </div>
    );
  }

  // Linked records
  const truckTrips = trips.filter((t) => t.truckId === truck.id);
  const truckFuels = fuelRecords.filter((f) => f.truckId === truck.id);
  const truckBreakdowns = breakdowns.filter((b) => b.truckId === truck.id);
  const truckMaintenances = maintenances.filter((m) => m.truckId === truck.id);

  const totalFuelCost = truckFuels.reduce((acc, f) => acc + f.totalCostCop, 0);
  const totalRepairCost = truckBreakdowns.reduce((acc, b) => acc + (b.repairCostCop || 0), 0);
  const totalMaintCost = truckMaintenances.reduce((acc, m) => acc + m.costCop, 0);

  const handleDelete = () => {
    deleteTruck(truck.id);
  };

  const openEditModal = () => {
    setEditPlate(truck.plate);
    setEditBrand(truck.brand);
    setEditModel(truck.model);
    setEditYear(truck.year);

    const isStandardType = ['Volqueta', 'Camión', 'Camioneta', 'Van'].includes(truck.vehicleType);
    if (isStandardType) {
      setEditVehicleTypeCategory(truck.vehicleType);
      setEditCustomVehicleType('');
    } else {
      setEditVehicleTypeCategory('Otro');
      setEditCustomVehicleType(truck.vehicleType);
    }

    setEditMaxCapacityTons(truck.maxCapacityTons ?? '');
    setEditCurrentMileage(truck.currentMileage);
    setEditFuelType(truck.fuelType);
    setEditStatus(truck.status);
    setEditSoatPolicy(truck.soatPolicyNumber || '');
    setEditSoatIssueDate(truck.soatIssueDate || '');
    setEditSoatExpDate(truck.soatExpDate || '');
    setEditRtmCertificate(truck.rtmCertificateNumber || '');
    setEditRtmIssueDate(truck.rtmIssueDate || '');
    setEditRtmExpDate(truck.rtmExpDate || '');
    setEditObservations(truck.observations || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPlate = editPlate.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalizedPlate) {
      showToast('Por favor ingresa la placa del vehículo', 'warning');
      return;
    }

    if (!editBrand.trim()) {
      showToast('Por favor escribe la marca del vehículo', 'warning');
      return;
    }

    if (!editModel.trim()) {
      showToast('Por favor escribe el modelo o línea del vehículo', 'warning');
      return;
    }

    if (!editYear || Number(editYear) < 1950) {
      showToast('Por favor ingresa un año de fabricación válido (desde 1950 en adelante)', 'warning');
      return;
    }

    const finalVehicleType =
      editVehicleTypeCategory === 'Otro'
        ? editCustomVehicleType.trim() || 'Otro'
        : editVehicleTypeCategory;

    // Calculate auto status for documents
    let soatStatus: ExpirationStatus = 'Vigente';
    if (editSoatExpDate) {
      const days = getDaysRemaining(editSoatExpDate);
      if (days < 0) soatStatus = 'Vencida';
      else if (days <= 30) soatStatus = 'Próxima a vencer';
    }

    let rtmStatus: ExpirationStatus = 'Vigente';
    if (editRtmExpDate) {
      const days = getDaysRemaining(editRtmExpDate);
      if (days < 0) rtmStatus = 'Vencida';
      else if (days <= 30) rtmStatus = 'Próxima a vencer';
    }

    const result = updateTruck(truck.id, {
      plate: normalizedPlate,
      brand: editBrand.trim(),
      model: editModel.trim(),
      year: Number(editYear),
      vehicleType: finalVehicleType,
      maxCapacityTons: editMaxCapacityTons !== '' ? Number(editMaxCapacityTons) : undefined,
      currentMileage: editCurrentMileage !== '' ? Number(editCurrentMileage) : truck.currentMileage,
      fuelType: editFuelType,
      status: editStatus,
      soatPolicyNumber: editSoatPolicy.trim() || truck.soatPolicyNumber,
      soatIssueDate: editSoatIssueDate || undefined,
      soatExpDate: editSoatExpDate || undefined,
      soatStatus,
      rtmCertificateNumber: editRtmCertificate.trim() || truck.rtmCertificateNumber,
      rtmIssueDate: editRtmIssueDate || undefined,
      rtmExpDate: editRtmExpDate || undefined,
      rtmStatus,
      observations: editObservations.trim() || undefined,
    });

    if (result && result.success) {
      setEditModalOpen(false);
    }
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'viajes', label: `Viajes (${truckTrips.length})` },
    { id: 'combustible', label: `Combustible (${truckFuels.length})` },
    { id: 'averias', label: `Averías (${truckBreakdowns.length})` },
    { id: 'mantenimiento', label: `Mantenimiento (${truckMaintenances.length})` },
    { id: 'documentos', label: 'Documentos' },
    { id: 'historial', label: 'Historial' },
  ] as const;

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title={`Camión ${truck.plate}`}
        subtitle={`${truck.brand} ${truck.model}`}
        showBack
        onBack={goBack}
        rightAction={
          <div className="flex items-center gap-1.5">
            <button
              onClick={openEditModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFF8F2] hover:bg-[#FFE3CC] text-[#F47B20] border border-[#FFE3CC] text-xs font-bold transition-all active:scale-95 shadow-xs"
              title="Editar datos del vehículo"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors"
              title="Eliminar vehículo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* HEADER TRUCK CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF8F2] border border-[#FFE3CC] flex items-center justify-center text-[#F47B20] shrink-0">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-stone-900 border border-amber-500 font-black tracking-wider text-xs">
                    {truck.plate}
                  </span>
                  <span className="text-sm font-extrabold text-[#2B2B2B]">
                    {truck.brand} {truck.model}
                  </span>
                </div>
                <span className="text-xs text-stone-500 mt-1 block font-medium">
                  {truck.vehicleType} · Año de fabricación {truck.year}
                </span>
                {truck.assignedDriverName && (
                  <span className="text-[11px] text-[#5A3825] font-semibold mt-0.5 block">
                    Conductor: {truck.assignedDriverName}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                truck.status === 'Disponible'
                  ? 'bg-emerald-100 text-emerald-800'
                  : truck.status === 'En viaje'
                  ? 'bg-[#FFE3CC] text-[#7A4E32]'
                  : truck.status === 'En mantenimiento'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {truck.status}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 bg-[#FFF8F2] p-3 rounded-2xl text-center">
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Kilometraje</span>
              <span className="text-xs sm:text-sm font-black text-[#5A3825] tabular-nums">
                {formatKm(truck.currentMileage)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Capacidad</span>
              <span className="text-xs sm:text-sm font-black text-[#5A3825] tabular-nums">
                {truck.maxCapacityTons ? formatTons(truck.maxCapacityTons) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 font-medium block">Combustible</span>
              <span className="text-xs sm:text-sm font-black text-[#5A3825]">
                {truck.fuelType}
              </span>
            </div>
          </div>

          {/* Operational Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-100">
            <button
              onClick={() => navigateTo('trip_new')}
              className="py-1.5 px-2 bg-stone-50 hover:bg-[#FFF8F2] text-[#5A3825] text-[11px] font-bold rounded-xl border border-stone-200 hover:border-[#F47B20] transition-colors flex items-center justify-center gap-1"
            >
              <Navigation className="w-3 h-3 text-[#F47B20]" />
              Nuevo Viaje
            </button>
            <button
              onClick={() => navigateTo('fuel_new')}
              className="py-1.5 px-2 bg-stone-50 hover:bg-[#FFF8F2] text-[#5A3825] text-[11px] font-bold rounded-xl border border-stone-200 hover:border-[#F47B20] transition-colors flex items-center justify-center gap-1"
            >
              <Fuel className="w-3 h-3 text-[#F47B20]" />
              Combustible
            </button>
            <button
              onClick={() => navigateTo('breakdown_new')}
              className="py-1.5 px-2 bg-stone-50 hover:bg-rose-50 text-[#5A3825] text-[11px] font-bold rounded-xl border border-stone-200 hover:border-rose-300 transition-colors flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Avería
            </button>
          </div>
        </div>

        {/* 7 HORIZONTAL SCROLLING TABS */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-stone-200/60 p-1 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#5A3825] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                  Ficha Técnica Completa
                </h3>
                <button
                  onClick={openEditModal}
                  className="text-xs font-bold text-[#F47B20] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar datos
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Placa Normalizada</span>
                  <span className="font-bold text-[#2B2B2B]">{truck.plate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Marca del Vehículo</span>
                  <span className="font-semibold text-stone-800">{truck.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Modelo / Línea</span>
                  <span className="font-semibold text-stone-800">{truck.model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Año de Fabricación</span>
                  <span className="font-bold text-[#5A3825]">{truck.year}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Tipo de Carrocería</span>
                  <span className="font-semibold text-stone-800">{truck.vehicleType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Tipo de Combustible</span>
                  <span className="font-semibold text-stone-800">{truck.fuelType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Capacidad de Carga</span>
                  <span className="font-bold text-[#F47B20]">
                    {truck.maxCapacityTons ? `${truck.maxCapacityTons} Toneladas` : 'No especificada'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Kilometraje Actual</span>
                  <span className="font-semibold text-stone-800">{formatKm(truck.currentMileage)}</span>
                </div>
              </div>

              {truck.observations && (
                <div className="mt-2 pt-2 border-t border-stone-100 text-xs">
                  <span className="text-[10px] text-stone-500 font-medium block">Observaciones Operacionales</span>
                  <p className="text-stone-700 mt-0.5 leading-relaxed">{truck.observations}</p>
                </div>
              )}
            </div>

            {/* Operating cost summary */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3">
                Costos Acumulados de Operación
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-stone-50 p-2.5 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">Combustible</span>
                  <span className="text-xs font-black text-[#5A3825] tabular-nums">
                    {formatCOP(totalFuelCost)}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">Averías</span>
                  <span className="text-xs font-black text-rose-600 tabular-nums">
                    {formatCOP(totalRepairCost)}
                  </span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">Mantenimiento</span>
                  <span className="text-xs font-black text-emerald-700 tabular-nums">
                    {formatCOP(totalMaintCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VIAJES */}
        {activeTab === 'viajes' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                Viajes del Camión ({truckTrips.length})
              </h3>
              <button
                onClick={() => navigateTo('trip_new')}
                className="text-xs font-bold text-[#F47B20] hover:underline"
              >
                + Registrar viaje
              </button>
            </div>
            {truckTrips.length === 0 ? (
              <p className="text-xs text-stone-400">Sin viajes asignados.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {truckTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => navigateTo('trip_detail', { tripId: trip.id })}
                    className="py-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#5A3825] block">
                        {trip.code} · {formatDateCO(trip.date)}
                      </span>
                      <span className="text-xs text-stone-700 block truncate max-w-xs">
                        {trip.origin} → {trip.destination}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {trip.distanceKm} km · {trip.totalTons} t
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800">
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMBUSTIBLE */}
        {activeTab === 'combustible' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                Cargas de Combustible ({truckFuels.length})
              </h3>
              <button
                onClick={() => navigateTo('fuel_new')}
                className="text-xs font-bold text-[#F47B20] hover:underline"
              >
                + Cargar combustible
              </button>
            </div>
            {truckFuels.length === 0 ? (
              <p className="text-xs text-stone-400">No hay registros de combustible para este camión.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {truckFuels.map((fuel) => (
                  <div key={fuel.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#2B2B2B] block">
                        {fuel.liters} Litros {fuel.fuelType} · {formatDateCO(fuel.date)}
                      </span>
                      <span className="text-[11px] text-stone-500 block truncate max-w-xs">
                        {fuel.gasStation}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Factura: {fuel.invoiceNumber} · Km: {formatKm(fuel.currentMileage)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#5A3825] block tabular-nums">
                        {formatCOP(fuel.totalCostCop)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AVERÍAS */}
        {activeTab === 'averias' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                Averías Reportadas ({truckBreakdowns.length})
              </h3>
              <button
                onClick={() => navigateTo('breakdown_new')}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                + Reportar avería
              </button>
            </div>
            {truckBreakdowns.length === 0 ? (
              <p className="text-xs text-stone-400">Sin averías reportadas para este vehículo.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {truckBreakdowns.map((brk) => (
                  <div
                    key={brk.id}
                    onClick={() => navigateTo('breakdown_detail', { breakdownId: brk.id })}
                    className="py-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-700">
                          {brk.type}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700">
                          {brk.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                        {brk.description}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {formatDateCO(brk.date)} · Taller: {brk.workshop || 'Pendiente'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        brk.status === 'Solucionada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {brk.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MANTENIMIENTO */}
        {activeTab === 'mantenimiento' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                Mantenimientos Preventivos ({truckMaintenances.length})
              </h3>
              <button
                onClick={() => navigateTo('maintenance_new')}
                className="text-xs font-bold text-[#F47B20] hover:underline"
              >
                + Registrar mantenimiento
              </button>
            </div>
            {truckMaintenances.length === 0 ? (
              <p className="text-xs text-stone-400">No hay mantenimientos preventivos registrados.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {truckMaintenances.map((mnt) => (
                  <div key={mnt.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#5A3825] block">
                        {mnt.type}
                      </span>
                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        {mnt.description}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {formatDateCO(mnt.date)} · {formatKm(mnt.mileage)} · {mnt.workshop}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 block tabular-nums">
                        {formatCOP(mnt.costCop)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Próx: {formatDateCO(mnt.nextRecommendedDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="space-y-4">
            {/* SOAT Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F47B20]" />
                  <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                    Seguro Obligatorio de Tránsito (SOAT)
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    truck.soatStatus === 'Vigente'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {truck.soatStatus || 'Vigente'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Número de Póliza</span>
                  <span className="font-bold text-[#2B2B2B]">{truck.soatPolicyNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Fecha de Vencimiento</span>
                  <span className="font-bold text-[#5A3825]">
                    {truck.soatExpDate ? formatDateCO(truck.soatExpDate) : 'No especificada'}
                  </span>
                </div>
              </div>
            </div>

            {/* RTM Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#F47B20]" />
                  <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                    Revisión Técnico-Mecánica (RTM)
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    truck.rtmStatus === 'Vigente'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {truck.rtmStatus || 'Vigente'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Certificado CDA</span>
                  <span className="font-bold text-[#2B2B2B]">{truck.rtmCertificateNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Fecha de Vencimiento</span>
                  <span className="font-bold text-[#5A3825]">
                    {truck.rtmExpDate ? formatDateCO(truck.rtmExpDate) : 'No especificada'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-4">
              Línea de Tiempo del Vehículo
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#F47B20] text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                  1
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2B2B2B] block">
                    Lectura Odómetro: {formatKm(truck.currentMileage)}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Vehículo en estado {truck.status.toLowerCase()} en patios de La Venta, Cajibío, Cauca.
                  </span>
                </div>
              </div>

              {truckFuels.map((f, i) => (
                <div key={f.id} className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                    <Fuel className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B2B2B] block">
                      Tanqueo: {f.liters} L · {formatCOP(f.totalCostCop)}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {formatDateCO(f.date)} · Estación: {f.gasStation}
                    </span>
                  </div>
                </div>
              ))}

              {truckBreakdowns.map((b) => (
                <div key={b.id} className="relative flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-700 block">
                      Avería: {b.type} ({b.status})
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {formatDateCO(b.date)} · {b.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT TRUCK MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-[#5A3825]">
                  Editar Datos del Vehículo
                </h3>
                <p className="text-xs text-stone-500">
                  Actualiza especificaciones, documentación o estado de {truck.plate}
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* 1. Datos básicos */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#5A3825] uppercase tracking-wider block">
                  Identificación y Especificaciones
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Placa *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={editPlate}
                      onChange={(e) => setEditPlate(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-black uppercase text-stone-900 bg-amber-50/30 focus:bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={editBrand}
                      onChange={(e) => setEditBrand(e.target.value)}
                      placeholder="Ej: Nissan, Dodge, Chevrolet..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Modelo / Línea *
                    </label>
                    <input
                      type="text"
                      required
                      value={editModel}
                      onChange={(e) => setEditModel(e.target.value)}
                      placeholder="Ej: UD, 300, C70, N2000..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Año de Fabricación *
                    </label>
                    <input
                      type="number"
                      required
                      min={1950}
                      max={new Date().getFullYear() + 1}
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej: 1983, 1986..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tipo de Vehículo *
                    </label>
                    <select
                      value={editVehicleTypeCategory}
                      onChange={(e) => setEditVehicleTypeCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
                    >
                      <option value="Volqueta">Volqueta</option>
                      <option value="Camión">Camión</option>
                      <option value="Camioneta">Camioneta</option>
                      <option value="Van">Van</option>
                      <option value="Otro">Otro (personalizado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Combustible *
                    </label>
                    <select
                      value={editFuelType}
                      onChange={(e) => setEditFuelType(e.target.value as FuelType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
                    >
                      <option value="Diésel">Diésel (ACPM)</option>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Gas">Gas Natural Vehicular</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {editVehicleTypeCategory === 'Otro' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                    <label className="block text-xs font-bold text-[#5A3825] mb-1">
                      Tipo de Vehículo Personalizado *
                    </label>
                    <input
                      type="text"
                      required
                      value={editCustomVehicleType}
                      onChange={(e) => setEditCustomVehicleType(e.target.value)}
                      placeholder="Ej: Furgón, Tractomula, Grúa..."
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Capacidad Carga (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editMaxCapacityTons}
                      onChange={(e) => setEditMaxCapacityTons(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej: 15.0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Kilometraje (km) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editCurrentMileage}
                      onChange={(e) => setEditCurrentMileage(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estado Operacional *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TruckStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
                  >
                    <option value="Disponible">Disponible (En patio en La Venta)</option>
                    <option value="En viaje">En viaje (En ruta activa)</option>
                    <option value="En mantenimiento">En mantenimiento (En taller)</option>
                    <option value="Fuera de servicio">Fuera de servicio (Inmovilizado)</option>
                    <option value="Inactivo">Inactivo (Sin operación)</option>
                  </select>
                </div>
              </div>

              {/* 2. Documentación */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <span className="text-[10px] font-bold text-[#5A3825] uppercase tracking-wider block">
                  Documentación Legal (SOAT y RTM)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Póliza SOAT *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSoatPolicy}
                      onChange={(e) => setEditSoatPolicy(e.target.value)}
                      placeholder="POL-TYU670-001"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Vencimiento SOAT
                    </label>
                    <input
                      type="date"
                      value={editSoatExpDate}
                      onChange={(e) => setEditSoatExpDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Certificado RTM *
                    </label>
                    <input
                      type="text"
                      required
                      value={editRtmCertificate}
                      onChange={(e) => setEditRtmCertificate(e.target.value)}
                      placeholder="RTM-TYU670-001"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Vencimiento RTM
                    </label>
                    <input
                      type="date"
                      value={editRtmExpDate}
                      onChange={(e) => setEditRtmExpDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Observaciones */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Observaciones Operacionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={editObservations}
                  onChange={(e) => setEditObservations(e.target.value)}
                  placeholder="Detalles sobre el vehículo, reparaciones, estado de volco..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#F47B20] text-white font-extrabold text-xs hover:bg-[#E06810] shadow-md shadow-[#F47B20]/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Deseas retirar este vehículo?"
        message={`Esta acción removerá el vehículo ${truck.plate} (${truck.brand} ${truck.model}) de la base de datos de Ferretería El Oasis S.A.S.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
