/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Driver,
  Truck,
  Trip,
  FuelRecord,
  Breakdown,
  MaintenanceRecord,
  AlertNotification,
  SmartInsight,
  ScreenId,
  ViewportMode,
  UserProfile,
  TripStatus,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_DRIVERS,
  INITIAL_TRUCKS,
  INITIAL_TRIPS,
  INITIAL_FUEL_RECORDS,
  INITIAL_BREAKDOWNS,
  INITIAL_MAINTENANCES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SMART_INSIGHTS,
} from '../data/mockData';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface FleetContextType {
  // Navigation & Viewport
  currentScreen: ScreenId;
  screenHistory: ScreenId[];
  navigateTo: (screen: ScreenId, params?: { truckId?: string; driverId?: string; tripId?: string; breakdownId?: string }) => void;
  goBack: () => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;

  // Selected Entities
  selectedTruckId: string | null;
  selectedDriverId: string | null;
  selectedTripId: string | null;
  selectedBreakdownId: string | null;

  // Data Collections
  drivers: Driver[];
  trucks: Truck[];
  trips: Trip[];
  fuelRecords: FuelRecord[];
  breakdowns: Breakdown[];
  maintenances: MaintenanceRecord[];
  notifications: AlertNotification[];
  smartInsights: SmartInsight[];

  // User & Auth
  user: UserProfile;
  isLoggedIn: boolean;
  login: (rememberMe?: boolean) => void;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Driver CRUD & Assignment
  addDriver: (driver: Omit<Driver, 'id'>) => boolean;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  assignVehicleToDriver: (driverId: string, truckPlate: string | null) => { success: boolean; message?: string };

  // Truck CRUD & Assignment
  addTruck: (truck: Omit<Truck, 'id'>) => { success: boolean; message?: string };
  updateTruck: (id: string, truck: Partial<Truck>) => { success: boolean; message?: string };
  deleteTruck: (id: string) => void;
  archiveTruck: (id: string) => void;
  assignDriverToTruck: (truckId: string, driverId: string | null) => { success: boolean; message?: string };

  // Trip CRUD & Kanban
  addTrip: (trip: Omit<Trip, 'id' | 'code'>) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  updateTripStatus: (
    id: string,
    newStatus: TripStatus,
    confirmationData?: {
      actualDeliveryDate?: string;
      actualDeliveryTime?: string;
      recipientName?: string;
      deliveryNotes?: string;
      undeliveredReason?: string;
    }
  ) => void;
  deleteTrip: (id: string) => void;

  // Fuel CRUD
  addFuelRecord: (fuel: Omit<FuelRecord, 'id'>) => void;
  deleteFuelRecord: (id: string) => void;

  // Breakdown CRUD
  addBreakdown: (breakdown: Omit<Breakdown, 'id'>) => void;
  solveBreakdown: (id: string, solutionData: { solutionDescription: string; workshop: string; repairCostCop: number; solutionDate: string }) => void;
  deleteBreakdown: (id: string) => void;

  // Maintenance CRUD
  addMaintenance: (maintenance: Omit<MaintenanceRecord, 'id'>) => void;
  deleteMaintenance: (id: string) => void;

  // Notification Operations
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Toast
  toast: ToastMessage | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;

  // System
  resetData: () => void;

  // Global Computed Metrics
  kpis: {
    totalTrucks: number;
    availableTrucks: number;
    inTripTrucks: number;
    inMaintenanceTrucks: number;
    outOfServiceTrucks: number;
    activeDrivers: number;
    monthlyTripsCount: number;
    monthlyTons: number;
    monthlyFuelExpense: number;
    monthlyFuelLiters: number;
    avgFuelConsumptionKmPerL: number;
    pendingBreakdownsCount: number;
    unreadNotificationsCount: number;
    criticalAlertsCount: number;
    delayedTripsCount: number;
  };
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'oasis_flota_state_cajibio_v3';

// Normalizer for plates (remove dashes/spaces, uppercase)
export const normalizePlate = (plate: string) => plate.replace(/[\s-]/g, '').toUpperCase();

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load and merge initial trucks with plate uniqueness constraint
  const [trucks, setTrucks] = useState<Truck[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_trucks`);
      let list: Truck[] = saved ? JSON.parse(saved) : [];
      // Ensure the 5 required vehicles exist by plate uniqueness
      INITIAL_TRUCKS.forEach((initialTruck) => {
        const norm = normalizePlate(initialTruck.plate);
        if (!list.some((t) => normalizePlate(t.plate) === norm)) {
          list.push(initialTruck);
        }
      });
      return list.length > 0 ? list : INITIAL_TRUCKS;
    } catch {
      return INITIAL_TRUCKS;
    }
  });

  // Load and merge initial drivers with identification uniqueness constraint
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_drivers`);
      let list: Driver[] = saved ? JSON.parse(saved) : [];
      INITIAL_DRIVERS.forEach((initialDriver) => {
        if (!list.some((d) => d.documentNumber === initialDriver.documentNumber)) {
          list.push(initialDriver);
        }
      });
      return list.length > 0 ? list : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_trips`);
      if (saved) {
        const parsed: Trip[] = JSON.parse(saved);
        return parsed.map((t) => ({
          ...t,
          status:
            t.status === 'En curso' ? 'En proceso' : t.status === 'Entregado' ? 'Completado' : t.status,
          materials: (t.materials || []).map((m) => {
            const weight = Number(m.weight ?? m.unitWeightKg ?? 1);
            const qty = Number(m.quantity ?? 1);
            const totalWeight = Number(m.totalWeight ?? qty * weight);
            const tons = Number(m.tons ?? (totalWeight >= 100 ? totalWeight / 1000 : totalWeight));
            return {
              ...m,
              weight,
              quantity: qty,
              totalWeight,
              tons,
            };
          }),
        }));
      }
      return INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fuel`);
      return saved ? JSON.parse(saved) : INITIAL_FUEL_RECORDS;
    } catch {
      return INITIAL_FUEL_RECORDS;
    }
  });

  const [breakdowns, setBreakdowns] = useState<Breakdown[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_breakdowns`);
      return saved ? JSON.parse(saved) : INITIAL_BREAKDOWNS;
    } catch {
      return INITIAL_BREAKDOWNS;
    }
  });

  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_maintenances`);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCES;
    } catch {
      return INITIAL_MAINTENANCES;
    }
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [smartInsights] = useState<SmartInsight[]>(INITIAL_SMART_INSIGHTS);

  // App UI State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>(['dashboard']);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile');

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>('trk-tyu670');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>('drv-carlos');
  const [selectedTripId, setSelectedTripId] = useState<string | null>('trip-1');
  const [selectedBreakdownId, setSelectedBreakdownId] = useState<string | null>('brk-1');

  // Administrator User Profile (stored persistently, not hardcoded)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_drivers`, JSON.stringify(drivers));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_trucks`, JSON.stringify(trucks));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_trips`, JSON.stringify(trips));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_fuel`, JSON.stringify(fuelRecords));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_breakdowns`, JSON.stringify(breakdowns));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_maintenances`, JSON.stringify(maintenances));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(user));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [drivers, trucks, trips, fuelRecords, breakdowns, maintenances, notifications, user]);

  // Check Trip Delays Automatically
  useEffect(() => {
    const now = new Date();
    let hasNewDelay = false;

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        // Only evaluate if not yet delivered
        if (trip.status === 'Entregado' || trip.status === 'Completado' || trip.status === 'Cancelado') {
          return trip;
        }

        const expDate = trip.expectedDeliveryDate || trip.date;
        const expTime = trip.expectedDeliveryTime || trip.arrivalTime || '18:00';

        if (expDate) {
          const expDateTime = new Date(`${expDate}T${expTime}:00`);
          if (!isNaN(expDateTime.getTime()) && now.getTime() > expDateTime.getTime()) {
            const diffMinutes = Math.round((now.getTime() - expDateTime.getTime()) / (1000 * 60));
            if (!trip.isDelayed || trip.delayMinutes !== diffMinutes) {
              hasNewDelay = true;
              return { ...trip, isDelayed: true, delayMinutes: diffMinutes };
            }
          }
        }
        return trip;
      })
    );

    // Create notifications for delayed trips if not already present
    trips.forEach((t) => {
      if (t.isDelayed && t.status !== 'Entregado' && t.status !== 'Completado') {
        const truck = trucks.find((trk) => trk.id === t.truckId);
        const existingNotif = notifications.find((n) => n.relatedTripId === t.id);
        if (!existingNotif) {
          const hours = t.delayMinutes ? (t.delayMinutes / 60).toFixed(1) : '1';
          const newNotif: AlertNotification = {
            id: `delay-notif-${t.id}`,
            title: `Despacho ${t.code} con retraso`,
            message: `Vehículo ${truck?.plate || ''} con destino a ${t.destination} presenta un retraso de aprox. ${hours} horas respecto al itinerario previsto.`,
            category: 'Entrega',
            priority: 'Advertencia',
            date: new Date().toISOString().split('T')[0],
            read: false,
            relatedTripId: t.id,
            relatedTruckId: t.truckId,
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      }
    });
  }, [trucks]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const navigateTo = (
    screen: ScreenId,
    params?: { truckId?: string; driverId?: string; tripId?: string; breakdownId?: string }
  ) => {
    if (params?.truckId) setSelectedTruckId(params.truckId);
    if (params?.driverId) setSelectedDriverId(params.driverId);
    if (params?.tripId) setSelectedTripId(params.tripId);
    if (params?.breakdownId) setSelectedBreakdownId(params.breakdownId);

    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const login = () => {
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
    showToast(`Bienvenido a Oasis Flota, ${user.name}`, 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
    showToast('Sesión finalizada con éxito', 'info');
  };

  const updateUserProfile = (updatedProfile: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedProfile };
      if (updatedProfile.name && !updatedProfile.initials) {
        next.initials = updatedProfile.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
      }
      return next;
    });
    showToast('Perfil de administrador actualizado correctamente', 'success');
  };

  // DRIVER MANAGEMENT & VEHICLE ALLOCATION
  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    // Check if identification already exists
    if (drivers.some((d) => d.documentNumber === driverData.documentNumber)) {
      showToast('Ya existe un conductor registrado con esta cédula', 'error');
      return false;
    }

    const newId = `drv-${Date.now()}`;
    const newDriver: Driver = { ...driverData, id: newId };
    setDrivers((prev) => [newDriver, ...prev]);

    // If driver has an assigned vehicle, update the truck record
    if (newDriver.assignedTruckPlate) {
      const norm = normalizePlate(newDriver.assignedTruckPlate);
      setTrucks((prev) =>
        prev.map((t) =>
          normalizePlate(t.plate) === norm
            ? { ...t, assignedDriverId: newId, assignedDriverName: newDriver.fullName }
            : t
        )
      );
    }

    showToast('Conductor registrado exitosamente', 'success');
    navigateTo('drivers');
    return true;
  };

  const updateDriver = (id: string, updated: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const next = { ...d, ...updated };
          return next;
        }
        return d;
      })
    );

    // Sync truck assignment if changed
    if (updated.assignedTruckPlate !== undefined) {
      const driver = drivers.find((d) => d.id === id);
      const name = updated.fullName || driver?.fullName || '';

      setTrucks((prev) =>
        prev.map((t) => {
          if (updated.assignedTruckPlate && normalizePlate(t.plate) === normalizePlate(updated.assignedTruckPlate)) {
            return { ...t, assignedDriverId: id, assignedDriverName: name };
          }
          if (t.assignedDriverId === id) {
            return { ...t, assignedDriverId: undefined, assignedDriverName: undefined };
          }
          return t;
        })
      );
    }

    showToast('Información de conductor actualizada', 'success');
  };

  const assignVehicleToDriver = (driverId: string, truckPlate: string | null) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return { success: false, message: 'Conductor no encontrado' };

    if (truckPlate) {
      const norm = normalizePlate(truckPlate);
      // Check conflict: is vehicle already assigned to another driver?
      const existingAssignment = drivers.find(
        (d) => d.id !== driverId && d.assignedTruckPlate && normalizePlate(d.assignedTruckPlate) === norm
      );

      if (existingAssignment) {
        return {
          success: false,
          message: `El vehículo ${truckPlate} ya está asignado a ${existingAssignment.fullName}. Desasígnalo primero para evitar conflictos.`,
        };
      }
    }

    updateDriver(driverId, { assignedTruckPlate: truckPlate || undefined });
    return { success: true };
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    // Remove assignment from trucks
    setTrucks((prev) =>
      prev.map((t) => (t.assignedDriverId === id ? { ...t, assignedDriverId: undefined, assignedDriverName: undefined } : t))
    );
    showToast('Conductor eliminado de la flota', 'info');
    navigateTo('drivers');
  };

  // TRUCK MANAGEMENT & DRIVER ALLOCATION
  const addTruck = (truckData: Omit<Truck, 'id'>) => {
    const norm = normalizePlate(truckData.plate);
    if (!norm) {
      showToast('Por favor ingresa una placa válida', 'warning');
      return { success: false, message: 'Placa inválida' };
    }

    // Check duplicate plate
    if (trucks.some((t) => normalizePlate(t.plate) === norm)) {
      showToast(`Ya existe un vehículo registrado con la placa ${norm}`, 'error');
      return { success: false, message: `Placa ${norm} ya registrada en el sistema` };
    }

    const newId = `trk-${Date.now()}`;
    const normalizedTruck: Truck = {
      ...truckData,
      id: newId,
      plate: norm,
    };

    setTrucks((prev) => [normalizedTruck, ...prev]);

    // If driver assigned, update driver
    if (normalizedTruck.assignedDriverId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === normalizedTruck.assignedDriverId ? { ...d, assignedTruckPlate: norm } : d
        )
      );
    }

    showToast('Vehículo registrado correctamente', 'success');
    navigateTo('trucks');
    return { success: true };
  };

  const updateTruck = (id: string, updated: Partial<Truck>) => {
    if (updated.plate) {
      const norm = normalizePlate(updated.plate);
      // Check if another truck has this plate
      const conflict = trucks.find((t) => t.id !== id && normalizePlate(t.plate) === norm);
      if (conflict) {
        showToast(`La placa ${norm} ya pertenece a otro vehículo`, 'error');
        return { success: false, message: 'Placa duplicada' };
      }
      updated.plate = norm;
    }

    setTrucks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));

    // Sync driver if assignedDriverId changed
    if (updated.assignedDriverId !== undefined) {
      const truck = trucks.find((t) => t.id === id);
      const plate = updated.plate || truck?.plate || '';
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === updated.assignedDriverId) {
            return { ...d, assignedTruckPlate: plate, assignedTruckId: id };
          }
          if (d.assignedTruckId === id || (d.assignedTruckPlate && normalizePlate(d.assignedTruckPlate) === normalizePlate(plate))) {
            return { ...d, assignedTruckPlate: undefined, assignedTruckId: undefined };
          }
          return d;
        })
      );
    }

    showToast('Vehículo actualizado exitosamente', 'success');
    return { success: true };
  };

  const assignDriverToTruck = (truckId: string, driverId: string | null) => {
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return { success: false, message: 'Vehículo no encontrado' };

    let driverName: string | undefined = undefined;
    if (driverId) {
      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) return { success: false, message: 'Conductor no encontrado' };
      driverName = driver.fullName;
    }

    updateTruck(truckId, {
      assignedDriverId: driverId || undefined,
      assignedDriverName: driverName,
    });

    return { success: true };
  };

  const archiveTruck = (id: string) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'Inactivo' ? 'Disponible' : 'Inactivo' } : t))
    );
    showToast('Estado de activación de vehículo modificado', 'info');
  };

  const deleteTruck = (id: string) => {
    const truck = trucks.find((t) => t.id === id);
    setTrucks((prev) => prev.filter((t) => t.id !== id));
    if (truck) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.assignedTruckPlate && normalizePlate(d.assignedTruckPlate) === normalizePlate(truck.plate)
            ? { ...d, assignedTruckPlate: undefined }
            : d
        )
      );
    }
    showToast('Vehículo retirado del inventario', 'info');
    navigateTo('trucks');
  };

  // TRIP CRUD & KANBAN STATUS FLOW
  const addTrip = (tripData: Omit<Trip, 'id' | 'code'>) => {
    const newId = `trip-${Date.now()}`;
    const tripCode = `VJ-2026-${String(trips.length + 1).padStart(3, '0')}`;
    const newTrip: Trip = {
      ...tripData,
      id: newId,
      code: tripCode,
      status: tripData.status || 'Programado',
    };

    setTrips((prev) => [newTrip, ...prev]);

    // If trip in progress, mark truck as 'En viaje'
    if (newTrip.status === 'En proceso' || newTrip.status === 'En curso') {
      updateTruck(newTrip.truckId, { status: 'En viaje' });
    }

    showToast('Despacho registrado correctamente', 'success');
    navigateTo('trips');
  };

  const updateTrip = (id: string, updated: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const merged = { ...t, ...updated };
          if (updated.status && updated.status !== t.status) {
            if (updated.status === 'En proceso' || updated.status === 'En curso') {
              updateTruck(merged.truckId, { status: 'En viaje' });
            } else if (
              updated.status === 'Completado' ||
              updated.status === 'Entregado' ||
              updated.status === 'Programado'
            ) {
              updateTruck(merged.truckId, { status: 'Disponible' });
            }
          }
          return merged;
        }
        return t;
      })
    );
    showToast('Viaje actualizado exitosamente', 'success');
  };

  const updateTripStatus = (
    id: string,
    newStatus: TripStatus,
    confirmationData?: {
      actualDeliveryDate?: string;
      actualDeliveryTime?: string;
      recipientName?: string;
      deliveryNotes?: string;
      undeliveredReason?: string;
    }
  ) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id === id) {
          const updatedTrip: Trip = {
            ...trip,
            status: newStatus,
            ...(confirmationData || {}),
          };

          // If completed, delivered or scheduled, truck returns to 'Disponible'
          if (
            newStatus === 'Entregado' ||
            newStatus === 'Completado' ||
            newStatus === 'No entregado' ||
            newStatus === 'Programado'
          ) {
            const truck = trucks.find((trk) => trk.id === trip.truckId);
            if (truck && truck.status === 'En viaje') {
              updateTruck(truck.id, { status: 'Disponible' });
            }
          } else if (newStatus === 'En proceso' || newStatus === 'En curso') {
            updateTruck(trip.truckId, { status: 'En viaje' });
          }

          return updatedTrip;
        }
        return trip;
      })
    );

    const message =
      newStatus === 'Completado'
        ? '¡Viaje finalizado exitosamente!'
        : newStatus === 'En proceso'
        ? 'Viaje iniciado: estado actualizado a En proceso'
        : newStatus === 'Entregado'
        ? '¡Despacho marcado como Entregado exitosamente!'
        : newStatus === 'No entregado'
        ? 'Despacho registrado como No Entregado con novedad registrada'
        : `Estado del viaje actualizado a ${newStatus}`;

    showToast(message, newStatus === 'No entregado' ? 'warning' : 'success');
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    showToast('Despacho eliminado', 'info');
    navigateTo('trips');
  };

  // FUEL CRUD
  const addFuelRecord = (fuelData: Omit<FuelRecord, 'id'>) => {
    const newId = `fuel-${Date.now()}`;
    const newFuel: FuelRecord = { ...fuelData, id: newId };
    setFuelRecords((prev) => [newFuel, ...prev]);

    // Update truck mileage
    updateTruck(newFuel.truckId, { currentMileage: newFuel.currentMileage });

    showToast('Tanqueo de combustible registrado', 'success');
    navigateTo('fuel');
  };

  const deleteFuelRecord = (id: string) => {
    setFuelRecords((prev) => prev.filter((f) => f.id !== id));
    showToast('Registro de combustible eliminado', 'info');
  };

  // BREAKDOWN CRUD
  const addBreakdown = (breakdownData: Omit<Breakdown, 'id'>) => {
    const newId = `brk-${Date.now()}`;
    const newBreakdown: Breakdown = { ...breakdownData, id: newId };
    setBreakdowns((prev) => [newBreakdown, ...prev]);

    if (newBreakdown.severity === 'Crítica') {
      updateTruck(newBreakdown.truckId, { status: 'Fuera de servicio' });
    } else if (newBreakdown.severity === 'Grave') {
      updateTruck(newBreakdown.truckId, { status: 'En mantenimiento' });
    }

    showToast('Avería reportada en sistema', 'warning');
    navigateTo('breakdowns');
  };

  const solveBreakdown = (
    id: string,
    solutionData: { solutionDescription: string; workshop: string; repairCostCop: number; solutionDate: string }
  ) => {
    const current = breakdowns.find((b) => b.id === id);
    if (!current) return;

    setBreakdowns((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              ...solutionData,
              status: 'Solucionada',
            }
          : b
      )
    );

    const remainingOpenBreakdowns = breakdowns.filter((b) => b.truckId === current.truckId && b.id !== id && b.status !== 'Solucionada');
    if (remainingOpenBreakdowns.length === 0) {
      updateTruck(current.truckId, { status: 'Disponible' });
    }

    showToast('Avería marcada como solucionada', 'success');
  };

  const deleteBreakdown = (id: string) => {
    setBreakdowns((prev) => prev.filter((b) => b.id !== id));
    showToast('Avería eliminada del registro', 'info');
  };

  // MAINTENANCE CRUD
  const addMaintenance = (maintenanceData: Omit<MaintenanceRecord, 'id'>) => {
    const newId = `mnt-${Date.now()}`;
    const newMaintenance: MaintenanceRecord = { ...maintenanceData, id: newId };
    setMaintenances((prev) => [newMaintenance, ...prev]);
    showToast('Mantenimiento preventivo registrado', 'success');
    navigateTo('maintenance');
  };

  const deleteMaintenance = (id: string) => {
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
    showToast('Registro de mantenimiento eliminado', 'info');
  };

  // NOTIFICATION CRUD
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas las alertas marcadas como leídas', 'info');
  };

  // RESET
  const resetData = () => {
    setDrivers(INITIAL_DRIVERS);
    setTrucks(INITIAL_TRUCKS);
    setTrips(INITIAL_TRIPS);
    setFuelRecords(INITIAL_FUEL_RECORDS);
    setBreakdowns(INITIAL_BREAKDOWNS);
    setMaintenances(INITIAL_MAINTENANCES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUser(INITIAL_USER);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_drivers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_trucks`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_trips`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fuel`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_breakdowns`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_maintenances`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_notifications`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
    showToast('Datos restaurados a valores oficiales de Ferretería El Oasis (Cajibío)', 'info');
  };

  // Computed KPIs
  const totalTrucks = trucks.length;
  const availableTrucks = trucks.filter((t) => t.status === 'Disponible').length;
  const inTripTrucks = trucks.filter((t) => t.status === 'En viaje').length;
  const inMaintenanceTrucks = trucks.filter((t) => t.status === 'En mantenimiento').length;
  const outOfServiceTrucks = trucks.filter((t) => t.status === 'Fuera de servicio' || t.status === 'Inactivo').length;
  const activeDrivers = drivers.filter((d) => d.status === 'Activo').length;
  const monthlyTripsCount = trips.length;
  const monthlyTons = trips.reduce((acc, t) => acc + (t.totalTons || 0), 0);
  const monthlyFuelExpense = fuelRecords.reduce((acc, f) => acc + (f.totalCostCop || 0), 0);
  const monthlyFuelLiters = fuelRecords.reduce((acc, f) => acc + (f.liters || 0), 0);
  const totalKmDriven = trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const avgFuelConsumptionKmPerL = monthlyFuelLiters > 0 ? Number((totalKmDriven / monthlyFuelLiters).toFixed(2)) : 3.8;
  const pendingBreakdownsCount = breakdowns.filter((b) => b.status !== 'Solucionada').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const criticalAlertsCount = notifications.filter((n) => n.priority === 'Crítica' || n.priority === 'Advertencia').length;
  const delayedTripsCount = trips.filter((t) => t.isDelayed && t.status !== 'Entregado' && t.status !== 'Completado').length;

  return (
    <FleetContext.Provider
      value={{
        currentScreen,
        screenHistory,
        navigateTo,
        goBack,
        viewportMode,
        setViewportMode,
        selectedTruckId,
        selectedDriverId,
        selectedTripId,
        selectedBreakdownId,
        drivers,
        trucks,
        trips,
        fuelRecords,
        breakdowns,
        maintenances,
        notifications,
        smartInsights,
        user,
        isLoggedIn,
        login,
        logout,
        updateUserProfile,
        addDriver,
        updateDriver,
        deleteDriver,
        assignVehicleToDriver,
        addTruck,
        updateTruck,
        deleteTruck,
        archiveTruck,
        assignDriverToTruck,
        addTrip,
        updateTrip,
        updateTripStatus,
        deleteTrip,
        addFuelRecord,
        deleteFuelRecord,
        addBreakdown,
        solveBreakdown,
        deleteBreakdown,
        addMaintenance,
        deleteMaintenance,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toast,
        showToast,
        resetData,
        kpis: {
          totalTrucks,
          availableTrucks,
          inTripTrucks,
          inMaintenanceTrucks,
          outOfServiceTrucks,
          activeDrivers,
          monthlyTripsCount,
          monthlyTons,
          monthlyFuelExpense,
          monthlyFuelLiters,
          avgFuelConsumptionKmPerL,
          pendingBreakdownsCount,
          unreadNotificationsCount,
          criticalAlertsCount,
          delayedTripsCount,
        },
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
