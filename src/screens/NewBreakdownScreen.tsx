/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { BreakdownSeverity, BreakdownStatus } from '../types';
import { Paperclip, Upload } from 'lucide-react';

export const NewBreakdownScreen: React.FC = () => {
  const { trucks, addBreakdown, goBack, showToast } = useFleet();

  const [selectedTruckId, setSelectedTruckId] = useState(trucks[0]?.id || '');
  const [date, setDate] = useState('2026-10-09');
  const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  const [mileage, setMileage] = useState(activeTruck?.currentMileage || 0);
  const [type, setType] = useState('Sistema de Frenos');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BreakdownSeverity>('Moderada');
  const [status, setStatus] = useState<BreakdownStatus>('Pendiente');

  // Solution details (if solved)
  const [solutionDate, setSolutionDate] = useState('2026-10-09');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [workshop, setWorkshop] = useState('Taller Diésel La Venta - Cajibío');
  const [repairCostCop, setRepairCostCop] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Por favor describe la avería ocurrida', 'warning');
      return;
    }

    addBreakdown({
      truckId: selectedTruckId,
      date,
      mileage: Number(mileage),
      type,
      description,
      severity,
      status,
      solutionDate: status === 'Solucionada' ? solutionDate : undefined,
      solutionDescription: status === 'Solucionada' ? solutionDescription : undefined,
      workshop: workshop || undefined,
      repairCostCop: repairCostCop > 0 ? Number(repairCostCop) : undefined,
      notes: notes || undefined,
      attachmentName: attachmentName || undefined,
    });
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Reportar Avería" showBack onBack={goBack} subtitle="Incidente mecánico o falla en vehículo" />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Detalle del Incidente
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Camión afectado *
            </label>
            <select
              value={selectedTruckId}
              onChange={(e) => {
                setSelectedTruckId(e.target.value);
                const t = trucks.find((trk) => trk.id === e.target.value);
                if (t) setMileage(t.currentMileage);
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
                Fecha del incidente *
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
                Kilometraje al momento *
              </label>
              <input
                type="number"
                required
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo o subsistema averiado
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Sistema de Frenos">Sistema de Frenos</option>
                <option value="Suspensión y Ejes">Suspensión y Ejes</option>
                <option value="Motor y Enfriamiento">Motor y Enfriamiento</option>
                <option value="Transmisión y Embrague">Transmisión y Embrague</option>
                <option value="Sistema Eléctrico y Luces">Sistema Eléctrico y Luces</option>
                <option value="Bomba Hidráulica y Volco">Bomba Hidráulica y Volco</option>
                <option value="Llantas y Rines">Llantas y Rines</option>
                <option value="Carrocería / Estacas">Carrocería / Estacas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nivel de gravedad
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as BreakdownSeverity)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#5A3825] focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Leve">Leve (Permite operar con precaución)</option>
                <option value="Moderada">Moderada (Requiere taller en 24h)</option>
                <option value="Grave">Grave (Camión debe detenerse)</option>
                <option value="Crítica">Crítica (Inmovilizado / Riesgo vital)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Descripción detallada de la avería *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Fuga de aire en manguera flexible de freno tándem trasero, pedal con recorrido largo y advertencia sonora en tablero..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          {/* ATTACHMENT PLACEHOLDER */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Adjunto fotográfico o evidencia (Opcional)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttachmentName('foto_evidencia_freno_tambor_091026.jpg')}
                className="py-2 px-3 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:border-[#F47B20] hover:text-[#F47B20] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Adjuntar foto de la falla</span>
              </button>
              {attachmentName && (
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Paperclip className="w-3 h-3" />
                  {attachmentName}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* STATUS & REPAIR DETAILS */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Estado de Reparación
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estado inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BreakdownStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Pendiente">Pendiente (Por revisión)</option>
                <option value="En reparación">En reparación (En taller)</option>
                <option value="Solucionada">Solucionada (Reparación lista)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Taller o responsable
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                placeholder="Ej: Taller Diésel Los Andes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          {status === 'Solucionada' && (
            <div className="space-y-3 pt-2 border-t border-stone-100 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha de solución
                  </label>
                  <input
                    type="date"
                    value={solutionDate}
                    onChange={(e) => setSolutionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Costo de reparación ($ COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={repairCostCop}
                    onChange={(e) => setRepairCostCop(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Descripción de la solución
                </label>
                <textarea
                  rows={2}
                  value={solutionDescription}
                  onChange={(e) => setSolutionDescription(e.target.value)}
                  placeholder="Repuestos instalados, pruebas de frenado realizadas en CDA..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>
            </div>
          )}
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
            Guardar Reporte
          </button>
        </div>
      </form>
    </div>
  );
};
