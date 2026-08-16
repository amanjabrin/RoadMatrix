import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  User,
  UserRole,
  VehicleStatus,
  DriverStatus,
  TripStatus,
  MaintenanceStatus,
} from '@/types';
import * as api from '@/lib/api';

// State Interface
interface FleetState {
  currentUser: User | null;
  isAuthenticated: boolean;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  selectedVehicleId: string | null;
  selectedDriverId: string | null;
  selectedTripId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FleetState = {
  currentUser: null,
  isAuthenticated: false,
  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  fuelLogs: [],
  selectedVehicleId: null,
  selectedDriverId: null,
  selectedTripId: null,
  loading: false,
  error: null,
};

type FleetAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_DATA'; payload: { vehicles: Vehicle[]; drivers: Driver[]; trips: Trip[]; maintenanceLogs: MaintenanceLog[]; fuelLogs: FuelLog[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SET_VEHICLE_STATUS'; payload: { id: string; status: VehicleStatus } }
  | { type: 'SELECT_VEHICLE'; payload: string | null }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'DELETE_DRIVER'; payload: string }
  | { type: 'SET_DRIVER_STATUS'; payload: { id: string; status: DriverStatus } }
  | { type: 'SELECT_DRIVER'; payload: string | null }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SET_TRIP_STATUS'; payload: { id: string; status: TripStatus } }
  | { type: 'SELECT_TRIP'; payload: string | null }
  | { type: 'ADD_MAINTENANCE'; payload: MaintenanceLog }
  | { type: 'UPDATE_MAINTENANCE'; payload: MaintenanceLog }
  | { type: 'SET_MAINTENANCE_STATUS'; payload: { id: string; status: MaintenanceStatus } }
  | { type: 'ADD_FUEL_LOG'; payload: FuelLog }
  | { type: 'DELETE_FUEL_LOG'; payload: string };

function fleetReducer(state: FleetState, action: FleetAction): FleetState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true, error: null };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? action.payload : v) };
    case 'DELETE_VEHICLE':
      return { ...state, vehicles: state.vehicles.filter(v => v.id !== action.payload) };
    case 'SET_VEHICLE_STATUS':
      return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? { ...v, status: action.payload.status } : v) };
    case 'SELECT_VEHICLE':
      return { ...state, selectedVehicleId: action.payload };
    case 'ADD_DRIVER':
      return { ...state, drivers: [...state.drivers, action.payload] };
    case 'UPDATE_DRIVER':
      return { ...state, drivers: state.drivers.map(d => d.id === action.payload.id ? action.payload : d) };
    case 'DELETE_DRIVER':
      return { ...state, drivers: state.drivers.filter(d => d.id !== action.payload) };
    case 'SET_DRIVER_STATUS':
      return { ...state, drivers: state.drivers.map(d => d.id === action.payload.id ? { ...d, status: action.payload.status } : d) };
    case 'SELECT_DRIVER':
      return { ...state, selectedDriverId: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP':
      return { ...state, trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRIP':
      return { ...state, trips: state.trips.filter(t => t.id !== action.payload) };
    case 'SET_TRIP_STATUS':
      return { ...state, trips: state.trips.map(t => t.id === action.payload.id ? { ...t, status: action.payload.status } : t) };
    case 'SELECT_TRIP':
      return { ...state, selectedTripId: action.payload };
    case 'ADD_MAINTENANCE':
      return { ...state, maintenanceLogs: [...state.maintenanceLogs, action.payload] };
    case 'UPDATE_MAINTENANCE':
      return { ...state, maintenanceLogs: state.maintenanceLogs.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'SET_MAINTENANCE_STATUS':
      return { ...state, maintenanceLogs: state.maintenanceLogs.map(m => m.id === action.payload.id ? { ...m, status: action.payload.status } : m) };
    case 'ADD_FUEL_LOG':
      return { ...state, fuelLogs: [...state.fuelLogs, action.payload] };
    case 'DELETE_FUEL_LOG':
      return { ...state, fuelLogs: state.fuelLogs.filter(f => f.id !== action.payload) };
    default:
      return state;
  }
}

interface FleetContextType {
  state: FleetState;
  dispatch: React.Dispatch<FleetAction>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadData: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
  getTripById: (id: string) => Trip | undefined;
  getAvailableVehicles: () => Vehicle[];
  getAvailableDrivers: () => Driver[];
  getActiveTrips: () => Trip[];
  getTripsByDriver: (driverId: string) => Trip[];
  getMaintenanceAlerts: () => MaintenanceLog[];
  canDriverOperateVehicle: (driverId: string, vehicleType: string) => boolean;
  isLicenseValid: (driverId: string) => boolean;
  validateCargoWeight: (vehicleId: string, cargoWeight: number) => boolean;
  getVehicleOperationalCost: (vehicleId: string) => number;
  getVehicleROI: (vehicleId: string) => { revenue: number; costs: number; roi: number };
  getFuelEfficiency: (vehicleId: string) => number;
  getDashboardKPIs: () => { activeFleet: number; maintenanceAlerts: number; utilizationRate: number; pendingCargo: number };
  apiAddVehicle: (data: Record<string, unknown>) => Promise<Vehicle | null>;
  apiUpdateVehicle: (id: string, data: Record<string, unknown>) => Promise<Vehicle | null>;
  apiSetVehicleStatus: (id: string, status: VehicleStatus) => Promise<void>;
  apiAddDriver: (data: Record<string, unknown>) => Promise<Driver | null>;
  apiSetDriverStatus: (id: string, status: DriverStatus) => Promise<void>;
  apiAddTrip: (data: Record<string, unknown>) => Promise<Trip | null>;
  apiSetTripStatus: (id: string, status: TripStatus, odometer?: number) => Promise<void>;
  apiAddMaintenance: (data: Record<string, unknown>) => Promise<MaintenanceLog | null>;
  apiSetMaintenanceStatus: (id: string, status: MaintenanceStatus) => Promise<void>;
  apiAddFuelLog: (data: Record<string, unknown>) => Promise<FuelLog | null>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

function normalizeVehicle(v: any): Vehicle {
  return {
    id: String(v.id),
    name: v.name,
    model: v.model,
    licensePlate: v.licensePlate ?? v.license_plate,
    type: v.type,
    maxLoadCapacity: v.maxLoadCapacity ?? v.max_load_capacity ?? 0,
    odometer: v.odometer ?? 0,
    status: v.status,
    acquisitionCost: v.acquisitionCost ?? v.acquisition_cost ?? 0,
    year: v.year,
    fuelType: v.fuelType ?? v.fuel_type,
    region: v.region,
  };
}
function normalizeDriver(d: any): Driver {
  return {
    id: String(d.id),
    name: d.name,
    email: d.email,
    phone: d.phone,
    licenseNumber: d.licenseNumber ?? d.license_number,
    licenseExpiry: d.licenseExpiry ?? d.license_expiry,
    licenseCategories: d.licenseCategories ?? d.license_categories ?? [],
    status: d.status,
    safetyScore: d.safetyScore ?? d.safety_score ?? 0,
    joinDate: d.joinDate ?? d.join_date,
    totalTrips: d.totalTrips ?? d.total_trips ?? 0,
    completedTrips: d.completedTrips ?? d.completed_trips ?? 0,
  };
}
function normalizeTrip(t: any): Trip {
  return {
    id: String(t.id),
    vehicleId: String(t.vehicleId ?? t.vehicle_id ?? t.vehicle),
    driverId: String(t.driverId ?? t.driver_id ?? t.driver),
    cargoWeight: t.cargoWeight ?? t.cargo_weight ?? 0,
    origin: t.origin,
    destination: t.destination,
    status: t.status,
    createdAt: t.createdAt ?? t.created_at,
    dispatchedAt: t.dispatchedAt ?? t.dispatched_at,
    completedAt: t.completedAt ?? t.completed_at,
    distance: t.distance,
    revenue: t.revenue,
  };
}
function normalizeMaintenance(m: any): MaintenanceLog {
  return {
    id: String(m.id),
    vehicleId: String(m.vehicleId ?? m.vehicle_id ?? m.vehicle),
    type: m.type,
    description: m.description ?? '',
    status: m.status,
    scheduledDate: m.scheduledDate ?? m.scheduled_date,
    completedDate: m.completedDate ?? m.completed_date,
    cost: m.cost ?? 0,
    serviceProvider: m.serviceProvider ?? m.service_provider,
  };
}
function normalizeFuel(f: any): FuelLog {
  return {
    id: String(f.id),
    vehicleId: String(f.vehicleId ?? f.vehicle_id ?? f.vehicle),
    liters: f.liters ?? 0,
    cost: f.cost ?? 0,
    date: f.date,
    odometerReading: f.odometerReading ?? f.odometer_reading ?? 0,
    station: f.station,
  };
}

const loadSavedSession = (): Partial<FleetState> => {
  try {
    const saved = localStorage.getItem('roadmatrix_session');
    if (saved && api.isAuthenticated()) {
      const user = JSON.parse(saved) as User;
      return { currentUser: user, isAuthenticated: true };
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return {};
};

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fleetReducer, { ...initialState, ...loadSavedSession() });

  const loadData = useCallback(async () => {
    if (!api.isAuthenticated()) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [vehicles, drivers, trips, maintenance, fuel] = await Promise.all([
        api.fetchVehicles(),
        api.fetchDrivers(),
        api.fetchTrips(),
        api.fetchMaintenanceLogs(),
        api.fetchFuelLogs(),
      ]);
      dispatch({
        type: 'SET_DATA',
        payload: {
          vehicles: (vehicles || []).map(normalizeVehicle),
          drivers: (drivers || []).map(normalizeDriver),
          trips: (trips || []).map(normalizeTrip),
          maintenanceLogs: (maintenance || []).map(normalizeMaintenance),
          fuelLogs: (fuel || []).map(normalizeFuel),
        },
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      dispatch({ type: 'LOGOUT' });
      api.logout();
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && api.isAuthenticated()) {
      loadData();
    }
  }, [state.isAuthenticated]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const user = await api.login(email, password);
      const u: User = { id: user.id, email: user.email, name: user.name, role: user.role as UserRole };
      localStorage.setItem('roadmatrix_session', JSON.stringify(u));
      dispatch({ type: 'LOGIN', payload: u });
      await loadData();
      return true;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      return false;
    }
  }, [loadData]);

  const logout = useCallback(() => {
    api.logout();
    localStorage.removeItem('roadmatrix_session');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.currentUser) return false;
    // Super Admin or manager bypasses all checks to have full rights
    if (state.currentUser.email === 'admin@roadmatrix.in' || state.currentUser.role === 'fleet_manager') return true;
    return roles.includes(state.currentUser.role);
  }, [state.currentUser]);

  const getVehicleById = useCallback((id: string) => state.vehicles.find(v => String(v.id) === String(id)), [state.vehicles]);
  const getDriverById = useCallback((id: string) => state.drivers.find(d => String(d.id) === String(id)), [state.drivers]);
  const getTripById = useCallback((id: string) => state.trips.find(t => String(t.id) === String(id)), [state.trips]);

  const getAvailableVehicles = useCallback(() => state.vehicles.filter(v => v.status === 'available'), [state.vehicles]);

  const getAvailableDrivers = useCallback(() => {
    const activeTripDriverIds = new Set(
      state.trips.filter(t => t.status === 'dispatched' || t.status === 'in_progress').map(t => t.driverId)
    );
    return state.drivers.filter(d => {
      if (d.status !== 'on_duty') return false;
      if (activeTripDriverIds.has(d.id)) return false;
      const expiry = new Date(d.licenseExpiry);
      return expiry > new Date();
    });
  }, [state.drivers, state.trips]);

  const getActiveTrips = useCallback(() => state.trips.filter(t => t.status === 'in_progress' || t.status === 'dispatched'), [state.trips]);
  const getTripsByDriver = useCallback((driverId: string) => state.trips.filter(t => t.driverId === driverId), [state.trips]);
  const getMaintenanceAlerts = useCallback(() => state.maintenanceLogs.filter(m => m.status === 'scheduled' || m.status === 'in_progress'), [state.maintenanceLogs]);

  const canDriverOperateVehicle = useCallback((driverId: string, vehicleType: string): boolean => {
    const driver = getDriverById(driverId);
    if (!driver) return false;
    return (driver.licenseCategories || []).includes(vehicleType as any);
  }, [getDriverById]);

  const isLicenseValid = useCallback((driverId: string): boolean => {
    const driver = getDriverById(driverId);
    if (!driver) return false;
    return new Date(driver.licenseExpiry) > new Date();
  }, [getDriverById]);

  const validateCargoWeight = useCallback((vehicleId: string, cargoWeight: number): boolean => {
    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) return false;
    return cargoWeight <= (vehicle.maxLoadCapacity ?? 0);
  }, [getVehicleById]);

  const getVehicleOperationalCost = useCallback((vehicleId: string): number => {
    const vid = String(vehicleId);
    const maintenanceCost = state.maintenanceLogs
      .filter(m => String(m.vehicleId) === vid && m.status === 'completed')
      .reduce((sum, m) => sum + (m.cost ?? 0), 0);
    const fuelCost = state.fuelLogs
      .filter(f => String(f.vehicleId) === vid)
      .reduce((sum, f) => sum + (f.cost ?? 0), 0);
    return maintenanceCost + fuelCost;
  }, [state.maintenanceLogs, state.fuelLogs]);

  const getVehicleROI = useCallback((vehicleId: string) => {
    const vid = String(vehicleId);
    const revenue = state.trips
      .filter(t => String(t.vehicleId) === vid && t.status === 'completed')
      .reduce((sum, t) => sum + (t.revenue ?? 0), 0);
    const operationalCosts = getVehicleOperationalCost(vehicleId);
    const vehicle = getVehicleById(vehicleId);
    const totalCosts = operationalCosts + (vehicle?.acquisitionCost ?? 0);
    const roi = totalCosts > 0 ? ((revenue - totalCosts) / totalCosts) * 100 : 0;
    return { revenue, costs: totalCosts, roi };
  }, [state.trips, getVehicleOperationalCost, getVehicleById]);

  const getFuelEfficiency = useCallback((vehicleId: string): number => {
    const vid = String(vehicleId);
    const vehicleTrips = state.trips.filter(t => String(t.vehicleId) === vid && t.status === 'completed');
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.distance ?? 0), 0);
    const totalFuel = state.fuelLogs
      .filter(f => String(f.vehicleId) === vid)
      .reduce((sum, f) => sum + (f.liters ?? 0), 0);
    return totalFuel > 0 ? totalDistance / totalFuel : 0;
  }, [state.trips, state.fuelLogs]);

  const getDashboardKPIs = useCallback(() => {
    const activeFleet = state.vehicles.filter(v => v.status === 'on_trip').length;
    const maintenanceAlerts = state.vehicles.filter(v => v.status === 'in_shop').length;
    const totalVehicles = state.vehicles.filter(v => v.status !== 'retired').length;
    const utilizationRate = totalVehicles > 0 ? Math.round((activeFleet / totalVehicles) * 100) : 0;
    const pendingCargo = state.trips.filter(t => t.status === 'draft').length;
    return { activeFleet, maintenanceAlerts, utilizationRate, pendingCargo };
  }, [state.vehicles, state.trips]);

  const apiAddVehicle = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await api.createVehicle({
        name: data.name, model: data.model, licensePlate: data.licensePlate, type: data.type,
        maxLoadCapacity: data.maxLoadCapacity, odometer: 0, status: 'available',
        acquisitionCost: data.acquisitionCost, year: data.year, fuelType: data.fuelType, region: data.region,
      });
      const v = normalizeVehicle(res);
      dispatch({ type: 'ADD_VEHICLE', payload: v });
      return v;
    } catch { return null; }
  }, []);
  const apiUpdateVehicle = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await api.updateVehicle(id, data);
      const v = normalizeVehicle(res);
      dispatch({ type: 'UPDATE_VEHICLE', payload: v });
      return v;
    } catch { return null; }
  }, []);
  const apiSetVehicleStatus = useCallback(async (id: string, status: VehicleStatus) => {
    try {
      await api.setVehicleStatus(id, status);
      dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id, status } });
    } catch (e) { throw e; }
  }, []);

  const apiAddDriver = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await api.createDriver(data);
      const d = normalizeDriver(res);
      dispatch({ type: 'ADD_DRIVER', payload: d });
      return d;
    } catch { return null; }
  }, []);
  const apiSetDriverStatus = useCallback(async (id: string, status: DriverStatus) => {
    try {
      await api.setDriverStatus(id, status);
      dispatch({ type: 'SET_DRIVER_STATUS', payload: { id, status } });
    } catch (e) { throw e; }
  }, []);

  const apiAddTrip = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await api.createTrip({
        vehicleId: data.vehicleId, driverId: data.driverId, cargoWeight: data.cargoWeight,
        origin: data.origin, destination: data.destination, status: 'draft',
      });
      const t = normalizeTrip(res);
      dispatch({ type: 'ADD_TRIP', payload: t });
      return t;
    } catch { return null; }
  }, []);
  const apiSetTripStatus = useCallback(async (id: string, status: TripStatus, odometer?: number) => {
    try {
      await api.setTripStatus(id, status, odometer);
      dispatch({ type: 'SET_TRIP_STATUS', payload: { id, status } });
      const trip = state.trips.find(t => String(t.id) === id);
      if (trip) {
        if (status === 'completed' || status === 'cancelled') {
          dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id: trip.vehicleId, status: 'available' } });
          if (odometer != null) {
            const v = state.vehicles.find(x => String(x.id) === trip.vehicleId);
            if (v) dispatch({ type: 'UPDATE_VEHICLE', payload: { ...v, odometer } });
          }
        } else if (status === 'dispatched' || status === 'in_progress') {
          dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id: trip.vehicleId, status: 'on_trip' } });
        }
      }
    } catch (e) { throw e; }
  }, [state.trips, state.vehicles]);

  const apiAddMaintenance = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await api.createMaintenanceLog(data);
      const m = normalizeMaintenance(res);
      dispatch({ type: 'ADD_MAINTENANCE', payload: m });
      dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id: String(data.vehicleId), status: 'in_shop' } });
      return m;
    } catch { return null; }
  }, []);
  const apiSetMaintenanceStatus = useCallback(async (id: string, status: MaintenanceStatus) => {
    try {
      await api.setMaintenanceStatus(id, status);
      dispatch({ type: 'SET_MAINTENANCE_STATUS', payload: { id, status } });
      const log = state.maintenanceLogs.find(m => String(m.id) === id);
      if (log && status === 'completed') {
        dispatch({ type: 'SET_VEHICLE_STATUS', payload: { id: log.vehicleId, status: 'available' } });
      }
    } catch (e) { throw e; }
  }, [state.maintenanceLogs]);

  const apiAddFuelLog = useCallback(async (data: Record<string, unknown>) => {
    try {
      const res = await api.createFuelLog(data);
      const f = normalizeFuel(res);
      dispatch({ type: 'ADD_FUEL_LOG', payload: f });
      return f;
    } catch { return null; }
  }, []);

  return (
    <FleetContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        loadData,
        hasRole,
        getVehicleById,
        getDriverById,
        getTripById,
        getAvailableVehicles,
        getAvailableDrivers,
        getActiveTrips,
        getTripsByDriver,
        getMaintenanceAlerts,
        canDriverOperateVehicle,
        isLicenseValid,
        validateCargoWeight,
        getVehicleOperationalCost,
        getVehicleROI,
        getFuelEfficiency,
        getDashboardKPIs,
        apiAddVehicle,
        apiUpdateVehicle,
        apiSetVehicleStatus,
        apiAddDriver,
        apiSetDriverStatus,
        apiAddTrip,
        apiSetTripStatus,
        apiAddMaintenance,
        apiSetMaintenanceStatus,
        apiAddFuelLog,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within a FleetProvider');
  return ctx;
}
