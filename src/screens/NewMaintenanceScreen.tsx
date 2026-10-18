/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { MaintenanceType, MaintenanceStatus } from '../types';

export const NewMaintenanceScreen: React.FC = () => {
  const { trucks, addMaintenance, goBack, showToast } = useFleet();

  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  const [type, setType] = useState<MaintenanceType>('Cambio de aceite');
  const [date, setDate] = useState('2026-10-09');
  const [mileage, setMileage] = useState(activeTruck?.currentMileage || 0);
  const [workshop, setWorkshop] = useState('Taller Central Diésel Piendamó - Cajibío');
  const [costCop, setCostCop] = useState(650000);
  const [description, setDescription] = useState('Cambio de aceite diésel 15W-40, filtro de aceite Donaldson y filtro trampa de agua.');
  const [notes, setNotes] = useState('');
  const [nextRecommendedDate, setNextRecommendedDate] = useState('2027-01-09');
  const [nextRecommendedMileage, setNextRecommendedMileage] = useState((activeTruck?.currentMileage || 0) + 10000);
  const [status, setStatus] = useState<MaintenanceStatus>('Al día');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Por favor describe los trabajos preventivos realizados', 'warning');
      return;
    }

    addMaintenance({
      truckId: selectedTruckId,
      type,
      date,
      mileage: Number(mileage),
      workshop,
      costCop: Number(costCop),
      description,
      notes: notes || undefined,
      nextRecommendedDate,
      nextRecommendedMileage: Number(nextRecommendedMileage),
      status,
    });
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Registrar Mantenimiento" showBack onBack={goBack} subtitle="Servicio preventivo para flota" />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Ficha del Mantenimiento
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Camión *
            </label>
            <select
              value={selectedTruckId}
              onChange={(e) => {
                setSelectedTruckId(e.target.value);
                const t = trucks.find((trk) => trk.id === e.target.value);
                if (t) {
                  setMileage(t.currentMileage);
                  setNextRecommendedMileage(t.currentMileage + 10000);
                }
              }}
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
                Tipo de mantenimiento
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Cambio de aceite">Cambio de aceite</option>
                <option value="Cambio de filtros">Cambio de filtros</option>
                <option value="Revisión de frenos">Revisión de frenos</option>
                <option value="Revisión de llantas">Revisión de llantas</option>
                <option value="Alineación y balanceo">Alineación y balanceo</option>
                <option value="Revisión del sistema eléctrico">Revisión del sistema eléctrico</option>
                <option value="Revisión de suspensión">Revisión de suspensión</option>
                <option value="Revisión general">Revisión general</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha realizada *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kilometraje actual *
              </label>
              <input
                type="number"
                required
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Costo del servicio ($ COP)
              </label>
              <input
                type="number"
                min="0"
                value={costCop}
                onChange={(e) => setCostCop(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Taller o responsable
            </label>
            <input
              type="text"
              value={workshop}
              onChange={(e) => setWorkshop(e.target.value)}
              placeholder="Ej: Serviteca Goodyear Calle 13"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Descripción de las labores *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle de aceites usados, referencias de filtros, calibraciones..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Próxima fecha recomendada
              </label>
              <input
                type="date"
                value={nextRecommendedDate}
                onChange={(e) => setNextRecommendedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Próximo kilometraje recomendado
              </label>
              <input
                type="number"
                value={nextRecommendedMileage}
                onChange={(e) => setNextRecommendedMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
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
            Guardar Mantenimiento
          </button>
        </div>
      </form>
    </div>
  );
};
