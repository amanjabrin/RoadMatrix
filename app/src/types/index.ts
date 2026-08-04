// FleetFlow Type Definitions

// User Roles for RBAC
export type UserRole = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Vehicle Types
export type VehicleType = 'truck' | 'van' | 'bike';
export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'retired';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  maxLoadCapacity: number; // in kg
  odometer: number; // in km
  status: VehicleStatus;
  image?: string;
  acquisitionCost: number; // for ROI calculations
  year: number;
  fuelType: 'diesel' | 'gasoline' | 'electric';
  region?: string; // optional for Command Center filter
}

// Driver Types
export type DriverStatus = 'on_duty' | 'off_duty' | 'suspended';
export type LicenseCategory = 'truck' | 'van' | 'bike';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  licenseCategories: LicenseCategory[];
  status: DriverStatus;
  safetyScore: number; // 0-100
  avatar?: string;
  joinDate: string;
  totalTrips: number;
  completedTrips: number;
}

// Trip Types
export type TripStatus = 'draft' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // in kg
  origin: string;
  destination: string;
  status: TripStatus;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  distance?: number; // in km
  revenue?: number; // for ROI calculations
}

// Maintenance Types
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed';
export type MaintenanceType = 'oil_change' | 'tire_rotation' | 'brake_inspection' | 'general_service' | 'repair';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  serviceProvider?: string;
  notes?: string;
}

// Fuel & Expense Types
export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  odometerReading: number;
  station?: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: 'fuel' | 'maintenance' | 'insurance' | 'toll' | 'other';
  amount: number;
  date: string;
  description: string;
}

// Analytics Types
export interface VehicleROI {
  vehicleId: string;
  revenue: number;
  totalCosts: number;
  roi: number; // percentage
}

export interface FuelEfficiency {
  vehicleId: string;
  kmPerLiter: number;
  period: string;
}

export interface DashboardKPIs {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
}

// Filter Types
export interface VehicleFilter {
  type?: VehicleType | 'all';
  status?: VehicleStatus | 'all';
  search?: string;
}

export interface TripFilter {
  status?: TripStatus | 'all';
  vehicleId?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Form Data Types
export interface CreateTripForm {
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  origin: string;
  destination: string;
}

export interface CreateVehicleForm {
  name: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
  maxLoadCapacity: number;
  fuelType: 'diesel' | 'gasoline' | 'electric';
  acquisitionCost: number;
  year: number;
}

export interface CreateDriverForm {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories: LicenseCategory[];
}

export interface FuelLogForm {
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  odometerReading: number;
}

export interface MaintenanceLogForm {
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  cost: number;
}
