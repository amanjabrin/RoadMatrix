const BASE_URL = 'http://localhost:8080';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('roadmatrix_token');
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody && errBody.message) {
        errMsg = errBody.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function login(email: string, password?: string) {
  const res = await request<{
    success: boolean;
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId: string;
    };
  }>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'password' }),
    }
  );
  localStorage.setItem('roadmatrix_token', res.token);
  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    role: res.user.role as any,
  };
}

export function logout() {
  localStorage.removeItem('roadmatrix_token');
  localStorage.removeItem('roadmatrix_session');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('roadmatrix_token');
}

export async function forgotPassword(email: string) {
  console.log("Requested password reset for: " + email);
  return {
    detail: 'Password reset link sent.',
    token: 'mock-reset-token',
    resetUrl: '/reset-password?token=mock-reset-token'
  };
}

export async function resetPassword(token: string, newPassword: string) {
  console.log("Resetting password for token: " + token + " with new password: " + newPassword);
  return { detail: 'Password reset successful.' };
}

// Vehicles API
export async function fetchVehicles() {
  return request<any[]>('/api/v1/fleet/vehicles');
}

export async function createVehicle(body: Record<string, unknown>) {
  return request<any>('/api/v1/fleet/vehicles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateVehicle(id: string, body: Record<string, unknown>) {
  return request<any>(`/api/v1/fleet/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteVehicle(id: string) {
  return request<void>(`/api/v1/fleet/vehicles/${id}`, {
    method: 'DELETE',
  });
}

export async function setVehicleStatus(id: string, status: string) {
  return request<any>(`/api/v1/fleet/vehicles/${id}/status?status=${status}`, {
    method: 'PUT',
  });
}

// Drivers API
export async function fetchDrivers() {
  return request<any[]>('/api/v1/driver');
}

export async function createDriver(body: Record<string, unknown>) {
  return request<any>('/api/v1/driver', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateDriver(id: string, body: Record<string, unknown>) {
  return request<any>(`/api/v1/driver/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function setDriverStatus(id: string, status: string) {
  return request<any>(`/api/v1/driver/${id}/status?status=${status}`, {
    method: 'PUT',
  });
}

// Trips API
export async function fetchTrips() {
  return request<any[]>('/api/v1/trip');
}

export async function createTrip(body: Record<string, unknown>) {
  return request<any>('/api/v1/trip', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTrip(id: string, body: Record<string, unknown>) {
  return request<any>(`/api/v1/trip/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function setTripStatus(id: string, status: string, odometer?: number) {
  let url = `/api/v1/trip/${id}/status?status=${status}`;
  if (odometer !== undefined && odometer !== null) {
    url += `&odometer=${odometer}`;
  }
  return request<any>(url, {
    method: 'PUT',
  });
}

// Maintenance API
export async function fetchMaintenanceLogs() {
  return request<any[]>('/api/v1/maintenance');
}

export async function createMaintenanceLog(body: Record<string, unknown>) {
  return request<any>('/api/v1/maintenance', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function setMaintenanceStatus(id: string, status: string) {
  return request<any>(`/api/v1/maintenance/${id}/status?status=${status}`, {
    method: 'PUT',
  });
}

// Fuel logs mapped to Expense Service under 'fuel' category
export async function fetchFuelLogs() {
  const expenses = await request<any[]>('/api/v1/expense');
  return expenses
    .filter(exp => exp.category === 'fuel')
    .map(exp => {
      let parsed = { liters: 0, odometerReading: 0, station: exp.description || 'Fuel Station' };
      try {
        if (exp.description && exp.description.trim().startsWith('{')) {
          parsed = JSON.parse(exp.description);
        }
      } catch (_) {}
      return {
        id: exp.id,
        vehicleId: exp.vehicleId,
        liters: parsed.liters || 50,
        cost: exp.amount,
        date: exp.date,
        odometerReading: parsed.odometerReading || 120000,
        station: parsed.station || exp.description || 'Fuel Station',
      };
    });
}

export async function createFuelLog(body: Record<string, unknown>) {
  const descObj = {
    liters: Number(body.liters || 0),
    odometerReading: Number(body.odometerReading || 0),
    station: String(body.station || 'Fuel Station')
  };

  const expBody = {
    vehicleId: body.vehicleId,
    category: 'fuel',
    amount: Number(body.cost || 0),
    date: body.date,
    description: JSON.stringify(descObj)
  };

  const exp = await request<any>('/api/v1/expense', {
    method: 'POST',
    body: JSON.stringify(expBody),
  });

  return {
    id: exp.id,
    vehicleId: exp.vehicleId,
    liters: descObj.liters,
    cost: exp.amount,
    date: exp.date,
    odometerReading: descObj.odometerReading,
    station: descObj.station,
  };
}

// Dashboard KPIs calculated dynamically based on real data
export async function fetchDashboardKPIs() {
  const [vehicles, trips] = await Promise.all([
    fetchVehicles(),
    fetchTrips(),
  ]);

  const activeFleet = (vehicles || []).filter(v => v.status === 'on_trip').length;
  const maintenanceAlerts = (vehicles || []).filter(v => v.status === 'in_shop').length;
  const totalVehicles = (vehicles || []).filter(v => v.status !== 'retired').length;
  const utilizationRate = totalVehicles > 0 ? Math.round((activeFleet / totalVehicles) * 100) : 0;
  const pendingCargo = (trips || []).filter(t => t.status === 'draft').length;

  return {
    activeFleet,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo
  };
}
