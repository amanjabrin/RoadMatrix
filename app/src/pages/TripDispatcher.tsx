import { useMemo, useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { 
  Plus, 
  MapPin, 
  ArrowRight, 
  Package, 
  User, 
  Truck, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Play,
  Check,
  X,
  FileEdit,
  Send,
  Loader2,
  FileSpreadsheet,
  FileText,
  Radio,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TripStatus } from '@/types';
import { ServiceNotConnected } from '@/components/common/ServiceNotConnected';
import { mockTrips } from '@/data/mockData';

export function TripDispatcher() {
  const { 
    state, 
    loadData,
    getAvailableVehicles, 
    getAvailableDrivers, 
    getVehicleById, 
    getDriverById,
    validateCargoWeight,
    canDriverOperateVehicle,
    isLicenseValid,
    hasRole,
    apiAddTrip,
    apiDeleteTrip,
    apiSetTripStatus,
  } = useFleet();

  const canManage = hasRole(['dispatcher', 'fleet_manager']);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');
  const [completeTripId, setCompleteTripId] = useState<string | null>(null);
  const [completeOdometer, setCompleteOdometer] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const isServiceConnected = state.servicesHealth.trip;
  const activeTripsList = isServiceConnected ? state.trips : (isDemoMode ? mockTrips : []);

  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
    distance: '',
    revenue: '',
  });

  // Trip status counts for dashboard
  const tripCounts = useMemo(() => ({
    draft: activeTripsList.filter(t => t.status === 'draft').length,
    dispatched: activeTripsList.filter(t => t.status === 'dispatched').length,
    in_progress: activeTripsList.filter(t => t.status === 'in_progress').length,
    completed: activeTripsList.filter(t => t.status === 'completed').length,
    cancelled: activeTripsList.filter(t => t.status === 'cancelled').length,
  }), [activeTripsList]);

  // Filter trips
  const filteredTrips = activeTripsList.filter((trip) => {
    if (statusFilter === 'all') return true;
    return trip.status === statusFilter;
  });

  const availableVehicles = getAvailableVehicles();
  const availableDrivers = getAvailableDrivers();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionError(null);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTrip = async () => {
    setError('');
    setActionError(null);
    if (!formData.vehicleId || !formData.driverId || !formData.cargoWeight || !formData.origin.trim() || !formData.destination.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    const vehicle = getVehicleById(formData.vehicleId);
    const cargoWeight = parseFloat(formData.cargoWeight);

    if (isNaN(cargoWeight) || cargoWeight <= 0) {
      setError('Cargo weight must be a positive number');
      return;
    }

    if (!validateCargoWeight(formData.vehicleId, cargoWeight)) {
      setError(`Cargo weight exceeds vehicle capacity (${vehicle?.maxLoadCapacity} kg)`);
      return;
    }

    if (!canDriverOperateVehicle(formData.driverId, vehicle?.type || '')) {
      setError('Driver is not licensed to operate this vehicle type');
      return;
    }
    if (!isLicenseValid(formData.driverId)) {
      setError('Driver license has expired');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        cargoWeight,
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
      };
      if (formData.distance && !isNaN(parseFloat(formData.distance))) {
        payload.distance = parseFloat(formData.distance);
      }
      if (formData.revenue && !isNaN(parseFloat(formData.revenue))) {
        payload.revenue = parseFloat(formData.revenue);
      }

      const t = await apiAddTrip(payload);
      if (t) {
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (tripId: string, newStatus: TripStatus) => {
    setActionError(null);
    const trip = activeTripsList.find(t => t.id === tripId);
    if (!trip) return;
    if (newStatus === 'completed') {
      setCompleteTripId(tripId);
      const v = getVehicleById(trip.vehicleId);
      setCompleteOdometer(String(v?.odometer ?? ''));
      return;
    }
    try {
      await apiSetTripStatus(tripId, newStatus);
    } catch (err) {
      setActionError((err as Error).message);
    }
  };

  const confirmCompleteTrip = async () => {
    if (!completeTripId) return;
    const trip = activeTripsList.find(t => t.id === completeTripId);
    if (!trip) return;
    const odometer = completeOdometer ? parseFloat(completeOdometer) : undefined;
    if (completeOdometer && (isNaN(odometer as number) || (odometer as number) < 0)) {
      setActionError('Odometer reading must be a valid positive number');
      return;
    }
    try {
      await apiSetTripStatus(completeTripId, 'completed', odometer);
      setCompleteTripId(null);
      setCompleteOdometer('');
    } catch (err) {
      setActionError((err as Error).message);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    setActionError(null);
    if (!window.confirm('Are you sure you want to delete this trip record?')) return;
    try {
      await apiDeleteTrip(tripId);
    } catch (err) {
      setActionError((err as Error).message);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      origin: '',
      destination: '',
      distance: '',
      revenue: '',
    });
    setError('');
  };

  const getStatusIcon = (status: TripStatus) => {
    switch (status) {
      case 'draft': return <div className="w-2 h-2 rounded-full bg-slate-400" />;
      case 'dispatched': return <div className="w-2 h-2 rounded-full bg-cyan-400" />;
      case 'in_progress': return <div className="w-2 h-2 rounded-full bg-blue-400" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'dispatched': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  if (!isServiceConnected && !isDemoMode) {
    return (
      <ServiceNotConnected
        serviceName="Trip Dispatcher & Route Service"
        serviceId="trip-service"
        port={8085}
        route="/api/v1/trip/**"
        description="Cargo logistics, load capacity checks, driver dispatching, and trip routing microservice."
        onRetry={loadData}
        onToggleDemoMode={() => setIsDemoMode(true)}
        isDemoMode={isDemoMode}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {isDemoMode && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <span><strong>Demo Wireframe Mode:</strong> Backend microservice (<code className="font-mono text-amber-200">trip-service :8085</code>) is offline. Showing sample layout for evaluation.</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsDemoMode(false)} className="text-xs h-7 border-amber-500/40 text-amber-300 hover:bg-amber-500/20">
            Exit Demo
          </Button>
        </div>
      )}

      {/* Global Action Error Alert */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionError(null)} 
            className="text-rose-400 hover:text-rose-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trip Dispatcher</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage ? 'Create, dispatch, and track cargo delivery routes' : 'View active trip assignments'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const headers = ['ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Status', 'Cargo (kg)', 'Distance', 'Revenue (₹)', 'Created'];
            const rows = filteredTrips.map(t => {
              const v = getVehicleById(t.vehicleId);
              const d = getDriverById(t.driverId);
              return [t.id, v?.name ?? '', d?.name ?? '', t.origin, t.destination, t.status, t.cargoWeight, t.distance ?? '', t.revenue ?? '', t.createdAt ? formatDate(t.createdAt) : ''];
            });
            const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `trips-${date}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const rows = filteredTrips.map(t => {
              const v = getVehicleById(t.vehicleId);
              const d = getDriverById(t.driverId);
              return `<tr><td>${t.id}</td><td>${v?.name ?? ''}</td><td>${d?.name ?? ''}</td><td>${t.origin}</td><td>${t.destination}</td><td>${t.status}</td><td>${t.cargoWeight}</td><td>${t.distance ?? ''}</td><td>₹${t.revenue ?? 0}</td><td>${t.createdAt ? formatDate(t.createdAt) : ''}</td></tr>`;
            }).join('');
            const html = `<!DOCTYPE html><html><head><title>Trips ${date}</title></head><body><h1>RoadMatrix Trip Dispatcher</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>ID</th><th>Vehicle</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Status</th><th>Cargo (kg)</th><th>Distance</th><th>Revenue (₹)</th><th>Created</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
            const printWin = window.open('', '_blank');
            if (printWin) {
              printWin.document.write(html);
              printWin.document.close();
              printWin.print();
              printWin.close();
            }
          }} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          {canManage && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="btn-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Trip
            </Button>
          )}
        </div>
      </div>

      {/* Trip Status Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <button type="button" onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'draft' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Draft</span>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.draft}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter(statusFilter === 'dispatched' ? 'all' : 'dispatched')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'dispatched' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Dispatched</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.dispatched}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'in_progress' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</span>
            <Loader2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.in_progress}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'completed' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.completed}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter(statusFilter === 'cancelled' ? 'all' : 'cancelled')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'cancelled' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.cancelled}</p>
        </button>
      </div>

      {/* Validation Info */}
      {canManage && (
        <div className="fleet-card p-4 bg-secondary/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Trip validation: Checks vehicle max load capacity, driver license status, and prevents conflicting vehicle assignments.</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TripStatus | 'all')}>
            <SelectTrigger className="fleet-input w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="all">All Trips ({activeTripsList.length})</SelectItem>
              <SelectItem value="draft">Draft ({tripCounts.draft})</SelectItem>
              <SelectItem value="dispatched">Dispatched ({tripCounts.dispatched})</SelectItem>
              <SelectItem value="in_progress">In Progress ({tripCounts.in_progress})</SelectItem>
              <SelectItem value="completed">Completed ({tripCounts.completed})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({tripCounts.cancelled})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredTrips.length} of {activeTripsList.length} trips
        </p>
      </div>

      {/* Trips Table */}
      <div className="fleet-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fleet-table w-full">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Route</th>
                <th>Status</th>
                <th>Distance / Rev</th>
                <th>Created</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="text-center py-8 text-muted-foreground text-sm">
                    No trips found for selected filter.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const vehicle = getVehicleById(trip.vehicleId);
                  const driver = getDriverById(trip.driverId);
                  return (
                    <tr key={trip.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="mono text-xs text-muted-foreground">
                        {trip.id.length > 8 ? trip.id.substring(0, 8).toUpperCase() : trip.id.toUpperCase()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{vehicle?.name || 'Assigned Vehicle'}</p>
                            <p className="text-xs text-muted-foreground">{vehicle?.licensePlate || trip.vehicleId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">{driver?.name || 'Assigned Driver'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">{trip.cargoWeight} kg</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[120px]" title={trip.origin}>{trip.origin}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[120px]" title={trip.destination}>{trip.destination}</span>
                        </div>
                      </td>
                      <td>
                        <span className={cn('status-pill', getStatusColor(trip.status))}>
                          {getStatusIcon(trip.status)}
                          <span className="ml-1 capitalize">{trip.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{trip.distance ?? 0} km</p>
                          <p className="text-emerald-400">₹{(trip.revenue ?? 0).toLocaleString()}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">{formatDate(trip.createdAt)}</span>
                        </div>
                      </td>
                      {canManage && (
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="fleet-card border-border" align="end">
                              {trip.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, 'dispatched')}>
                                  <Play className="w-4 h-4 mr-2 text-cyan-400" />
                                  Dispatch Trip
                                </DropdownMenuItem>
                              )}
                              {trip.status === 'dispatched' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, 'in_progress')}>
                                  <Play className="w-4 h-4 mr-2 text-blue-400" />
                                  Start Trip
                                </DropdownMenuItem>
                              )}
                              {trip.status === 'in_progress' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, 'completed')}>
                                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                                  Complete Trip
                                </DropdownMenuItem>
                              )}
                              {(trip.status === 'draft' || trip.status === 'dispatched') && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, 'cancelled')}>
                                  <X className="w-4 h-4 mr-2 text-rose-400" />
                                  Cancel Trip
                                </DropdownMenuItem>
                              )}
                              {(trip.status === 'draft' || trip.status === 'cancelled') && (
                                <>
                                  <DropdownMenuSeparator className="bg-border/60" />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteTrip(trip.id)} 
                                    className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2 text-rose-400" />
                                    Delete Trip
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Dialog */}
      {canManage && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fleet-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Delivery Trip</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Available Vehicle *</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select available vehicle" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableVehicles.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">No available vehicles</div>
                    ) : (
                      availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} · {vehicle.licensePlate} · Max: {vehicle.maxLoadCapacity}kg
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Available Driver *</Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select available driver" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableDrivers.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">No available drivers on duty</div>
                    ) : (
                      availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} · Lic: {driver.licenseCategories.join(', ')} · Score: {driver.safetyScore}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Cargo Weight (kg) *</Label>
                <Input
                  type="number"
                  placeholder="Enter cargo weight in kg (e.g. 1500)"
                  value={formData.cargoWeight}
                  onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Origin *</Label>
                  <Input
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Destination *</Label>
                  <Input
                    placeholder="e.g. Pune, Maharashtra"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Estimated Distance (km)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Estimated Revenue (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 24000"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setIsAddDialogOpen(false)} 
                variant="outline" 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTrip} 
                className="btn-cyan flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Trip'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Trip - Enter final odometer */}
      <Dialog open={!!completeTripId} onOpenChange={(open) => !open && setCompleteTripId(null)}>
        <DialogContent className="fleet-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Final Odometer Reading (km)</Label>
              <Input
                type="number"
                value={completeOdometer}
                onChange={(e) => setCompleteOdometer(e.target.value)}
                className="fleet-input w-full"
                placeholder="Enter final vehicle odometer reading"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCompleteTripId(null)}>Cancel</Button>
              <Button className="btn-cyan flex-1" onClick={confirmCompleteTrip}>Complete Trip</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
