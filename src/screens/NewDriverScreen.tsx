/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  LicenseCategory,
  MedicalFitness,
  DriverRole,
  ContractType,
  DriverStatus,
  ExpirationStatus,
  ContractStatus,
} from '../types';
import { getDaysRemaining } from '../utils/formatters';

export const NewDriverScreen: React.FC = () => {
  const { addDriver, goBack, showToast } = useFleet();

  // Personal Info
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Driver License
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>('C2');
  const [licenseIssueDate, setLicenseIssueDate] = useState('2023-01-15');
  const [licenseExpDate, setLicenseExpDate] = useState('2027-01-15');

  // Medical Fitness
  const [medicalFitness, setMedicalFitness] = useState<MedicalFitness>('Apto');
  const [medicalRestrictions, setMedicalRestrictions] = useState('');

  // Function / Role
  const [role, setRole] = useState<DriverRole>('Chofer descargador');

  // Contract
  const [contractType, setContractType] = useState<ContractType>('Término fijo');
  const [contractStartDate, setContractStartDate] = useState('2026-01-01');
  const [contractEndDate, setContractEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<DriverStatus>('Activo');

  // Calculate automated status for License
  const getCalcLicenseStatus = (): ExpirationStatus => {
    const days = getDaysRemaining(licenseExpDate);
    if (days < 0) return 'Vencida';
    if (days <= 30) return 'Próxima a vencer';
    return 'Vigente';
  };

  // Calculate automated status for Contract
  const getCalcContractStatus = (): ContractStatus => {
    if (contractType === 'Término indefinido') return 'Vigente';
    const days = getDaysRemaining(contractEndDate);
    if (days < 0) return 'Finalizado';
    if (days <= 30) return 'Próximo a vencer';
    return 'Vigente';
  };

  const calculatedLicenseStatus = getCalcLicenseStatus();
  const calculatedContractStatus = getCalcContractStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !documentNumber.trim() || !licenseNumber.trim()) {
      showToast('Revisa los campos obligatorios marcados con *', 'warning');
      return;
    }

    addDriver({
      fullName,
      documentNumber,
      phone: phone || '310 000 0000',
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@eloasis.com.co`,
      address: address || 'La Venta, Cajibío, Cauca',
      licenseNumber,
      licenseCategory,
      licenseIssueDate,
      licenseExpDate,
      licenseStatus: calculatedLicenseStatus,
      medicalFitness,
      medicalRestrictions: medicalRestrictions || undefined,
      role,
      contractType,
      contractStartDate,
      contractEndDate,
      contractStatus: calculatedContractStatus,
      status,
    });
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Nuevo Conductor" showBack onBack={goBack} subtitle="Registro oficial de operador" />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* 1. INFORMACIÓN PERSONAL */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            1. Información Personal
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Pedro Antonio Morales"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Número de identificación (C.C.) *
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ej: 80.123.456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Teléfono de contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 312 456 7890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pedro.morales@eloasis.com.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Dirección de residencia
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Vereda La Venta, Cajibío, Cauca"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* 2. LICENCIA DE CONDUCCIÓN */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              2. Licencia de Conducción
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                calculatedLicenseStatus === 'Vigente'
                  ? 'bg-emerald-100 text-emerald-800'
                  : calculatedLicenseStatus === 'Próxima a vencer'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Estado auto: {calculatedLicenseStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Número de licencia *
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Ej: 11001-80123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Categoría de licencia
              </label>
              <select
                value={licenseCategory}
                onChange={(e) => setLicenseCategory(e.target.value as LicenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="C1">C1 (Automóviles y camionetas públicas)</option>
                <option value="C2">C2 (Camiones rígidos, busetas y volquetas)</option>
                <option value="C3">C3 (Vehículos articulados / tractomulas)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de expedición
              </label>
              <input
                type="date"
                value={licenseIssueDate}
                onChange={(e) => setLicenseIssueDate(e.target.value)}
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
                value={licenseExpDate}
                onChange={(e) => setLicenseExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* 3. APTITUD MÉDICA Y FUNCIÓN */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            3. Aptitud Médica y Función Operativa
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Aptitud médica para conducción
              </label>
              <select
                value={medicalFitness}
                onChange={(e) => setMedicalFitness(e.target.value as MedicalFitness)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Apto">Apto</option>
                <option value="Apto con restricciones">Apto con restricciones</option>
                <option value="Pendiente de valoración">Pendiente de valoración</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Función asignada
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as DriverRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Chofer">Chofer</option>
                <option value="Chofer descargador">Chofer descargador</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Restricciones u observaciones operativas (Opcional)
            </label>
            <input
              type="text"
              value={medicalRestrictions}
              onChange={(e) => setMedicalRestrictions(e.target.value)}
              placeholder="Ej: Uso de faja de carga, lentes correctivos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
            />
          </div>
        </section>

        {/* 4. CONTRATO LABORAL */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              4. Contrato Laboral y Estado
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFE3CC] text-[#7A4E32]">
              Contrato: {calculatedContractStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tipo de contrato
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Término fijo">Término fijo</option>
                <option value="Término indefinido">Término indefinido</option>
                <option value="Prestación de servicios">Prestación de servicios</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estado operativo actual
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DriverStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden bg-white"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="En licencia">En licencia</option>
                <option value="Contrato vencido">Contrato vencido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de finalización
              </label>
              <input
                type="date"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
                disabled={contractType === 'Término indefinido'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden disabled:bg-stone-100 disabled:text-stone-400"
              />
            </div>
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
            Guardar Conductor
          </button>
        </div>
      </form>
    </div>
  );
};
