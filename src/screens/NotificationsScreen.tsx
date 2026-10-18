/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  Calendar,
  Filter,
} from 'lucide-react';
import { formatDateCO } from '../utils/formatters';
import { NotificationPriority } from '../types';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateTo,
    goBack,
  } = useFleet();

  const [priorityFilter, setPriorityFilter] = useState<'Todas' | NotificationPriority>('Todas');

  const filteredNotifs = notifications.filter((n) => {
    if (priorityFilter === 'Todas') return true;
    return n.priority === priorityFilter;
  });

  const priorityStyles: Record<NotificationPriority, { bg: string; text: string; icon: any; iconColor: string }> = {
    Informativa: {
      bg: 'bg-stone-50 border-stone-200',
      text: 'text-stone-700',
      icon: Info,
      iconColor: 'text-[#5A3825]',
    },
    Advertencia: {
      bg: 'bg-[#FFF8F2] border-[#FFE3CC]',
      text: 'text-[#7A4E32]',
      icon: AlertTriangle,
      iconColor: 'text-[#F47B20]',
    },
    Crítica: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar
        title="Centro de Alertas"
        subtitle="Notificaciones de flota y legal"
        showBack
        onBack={goBack}
        rightAction={
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] font-bold text-[#F47B20] hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Leer todas</span>
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* FILTERS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5 mr-1" />
          {(['Todas', 'Crítica', 'Advertencia', 'Informativa'] as const).map(
            (priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  priorityFilter === priority
                    ? 'bg-[#5A3825] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {priority}
              </button>
            )
          )}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 p-6">
              <p className="text-xs text-stone-500 font-medium">
                No hay notificaciones para este filtro.
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const pStyle = priorityStyles[notif.priority];
              const Icon = pStyle.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.relatedTruckId) {
                      navigateTo('truck_detail', { truckId: notif.relatedTruckId });
                    } else if (notif.relatedDriverId) {
                      navigateTo('driver_detail', { driverId: notif.relatedDriverId });
                    }
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer relative shadow-xs hover:border-[#F47B20] ${pStyle.bg} ${
                    !notif.read ? 'ring-1 ring-[#F47B20]/40' : 'opacity-90'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-white shadow-2xs shrink-0 mt-0.5 ${pStyle.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-[#2B2B2B]">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-[#F47B20]" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            notif.priority === 'Crítica'
                              ? 'bg-rose-200 text-rose-900'
                              : notif.priority === 'Advertencia'
                              ? 'bg-[#FFE3CC] text-[#7A4E32]'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {notif.priority}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed mb-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>Categoría: {notif.category}</span>
                        <span>{formatDateCO(notif.date)}</span>
                      </div>
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
