import { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { 
  Search, 
  Plus, 
  Filter, 
  Truck, 
  Bike,
  Car,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { cn, formatNumber, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import type { Vehicle, VehicleType, VehicleStatus } from '@/types';

const vehicleTypeIcons = {
  truck: Truck,
  van: Car,
  bike: Bike,
};

export function VehicleRegistry() {
  const { state, dispatch, getVehicleOperationalCost, getVehicleROI, hasRole, apiAddVehicle, apiUpdateVehicle, apiSetVehicleStatus } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOdometer, setEditOdometer] = useState(0);

  // Only Fleet Manager can add/edit vehicles and set Out of Service
  const canAdd = hasRole(['fleet_manager']);
  const canEdit = hasRole(['fleet_manager']);

  // Form state
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    model: '',
    licensePlate: '',
    type: 'truck',
    maxLoadCapacity: 0,
    fuelType: 'diesel',
    acquisitionCost: 0,
    year: new Date().getFullYear(),
  });

  // Filter vehicles
  const filteredVehicles = state.vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddVehicle = async () => {
    const payload = {
      name: formData.name || '',
      model: formData.model || '',
      licensePlate: formData.licensePlate || '',
      type: (formData.type as VehicleType) || 'truck',
      maxLoadCapacity: formData.maxLoadCapacity || 0,
      acquisitionCost: formData.acquisitionCost || 0,
      year: formData.year || new Date().getFullYear(),
      fuelType: (formData.fuelType as 'diesel' | 'gasoline' | 'electric') || 'diesel',
      region: '',
    };
    const v = await apiAddVehicle(payload);
    if (v) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const openDetailView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditOdometer(vehicle.odometer);
    setIsDetailOpen(true);
  };

  const handleOutOfServiceToggle = async (vehicle: Vehicle, outOfService: boolean) => {
    try {
      await apiSetVehicleStatus(vehicle.id, outOfService ? 'retired' : 'available');
      setSelectedVehicle((prev) => prev && prev.id === vehicle.id ? { ...prev, status: outOfService ? 'retired' : 'available' } : prev);
    } catch (e) { /* ignore */ }
  };

  const handleSaveOdometer = async () => {
    if (!selectedVehicle) return;
    const v = await apiUpdateVehicle(selectedVehicle.id, { odometer: editOdometer });
    if (v) {
      setSelectedVehicle((prev) => prev ? { ...prev, odometer: editOdometer } : null);
      setIsEditOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      licensePlate: '',
      type: 'truck',
      maxLoadCapacity: 0,
      fuelType: 'diesel',
      acquisitionCost: 0,
      year: new Date().getFullYear(),
    });
  };

  const renderVehicleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Name</Label>
          <Input
            placeholder="e.g., Truck 01"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Model</Label>
          <Input
            placeholder="e.g., Ford F-550"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">License Plate</Label>
        <Input
          placeholder="e.g., CA-7842"
          value={formData.licensePlate}
          onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
          className="fleet-input w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as VehicleType })}
          >
            <SelectTrigger className="fleet-input w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Fuel Type</Label>
          <Select
            value={formData.fuelType}
            onValueChange={(value) => setFormData({ ...formData, fuelType: value as any })}
          >
            <SelectTrigger className="fleet-input w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Max Load (kg)</Label>
          <Input
            type="number"
            placeholder="e.g., 3500"
            value={formData.maxLoadCapacity}
            onChange={(e) => setFormData({ ...formData, maxLoadCapacity: parseInt(e.target.value) || 0 })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Year</Label>
          <Input
            type="number"
            placeholder="e.g., 2023"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Acquisition Cost (₹)</Label>
          <Input
            type="number"
            placeholder="e.g., 65000"
            value={formData.acquisitionCost}
            onChange={(e) => setFormData({ ...formData, acquisitionCost: parseInt(e.target.value) || 0 })}
            className="fleet-input w-full"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">View fleet assets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const headers = ['Name', 'Model', 'License Plate', 'Type', 'Status', 'Odometer', 'Max Load (kg)', 'Acquisition Cost (₹)', 'Fuel Type', 'Region', 'Year'];
            const rows = filteredVehicles.map(v => [v.name, v.model, v.licensePlate, v.type, v.status, v.odometer, v.maxLoadCapacity, v.acquisitionCost ?? 0, v.fuelType, v.region ?? '', v.year]);
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `vehicles-${date}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const rows = filteredVehicles.map(v => `<tr><td>${v.name}</td><td>${v.model}</td><td>${v.licensePlate}</td><td>${v.type}</td><td>${v.status}</td><td>${formatNumber(v.odometer)}</td><td>${formatNumber(v.maxLoadCapacity)}</td><td>₹${formatNumber(v.acquisitionCost ?? 0)}</td><td>${v.fuelType}</td><td>${v.region ?? ''}</td><td>${v.year}</td></tr>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Vehicles ${date}</title></head><body><h1>FleetFlow Vehicle Registry</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>Name</th><th>Model</th><th>License</th><th>Type</th><th>Status</th><th>Odometer</th><th>Max Load</th><th>Cost (₹)</th><th>Fuel</th><th>Region</th><th>Year</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
          {canAdd && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="btn-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="fleet-input w-full pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VehicleType | 'all')}>
            <SelectTrigger className="fleet-input w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VehicleStatus | 'all')}>
            <SelectTrigger className="fleet-input w-32">
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
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((vehicle) => {
          const Icon = vehicleTypeIcons[vehicle.type];
          const roi = getVehicleROI(vehicle.id);
          return (
            <div
              key={vehicle.id}
              className="fleet-card p-5 cursor-pointer fleet-card-hover"
              onClick={() => openDetailView(vehicle)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#30F2FF]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground">{vehicle.name}</h3>
              <p className="text-sm text-muted-foreground">{vehicle.model}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License Plate</span>
                  <span className="text-foreground mono">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Load</span>
                  <span className="text-foreground">{formatNumber(vehicle.maxLoadCapacity)} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Odometer</span>
                  <span className="text-foreground">{formatNumber(vehicle.odometer)} km</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className={cn(
                  'status-pill',
                  vehicle.status === 'available' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                  vehicle.status === 'on_trip' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                  vehicle.status === 'in_shop' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  vehicle.status === 'retired' && 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                )}>
                  {vehicle.status === 'on_trip' ? 'On Trip' : vehicle.status === 'in_shop' ? 'In Shop' : vehicle.status === 'retired' ? 'Retired' : 'Available'}
                </span>
                <span className={cn(
                  'text-xs font-medium',
                  roi.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  ROI: {roi.roi.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Dialog - Only for Fleet Manager */}
      {canAdd && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fleet-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Vehicle</DialogTitle>
            </DialogHeader>
            {renderVehicleForm()}
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddVehicle} className="btn-cyan flex-1">
                Add Vehicle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Vehicle Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="fleet-card border-border max-w-2xl">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedVehicle.name}</DialogTitle>
                    <p className="text-muted-foreground">{selectedVehicle.model}</p>
                  </div>
                  <span className={cn(
                    'status-pill',
                    selectedVehicle.status === 'available' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    selectedVehicle.status === 'on_trip' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    selectedVehicle.status === 'in_shop' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    selectedVehicle.status === 'retired' && 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                  )}>
                    {selectedVehicle.status === 'on_trip' ? 'On Trip' : selectedVehicle.status === 'in_shop' ? 'In Shop' : selectedVehicle.status === 'retired' ? 'Retired' : 'Available'}
                  </span>
                </div>
              </DialogHeader>

              {canEdit && (
                <div className="flex items-center justify-between py-4 border-b border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Out of Service (Retired)</p>
                    <p className="text-xs text-muted-foreground">Remove from dispatch pool</p>
                  </div>
                  <Switch
                    checked={selectedVehicle.status === 'retired'}
                    onCheckedChange={(checked) => handleOutOfServiceToggle(selectedVehicle, checked)}
                  />
                </div>
              )}

              {canEdit && (
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">Odometer</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(selectedVehicle.odometer)} km</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="text-[#30F2FF] border-[#30F2FF]/50">
                    Edit
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Specifications</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">License Plate</span>
                      <span className="text-foreground mono">{selectedVehicle.licensePlate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground capitalize">{selectedVehicle.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Year</span>
                      <span className="text-foreground">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Fuel Type</span>
                      <span className="text-foreground capitalize">{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Max Load</span>
                      <span className="text-foreground">{formatNumber(selectedVehicle.maxLoadCapacity)} kg</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Odometer</span>
                      <span className="text-foreground">{formatNumber(selectedVehicle.odometer)} km</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Financial Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Acquisition Cost</span>
                      <span className="text-foreground">₹{formatNumber(selectedVehicle.acquisitionCost)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Operational Cost</span>
                      <span className="text-foreground">₹{formatNumber(getVehicleOperationalCost(selectedVehicle.id))}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="text-foreground">₹{formatNumber(getVehicleROI(selectedVehicle.id).revenue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">ROI</span>
                      <span className={cn(
                        'font-medium',
                        getVehicleROI(selectedVehicle.id).roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        {getVehicleROI(selectedVehicle.id).roi.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Odometer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="fleet-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Odometer</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4 mt-4">
              <Label className="text-sm text-muted-foreground">Odometer (km)</Label>
              <Input
                type="number"
                value={editOdometer}
                onChange={(e) => setEditOdometer(parseInt(e.target.value) || 0)}
                className="fleet-input w-full"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button className="btn-cyan flex-1" onClick={handleSaveOdometer}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
