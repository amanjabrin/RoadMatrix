import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useFleet } from '@/context/FleetContext';
import { Search, Bell, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderProps {
  onPageChange: (page: string) => void;
}

export function Header({ onPageChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { state, getAvailableVehicles, getAvailableDrivers, validateCargoWeight, canDriverOperateVehicle, isLicenseValid, apiAddTrip, hasRole } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Only Dispatcher can create trips (Fleet Manager is view-only)
  const canCreateTrips = hasRole(['dispatcher']);
  
  // Quick trip form state
  const [newTrip, setNewTrip] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    origin: '',
    destination: '',
  });
  const [error, setError] = useState('');

  const availableVehicles = getAvailableVehicles();
  const availableDrivers = getAvailableDrivers();

  const handleCreateTrip = async () => {
    setError('');
    
    if (!newTrip.vehicleId || !newTrip.driverId || !newTrip.cargoWeight || !newTrip.origin || !newTrip.destination) {
      setError('Please fill in all fields');
      return;
    }

    const vehicle = state.vehicles.find(v => v.id === newTrip.vehicleId);
    const cargoWeight = parseFloat(newTrip.cargoWeight);

    if (!validateCargoWeight(newTrip.vehicleId, cargoWeight)) {
      setError(`Cargo weight exceeds vehicle capacity (${vehicle?.maxLoadCapacity} kg)`);
      return;
    }

    if (!canDriverOperateVehicle(newTrip.driverId, vehicle?.type || '')) {
      setError('Driver is not licensed to operate this vehicle type');
      return;
    }

    if (!isLicenseValid(newTrip.driverId)) {
      setError('Driver license has expired');
      return;
    }

    const t = await apiAddTrip({
      vehicleId: newTrip.vehicleId,
      driverId: newTrip.driverId,
      cargoWeight,
      origin: newTrip.origin,
      destination: newTrip.destination,
    });
    if (!t) return;
    setNewTrip({
      vehicleId: '',
      driverId: '',
      cargoWeight: '',
      origin: '',
      destination: '',
    });
    setIsDialogOpen(false);
    onPageChange('trips');
  };

  return (
    <header className="h-[72px] bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-60 z-30">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trips, vehicles, drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="fleet-input w-full pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {(theme === 'light' || theme === 'system') ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#30F2FF] rounded-full" />
        </button>

        {canCreateTrips && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="fleet-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Trip</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Vehicle</Label>
                <Select
                  value={newTrip.vehicleId}
                  onValueChange={(value) => setNewTrip({ ...newTrip, vehicleId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} · {vehicle.licensePlate} · {vehicle.maxLoadCapacity}kg max
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Driver</Label>
                <Select
                  value={newTrip.driverId}
                  onValueChange={(value) => setNewTrip({ ...newTrip, driverId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} · Score: {driver.safetyScore}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Cargo Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="Enter cargo weight"
                  value={newTrip.cargoWeight}
                  onChange={(e) => setNewTrip({ ...newTrip, cargoWeight: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Origin</Label>
                  <Input
                    placeholder="From"
                    value={newTrip.origin}
                    onChange={(e) => setNewTrip({ ...newTrip, origin: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Destination</Label>
                  <Input
                    placeholder="To"
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
              </div>

              <Button onClick={handleCreateTrip} className="btn-cyan w-full mt-6">
                Create Trip
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>
    </header>
  );
}
