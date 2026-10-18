/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  Truck,
  User,
  ShieldAlert,
} from 'lucide-react';
import { formatDateCO, getDaysRemaining } from '../utils/formatters';

interface LegalDocItem {
  id: string;
  documentType: 'SOAT' | 'Tecnomecánica' | 'Licencia de conducción' | 'Contrato laboral';
  entityName: string;
  entitySubtitle: string;
  expDate: string;
  daysRemaining: number;
  status: 'Vigente' | 'Próximo a vencer' | 'Vencido';
  entityType: 'truck' | 'driver';
  entityId: string;
}

export const DocumentsScreen: React.FC = () => {
  const { trucks, drivers, navigateTo } = useFleet();
  const [filterRange, setFilterRange] = useState<'Todos' | '7d' | '30d' | '60d' | 'Vencidos'>('Todos');

  // Build centralized list of documents
  const allDocs: LegalDocItem[] = [];

  // Trucks SOAT & RTM
  trucks.forEach((t) => {
    // SOAT
    if (t.soatExpDate) {
      const soatDays = getDaysRemaining(t.soatExpDate);
      allDocs.push({
        id: `soat-${t.id}`,
        documentType: 'SOAT',
        entityName: `Camión ${t.plate}`,
        entitySubtitle: `${t.brand} ${t.model} · Póliza ${t.soatPolicyNumber}`,
        expDate: t.soatExpDate,
        daysRemaining: soatDays,
        status: soatDays < 0 ? 'Vencido' : soatDays <= 30 ? 'Próximo a vencer' : 'Vigente',
        entityType: 'truck',
        entityId: t.id,
      });
    }

    // RTM
    if (t.rtmExpDate) {
      const rtmDays = getDaysRemaining(t.rtmExpDate);
      allDocs.push({
        id: `rtm-${t.id}`,
        documentType: 'Tecnomecánica',
        entityName: `Camión ${t.plate}`,
        entitySubtitle: `${t.brand} ${t.model} · Cert. ${t.rtmCertificateNumber}`,
        expDate: t.rtmExpDate,
        daysRemaining: rtmDays,
        status: rtmDays < 0 ? 'Vencido' : rtmDays <= 30 ? 'Próximo a vencer' : 'Vigente',
        entityType: 'truck',
        entityId: t.id,
      });
    }
  });

  // Drivers Licenses & Contracts
  drivers.forEach((d) => {
    // License
    if (d.licenseExpDate) {
      const licDays = getDaysRemaining(d.licenseExpDate);
      allDocs.push({
        id: `lic-${d.id}`,
        documentType: 'Licencia de conducción',
        entityName: d.fullName,
        entitySubtitle: `C.C. ${d.documentNumber} · Categoría ${d.licenseCategory}`,
        expDate: d.licenseExpDate,
        daysRemaining: licDays,
        status: licDays < 0 ? 'Vencido' : licDays <= 30 ? 'Próximo a vencer' : 'Vigente',
        entityType: 'driver',
        entityId: d.id,
      });
    }

    // Contract (if not indefinido)
    if (d.contractType !== 'Término indefinido' && d.contractEndDate) {
      const conDays = getDaysRemaining(d.contractEndDate);
      allDocs.push({
        id: `con-${d.id}`,
        documentType: 'Contrato laboral',
        entityName: d.fullName,
        entitySubtitle: `C.C. ${d.documentNumber} · ${d.contractType}`,
        expDate: d.contractEndDate,
        daysRemaining: conDays,
        status: conDays < 0 ? 'Vencido' : conDays <= 30 ? 'Próximo a vencer' : 'Vigente',
        entityType: 'driver',
        entityId: d.id,
      });
    }
  });

  // Sort by days remaining ascending
  allDocs.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Filter
  const filteredDocs = allDocs.filter((doc) => {
    if (filterRange === 'Todos') return true;
    if (filterRange === 'Vencidos') return doc.daysRemaining < 0;
    if (filterRange === '7d') return doc.daysRemaining >= 0 && doc.daysRemaining <= 7;
    if (filterRange === '30d') return doc.daysRemaining >= 0 && doc.daysRemaining <= 30;
    if (filterRange === '60d') return doc.daysRemaining >= 0 && doc.daysRemaining <= 60;
    return true;
  });

  const expiredCount = allDocs.filter((d) => d.daysRemaining < 0).length;
  const soonCount = allDocs.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30).length;

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Documentos y Vencimientos" subtitle="Monitoreo legal y reglamentario" />

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* ALERT HEADER */}
        {(expiredCount > 0 || soonCount > 0) && (
          <div className="bg-[#FFF8F2] border border-[#FFE3CC] rounded-3xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE3CC] text-[#F47B20] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#5A3825]">
                  Atención Requerida en Documentación
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  {expiredCount} vencidos · {soonCount} próximos a vencer en los siguientes 30 días
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TIME FILTER BUTTONS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {[
            { id: 'Todos', label: 'Todos' },
            { id: '7d', label: 'Próximos 7 días' },
            { id: '30d', label: 'Próximos 30 días' },
            { id: '60d', label: 'Próximos 60 días' },
            { id: 'Vencidos', label: 'Vencidos' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRange(f.id as any)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                filterRange === f.id
                  ? 'bg-[#5A3825] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* DOCUMENTS LIST */}
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
              <p className="text-xs text-stone-500 font-medium">
                No hay documentos que coincidan con el filtro seleccionado.
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isExpired = doc.daysRemaining < 0;
              const isUrgent = doc.daysRemaining >= 0 && doc.daysRemaining <= 15;

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    if (doc.entityType === 'truck') {
                      navigateTo('truck_detail', { truckId: doc.entityId });
                    } else {
                      navigateTo('driver_detail', { driverId: doc.entityId });
                    }
                  }}
                  className={`bg-white rounded-3xl p-4 border shadow-xs hover:border-[#F47B20] cursor-pointer transition-all active:scale-[0.99] ${
                    isExpired
                      ? 'border-rose-300 bg-rose-50/30'
                      : isUrgent
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-stone-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#5A3825]">
                          {doc.documentType}
                        </span>
                        <span className="text-[10px] text-stone-500 font-semibold">
                          ({doc.entityType === 'truck' ? 'Vehículo' : 'Conductor'})
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2B2B2B] mt-0.5">
                        {doc.entityName}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {doc.entitySubtitle}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg inline-block ${
                          isExpired
                            ? 'bg-rose-100 text-rose-800'
                            : isUrgent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isExpired
                          ? `Venció hace ${Math.abs(doc.daysRemaining)} días`
                          : doc.daysRemaining === 0
                          ? 'Vence hoy'
                          : `Vence en ${doc.daysRemaining} días`}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-1">
                        Fecha: {formatDateCO(doc.expDate)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
