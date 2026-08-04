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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TripStatus } from '@/types';

export function TripDispatcher() {
  const { 
    state, 
    dispatch, 
    getAvailableVehicles, 
    getAvailableDrivers, 
    getVehicleById, 
    getDriverById,
    validateCargoWeight,
    canDriverOperateVehicle,
    isLicenseValid,
    hasRole,
    apiAddTrip,
    apiSetTripStatus,
  } = useFleet();

  // Only Dispatcher can create/manage trips (Fleet Manager is view-only)
  const canManage = hasRole(['dispatcher']);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');
  const [completeTripId, setCompleteTripId] = useState<string | null>(null);
  const [completeOdometer, setCompleteOdometer] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
  });

  // Trip status counts for dashboard
  const tripCounts = useMemo(() => ({
    draft: state.trips.filter(t => t.status === 'draft').length,
    dispatched: state.trips.filter(t => t.status === 'dispatched').length,
    in_progress: state.trips.filter(t => t.status === 'in_progress').length,
    completed: state.trips.filter(t => t.status === 'completed').length,
    cancelled: state.trips.filter(t => t.status === 'cancelled').length,
  }), [state.trips]);

  // Filter trips
  const filteredTrips = state.trips.filter((trip) => {
    if (statusFilter === 'all') return true;
    return trip.status === statusFilter;
  });

  const availableVehicles = getAvailableVehicles();
  const availableDrivers = getAvailableDrivers();

  const handleCreateTrip = async () => {
    setError('');
    if (!formData.vehicleId || !formData.driverId || !formData.cargoWeight || !formData.origin || !formData.destination) {
      setError('Please fill in all fields');
      return;
    }
    const vehicle = getVehicleById(formData.vehicleId);
    const cargoWeight = parseFloat(formData.cargoWeight);
    if (!validateCargoWeight(formData.vehicleId, cargoWeight)) {
      setError(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle?.maxLoadCapacity}kg)`);
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
    const t = await apiAddTrip({
      vehicleId: formData.vehicleId,
      driverId: formData.driverId,
      cargoWeight,
      origin: formData.origin,
      destination: formData.destination,
    });
    if (t) {
      setIsAddDialogOpen(false);
      resetForm();
    } else {
      setError('Failed to create trip');
    }
  };

  const handleUpdateStatus = (tripId: string, newStatus: TripStatus) => {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    if (newStatus === 'completed') {
      setCompleteTripId(tripId);
      const v = getVehicleById(trip.vehicleId);
      setCompleteOdometer(String(v?.odometer ?? ''));
      return;
    }
    apiSetTripStatus(tripId, newStatus).catch(() => {});
  };

  const confirmCompleteTrip = async () => {
    if (!completeTripId) return;
    const trip = state.trips.find(t => t.id === completeTripId);
    if (!trip) return;
    const odometer = parseInt(completeOdometer, 10);
    await apiSetTripStatus(completeTripId, 'completed', isNaN(odometer) ? undefined : odometer);
    setCompleteTripId(null);
    setCompleteOdometer('');
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      origin: '',
      destination: '',
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trip Dispatcher</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage ? 'Create and manage delivery trips' : 'View trip assignments'}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            const html = `<!DOCTYPE html><html><head><title>Trips ${date}</title></head><body><h1>FleetFlow Trip Dispatcher</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>ID</th><th>Vehicle</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Status</th><th>Cargo (kg)</th><th>Distance</th><th>Revenue (₹)</th><th>Created</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
        <button type="button" onClick={() => setStatusFilter('draft')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'draft' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Draft</span>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.draft}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter('dispatched')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'dispatched' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Dispatched</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.dispatched}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter('in_progress')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'in_progress' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</span>
            <Loader2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.in_progress}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter('completed')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'completed' && 'ring-2 ring-cyan-400/50')}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{tripCounts.completed}</p>
        </button>
        <button type="button" onClick={() => setStatusFilter('cancelled')} className={cn('fleet-card p-4 text-left transition-all hover:opacity-90', statusFilter === 'cancelled' && 'ring-2 ring-cyan-400/50')}>
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
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>System validates load capacity and driver license before dispatch</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TripStatus | 'all')}>
          <SelectTrigger className="fleet-input w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="fleet-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trips Table */}
      <div className="fleet-card overflow-hidden">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo</th>
              <th>Route</th>
              <th>Status</th>
              <th>Created</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip) => {
              const vehicle = getVehicleById(trip.vehicleId);
              const driver = getDriverById(trip.driverId);
              return (
                <tr key={trip.id}>
                  <td className="mono text-muted-foreground">{trip.id.toUpperCase()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{vehicle?.name}</p>
                        <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{driver?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{trip.cargoWeight} kg</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-foreground">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {trip.origin}
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      {trip.destination}
                    </div>
                  </td>
                  <td>
                    <span className={cn('status-pill', getStatusColor(trip.status))}>
                      {getStatusIcon(trip.status)}
                      <span className="ml-1 capitalize">{trip.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(trip.createdAt)}
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
                              Dispatch
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
                              Complete
                            </DropdownMenuItem>
                          )}
                          {(trip.status === 'draft' || trip.status === 'dispatched') && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, 'cancelled')}>
                              <X className="w-4 h-4 mr-2 text-rose-400" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Trip Dialog - Only for Fleet Manager and Dispatcher */}
      {canManage && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fleet-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Trip</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Vehicle</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select available vehicle" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} · {vehicle.licensePlate} · Max: {vehicle.maxLoadCapacity}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Driver</Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select available driver" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} · License: {driver.licenseCategories.join(', ')} · Score: {driver.safetyScore}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Cargo Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="Enter cargo weight in kg"
                  value={formData.cargoWeight}
                  onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Origin</Label>
                  <Input
                    placeholder="From location"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Destination</Label>
                  <Input
                    placeholder="To location"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateTrip} className="btn-cyan flex-1">
                Create Trip
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
            <Label className="text-sm text-muted-foreground">Final Odometer (km)</Label>
            <Input
              type="number"
              value={completeOdometer}
              onChange={(e) => setCompleteOdometer(e.target.value)}
              className="fleet-input w-full"
              placeholder="Enter odometer reading"
            />
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
