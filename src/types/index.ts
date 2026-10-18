/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewportMode = 'mobile' | 'responsive';

export type ScreenId =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'drivers'
  | 'driver_new'
  | 'driver_detail'
  | 'trucks'
  | 'truck_new'
  | 'truck_detail'
  | 'trips'
  | 'trip_new'
  | 'trip_detail'
  | 'fuel'
  | 'fuel_new'
  | 'breakdowns'
  | 'breakdown_new'
  | 'breakdown_detail'
  | 'maintenance'
  | 'maintenance_new'
  | 'documents'
  | 'notifications'
  | 'history'
  | 'reports'
  | 'kpis'
  | 'smart_analysis'
  | 'profile'
  | 'more_menu';

export type DriverStatus = 'Activo' | 'Inactivo' | 'En licencia' | 'Contrato vencido';
export type LicenseCategory = 'C1' | 'C2' | 'C3';
export type MedicalFitness = 'Apto' | 'Apto con restricciones' | 'Pendiente de valoración';
export type DriverRole = 'Chofer' | 'Chofer descargador';
export type ContractType = 'Término fijo' | 'Término indefinido' | 'Prestación de servicios' | 'Otro';
export type ExpirationStatus = 'Vigente' | 'Próxima a vencer' | 'Vencida';
export type ContractStatus = 'Vigente' | 'Próximo a vencer' | 'Finalizado';

export interface Driver {
  id: string;
  fullName: string;
  documentNumber: string; // C.C.
  phone: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  licenseCategory: LicenseCategory;
  licenseIssueDate?: string;
  licenseExpDate?: string;   // Optional until provided
  licenseStatus?: ExpirationStatus;
  medicalFitness?: MedicalFitness;
  medicalRestrictions?: string;
  role?: DriverRole;
  contractType?: ContractType;
  contractStartDate?: string;
  contractEndDate?: string;
  contractStatus?: ContractStatus;
  status: DriverStatus;
  avatarUrl?: string;
  assignedTruckPlate?: string;
  assignedTruckId?: string;
  notes?: string;
}

export type TruckStatus = 'Disponible' | 'En viaje' | 'En mantenimiento' | 'Fuera de servicio' | 'Inactivo';
export type FuelType = 'Diésel' | 'Gasolina' | 'Gas' | 'Otro';

export interface Truck {
  id: string;
  plate: string;          // Normalized uppercase e.g. TYU670
  brand: string;          // Free text (Nissan, Dodge, Chevrolet, etc.)
  model: string;          // Free text (UD, 300, C70, N2000, etc.)
  year: number;           // Any year, e.g. 1983, 1986, 1992, 1996, 2012
  vehicleType: string;    // Volqueta, Camioneta, Van, Camión, or custom from "Otro"
  maxCapacityTons?: number;
  currentMileage: number;
  fuelType: FuelType;
  status: TruckStatus;
  soatPolicyNumber: string;
  soatIssueDate?: string;
  soatExpDate?: string;
  soatStatus?: ExpirationStatus;
  rtmCertificateNumber: string;
  rtmIssueDate?: string;
  rtmExpDate?: string;
  rtmStatus?: ExpirationStatus;
  observations?: string;
  photoUrl?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
}

export type TripStatus =
  | 'Programado'
  | 'En proceso'
  | 'Completado'
  | 'En curso'
  | 'Entregado'
  | 'No entregado'
  | 'Cancelado';

export interface CargoMaterial {
  id: string;
  name: string;          // Descripción del material
  quantity: number;      // Cantidad (permite valores no negativos)
  weight?: number;       // Peso unitario (reemplaza 'Unidad')
  totalWeight?: number;  // Peso total = Cantidad × Peso (calculado automáticamente)
  unit?: string;         // Unidades, kg, Bultos, m³, etc. (opcional para visualización)
  unitWeightKg?: number; // Compatibilidad histórica
  totalWeightKg?: number;// Cantidad * Peso unitario
  tons: number;          // Peso en toneladas (totalWeight / 1000)
}

export interface Trip {
  id: string;
  code: string;        // VJ-2026-089
  date: string;
  truckId: string;
  driverId: string;
  driverRoleOnTrip?: DriverRole;
  origin: string;
  destination: string;
  departureTime: string; // HH:mm
  arrivalTime?: string;   // HH:mm
  expectedDeliveryDate?: string; // YYYY-MM-DD
  expectedDeliveryTime?: string; // HH:mm
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
  deliveryNotes?: string;
  recipientName?: string;
  undeliveredReason?: string;
  durationHours?: number;
  startMileage?: number;
  endMileage?: number;
  distanceKm?: number;
  materials: CargoMaterial[];
  totalWeight?: number;  // Suma de los pesos totales
  totalWeightKg?: number;
  totalTons: number;
  isOverloaded?: boolean;
  status: TripStatus;
  customerRequirements?: string; // Requerimientos adicionales solicitados por el cliente
  observations?: string;
  isDelayed?: boolean;
  delayMinutes?: number;
}

export interface FuelRecord {
  id: string;
  truckId: string;
  date: string;
  time: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiterCop: number;
  totalCostCop: number;
  currentMileage: number;
  gasStation: string;
  invoiceNumber: string;
  notes?: string;
  kmPerLiter?: number;
}

export type BreakdownSeverity = 'Leve' | 'Moderada' | 'Grave' | 'Crítica';
export type BreakdownStatus = 'Pendiente' | 'En reparación' | 'Solucionada';

export interface Breakdown {
  id: string;
  truckId: string;
  date: string;
  mileage: number;
  type: string;
  description: string;
  severity: BreakdownSeverity;
  status: BreakdownStatus;
  solutionDate?: string;
  solutionDescription?: string;
  workshop?: string;
  repairCostCop?: number;
  notes?: string;
  attachmentName?: string;
}

export type MaintenanceType =
  | 'Cambio de aceite'
  | 'Cambio de filtros'
  | 'Revisión de frenos'
  | 'Revisión de llantas'
  | 'Alineación y balanceo'
  | 'Revisión del sistema eléctrico'
  | 'Revisión de suspensión'
  | 'Revisión general'
  | 'Otro';

export type MaintenanceStatus = 'Al día' | 'Próximo' | 'Vencido';

export interface MaintenanceRecord {
  id: string;
  truckId: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  workshop: string;
  costCop: number;
  description: string;
  notes?: string;
  nextRecommendedDate: string;
  nextRecommendedMileage: number;
  status: MaintenanceStatus;
}

export type NotificationPriority = 'Informativa' | 'Advertencia' | 'Crítica';

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  category: 'Licencia' | 'SOAT' | 'Tecnomecánica' | 'Contrato' | 'Mantenimiento' | 'Avería' | 'Combustible' | 'Disponibilidad' | 'Entrega';
  priority: NotificationPriority;
  date: string;
  read: boolean;
  relatedTruckId?: string;
  relatedDriverId?: string;
  relatedTripId?: string;
}

export type InsightCategory = 'Información' | 'Recomendación' | 'Advertencia' | 'Crítica';

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  truckId?: string;
  actionText?: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  company: string;
  location: string;
  avatarUrl?: string;
  initials?: string;
}
