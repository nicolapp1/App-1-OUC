/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { FuelType, TruckStatus, ExpirationStatus } from '../types';
import { getDaysRemaining } from '../utils/formatters';
import { Truck, ShieldCheck, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const NewTruckScreen: React.FC = () => {
  const { addTruck, goBack, showToast, trucks } = useFleet();

  // 1. Basic Information
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>(1995);
  
  // Vehicle type with "Otro" custom reveal
  const [vehicleTypeCategory, setVehicleTypeCategory] = useState<string>('Volqueta');
  const [customVehicleType, setCustomVehicleType] = useState<string>('');
  
  const [maxCapacityTons, setMaxCapacityTons] = useState<number | ''>(15.0);
  const [currentMileage, setCurrentMileage] = useState<number | ''>(150000);
  const [fuelType, setFuelType] = useState<FuelType>('Diésel');

  // 2. SOAT
  const [soatPolicyNumber, setSoatPolicyNumber] = useState('');
  const [soatIssueDate, setSoatIssueDate] = useState('2026-01-15');
  const [soatExpDate, setSoatExpDate] = useState('2027-01-15');

  // 3. RTM
  const [rtmCertificateNumber, setRtmCertificateNumber] = useState('');
  const [rtmIssueDate, setRtmIssueDate] = useState('2026-02-10');
  const [rtmExpDate, setRtmExpDate] = useState('2027-02-10');

  // 4. Operational
  const [status, setStatus] = useState<TruckStatus>('Disponible');
  const [observations, setObservations] = useState('');

  // Auto Status Calculations
  const getCalcSoatStatus = (): ExpirationStatus => {
    if (!soatExpDate) return 'Vigente';
    const days = getDaysRemaining(soatExpDate);
    if (days < 0) return 'Vencida';
    if (days <= 30) return 'Próxima a vencer';
    return 'Vigente';
  };

  const getCalcRtmStatus = (): ExpirationStatus => {
    if (!rtmExpDate) return 'Vigente';
    const days = getDaysRemaining(rtmExpDate);
    if (days < 0) return 'Vencida';
    if (days <= 30) return 'Próxima a vencer';
    return 'Vigente';
  };

  const autoSoatStatus = getCalcSoatStatus();
  const autoRtmStatus = getCalcRtmStatus();

  // Normalize plate: remove spaces, uppercase
  const normalizePlateInput = (val: string) => {
    return val.toUpperCase().replace(/\s+/g, '');
  };

  const finalVehicleType =
    vehicleTypeCategory === 'Otro'
      ? customVehicleType.trim() || 'Otro'
      : vehicleTypeCategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPlate = normalizePlateInput(plate);
    if (!normalizedPlate) {
      showToast('Por favor ingresa la placa del vehículo', 'warning');
      return;
    }

    if (!brand.trim()) {
      showToast('Por favor escribe la marca del vehículo', 'warning');
      return;
    }

    if (!model.trim()) {
      showToast('Por favor escribe el modelo o línea del vehículo', 'warning');
      return;
    }

    if (!year || Number(year) < 1950 || Number(year) > new Date().getFullYear() + 1) {
      showToast('Por favor ingresa un año de fabricación válido (desde 1950 en adelante)', 'warning');
      return;
    }

    if (vehicleTypeCategory === 'Otro' && !customVehicleType.trim()) {
      showToast('Por favor especifica el tipo de vehículo personalizado', 'warning');
      return;
    }

    // Check duplicate plate in local list
    const cleanPlate = normalizedPlate.replace(/[\s-]/g, '');
    const exists = trucks.some((t) => t.plate.replace(/[\s-]/g, '') === cleanPlate);
    if (exists) {
      showToast(`Ya existe un vehículo registrado con la placa ${normalizedPlate}`, 'error');
      return;
    }

    const result = addTruck({
      plate: normalizedPlate,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      vehicleType: finalVehicleType,
      maxCapacityTons: maxCapacityTons !== '' ? Number(maxCapacityTons) : undefined,
      currentMileage: currentMileage !== '' ? Number(currentMileage) : 0,
      fuelType,
      status,
      soatPolicyNumber: soatPolicyNumber.trim() || `SOAT-${normalizedPlate}`,
      soatIssueDate: soatIssueDate || undefined,
      soatExpDate: soatExpDate || undefined,
      soatStatus: autoSoatStatus,
      rtmCertificateNumber: rtmCertificateNumber.trim() || `RTM-${normalizedPlate}`,
      rtmIssueDate: rtmIssueDate || undefined,
      rtmExpDate: rtmExpDate || undefined,
      rtmStatus: autoRtmStatus,
      observations: observations.trim() || undefined,
    });

    if (result && !result.success && result.message) {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Nuevo Vehículo" showBack onBack={goBack} subtitle="Ingreso a flota de Ferretería El Oasis" />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* 1. INFORMACIÓN BÁSICA */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#F47B20]" />
              1. Identificación y Especificaciones Básicas
            </h3>
            <span className="text-[10px] text-stone-400 font-medium">* Campos obligatorios</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Placa (Colombia) *
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={plate}
                onChange={(e) => setPlate(normalizePlateInput(e.target.value))}
                placeholder="Ej: TYU670 o TYU-670"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-black uppercase tracking-wider text-stone-900 bg-amber-50/30 focus:bg-white focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Normalización automática a mayúsculas
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Marca del Vehículo *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Nissan, Dodge, Chevrolet, Hino..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Entrada libre de texto para cualquier marca
              </span>
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
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej: UD, 300, C70, N2000, NPR..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Texto libre sin restricciones
              </span>
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
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 1983, 1986, 1996, 2015..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Permite cualquier año (incluyendo 1983, 1986)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo de Vehículo *
              </label>
              <select
                value={vehicleTypeCategory}
                onChange={(e) => setVehicleTypeCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Volqueta">Volqueta</option>
                <option value="Camión">Camión</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Van">Van</option>
                <option value="Otro">Otro (especificar...)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo de Combustible *
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Diésel">Diésel (ACPM)</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Gas">Gas Natural Vehicular (GNV)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* If "Otro" is chosen, reveal editable custom input */}
          {vehicleTypeCategory === 'Otro' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-[#5A3825] mb-1">
                Especificar Tipo de Vehículo Personalizado *
              </label>
              <input
                type="text"
                required
                value={customVehicleType}
                onChange={(e) => setCustomVehicleType(e.target.value)}
                placeholder="Ej: Furgón Refrigerado, Planchón con Grúa, Tractomula..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Capacidad de Carga (Toneladas)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="80"
                value={maxCapacityTons}
                onChange={(e) => setMaxCapacityTons(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 15.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Opcional / según disponibilidad
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kilometraje Actual (km) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentMileage}
                onChange={(e) => setCurrentMileage(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 182400"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* 2. PÓLIZA DE SEGURO (SOAT) */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F47B20]" />
              2. Seguro Obligatorio de Accidentes de Tránsito (SOAT)
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                autoSoatStatus === 'Vigente'
                  ? 'bg-emerald-100 text-emerald-800'
                  : autoSoatStatus === 'Próxima a vencer'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Estado: {autoSoatStatus}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Número de Póliza de Seguro *
            </label>
            <input
              type="text"
              required
              value={soatPolicyNumber}
              onChange={(e) => setSoatPolicyNumber(e.target.value)}
              placeholder="Ej: POL-TYU670-001 o SURA-884910"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Completamente editable — no requiere formato prefijado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de expedición
              </label>
              <input
                type="date"
                value={soatIssueDate}
                onChange={(e) => setSoatIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                required
                value={soatExpDate}
                onChange={(e) => setSoatExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* 3. REVISIÓN TÉCNICO-MECÁNICA (RTM) */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#F47B20]" />
              3. Certificado de Revisión Técnico-Mecánica (RTM)
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                autoRtmStatus === 'Vigente'
                  ? 'bg-emerald-100 text-emerald-800'
                  : autoRtmStatus === 'Próxima a vencer'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Estado: {autoRtmStatus}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Número de Certificado RTM *
            </label>
            <input
              type="text"
              required
              value={rtmCertificateNumber}
              onChange={(e) => setRtmCertificateNumber(e.target.value)}
              placeholder="Ej: RTM-TYU670-001 o CDA-POPAYAN-120"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Completamente editable — registro libre del certificado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de expedición
              </label>
              <input
                type="date"
                value={rtmIssueDate}
                onChange={(e) => setRtmIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                required
                value={rtmExpDate}
                onChange={(e) => setRtmExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* 4. ESTADO OPERACIONAL & OBSERVACIONES */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            4. Estado Operacional y Observaciones
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Estado del Vehículo *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TruckStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
            >
              <option value="Disponible">Disponible (En patio en La Venta listo para despacho)</option>
              <option value="En viaje">En viaje (En ruta activa de entrega)</option>
              <option value="En mantenimiento">En mantenimiento (En taller programado)</option>
              <option value="Fuera de servicio">Fuera de servicio (Inmovilizado)</option>
              <option value="Inactivo">Inactivo (Sin operación)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observaciones del Vehículo (Opcional)
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Volqueta repotenciada con gato telescópico reforzado para transporte de material de río desde Cajibío o Piendamó."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>
        </section>

        {/* ACTION BUTTONS */}
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
            Registrar Vehículo en Flota
          </button>
        </div>
      </form>
    </div>
  );
};
