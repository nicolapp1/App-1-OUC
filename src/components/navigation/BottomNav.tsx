/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { LayoutDashboard, Navigation, Truck, Users, Menu } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useFleet();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: LayoutDashboard,
      screen: 'dashboard' as const,
      isActive: currentScreen === 'dashboard',
    },
    {
      id: 'trips',
      label: 'Viajes',
      icon: Navigation,
      screen: 'trips' as const,
      isActive: currentScreen === 'trips' || currentScreen === 'trip_new' || currentScreen === 'trip_detail',
    },
    {
      id: 'trucks',
      label: 'Camiones',
      icon: Truck,
      screen: 'trucks' as const,
      isActive: currentScreen === 'trucks' || currentScreen === 'truck_new' || currentScreen === 'truck_detail',
    },
    {
      id: 'drivers',
      label: 'Conductores',
      icon: Users,
      screen: 'drivers' as const,
      isActive: currentScreen === 'drivers' || currentScreen === 'driver_new' || currentScreen === 'driver_detail',
    },
    {
      id: 'more',
      label: 'Más',
      icon: Menu,
      screen: 'more_menu' as const,
      isActive: [
        'more_menu',
        'fuel',
        'fuel_new',
        'breakdowns',
        'breakdown_new',
        'breakdown_detail',
        'maintenance',
        'maintenance_new',
        'documents',
        'history',
        'reports',
        'kpis',
        'smart_analysis',
        'profile',
        'notifications',
      ].includes(currentScreen),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg shadow-black/5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.screen)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors relative ${
                item.isActive ? 'text-[#F47B20]' : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    item.isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#F47B20] rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate ${
                  item.isActive ? 'font-bold text-[#F47B20]' : 'font-medium text-stone-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
