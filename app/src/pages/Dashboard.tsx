import { useMemo, useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { 
  Truck, 
  Wrench, 
  TrendingUp, 
  Package,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VehicleType, VehicleStatus } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  onViewAllVehicles?: () => void;
}

export function Dashboard({ onViewAllVehicles }: DashboardProps) {
  const { state, getDashboardKPIs, getActiveTrips, getVehicleById, getDriverById, getFuelEfficiency, hasRole } = useFleet();
  const chartTheme = useChartTheme();
  const canCreateTrip = hasRole(['dispatcher']);
  const canLogFuel = hasRole(['financial_analyst']);
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');

  // Fuel efficiency from backend data (per vehicle)
  const fuelEfficiencyData = useMemo(() => {
    return state.vehicles
      .filter(v => v.status !== 'retired')
      .map(v => ({ name: v.name.slice(0, 8), efficiency: Number(getFuelEfficiency(v.id).toFixed(1)) }))
      .filter(d => d.efficiency > 0)
      .slice(0, 7);
  }, [state.vehicles, state.trips, state.fuelLogs, getFuelEfficiency]);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const kpis = getDashboardKPIs();
  const activeTrips = getActiveTrips();

  const filteredVehicles = state.vehicles.filter((v) => {
    const matchType = typeFilter === 'all' || v.type === typeFilter;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchRegion = regionFilter === 'all' || (v.region && v.region === regionFilter);
    return matchType && matchStatus && matchRegion;
  });
  const regions = Array.from(new Set(state.vehicles.map((v) => v.region).filter(Boolean))) as string[];

  const kpiCards = [
    {
      label: 'Active Fleet',
      value: kpis.activeFleet,
      subtext: 'vehicles on trip',
      icon: Truck,
      trend: '+12%',
      trendUp: true,
      color: 'cyan',
    },
    {
      label: 'Maintenance Alerts',
      value: kpis.maintenanceAlerts,
      subtext: 'vehicles in shop',
      icon: Wrench,
      trend: '-2',
      trendUp: false,
      color: 'amber',
    },
    {
      label: 'Utilization Rate',
      value: `${kpis.utilizationRate}%`,
      subtext: 'fleet assigned',
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
      color: 'emerald',
    },
    {
      label: 'Pending Cargo',
      value: kpis.pendingCargo,
      subtext: 'shipments waiting',
      icon: Package,
      trend: '+3',
      trendUp: true,
      color: 'blue',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Command Center Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as VehicleType | 'all')}>
          <SelectTrigger className="fleet-input w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="fleet-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VehicleStatus | 'all')}>
          <SelectTrigger className="fleet-input w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="fleet-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_trip">On Trip</SelectItem>
            <SelectItem value="in_shop">In Shop</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="fleet-input w-32">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent className="fleet-card border-border">
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="kpi-card fleet-card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-label">{kpi.label}</p>
                  <p className="kpi-value">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtext}</p>
                </div>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  kpi.color === 'cyan' && 'bg-cyan-500/10',
                  kpi.color === 'amber' && 'bg-amber-500/10',
                  kpi.color === 'emerald' && 'bg-emerald-500/10',
                  kpi.color === 'blue' && 'bg-blue-500/10',
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    kpi.color === 'cyan' && 'text-cyan-400',
                    kpi.color === 'amber' && 'text-amber-400',
                    kpi.color === 'emerald' && 'text-emerald-400',
                    kpi.color === 'blue' && 'text-blue-400',
                  )} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {kpi.trendUp ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                )}
                <span className={cn(
                  'text-xs font-medium',
                  kpi.trendUp ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map Placeholder */}
        <div className="lg:col-span-2 fleet-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Live Fleet Map</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="h-80 bg-secondary/30 rounded-xl relative overflow-hidden">
            {/* Simulated Map */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#111318] to-[#1a1d24]">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute w-full h-px bg-foreground" style={{ top: `${i * 10}%` }} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute h-full w-px bg-foreground" style={{ left: `${i * 10}%` }} />
                ))}
              </div>
              
              {/* Vehicle markers */}
              {activeTrips.slice(0, 5).map((trip, i) => {
                const vehicle = getVehicleById(trip.vehicleId);
                const top = 20 + (i * 15);
                const left = 15 + (i * 12);
                return (
                  <div
                    key={trip.id}
                    className="absolute flex items-center gap-2"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <div className="relative">
                      <div className="w-4 h-4 bg-[#30F2FF] rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-[#30F2FF] rounded-full animate-ping opacity-50" />
                    </div>
                    <span className="text-xs bg-card/80 px-2 py-1 rounded text-foreground">
                      {vehicle?.name}
                    </span>
                  </div>
                );
              })}
              
              {/* Route lines */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 100 150 Q 200 100 300 180 T 500 120"
                  stroke="#30F2FF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M 150 200 Q 250 250 350 200 T 550 220"
                  stroke="#30F2FF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Status</h3>
          <div className="space-y-3">
            {filteredVehicles.slice(0, 6).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    vehicle.status === 'available' && 'bg-emerald-400',
                    vehicle.status === 'on_trip' && 'bg-cyan-400',
                    vehicle.status === 'in_shop' && 'bg-amber-400',
                  )} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                  </div>
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  vehicle.status === 'available' && 'bg-emerald-500/10 text-emerald-400',
                  vehicle.status === 'on_trip' && 'bg-cyan-500/10 text-cyan-400',
                  vehicle.status === 'in_shop' && 'bg-amber-500/10 text-amber-400',
                )}>
                  {vehicle.status === 'on_trip' ? 'On Trip' : vehicle.status === 'in_shop' ? 'In Shop' : 'Available'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onViewAllVehicles}
            className="w-full mt-4 py-2 text-sm text-[#30F2FF] hover:bg-[#30F2FF]/10 rounded-lg transition-colors"
          >
            View all vehicles ({filteredVehicles.length})
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Activity */}
        <div className="lg:col-span-2 fleet-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Active Trips</h3>
            <button className="text-sm text-[#30F2FF] hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeTrips.slice(0, 5).map((trip) => {
                  const vehicle = getVehicleById(trip.vehicleId);
                  const driver = getDriverById(trip.driverId);
                  return (
                    <tr key={trip.id}>
                      <td className="mono text-muted-foreground">{trip.id.toUpperCase()}</td>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-foreground">{vehicle?.name}</p>
                          <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                            {driver?.name.charAt(0)}
                          </div>
                          <span className="text-sm text-foreground">{driver?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {trip.origin}
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                          {trip.destination}
                        </div>
                      </td>
                      <td>
                        <span className={cn(
                          'status-pill',
                          trip.status === 'in_progress' && 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                          trip.status === 'dispatched' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                        )}>
                          {trip.status === 'in_progress' ? 'In Progress' : 'Dispatched'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Charts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="fleet-card p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {canCreateTrip && (
                <button className="w-full flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Create Trip</p>
                    <p className="text-xs text-muted-foreground">Assign vehicle & driver</p>
                  </div>
                </button>
              )}
              {canLogFuel && (
                <button className="w-full flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Log Fuel</p>
                    <p className="text-xs text-muted-foreground">Record fuel purchase</p>
                  </div>
                </button>
              )}
              <button className="w-full flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Schedule Service</p>
                  <p className="text-xs text-muted-foreground">Book maintenance</p>
                </div>
              </button>
            </div>
          </div>

          {/* Fuel Efficiency Chart (from backend) */}
          <div className="fleet-card p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Fuel Efficiency (km/L)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelEfficiencyData.length ? fuelEfficiencyData : [{ name: '-', efficiency: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                  <XAxis dataKey="name" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={11} />
                  <YAxis stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      borderRadius: '8px',
                      color: chartTheme.tooltipText,
                    }}
                    labelStyle={{ color: chartTheme.tooltipText }}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#30F2FF"
                    strokeWidth={2}
                    dot={{ fill: '#30F2FF', strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
