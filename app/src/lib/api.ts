import {
  mockVehicles,
  mockDrivers,
  mockTrips,
  mockMaintenanceLogs,
  mockFuelLogs,
  mockUsers,
} from '@/data/mockData';

// Helper to get/set localStorage data
function getStorage<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
}

// Helper to set localStorage data
function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize and retrieve localStorage states
const getVehicles = () => getStorage('fleetflow_vehicles', mockVehicles);
const setVehicles = (data: typeof mockVehicles) => setStorage('fleetflow_vehicles', data);

const getDrivers = () => getStorage('fleetflow_drivers', mockDrivers);
const setDrivers = (data: typeof mockDrivers) => setStorage('fleetflow_drivers', data);

const getTrips = () => getStorage('fleetflow_trips', mockTrips);
const setTrips = (data: typeof mockTrips) => setStorage('fleetflow_trips', data);

const getMaintenance = () => getStorage('fleetflow_maintenance', mockMaintenanceLogs);
const setMaintenance = (data: typeof mockMaintenanceLogs) => setStorage('fleetflow_maintenance', data);

const getFuel = () => getStorage('fleetflow_fuel', mockFuelLogs);
const setFuel = (data: typeof mockFuelLogs) => setStorage('fleetflow_fuel', data);

export async function login(email: string, password?: string) {
  const user = {
    id: 'admin',
    email: 'admin@fleetflow.in',
    name: 'Super Admin',
    role: 'fleet_manager' as const,
  };
  localStorage.setItem('fleetflow_token', 'mock-token-admin');
  return user;
}

export function logout() {
  localStorage.removeItem('fleetflow_token');
  localStorage.removeItem('fleetflow_session');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('fleetflow_token');
}

export async function forgotPassword(email: string) {
  return { detail: 'Password reset link sent.', token: 'mock-reset-token' };
}

export async function resetPassword(token: string, newPassword: string) {
  return { detail: 'Password reset successful.' };
}

// Vehicles API mocks
export async function fetchVehicles() {
  return getVehicles();
}

export async function createVehicle(body: Record<string, unknown>) {
  const list = getVehicles();
  const newVehicle = {
    id: 'v_' + Math.random().toString(36).substr(2, 9),
    name: String(body.name),
    model: String(body.model),
    licensePlate: String(body.licensePlate),
    type: body.type as any,
    maxLoadCapacity: Number(body.maxLoadCapacity),
    odometer: Number(body.odometer || 0),
    status: 'available' as const,
    acquisitionCost: Number(body.acquisitionCost || 0),
    year: Number(body.year || new Date().getFullYear()),
    fuelType: (body.fuelType || 'diesel') as any,
    region: String(body.region || 'West'),
  };
  list.push(newVehicle);
  setVehicles(list);
  return newVehicle;
}

export async function updateVehicle(id: string, body: Record<string, unknown>) {
  const list = getVehicles();
  const idx = list.findIndex(v => String(v.id) === String(id));
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...body } as any;
    setVehicles(list);
    return list[idx];
  }
  throw new Error('Vehicle not found');
}

export async function deleteVehicle(id: string) {
  const list = getVehicles();
  const filtered = list.filter(v => String(v.id) !== String(id));
  setVehicles(filtered);
}

export async function setVehicleStatus(id: string, status: string) {
  const list = getVehicles();
  const idx = list.findIndex(v => String(v.id) === String(id));
  if (idx !== -1) {
    list[idx].status = status as any;
    setVehicles(list);
    return list[idx];
  }
  throw new Error('Vehicle not found');
}

// Drivers API mocks
export async function fetchDrivers() {
  return getDrivers();
}

export async function createDriver(body: Record<string, unknown>) {
  const list = getDrivers();
  const newDriver = {
    id: 'd_' + Math.random().toString(36).substr(2, 9),
    name: String(body.name),
    email: String(body.email),
    phone: String(body.phone),
    licenseNumber: String(body.licenseNumber),
    licenseExpiry: String(body.licenseExpiry),
    licenseCategories: (body.licenseCategories || []) as any,
    status: 'on_duty' as const,
    safetyScore: 95,
    joinDate: new Date().toISOString().split('T')[0],
    totalTrips: 0,
    completedTrips: 0,
  };
  list.push(newDriver);
  setDrivers(list);
  return newDriver;
}

export async function updateDriver(id: string, body: Record<string, unknown>) {
  const list = getDrivers();
  const idx = list.findIndex(d => String(d.id) === String(id));
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...body } as any;
    setDrivers(list);
    return list[idx];
  }
  throw new Error('Driver not found');
}

export async function setDriverStatus(id: string, status: string) {
  const list = getDrivers();
  const idx = list.findIndex(d => String(d.id) === String(id));
  if (idx !== -1) {
    list[idx].status = status as any;
    setDrivers(list);
    return list[idx];
  }
  throw new Error('Driver not found');
}

// Trips API mocks
export async function fetchTrips() {
  return getTrips();
}

export async function createTrip(body: Record<string, unknown>) {
  const list = getTrips();
  const newTrip = {
    id: 't_' + Math.random().toString(36).substr(2, 9),
    vehicleId: String(body.vehicleId),
    driverId: String(body.driverId),
    cargoWeight: Number(body.cargoWeight || 0),
    origin: String(body.origin),
    destination: String(body.destination),
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
    distance: 250, // default placeholder
    revenue: 35000, // default placeholder
  };
  list.push(newTrip);
  setTrips(list);
  return newTrip;
}

export async function updateTrip(id: string, body: Record<string, unknown>) {
  const list = getTrips();
  const idx = list.findIndex(t => String(t.id) === String(id));
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...body } as any;
    setTrips(list);
    return list[idx];
  }
  throw new Error('Trip not found');
}

export async function setTripStatus(id: string, status: string, odometer?: number) {
  const list = getTrips();
  const idx = list.findIndex(t => String(t.id) === String(id));
  if (idx !== -1) {
    list[idx].status = status as any;
    if (status === 'completed') {
      list[idx].completedAt = new Date().toISOString();
    } else if (status === 'dispatched' || status === 'in_progress') {
      list[idx].dispatchedAt = new Date().toISOString();
    }
    setTrips(list);
    return list[idx];
  }
  throw new Error('Trip not found');
}

// Maintenance API mocks
export async function fetchMaintenanceLogs() {
  return getMaintenance();
}

export async function createMaintenanceLog(body: Record<string, unknown>) {
  const list = getMaintenance();
  const newLog = {
    id: 'm_' + Math.random().toString(36).substr(2, 9),
    vehicleId: String(body.vehicleId),
    type: (body.type || 'general_service') as any,
    description: String(body.description || ''),
    status: 'scheduled' as const,
    scheduledDate: String(body.scheduledDate || new Date().toISOString().split('T')[0]),
    cost: Number(body.cost || 0),
    serviceProvider: String(body.serviceProvider || 'Local Workshop'),
  };
  list.push(newLog);
  setMaintenance(list);
  return newLog;
}

export async function setMaintenanceStatus(id: string, status: string) {
  const list = getMaintenance();
  const idx = list.findIndex(m => String(m.id) === String(id));
  if (idx !== -1) {
    list[idx].status = status as any;
    if (status === 'completed') {
      list[idx].completedDate = new Date().toISOString().split('T')[0];
    }
    setMaintenance(list);
    return list[idx];
  }
  throw new Error('Maintenance log not found');
}

// Fuel API mocks
export async function fetchFuelLogs() {
  return getFuel();
}

export async function createFuelLog(body: Record<string, unknown>) {
  const list = getFuel();
  const newLog = {
    id: 'f_' + Math.random().toString(36).substr(2, 9),
    vehicleId: String(body.vehicleId),
    liters: Number(body.liters || 0),
    cost: Number(body.cost || 0),
    date: String(body.date || new Date().toISOString().split('T')[0]),
    odometerReading: Number(body.odometerReading || 0),
    station: String(body.station || 'Fuel Station'),
  };
  list.push(newLog);
  setFuel(list);
  return newLog;
}

// Dashboard KPIs API Mock
export async function fetchDashboardKPIs() {
  const vehicles = getVehicles();
  const trips = getTrips();
  
  const activeFleet = vehicles.filter(v => v.status === 'on_trip').length;
  const maintenanceAlerts = vehicles.filter(v => v.status === 'in_shop').length;
  const totalVehicles = vehicles.filter(v => v.status !== 'retired').length;
  const utilizationRate = totalVehicles > 0 ? Math.round((activeFleet / totalVehicles) * 100) : 0;
  const pendingCargo = trips.filter(t => t.status === 'draft').length;
  
  return {
    activeFleet,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo
  };
}
