/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Trip, CargoMaterial, DriverRole, TripStatus } from '../../types';
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Gauge,
  Truck as TruckIcon,
  User,
  CheckCircle2,
  ArrowRight,
  Package,
  Calendar,
  MapPin,
  ClipboardList,
  Info,
} from 'lucide-react';
import { formatTons } from '../../utils/formatters';

interface EditTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({ trip, isOpen, onClose }) => {
  const { trucks, drivers, updateTrip, showToast } = useFleet();

  // State loaded automatically from existing trip record
  const [date, setDate] = useState(trip.date || '');
  const [selectedTruckId, setSelectedTruckId] = useState(trip.truckId || '');
  const [selectedDriverId, setSelectedDriverId] = useState(trip.driverId || '');
  const [driverRole, setDriverRole] = useState<DriverRole>(trip.driverRoleOnTrip || 'Chofer');
  const [origin, setOrigin] = useState(trip.origin || '');
  const [destination, setDestination] = useState(trip.destination || '');

  // Times & Mileages
  const [departureTime, setDepartureTime] = useState(trip.departureTime || '08:00');
  const [arrivalTime, setArrivalTime] = useState(trip.arrivalTime || '11:30');
  const [startMileage, setStartMileage] = useState<number>(trip.startMileage || 0);
  const [endMileage, setEndMileage] = useState<number>(trip.endMileage || 0);

  // Status Management
  const [status, setStatus] = useState<TripStatus>(trip.status || 'Programado');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TripStatus | null>(null);

  // Customer Requirements & Observations
  const [customerRequirements, setCustomerRequirements] = useState(trip.customerRequirements || '');
  const [observations, setObservations] = useState(trip.observations || '');

  // Transported Materials
  const [materials, setMaterials] = useState<CargoMaterial[]>(() => {
    if (trip.materials && trip.materials.length > 0) {
      return trip.materials.map((m) => {
        const q = Number(m.quantity ?? 1);
        const w = Number(m.weight ?? m.unitWeightKg ?? 1);
        const tw = Number(m.totalWeight ?? q * w);
        const tons = Number(m.tons ?? (tw >= 100 ? tw / 1000 : tw));
        return {
          id: m.id || `mat-${Date.now()}-${Math.random()}`,
          name: m.name || '',
          quantity: q,
          weight: w,
          totalWeight: tw,
          tons,
          unit: m.unit,
        };
      });
    }
    return [
      {
        id: `mat-${Date.now()}`,
        name: 'Cemento gris Argos UG',
        quantity: 100,
        weight: 50,
        totalWeight: 5000,
        tons: 5.0,
      },
    ];
  });

  // Reload when trip prop changes
  useEffect(() => {
    if (isOpen && trip) {
      setDate(trip.date || '');
      setSelectedTruckId(trip.truckId || trucks[0]?.id || '');
      setSelectedDriverId(trip.driverId || drivers[0]?.id || '');
      setDriverRole(trip.driverRoleOnTrip || 'Chofer');
      setOrigin(trip.origin || '');
      setDestination(trip.destination || '');
      setDepartureTime(trip.departureTime || '08:00');
      setArrivalTime(trip.arrivalTime || '11:30');
      setStartMileage(trip.startMileage || 0);
      setEndMileage(trip.endMileage || 0);
      setStatus(trip.status || 'Programado');
      setCustomerRequirements(trip.customerRequirements || '');
      setObservations(trip.observations || '');

      if (trip.materials && trip.materials.length > 0) {
        setMaterials(
          trip.materials.map((m) => {
            const q = Number(m.quantity ?? 1);
            const w = Number(m.weight ?? m.unitWeightKg ?? 1);
            const tw = Number(m.totalWeight ?? q * w);
            const tons = Number(m.tons ?? (tw >= 100 ? tw / 1000 : tw));
            return {
              id: m.id || `mat-${Date.now()}-${Math.random()}`,
              name: m.name || '',
              quantity: q,
              weight: w,
              totalWeight: tw,
              tons,
              unit: m.unit,
            };
          })
        );
      }
    }
  }, [isOpen, trip, trucks, drivers]);

  if (!isOpen) return null;

  const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];

  // Auto Calculations
  const calcDistanceKm = Math.max(0, endMileage - startMileage);

  const calcDurationHours = (): number => {
    try {
      if (!departureTime || !arrivalTime) return 0;
      const [depH, depM] = departureTime.split(':').map(Number);
      const [arrH, arrM] = arrivalTime.split(':').map(Number);
      let diffMinutes = arrH * 60 + arrM - (depH * 60 + depM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      return Number((diffMinutes / 60).toFixed(2));
    } catch {
      return 0;
    }
  };

  // Materials Calculations
  const totalWeightSum = materials.reduce(
    (acc, m) => acc + (Number(m.totalWeight) || 0),
    0
  );

  const totalTons = Number(
    materials
      .reduce((acc, m) => acc + (Number(m.tons) || 0), 0)
      .toFixed(2)
  );

  const maxCapacity = activeTruck?.maxCapacityTons ?? 10;
  const isOverloaded = totalTons > maxCapacity;

  // Add Material
  const handleAddMaterial = () => {
    const newId = `mat-${Date.now()}`;
    const defaultQty = 100;
    const defaultWeight = 20;
    const defaultTotal = defaultQty * defaultWeight;
    setMaterials((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        quantity: defaultQty,
        weight: defaultWeight,
        totalWeight: defaultTotal,
        tons: Number((defaultTotal / 1000).toFixed(2)),
      },
    ]);
  };

  // Remove Material
  const handleRemoveMaterial = (id: string) => {
    if (materials.length <= 1) {
      showToast('El viaje debe registrar al menos un material', 'warning');
      return;
    }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Update Material item with automatic formula: Total Weight = Quantity × Weight
  const handleMaterialChange = (
    id: string,
    field: 'name' | 'quantity' | 'weight',
    value: string | number
  ) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        let nextName = m.name;
        let nextQty = m.quantity;
        let nextWeight = m.weight ?? 0;

        if (field === 'name') {
          nextName = String(value);
        } else if (field === 'quantity') {
          const num = typeof value === 'number' ? value : parseFloat(value);
          nextQty = isNaN(num) || num < 0 ? 0 : num;
        } else if (field === 'weight') {
          const num = typeof value === 'number' ? value : parseFloat(value);
          nextWeight = isNaN(num) || num < 0 ? 0 : num;
        }

        // Automatic Formula: Total Weight = Quantity × Weight
        const calculatedTotalWeight = Number((nextQty * nextWeight).toFixed(2));
        // Tons representation for vehicle load comparison
        const calculatedTons = Number(
          (calculatedTotalWeight >= 100
            ? calculatedTotalWeight / 1000
            : calculatedTotalWeight
          ).toFixed(2)
        );

        return {
          ...m,
          name: nextName,
          quantity: nextQty,
          weight: nextWeight,
          totalWeight: calculatedTotalWeight,
          totalWeightKg: calculatedTotalWeight,
          tons: calculatedTons,
        };
      })
    );
  };

  // Status Transition with confirmation
  const requestStatusChange = (newStatus: TripStatus) => {
    if (newStatus === status) return;

    if (newStatus === 'Completado') {
      setPendingStatus('Completado');
      setShowStatusConfirm(true);
    } else {
      setStatus(newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      setStatus(pendingStatus);
      setPendingStatus(null);
    }
    setShowStatusConfirm(false);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) {
      showToast('Por favor especifica el destino del despacho', 'warning');
      return;
    }

    // Verify all materials have a description
    const hasEmptyDescription = materials.some((m) => !m.name.trim());
    if (hasEmptyDescription) {
      showToast('Todos los materiales deben tener una descripción válida', 'warning');
      return;
    }

    if (isOverloaded) {
      const proceed = confirm(
        `¡Atención! La carga total (${totalTons} t) supera la capacidad del camión seleccionado (${maxCapacity} t). ¿Deseas guardar los cambios de todas formas?`
      );
      if (!proceed) return;
    }

    // Update existing trip persistently without duplicate record
    updateTrip(trip.id, {
      date,
      truckId: selectedTruckId,
      driverId: selectedDriverId,
      driverRoleOnTrip: driverRole,
      origin,
      destination,
      departureTime,
      arrivalTime,
      durationHours: calcDurationHours(),
      startMileage,
      endMileage,
      distanceKm: calcDistanceKm,
      materials,
      totalWeight: totalWeightSum,
      totalWeightKg: totalWeightSum,
      totalTons,
      isOverloaded,
      status,
      customerRequirements: customerRequirements.trim() || undefined,
      observations: observations.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-[#5A3825] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F47B20] text-white px-2 py-0.5 rounded-md">
                Editar Viaje
              </span>
              <span className="text-xs font-mono font-bold text-amber-200">{trip.code}</span>
            </div>
            <h2 className="text-base font-black text-white mt-0.5">
              Modificar Información del Despacho
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1 text-xs">
          {/* ============================================================ */}
          {/* 1. GESTIÓN DE ESTADO DEL VIAJE (STATUS MANAGEMENT)           */}
          {/* ============================================================ */}
          <section className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-200">
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F47B20]" />
                Gestión del Estado del Viaje
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  status === 'Completado'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : status === 'En proceso'
                    ? 'bg-[#FFE3CC] text-[#7A4E32] border-[#F47B20]/40'
                    : 'bg-stone-200 text-stone-700 border-stone-300'
                }`}
              >
                Estado actual: {status}
              </span>
            </div>

            {/* Stepper / Timeline Visual */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Programado */}
              <button
                type="button"
                onClick={() => requestStatusChange('Programado')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  status === 'Programado'
                    ? 'bg-white border-[#5A3825] shadow-xs ring-2 ring-[#5A3825]/20 text-[#5A3825] font-black'
                    : 'bg-white/70 border-stone-200 text-stone-500 hover:bg-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-400">
                  Paso 1
                </span>
                <span className="text-xs font-bold mt-0.5">Programado</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Despacho agendado</span>
              </button>

              {/* En proceso */}
              <button
                type="button"
                onClick={() => requestStatusChange('En proceso')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  status === 'En proceso'
                    ? 'bg-[#FFF8F2] border-[#F47B20] shadow-xs ring-2 ring-[#F47B20]/30 text-[#7A4E32] font-black'
                    : 'bg-white/70 border-stone-200 text-stone-500 hover:bg-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block text-[#F47B20]">
                  Paso 2
                </span>
                <span className="text-xs font-bold mt-0.5">En proceso</span>
                <span className="text-[9px] text-stone-400 mt-0.5">En ruta de entrega</span>
              </button>

              {/* Completado */}
              <button
                type="button"
                onClick={() => requestStatusChange('Completado')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  status === 'Completado'
                    ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30 text-emerald-800 font-black'
                    : 'bg-white/70 border-stone-200 text-stone-500 hover:bg-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-600">
                  Paso 3 (Final)
                </span>
                <span className="text-xs font-bold mt-0.5">Completado</span>
                <span className="text-[9px] text-stone-400 mt-0.5">Entrega concluida</span>
              </button>
            </div>

            {/* Quick Flow Transition Action */}
            <div className="pt-1">
              {status === 'Programado' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="text-[11px] text-amber-900">
                    <span className="font-bold block">El viaje no ha iniciado.</span>
                    ¿El camión ya salió de la ferretería?
                  </div>
                  <button
                    type="button"
                    onClick={() => requestStatusChange('En proceso')}
                    className="py-1.5 px-3 bg-[#F47B20] hover:bg-[#E06810] text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                  >
                    <span>Iniciar viaje</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {status === 'En proceso' && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <div className="text-[11px] text-sky-900">
                    <span className="font-bold block">El viaje está en ejecución.</span>
                    ¿El material ya fue descargado en el predio?
                  </div>
                  <button
                    type="button"
                    onClick={() => requestStatusChange('Completado')}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Finalizar viaje</span>
                  </button>
                </div>
              )}

              {status === 'Completado' && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Viaje concluido:</strong> Este registro se encuentra en estado final
                    (Completado). Puede actualizar detalles o volver a activar si es necesario.
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 2. INFORMACIÓN GENERAL Y RECURSOS ASIGNADOS                 */}
          {/* ============================================================ */}
          <section className="space-y-3">
            <h3 className="font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#F47B20]" />
              Información de la Operación y Recursos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Fecha del despacho</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Vehículo asignado (Placa / Capacidad)
                </label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-[#5A3825] bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.plate} · {t.brand} {t.model} ({t.maxCapacityTons || 10} t)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Conductor asignado</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} (Lic. {d.licenseCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Rol en el viaje</label>
                <select
                  value={driverRole}
                  onChange={(e) => setDriverRole(e.target.value as DriverRole)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                >
                  <option value="Chofer">Chofer únicamente</option>
                  <option value="Chofer descargador">Chofer descargador</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Origen</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Ej: Ferretería El Oasis - Sede La Venta, Cajibío"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Destino de entrega</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ej: Obra Vereda El Carmelo, Cajibío"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 3. REQUISITOS O SOLICITUDES DEL CLIENTE                      */}
          {/* ============================================================ */}
          <section className="space-y-2 bg-[#FFF8F2] p-4 rounded-2xl border border-[#FFE3CC]">
            <h3 className="font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#F47B20]" />
              Requisitos y Solicitudes del Cliente
            </h3>
            <p className="text-[11px] text-stone-600">
              Permite registrar o actualizar especificaciones adicionales solicitadas por el cliente
              (instrucciones de descargue, contacto en obra, horarios especiales, etc.).
            </p>
            <textarea
              rows={2}
              value={customerRequirements}
              onChange={(e) => setCustomerRequirements(e.target.value)}
              placeholder="Ej: Descargar junto a la mezcladora al fondo del lote; avisar 20 min antes al cel 311 000 0000; entregar copia sellada al maestro."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
            />
          </section>

          {/* ============================================================ */}
          {/* 4. TIEMPOS Y ODÓMETRO                                        */}
          {/* ============================================================ */}
          <section className="space-y-3">
            <h3 className="font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F47B20]" />
              Tiempos y Odómetro
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Hora salida</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Hora llegada</label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Km inicial</label>
                <input
                  type="number"
                  value={startMileage}
                  onChange={(e) => setStartMileage(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Km final</label>
                <input
                  type="number"
                  value={endMileage}
                  onChange={(e) => setEndMileage(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-700">
              <span>Duración estimada: {calcDurationHours()} h</span>
              <span className="text-[#F47B20]">Distancia total: {calcDistanceKm} km</span>
            </div>
          </section>

          {/* ============================================================ */}
          {/* 5. MATERIAL TRANSPORTADO (NEW MANDATORY STRUCTURE)           */}
          {/*    Descripción, Cantidad, Peso (replaces Unidad),            */}
          {/*    Peso total = Cantidad × Peso (read-only auto-calc)        */}
          {/* ============================================================ */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <h3 className="font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#F47B20]" />
                Material Transportado
              </h3>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="py-1 px-2.5 bg-[#FFF8F2] hover:bg-[#FFE3CC] text-[#F47B20] border border-[#F47B20]/30 rounded-xl font-bold flex items-center gap-1 transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar material</span>
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((mat, index) => (
                <div
                  key={mat.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#5A3825]">
                      Material #{index + 1}
                    </span>
                    {materials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 flex items-center gap-1 text-[11px] font-bold"
                        title="Eliminar material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  {/* Descripción del material (Editable text field) */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                      Descripción del material
                    </label>
                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => handleMaterialChange(mat.id, 'name', e.target.value)}
                      placeholder="Ej: Cemento gris Argos UG, Arena lavada, Ladrillo tolete"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
                    />
                  </div>

                  {/* Grid: Cantidad, Peso (Unitario), Peso total (Auto-calculado) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Cantidad (Editable numeric field, non-negative) */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={mat.quantity}
                        onChange={(e) => handleMaterialChange(mat.id, 'quantity', e.target.value)}
                        placeholder="100"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                      />
                    </div>

                    {/* Peso (Editable numeric field, replaces 'Unidad', unit weight, non-negative) */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Peso <span className="text-stone-400 font-normal">(unitario)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={mat.weight ?? 0}
                        onChange={(e) => handleMaterialChange(mat.id, 'weight', e.target.value)}
                        placeholder="20"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                      />
                    </div>

                    {/* Peso total (Automatically calculated numeric field: Quantity × Weight, READ-ONLY) */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-bold text-[#5A3825]">
                          Peso total
                        </label>
                        <span className="text-[9px] text-[#F47B20] font-bold">Auto (Cant × Peso)</span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={
                          typeof mat.totalWeight === 'number'
                            ? mat.totalWeight.toLocaleString('es-CO')
                            : '0'
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-100 font-black text-[#5A3825] cursor-not-allowed select-none"
                        title="Campo calculado automáticamente: Cantidad × Peso"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Load vs Capacity Box */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isOverloaded
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Peso total acumulado de materiales
                  </span>
                  <span className="text-sm font-black">
                    {totalWeightSum.toLocaleString('es-CO')} · {formatTons(totalTons)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Capacidad máxima del camión
                  </span>
                  <span className="text-sm font-black">{maxCapacity} t</span>
                </div>
              </div>

              {isOverloaded && (
                <div className="mt-2 pt-2 border-t border-rose-200 flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    ¡Sobrecupo! La carga total ({totalTons} t) supera la capacidad del vehículo ({maxCapacity} t).
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* ============================================================ */}
          {/* 6. OBSERVACIONES OPERATIVAS GENERALES                        */}
          {/* ============================================================ */}
          <section className="space-y-1.5">
            <label className="block font-bold text-stone-700">
              Observaciones adicionales del viaje
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Detalles sobre el trayecto, estado de vías terciarias, recibos de peaje o novedades..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </section>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#F47B20] hover:bg-[#E06810] text-white font-bold flex items-center gap-2 shadow-md shadow-[#F47B20]/25 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal when marking as Completado */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-black text-[#5A3825]">
                ¿Marcar viaje como Completado?
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                El viaje {trip.code} pasará a estado final (Finalizado/Completado) y el vehículo
                volverá a estar disponible para nuevos despachos.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
