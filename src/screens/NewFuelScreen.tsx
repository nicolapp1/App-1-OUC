/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { FuelType } from '../types';
import { formatCOP } from '../utils/formatters';

export const NewFuelScreen: React.FC = () => {
  const { trucks, fuelRecords, addFuelRecord, goBack, showToast } = useFleet();

  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const [date, setDate] = useState('2026-10-09');
  const [time, setTime] = useState('17:30');
  const [fuelType, setFuelType] = useState<FuelType>('Diésel');
  const [liters, setLiters] = useState(90);
  const [pricePerLiterCop, setPricePerLiterCop] = useState(2850);
  const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  const [currentMileage, setCurrentMileage] = useState(activeTruck?.currentMileage || 0);
  const [gasStation, setGasStation] = useState('Primax Cajibío Salida Popayán');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activeTruck) {
      setCurrentMileage(activeTruck.currentMileage);
    }
  }, [selectedTruckId]);

  // Auto total calculation
  const totalCostCop = Math.round(Number(liters) * Number(pricePerLiterCop));

  // Auto km/L estimate based on previous refill
  const previousRefill = fuelRecords
    .filter((f) => f.truckId === selectedTruckId)
    .sort((a, b) => b.currentMileage - a.currentMileage)[0];

  const estimatedKmPerL =
    previousRefill && currentMileage > previousRefill.currentMileage && liters > 0
      ? Number(((currentMileage - previousRefill.currentMileage) / liters).toFixed(2))
      : 3.8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTruckId || liters <= 0) {
      showToast('Por favor ingresa una cantidad válida de litros', 'warning');
      return;
    }

    addFuelRecord({
      truckId: selectedTruckId,
      date,
      time,
      fuelType,
      liters: Number(liters),
      pricePerLiterCop: Number(pricePerLiterCop),
      totalCostCop,
      currentMileage: Number(currentMileage),
      gasStation,
      invoiceNumber: invoiceNumber || `FAC-${Date.now().toString().slice(-6)}`,
      notes: notes || undefined,
      kmPerLiter: estimatedKmPerL,
    });
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Registrar Combustible" showBack onBack={goBack} subtitle="Cargue de combustible para flota" />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Detalles del Tanqueo
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Camión *
            </label>
            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
            >
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.plate} — {truck.brand} {truck.model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha del cargue *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo de combustible
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Diésel">Diésel (ACPM)</option>
                <option value="Gasolina">Gasolina Corriente</option>
                <option value="Gas">Gas Natural Vehicular</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kilometraje al tanquear *
              </label>
              <input
                type="number"
                required
                value={currentMileage}
                onChange={(e) => setCurrentMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Cantidad de Litros *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={liters}
                onChange={(e) => setLiters(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Precio por Litro ($ COP)
              </label>
              <input
                type="number"
                min="100"
                value={pricePerLiterCop}
                onChange={(e) => setPricePerLiterCop(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          {/* TOTAL COST AUTO DISPLAY */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8F2] border border-[#FFE3CC] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Valor Total Liquidado
              </span>
              <span className="text-base font-black text-[#5A3825] tabular-nums">
                {formatCOP(totalCostCop)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Rendimiento Estimado
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ~ {estimatedKmPerL} km/L
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estación de servicio
              </label>
              <input
                type="text"
                value={gasStation}
                onChange={(e) => setGasStation(e.target.value)}
                placeholder="Ej: Primax Cajibío Salida Popayán"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Número de factura o recibo
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ej: FAC-884192"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tanque lleno, novedad de surtidor, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>
        </section>

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
            Guardar Tanqueo
          </button>
        </div>
      </form>
    </div>
  );
};
