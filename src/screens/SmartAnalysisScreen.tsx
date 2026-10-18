/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { InsightCategory } from '../types';

export const SmartAnalysisScreen: React.FC = () => {
  const { smartInsights, trucks, navigateTo, goBack } = useFleet();
  const [filterCategory, setFilterCategory] = useState<'Todas' | InsightCategory>('Todas');

  const filteredInsights = smartInsights.filter((ins) => {
    if (filterCategory === 'Todas') return true;
    return ins.category === filterCategory;
  });

  const categoryStyles: Record<InsightCategory, { bg: string; text: string; icon: any; iconColor: string }> = {
    Información: {
      bg: 'bg-stone-50 border-stone-200',
      text: 'text-stone-800',
      icon: Info,
      iconColor: 'text-[#5A3825]',
    },
    Recomendación: {
      bg: 'bg-emerald-50/70 border-emerald-200',
      text: 'text-emerald-900',
      icon: Lightbulb,
      iconColor: 'text-emerald-600',
    },
    Advertencia: {
      bg: 'bg-[#FFF8F2] border-[#FFE3CC]',
      text: 'text-[#7A4E32]',
      icon: AlertTriangle,
      iconColor: 'text-[#F47B20]',
    },
    Crítica: {
      bg: 'bg-rose-50/80 border-rose-200',
      text: 'text-rose-900',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Análisis Inteligente" subtitle="Detección de patrones y anomalías" showBack onBack={goBack} />

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* BANNER CLARIFICATION AS REQUIRED BY PROMPT */}
        <div className="bg-gradient-to-br from-[#5A3825] to-[#7A4E32] rounded-3xl p-5 text-white shadow-lg shadow-[#5A3825]/10 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F47B20]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Motor de Diagnóstico Predictivo
            </h2>
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            Algoritmos analíticos que comparan rendimientos de combustible, historiales mecánicos e intervalos de uso de los camiones para anticipar fallas y optimizar despachos en El Oasis.
          </p>
          <div className="pt-2 border-t border-white/20">
            <span className="text-[10px] text-[#FFE3CC] font-semibold italic">
              * Datos simulados para modelado de decisiones inteligentes de transporte.
            </span>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todas', 'Crítica', 'Advertencia', 'Recomendación', 'Información'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#5A3825] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* INSIGHT CARDS */}
        <div className="space-y-3">
          {filteredInsights.map((insight) => {
            const style = categoryStyles[insight.category];
            const Icon = style.icon;
            const truck = trucks.find((t) => t.id === insight.truckId);

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-3xl border shadow-xs transition-all space-y-3 ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-white shadow-2xs ${style.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#2B2B2B]">
                        {insight.title}
                      </h3>
                      {truck && (
                        <span className="text-[11px] font-bold text-[#5A3825]">
                          Vehículo: {truck.plate} ({truck.brand} {truck.model})
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      insight.category === 'Crítica'
                        ? 'bg-rose-200 text-rose-900'
                        : insight.category === 'Advertencia'
                        ? 'bg-[#FFE3CC] text-[#7A4E32]'
                        : insight.category === 'Recomendación'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {insight.category}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {insight.description}
                </p>

                {insight.actionText && (
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#5A3825]">
                      Acción sugerida: {insight.actionText}
                    </span>
                    {truck && (
                      <button
                        onClick={() => navigateTo('truck_detail', { truckId: truck.id })}
                        className="text-xs font-bold text-[#F47B20] hover:underline flex items-center gap-0.5"
                      >
                        Ver camión <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
