/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Award,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Navigation,
  Truck,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatDateCO, formatKm, formatTons } from '../utils/formatters';

export const DriverDetailScreen: React.FC = () => {
  const {
    selectedDriverId,
    drivers,
    trips,
    trucks,
    deleteDriver,
    goBack,
    navigateTo,
  } = useFleet();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'perfil' | 'historial'>('perfil');

  const driver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  if (!driver) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-stone-500">Conductor no encontrado.</p>
        <button onClick={goBack} className="mt-4 px-4 py-2 bg-[#F47B20] text-white rounded-xl text-xs">
          Regresar
        </button>
      </div>
    );
  }

  // Driver metrics
  const driverTrips = trips.filter((t) => t.driverId === driver.id);
  const totalKm = driverTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const totalTons = driverTrips.reduce((acc, t) => acc + (t.totalTons || 0), 0);
  const uniqueTruckIds = Array.from(new Set(driverTrips.map((t) => t.truckId)));
  const drivenTrucks = trucks.filter((t) => uniqueTruckIds.includes(t.id));

  const handleDelete = () => {
    deleteDriver(driver.id);
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title={driver.fullName}
        showBack
        onBack={goBack}
        subtitle={`C.C. ${driver.documentNumber}`}
        rightAction={
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50"
            title="Eliminar conductor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
        {/* HEADER PROFILE CARD */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8F2] border-2 border-[#FFE3CC] overflow-hidden shrink-0 flex items-center justify-center font-black text-xl text-[#5A3825]">
              {driver.avatarUrl ? (
                <img
                  src={driver.avatarUrl}
                  alt={driver.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                driver.fullName.substring(0, 2).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#FFE3CC] text-[#7A4E32]">
                  {driver.role}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    driver.status === 'Activo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {driver.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-[#2B2B2B] truncate">
                {driver.fullName}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Cédula: {driver.documentNumber}
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-100 text-center">
            <div className="bg-[#FFF8F2] p-2 rounded-xl">
              <span className="text-[10px] text-stone-500 font-medium block">Viajes</span>
              <span className="text-sm font-black text-[#5A3825] tabular-nums">
                {driverTrips.length}
              </span>
            </div>
            <div className="bg-[#FFF8F2] p-2 rounded-xl">
              <span className="text-[10px] text-stone-500 font-medium block">Distancia</span>
              <span className="text-sm font-black text-[#5A3825] tabular-nums">
                {formatKm(totalKm)}
              </span>
            </div>
            <div className="bg-[#FFF8F2] p-2 rounded-xl">
              <span className="text-[10px] text-stone-500 font-medium block">Carga</span>
              <span className="text-sm font-black text-[#5A3825] tabular-nums">
                {formatTons(totalTons)}
              </span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'perfil'
                ? 'bg-white text-[#5A3825] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Datos y Documentación
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'historial'
                ? 'bg-white text-[#5A3825] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Historial de Operación ({driverTrips.length})
          </button>
        </div>

        {activeTab === 'perfil' ? (
          <div className="space-y-4">
            {/* Contact info */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
                Información de Contacto
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-stone-700">
                  <Phone className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span className="font-semibold">{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-700">
                  <Mail className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-700">
                  <MapPin className="w-4 h-4 text-[#F47B20] shrink-0" />
                  <span>{driver.address}</span>
                </div>
              </div>
            </div>

            {/* License details */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                  Licencia de Conducción
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    driver.licenseStatus === 'Vigente'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {driver.licenseStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    Número de Licencia
                  </span>
                  <span className="font-bold text-[#2B2B2B]">{driver.licenseNumber}</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    Categoría
                  </span>
                  <span className="font-bold text-[#F47B20]">{driver.licenseCategory}</span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    Expedición
                  </span>
                  <span className="font-medium text-stone-700">
                    {formatDateCO(driver.licenseIssueDate)}
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <span className="text-[10px] text-stone-500 font-medium block">
                    Vencimiento
                  </span>
                  <span className="font-bold text-[#5A3825]">
                    {formatDateCO(driver.licenseExpDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical Fitness */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
                Aptitud Médica
              </h3>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#2B2B2B] block">
                    {driver.medicalFitness}
                  </span>
                  {driver.medicalRestrictions ? (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl mt-1.5 border border-amber-200">
                      Restricción: {driver.medicalRestrictions}
                    </p>
                  ) : (
                    <span className="text-[10px] text-stone-500">
                      Sin restricciones operativas registradas.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contract details */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
                  Contrato Laboral
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFE3CC] text-[#7A4E32]">
                  {driver.contractStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Tipo</span>
                  <span className="font-semibold text-stone-800">{driver.contractType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-medium block">Vigencia</span>
                  <span className="font-semibold text-stone-800">
                    {formatDateCO(driver.contractStartDate)} al{' '}
                    {driver.contractType === 'Término indefinido'
                      ? 'Indefinido'
                      : formatDateCO(driver.contractEndDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* HISTORIAL DEL CONDUCTOR */
          <div className="space-y-4">
            {/* Camiones conducidos */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#F47B20]" />
                Camiones Conducidos ({drivenTrucks.length})
              </h3>
              {drivenTrucks.length === 0 ? (
                <p className="text-xs text-stone-400">Sin viajes registrados aún.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {drivenTrucks.map((truck) => (
                    <div
                      key={truck.id}
                      onClick={() => navigateTo('truck_detail', { truckId: truck.id })}
                      className="p-2.5 rounded-2xl bg-[#FFF8F2] border border-[#FFE3CC] hover:border-[#F47B20] cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-black text-[#5A3825] block">
                          {truck.plate}
                        </span>
                        <span className="text-[10px] text-stone-500 truncate block">
                          {truck.brand} {truck.model}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#F47B20]">
                        {truck.maxCapacityTons} t
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Viajes del conductor */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
              <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#F47B20]" />
                Viajes Realizados
              </h3>

              {driverTrips.length === 0 ? (
                <p className="text-xs text-stone-400">No hay viajes registrados para este conductor.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {driverTrips.map((trip) => {
                    const truck = trucks.find((t) => t.id === trip.truckId);
                    return (
                      <div
                        key={trip.id}
                        onClick={() => navigateTo('trip_detail', { tripId: trip.id })}
                        className="py-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#5A3825]">
                              {trip.code}
                            </span>
                            <span className="text-[10px] font-semibold text-stone-500">
                              {formatDateCO(trip.date)}
                            </span>
                          </div>
                          <span className="text-xs text-stone-700 font-medium block truncate max-w-xs mt-0.5">
                            {trip.origin} → {trip.destination}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            Camión {truck?.plate || '—'} · {trip.distanceKm} km · {trip.totalTons} t
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            trip.status === 'Completado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Deseas eliminar este conductor?"
        message={`Esta acción removerá a ${driver.fullName} de la nómina de conductores de El Oasis.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
