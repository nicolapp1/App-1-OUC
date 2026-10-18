/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import {
  Calendar,
  Clock,
  Gauge,
  Truck,
  User,
  ArrowRight,
  Package,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Edit3,
  ClipboardList,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { formatDateCO, formatKm, formatTons } from '../utils/formatters';
import { TripStatus } from '../types';

export const TripDetailScreen: React.FC = () => {
  const {
    selectedTripId,
    trips,
    trucks,
    drivers,
    updateTripStatus,
    deleteTrip,
    goBack,
    navigateTo,
  } = useFleet();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const trip = trips.find((t) => t.id === selectedTripId) || trips[0];

  if (!trip) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-stone-500">Viaje no encontrado.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-[#F47B20] text-white rounded-xl text-xs font-bold"
        >
          Regresar a Viajes
        </button>
      </div>
    );
  }

  const truck = trucks.find((t) => t.id === trip.truckId);
  const driver = drivers.find((d) => d.id === trip.driverId);

  // Status transitions
  const handleStartTrip = () => {
    updateTripStatus(trip.id, 'En proceso');
  };

  const handleCompleteTrip = () => {
    updateTripStatus(trip.id, 'Completado');
    setCompleteModalOpen(false);
  };

  const handleDelete = () => {
    deleteTrip(trip.id);
  };

  const isCompleted = trip.status === 'Completado' || trip.status === 'Entregado';
  const isInProgress = trip.status === 'En proceso' || trip.status === 'En curso';
  const isScheduled = trip.status === 'Programado';

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title={trip.code}
        subtitle={formatDateCO(trip.date)}
        showBack
        onBack={goBack}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF8F2] hover:bg-[#FFE3CC] text-[#F47B20] border border-[#F47B20]/30 rounded-xl text-xs font-bold transition-colors active:scale-95 shadow-2xs"
              title="Editar información del viaje"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors"
              title="Eliminar viaje"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* ============================================================ */}
        {/* ROUTE HEADER & STATUS MANAGEMENT CARD                        */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Despacho Operativo
              </span>
              <span className="text-sm font-black text-[#5A3825]">{trip.code}</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-xl border ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isInProgress
                    ? 'bg-[#FFE3CC] text-[#7A4E32] border-[#F47B20]/40'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {trip.status}
              </span>

              {/* Status Action Buttons */}
              {isScheduled && (
                <button
                  onClick={handleStartTrip}
                  className="py-1 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs transition-all"
                  title="Marcar como En proceso"
                >
                  <span>Iniciar viaje</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {isInProgress && (
                <button
                  onClick={() => setCompleteModalOpen(true)}
                  className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs transition-all"
                  title="Finalizar viaje"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finalizar</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Visualization */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/70">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <div
                className={`flex items-center gap-1.5 ${
                  isScheduled ? 'text-[#5A3825] font-black' : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isScheduled ? 'bg-[#5A3825] ring-2 ring-[#5A3825]/30' : 'bg-stone-300'
                  }`}
                />
                <span>1. Programado</span>
              </div>

              <span className="text-stone-300">────────</span>

              <div
                className={`flex items-center gap-1.5 ${
                  isInProgress ? 'text-[#F47B20] font-black' : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isInProgress ? 'bg-[#F47B20] ring-2 ring-[#F47B20]/30 animate-pulse' : 'bg-stone-300'
                  }`}
                />
                <span>2. En proceso</span>
              </div>

              <span className="text-stone-300">────────</span>

              <div
                className={`flex items-center gap-1.5 ${
                  isCompleted ? 'text-emerald-700 font-black' : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCompleted ? 'bg-emerald-600 ring-2 ring-emerald-600/30' : 'bg-stone-300'
                  }`}
                />
                <span>3. Completado</span>
              </div>
            </div>
          </div>

          {/* Route path */}
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1.5">
              Trayecto del Despacho
            </span>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#5A3825] mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Origen
                  </span>
                  <span className="text-xs font-bold text-[#2B2B2B]">{trip.origin}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#F47B20] mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Destino
                  </span>
                  <span className="text-xs font-bold text-[#F47B20]">{trip.destination}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Trip Primary Action Banner */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              ¿Deseas modificar materiales, tiempos o solicitudes del cliente?
            </span>
            <button
              onClick={() => setEditModalOpen(true)}
              className="py-1.5 px-3 bg-[#5A3825] hover:bg-[#432A1C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-xs transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Editar Viaje</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CUSTOMER REQUIREMENTS (REQUISITOS DEL CLIENTE)               */}
        {/* ============================================================ */}
        {trip.customerRequirements && (
          <div className="bg-[#FFF8F2] rounded-3xl p-5 border border-[#FFE3CC] shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#5A3825] pb-1 border-b border-[#FFE3CC]">
              <ClipboardList className="w-4 h-4 text-[#F47B20]" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Requisitos y Solicitudes del Cliente
              </h3>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-medium pt-1">
              {trip.customerRequirements}
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* RECURSOS ASIGNADOS                                           */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Recursos Asignados
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Truck */}
            <div
              onClick={() => truck && navigateTo('truck_detail', { truckId: truck.id })}
              className="bg-[#FFF8F2] p-3 rounded-2xl cursor-pointer hover:border-[#F47B20] border border-[#FFE3CC] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold mb-1">
                <Truck className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Camión</span>
              </div>
              <span className="text-xs font-black text-[#5A3825] block">
                {truck?.plate || '—'}
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                {truck?.brand} {truck?.model}
              </span>
              <span className="text-[10px] text-[#F47B20] font-bold block mt-1">
                Capacidad: {truck?.maxCapacityTons || 10} t
              </span>
            </div>

            {/* Driver */}
            <div
              onClick={() => driver && navigateTo('driver_detail', { driverId: driver.id })}
              className="bg-[#FFF8F2] p-3 rounded-2xl cursor-pointer hover:border-[#F47B20] border border-[#FFE3CC] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold mb-1">
                <User className="w-3.5 h-3.5 text-[#F47B20]" />
                <span>Conductor</span>
              </div>
              <span className="text-xs font-bold text-[#5A3825] block truncate">
                {driver?.fullName || '—'}
              </span>
              <span className="text-[10px] text-stone-500 block">
                Rol: {trip.driverRoleOnTrip || 'Chofer'}
              </span>
              <span className="text-[10px] text-[#7A4E32] font-semibold block mt-1">
                Lic. {driver?.licenseCategory}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TIEMPOS Y ODÓMETRO                                           */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Tiempos y Odómetro
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-500 block font-bold">Salida - Llegada</span>
              <span className="font-bold text-[#2B2B2B]">
                {trip.departureTime} → {trip.arrivalTime || 'Pendiente'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Duración: {trip.durationHours || 0} horas
              </span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-2xl">
              <span className="text-[10px] text-stone-500 block font-bold">Odómetro (Km)</span>
              <span className="font-bold text-[#2B2B2B]">
                {trip.startMileage || 0} → {trip.endMileage || 0}
              </span>
              <span className="text-[10px] text-[#F47B20] font-bold block mt-0.5">
                Recorrido: {trip.distanceKm || 0} km
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MATERIAL TRANSPORTADO (COMPREHENSIVE BREAKDOWN)              */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#F47B20]" />
              Materiales Transportados
            </h3>
            <span className="text-xs font-black text-[#5A3825] tabular-nums">
              Total: {formatTons(trip.totalTons)}
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {trip.materials.map((m, idx) => {
              const qty = Number(m.quantity ?? 1);
              const weight = Number(m.weight ?? m.unitWeightKg ?? 1);
              const totalWeight = Number(m.totalWeight ?? qty * weight);

              return (
                <div key={m.id || idx} className="py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2B2B2B] text-xs">{m.name}</span>
                    <span className="font-black text-[#5A3825] tabular-nums">
                      {formatTons(m.tons)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2 rounded-xl text-[11px]">
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase">
                        Cantidad
                      </span>
                      <span className="font-bold text-stone-700">
                        {qty.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase">
                        Peso (Unitario)
                      </span>
                      <span className="font-bold text-stone-700">
                        {weight.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#F47B20] block font-bold uppercase">
                        Peso total (Cant × Peso)
                      </span>
                      <span className="font-black text-[#5A3825]">
                        {totalWeight.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {trip.isOverloaded && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Este viaje registró sobrecupo respecto a la capacidad del camión.</span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* OBSERVACIONES                                                */}
        {/* ============================================================ */}
        {trip.observations && (
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
            <span className="text-[10px] text-stone-500 uppercase font-bold block mb-1">
              Observaciones del viaje
            </span>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              {trip.observations}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="¿Deseas eliminar este viaje?"
        message={`Se eliminará el registro ${trip.code} de la base de operaciones de la ferretería.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Complete Confirmation Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-black text-[#5A3825]">¿Finalizar despacho?</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                El viaje {trip.code} pasará a estado <strong>Completado</strong> y el camión quedará
                marcado como <strong>Disponible</strong> para nuevos viajes.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCompleteTrip}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Sí, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Trip Edit Modal */}
      <EditTripModal
        trip={trip}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
};
