/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { OasisLogo } from '../components/common/OasisLogo';
import {
  Fuel,
  Wrench,
  AlertTriangle,
  FileCheck,
  History,
  FileText,
  TrendingUp,
  Sparkles,
  Bell,
  User,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ScreenId } from '../types';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  badgeColor?: string;
  screen: ScreenId;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const MoreMenuScreen: React.FC = () => {
  const { navigateTo, kpis, user } = useFleet();

  const menuSections: MenuSection[] = [
    {
      title: 'Operación y Mantenimiento',
      items: [
        {
          id: 'fuel',
          label: 'Combustible',
          description: 'Control de tanqueos, gasto mensual y consumos',
          icon: Fuel,
          color: 'text-amber-700 bg-amber-100',
          screen: 'fuel' as const,
        },
        {
          id: 'breakdowns',
          label: 'Averías',
          description: 'Reporte, seguimiento y solución de fallas mecánicas',
          icon: AlertTriangle,
          color: 'text-rose-600 bg-rose-100',
          badge: kpis.pendingBreakdownsCount > 0 ? `${kpis.pendingBreakdownsCount} abiertas` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800',
          screen: 'breakdowns' as const,
        },
        {
          id: 'maintenance',
          label: 'Mantenimiento preventivo',
          description: 'Servicios periódicos, lubricación y revisiones',
          icon: Wrench,
          color: 'text-emerald-700 bg-emerald-100',
          screen: 'maintenance' as const,
        },
        {
          id: 'documents',
          label: 'Documentos y vencimientos',
          description: 'Monitoreo de SOAT, tecnomecánica y licencias',
          icon: FileCheck,
          color: 'text-[#F47B20] bg-[#FFE3CC]',
          badge: kpis.criticalAlertsCount > 0 ? `${kpis.criticalAlertsCount} por vencer` : undefined,
          badgeColor: 'bg-[#FFE3CC] text-[#7A4E32]',
          screen: 'documents' as const,
        },
      ],
    },
    {
      title: 'Trazabilidad y Reportes',
      items: [
        {
          id: 'history',
          label: 'Historial',
          description: 'Línea de tiempo cronológica por camión y conductor',
          icon: History,
          color: 'text-[#5A3825] bg-stone-100',
          screen: 'history' as const,
        },
        {
          id: 'reports',
          label: 'Reportes',
          description: 'Analíticas y exportación en Excel y PDF',
          icon: FileText,
          color: 'text-[#F47B20] bg-[#FFF8F2]',
          screen: 'reports' as const,
        },
        {
          id: 'kpis',
          label: 'Indicadores de gestión',
          description: 'Costo por km, utilización y disponibilidad de flota',
          icon: TrendingUp,
          color: 'text-blue-700 bg-blue-100',
          screen: 'kpis' as const,
        },
        {
          id: 'smart_analysis',
          label: 'Análisis inteligente',
          description: 'Detección predictiva de anomalías y sugerencias',
          icon: Sparkles,
          color: 'text-purple-700 bg-purple-100',
          screen: 'smart_analysis' as const,
        },
      ],
    },
    {
      title: 'Sistema y Cuenta',
      items: [
        {
          id: 'notifications',
          label: 'Notificaciones',
          description: 'Centro de avisos urgentes e informativos',
          icon: Bell,
          color: 'text-stone-700 bg-stone-100',
          badge: kpis.unreadNotificationsCount > 0 ? `${kpis.unreadNotificationsCount} nuevas` : undefined,
          badgeColor: 'bg-[#F47B20] text-white',
          screen: 'notifications' as const,
        },
        {
          id: 'profile',
          label: 'Perfil',
          description: 'Datos del administrador y preferencias',
          icon: User,
          color: 'text-[#5A3825] bg-stone-100',
          screen: 'profile' as const,
        },
      ],
    },
  ];

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Más Opciones" subtitle="Módulos operacionales y configuración" />

      <div className="px-4 py-4 space-y-5 max-w-4xl mx-auto">
        {/* PROFILE PREVIEW HEADER */}
        <div
          onClick={() => navigateTo('profile')}
          className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#F47B20] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5A3825] text-white font-extrabold text-sm flex items-center justify-center ring-2 ring-[#FFE3CC]">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#2B2B2B]">{user.name}</h3>
              <span className="text-[11px] text-[#F47B20] font-semibold block">
                {user.role}
              </span>
              <span className="text-[10px] text-stone-500">
                {user.company} · {user.location.split(',')[0]}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        {/* MENU SECTIONS */}
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[11px] font-bold text-[#5A3825] uppercase tracking-wider px-1">
              {section.title}
            </h3>

            <div className="bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 shadow-xs overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.screen)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2B2B2B] group-hover:text-[#F47B20] transition-colors">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* BRAND PROMPT FOOTER */}
        <div className="pt-2 flex flex-col items-center text-center opacity-85">
          <OasisLogo size="sm" showSubtitle={false} showSlogan={false} />
          <span className="text-[11px] font-bold text-[#5A3825] mt-1 uppercase">
            Ferretería El Oasis S.A.S.
          </span>
          <span className="text-[10px] text-stone-500">
            La Venta, Cajibío, Cauca · Transporte y Materiales de Construcción
          </span>
        </div>
      </div>
    </div>
  );
};
