/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FleetProvider, useFleet } from './context/FleetContext';
import { Toast } from './components/common/Toast';
import { BottomNav } from './components/navigation/BottomNav';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DriversScreen } from './screens/DriversScreen';
import { NewDriverScreen } from './screens/NewDriverScreen';
import { DriverDetailScreen } from './screens/DriverDetailScreen';
import { TrucksScreen } from './screens/TrucksScreen';
import { NewTruckScreen } from './screens/NewTruckScreen';
import { TruckDetailScreen } from './screens/TruckDetailScreen';
import { TripsScreen } from './screens/TripsScreen';
import { NewTripScreen } from './screens/NewTripScreen';
import { TripDetailScreen } from './screens/TripDetailScreen';
import { FuelScreen } from './screens/FuelScreen';
import { NewFuelScreen } from './screens/NewFuelScreen';
import { BreakdownsScreen } from './screens/BreakdownsScreen';
import { NewBreakdownScreen } from './screens/NewBreakdownScreen';
import { BreakdownDetailScreen } from './screens/BreakdownDetailScreen';
import { MaintenanceScreen } from './screens/MaintenanceScreen';
import { NewMaintenanceScreen } from './screens/NewMaintenanceScreen';
import { DocumentsScreen } from './screens/DocumentsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { KpisScreen } from './screens/KpisScreen';
import { SmartAnalysisScreen } from './screens/SmartAnalysisScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MoreMenuScreen } from './screens/MoreMenuScreen';

import { Smartphone, Monitor } from 'lucide-react';

const ScreenRouter: React.FC = () => {
  const { currentScreen, isLoggedIn, viewportMode, setViewportMode } = useFleet();

  // If not logged in and not on splash/login
  if (!isLoggedIn && currentScreen !== 'splash' && currentScreen !== 'login') {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'drivers':
        return <DriversScreen />;
      case 'driver_new':
        return <NewDriverScreen />;
      case 'driver_detail':
        return <DriverDetailScreen />;
      case 'trucks':
        return <TrucksScreen />;
      case 'truck_new':
        return <NewTruckScreen />;
      case 'truck_detail':
        return <TruckDetailScreen />;
      case 'trips':
        return <TripsScreen />;
      case 'trip_new':
        return <NewTripScreen />;
      case 'trip_detail':
        return <TripDetailScreen />;
      case 'fuel':
        return <FuelScreen />;
      case 'fuel_new':
        return <NewFuelScreen />;
      case 'breakdowns':
        return <BreakdownsScreen />;
      case 'breakdown_new':
        return <NewBreakdownScreen />;
      case 'breakdown_detail':
        return <BreakdownDetailScreen />;
      case 'maintenance':
        return <MaintenanceScreen />;
      case 'maintenance_new':
        return <NewMaintenanceScreen />;
      case 'documents':
        return <DocumentsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'kpis':
        return <KpisScreen />;
      case 'smart_analysis':
        return <SmartAnalysisScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'more_menu':
        return <MoreMenuScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav = currentScreen !== 'splash' && currentScreen !== 'login';

  return (
    <div className="min-h-screen bg-stone-100/90 text-[#2B2B2B] flex flex-col items-center justify-start antialiased selection:bg-[#FFE3CC] selection:text-[#5A3825]">
      {/* Top Testing Utility Bar for Viewport Preview (Only visible on large screens) */}
      <div className="hidden lg:flex w-full bg-[#5A3825] text-white py-1.5 px-6 items-center justify-between text-xs z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-[#F47B20] tracking-wider uppercase">
            Oasis Flota
          </span>
          <span className="text-white/60">·</span>
          <span className="text-white/80 font-medium">
            Ferretería El Oasis S.A.S. — Gestión Inteligente de Transporte
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/70 text-[11px]">Modo de visualización:</span>
          <div className="flex items-center p-0.5 bg-black/25 rounded-lg">
            <button
              onClick={() => setViewportMode('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-[#F47B20] text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil (390px)</span>
            </button>
            <button
              onClick={() => setViewportMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                viewportMode === 'responsive'
                  ? 'bg-[#F47B20] text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Pantalla Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Frame */}
      <div
        className={`w-full transition-all duration-300 relative ${
          viewportMode === 'mobile'
            ? 'max-w-[410px] my-0 lg:my-6 lg:rounded-[40px] shadow-2xl overflow-hidden border-0 lg:border-8 lg:border-stone-800 bg-[#F8F9FA] min-h-screen lg:min-h-[844px]'
            : 'max-w-7xl w-full bg-[#F8F9FA] min-h-screen shadow-md'
        }`}
      >
        {/* Render Active Screen */}
        {renderScreen()}

        {/* Global Toast */}
        <Toast />

        {/* Persistent Bottom Nav */}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FleetProvider>
      <ScreenRouter />
    </FleetProvider>
  );
}
