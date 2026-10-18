/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { CargoMaterial, DriverRole, TripStatus } from '../types';
import { Plus, Trash2, AlertTriangle, CheckCircle2, Clock, Gauge, ClipboardList, Package } from 'lucide-react';
import { formatTons } from '../utils/formatters';

export const NewTripScreen: React.FC = () => {
  const { trucks, drivers, addTrip, goBack, showToast } = useFleet();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [driverRole, setDriverRole] = useState<DriverRole>('Chofer');
  const [origin, setOrigin] = useState('Ferretería El Oasis - Sede La Venta, Cajibío');
  const [destination, setDestination] = useState('');

  // Times
  const [departureTime, setDepartureTime] = useState('08:00');
  const [arrivalTime, setArrivalTime] = useState('11:30');

  // Mileages
  const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  const [startMileage, setStartMileage] = useState(activeTruck?.currentMileage || 0);
  const [endMileage, setEndMileage] = useState((activeTruck?.currentMileage || 0) + 40);

  // Status & Notes
  const [status, setStatus] = useState<TripStatus>('Programado');
  const [customerRequirements, setCustomerRequirements] = useState('');
  const [observations, setObservations] = useState('');

  // Materials Array with: name, quantity, weight, totalWeight (auto Quantity × Weight)
  const [materials, setMaterials] = useState<CargoMaterial[]>([
    {
      id: 'm-1',
      name: 'Cemento gris Argos Tipo UG',
      quantity: 100,
      weight: 50,
      totalWeight: 5000,
      totalWeightKg: 5000,
      tons: 5.0,
    },
  ]);

  // When truck changes, update start mileage default
  useEffect(() => {
    if (activeTruck) {
      setStartMileage(activeTruck.currentMileage);
      setEndMileage(activeTruck.currentMileage + 45);
    }
  }, [selectedTruckId]);

  // When driver changes, update driver role default
  useEffect(() => {
    const d = drivers.find((drv) => drv.id === selectedDriverId);
    if (d?.role) {
      setDriverRole(d.role);
    }
  }, [selectedDriverId]);

  // Calculations
  const calcDistanceKm = Math.max(0, endMileage - startMileage);

  const calcDurationHours = (): number => {
    try {
      const [depH, depM] = departureTime.split(':').map(Number);
      const [arrH, arrM] = arrivalTime.split(':').map(Number);
      let diffMinutes = arrH * 60 + arrM - (depH * 60 + depM);
      if (diffMinutes < 0) diffMinutes += 24 * 60; // next day rollover
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
    materials.reduce((acc, m) => acc + (Number(m.tons) || 0), 0).toFixed(2)
  );

  const maxCapacity = activeTruck?.maxCapacityTons ?? 10;
  const isOverloaded = totalTons > maxCapacity;

  // Add material
  const handleAddMaterial = () => {
    const newId = `m-${Date.now()}`;
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
        totalWeightKg: defaultTotal,
        tons: Number((defaultTotal / 1000).toFixed(2)),
      },
    ]);
  };

  // Remove material
  const handleRemoveMaterial = (id: string) => {
    if (materials.length <= 1) {
      showToast('Debe haber al menos un material registrado en el despacho', 'warning');
      return;
    }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Update material with formula: Total Weight = Quantity × Weight
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      showToast('Por favor especifica el destino de entrega', 'warning');
      return;
    }

    const hasEmptyDescription = materials.some((m) => !m.name.trim());
    if (hasEmptyDescription) {
      showToast('Por favor ingresa la descripción para todos los materiales', 'warning');
      return;
    }

    if (isOverloaded) {
      const proceed = confirm(
        `¡Atención! La carga (${totalTons} t) supera la capacidad máxima del camión (${maxCapacity} t). ¿Deseas registrarlo de todas formas con sobrecupo advertido?`
      );
      if (!proceed) return;
    }

    addTrip({
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
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Registrar Viaje"
        showBack
        onBack={goBack}
        subtitle="Despacho de materiales de construcción"
      />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* ESTADO INICIAL DEL VIAJE */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              Estado Inicial del Despacho
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                status === 'En proceso'
                  ? 'bg-[#FFE3CC] text-[#7A4E32] border-[#F47B20]/40'
                  : 'bg-stone-100 text-stone-700 border-stone-300'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setStatus('Programado')}
              className={`py-2.5 px-3 rounded-2xl border text-center transition-all ${
                status === 'Programado'
                  ? 'bg-white border-[#5A3825] shadow-xs ring-2 ring-[#5A3825]/20 text-[#5A3825] font-black'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-white'
              }`}
            >
              <span className="text-xs font-bold block">1. Programado</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Agendado para despacho
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('En proceso')}
              className={`py-2.5 px-3 rounded-2xl border text-center transition-all ${
                status === 'En proceso'
                  ? 'bg-[#FFF8F2] border-[#F47B20] shadow-xs ring-2 ring-[#F47B20]/30 text-[#7A4E32] font-black'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-white'
              }`}
            >
              <span className="text-xs font-bold block">2. En proceso</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Vehículo sale a ruta ahora
              </span>
            </button>
          </div>
        </section>

        {/* 1. INFORMACIÓN GENERAL */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            1. Información General y Asignación
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Fecha del despacho *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Vehículo asignado *
              </label>
              <select
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.plate} ({truck.brand} - {truck.maxCapacityTons} t)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Conductor asignado *
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.fullName} (Lic. {driver.licenseCategory})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Función del conductor durante el viaje
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Chofer', 'Chofer descargador'] as DriverRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setDriverRole(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    driverRole === r
                      ? 'bg-[#5A3825] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Origen del despacho *
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej: Ferretería El Oasis - Sede La Venta, Cajibío"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Destino / Obra de entrega *
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej: Obra Vereda El Carmelo, Cajibío, Cauca"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          {/* REQUISITOS DEL CLIENTE */}
          <div className="bg-[#FFF8F2] p-3.5 rounded-2xl border border-[#FFE3CC] space-y-1.5">
            <label className="block text-xs font-bold text-[#5A3825] flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#F47B20]" />
              Requisitos y Solicitudes del Cliente
            </label>
            <textarea
              rows={2}
              value={customerRequirements}
              onChange={(e) => setCustomerRequirements(e.target.value)}
              placeholder="Instrucciones especiales de descargue, contacto en obra, horarios..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
            />
          </div>
        </section>

        {/* 2. HORARIOS Y DISTANCIA */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            2. Horarios y Odómetro
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Hora de salida</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Hora de llegada estimada
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-[#FFF8F2] p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-[#5A3825]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F47B20]" />
              Duración total estimada:
            </span>
            <span className="text-sm">{calcDurationHours()} horas</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kilometraje inicial (km)
              </label>
              <input
                type="number"
                value={startMileage}
                onChange={(e) => setStartMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kilometraje final (km)
              </label>
              <input
                type="number"
                value={endMileage}
                onChange={(e) => setEndMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-[#FFF8F2] p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-[#5A3825]">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#F47B20]" />
              Distancia recorrida:
            </span>
            <span className="text-sm">{calcDistanceKm} km</span>
          </div>
        </section>

        {/* 3. MATERIAL TRANSPORTADO (UPDATED MANDATORY STRUCTURE) */}
        {/*    Descripción, Cantidad, Peso (unitario), Peso total (auto) */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#F47B20]" />
              3. Material Transportado
            </h3>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="text-xs font-bold text-[#F47B20] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar material</span>
            </button>
          </div>

          <div className="space-y-3">
            {materials.map((mat, index) => (
              <div
                key={mat.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5A3825]">
                    Ítem #{index + 1}
                  </span>
                  {materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(mat.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>

                {/* Descripción del material (Editable text field) */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                    Descripción del material
                  </label>
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => handleMaterialChange(mat.id, 'name', e.target.value)}
                    placeholder="Ej: Cemento gris Argos UG, Arena lavada, Ladrillo tolete"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
                  />
                </div>

                {/* Grid: Cantidad, Peso (Unitario, replaces 'Unidad'), Peso total (Auto, read-only) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
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
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
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
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] font-bold text-[#5A3825]">
                        Peso total
                      </label>
                      <span className="text-[9px] text-[#F47B20] font-bold">Auto</span>
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
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-black text-[#5A3825] bg-stone-100 cursor-not-allowed select-none"
                      title="Campo calculado automáticamente: Cantidad × Peso"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TONNAGE VS CAPACITY COMPARISON BOX */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isOverloaded
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5">
                {isOverloaded ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                Tonelaje total transportado:
              </span>
              <span className="text-base font-black tabular-nums">
                {formatTons(totalTons)} ({totalWeightSum.toLocaleString('es-CO')} kg)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Capacidad máxima camión ({activeTruck?.plate}):</span>
              <span className="font-bold text-[#5A3825]">{formatTons(maxCapacity)}</span>
            </div>

            {isOverloaded && (
              <p className="text-[11px] font-bold text-rose-700 mt-2 pt-2 border-t border-rose-200">
                ¡ADVERTENCIA DE SOBREPESO! La carga excede la capacidad técnica del vehículo en{' '}
                {formatTons(totalTons - maxCapacity)}. Esto puede ocasionar multas de tránsito o riesgo mecánico.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observaciones adicionales del viaje
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Instrucciones de recibo, personas de contacto en obra, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-1 py-3 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 font-bold text-xs hover:bg-stone-50 min-h-[46px]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-2 py-3 px-4 rounded-xl bg-[#F47B20] hover:bg-[#E06810] text-white font-extrabold text-xs shadow-md shadow-[#F47B20]/25 active:scale-98 transition-all min-h-[46px]"
          >
            Guardar y Registrar Viaje
          </button>
        </div>
      </form>
    </div>
  );
};
