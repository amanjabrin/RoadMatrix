import { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { cn, formatDate, daysUntilExpiry } from '@/lib/utils';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { Driver, DriverStatus, LicenseCategory } from '@/types';

const licenseCategories: { value: LicenseCategory; label: string }[] = [
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'bike', label: 'Bike' },
];

export function Drivers() {
  const { state, isLicenseValid, hasRole, apiAddDriver, apiSetDriverStatus } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const canAdd = hasRole(['fleet_manager']);
  const canChangeStatus = hasRole(['safety_officer']);
  const canExport = true;

  const handleSetDriverStatus = async (driverId: string, status: DriverStatus) => {
    try {
      await apiSetDriverStatus(driverId, status);
      setSelectedDriver((prev) => prev && prev.id === driverId ? { ...prev, status } : prev);
    } catch (e) { /* ignore */ }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategories: [] as LicenseCategory[],
  });

  // Filter drivers
  const filteredDrivers = state.drivers.filter((driver) => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddDriver = async () => {
    const d = await apiAddDriver({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      licenseExpiry: formData.licenseExpiry,
      licenseCategories: formData.licenseCategories,
      status: 'on_duty',
      safetyScore: 85,
      joinDate: new Date().toISOString().slice(0, 10),
      totalTrips: 0,
      completedTrips: 0,
    });
    if (d) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const openDetailView = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseCategories: [],
    });
  };

  const toggleLicenseCategory = (category: LicenseCategory) => {
    setFormData(prev => ({
      ...prev,
      licenseCategories: prev.licenseCategories.includes(category)
        ? prev.licenseCategories.filter(c => c !== category)
        : [...prev.licenseCategories, category]
    }));
  };

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case 'on_duty': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'off_duty': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'suspended': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const renderDriverForm = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Full Name</Label>
        <Input
          placeholder="e.g., Alex Rivera"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="fleet-input w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Email</Label>
          <Input
            type="email"
            placeholder="driver@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Phone</Label>
          <Input
            placeholder="+1-555-0100"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">License Number</Label>
          <Input
            placeholder="e.g., DL-784521"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">License Expiry</Label>
          <Input
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">License Categories</Label>
        <div className="flex gap-4 mt-2">
          {licenseCategories.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.licenseCategories.includes(cat.value)}
                onCheckedChange={() => toggleLicenseCategory(cat.value)}
              />
              <span className="text-sm text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Driver Performance & Safety</h1>
          <p className="text-sm text-muted-foreground mt-1">View driver profiles and compliance</p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <>
              <Button variant="outline" size="sm" onClick={() => {
                const date = new Date().toISOString().slice(0, 10);
                const headers = ['Name', 'Email', 'Phone', 'License', 'Expiry', 'Status', 'Safety', 'Trips', 'Completed'];
                const rows = filteredDrivers.map(d => [d.name, d.email, d.phone, d.licenseNumber, d.licenseExpiry, d.status, d.safetyScore, d.totalTrips, d.completedTrips]);
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `drivers-${date}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              }} className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const date = new Date().toISOString().slice(0, 10);
                const rows = filteredDrivers.map(d => `<tr><td>${d.name}</td><td>${d.email}</td><td>${d.phone}</td><td>${d.licenseNumber}</td><td>${formatDate(d.licenseExpiry)}</td><td>${d.status}</td><td>${d.safetyScore}</td><td>${d.totalTrips}</td><td>${d.completedTrips}</td></tr>`).join('');
                const html = `<!DOCTYPE html><html><head><title>Drivers ${date}</title></head><body><h1>FleetFlow Drivers</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>License</th><th>Expiry</th><th>Status</th><th>Safety</th><th>Trips</th><th>Completed</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
            </>
          )}
          {canAdd && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="btn-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          )}
        </div>
      </div>

      {/* Compliance Warning */}
      <div className="fleet-card p-4 bg-secondary/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Drivers with expired licenses are automatically blocked from trip assignment</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="fleet-input w-full pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DriverStatus | 'all')}>
          <SelectTrigger className="fleet-input w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="fleet-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on_duty">On Duty</SelectItem>
            <SelectItem value="off_duty">Off Duty</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.map((driver) => {
          const isLicenseExpired = !isLicenseValid(driver.id);
          const daysLeft = daysUntilExpiry(driver.licenseExpiry);
          const completionRate = driver.totalTrips > 0 
            ? Math.round((driver.completedTrips / driver.totalTrips) * 100) 
            : 0;

          return (
            <div key={driver.id} className="fleet-card p-5 cursor-pointer fleet-card-hover" onClick={() => openDetailView(driver)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-[#30F2FF]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground">{driver.name}</h3>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground mono">{driver.licenseNumber}</span>
                </div>
              </div>

              {/* License Status */}
              <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">License Expiry</span>
                  {isLicenseExpired ? (
                    <span className="flex items-center gap-1 text-xs text-rose-400">
                      <XCircle className="w-3 h-3" />
                      Expired
                    </span>
                  ) : daysLeft <= 30 ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      {daysLeft} days
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground mt-1">{formatDate(driver.licenseExpiry)}</p>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Safety Score</p>
                  <p className={cn('text-lg font-semibold', getSafetyScoreColor(driver.safetyScore))}>
                    {driver.safetyScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="text-lg font-semibold text-foreground">{completionRate}%</p>
                </div>
              </div>

              {/* Status & Categories */}
              <div className="mt-4 flex items-center justify-between">
                <span className={cn('status-pill', getStatusColor(driver.status))}>
                  {driver.status === 'on_duty' ? 'On Duty' : driver.status === 'off_duty' ? 'Off Duty' : 'Suspended'}
                </span>
                <div className="flex gap-1">
                  {driver.licenseCategories.map((cat) => (
                    <span key={cat} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground capitalize">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Driver Dialog - Only for Fleet Manager */}
      {canAdd && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fleet-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Driver</DialogTitle>
            </DialogHeader>
            {renderDriverForm()}
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddDriver} className="btn-cyan flex-1">
                Add Driver
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="fleet-card border-border max-w-lg">
          {selectedDriver && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedDriver.name}</DialogTitle>
              </DialogHeader>

              {canChangeStatus && (
                <div className="py-4 border-b border-border/30">
                  <p className="text-sm font-medium text-foreground mb-2">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={selectedDriver.status === 'on_duty' ? 'default' : 'outline'}
                      className={selectedDriver.status === 'on_duty' ? 'btn-cyan' : ''}
                      onClick={() => handleSetDriverStatus(selectedDriver.id, 'on_duty')}
                    >
                      On Duty
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedDriver.status === 'off_duty' ? 'default' : 'outline'}
                      className={selectedDriver.status === 'off_duty' ? 'btn-cyan' : ''}
                      onClick={() => handleSetDriverStatus(selectedDriver.id, 'off_duty')}
                    >
                      Off Duty
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedDriver.status === 'suspended' ? 'default' : 'outline'}
                      className={selectedDriver.status === 'suspended' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : ''}
                      onClick={() => handleSetDriverStatus(selectedDriver.id, 'suspended')}
                    >
                      Suspended
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedDriver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground mono">{selectedDriver.licenseNumber}</span>
                </div>
                
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">License Expires</p>
                  <p className="text-sm text-foreground">{formatDate(selectedDriver.licenseExpiry)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Safety Score</p>
                    <p className={cn('text-lg font-semibold', getSafetyScoreColor(selectedDriver.safetyScore))}>
                      {selectedDriver.safetyScore}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Trips</p>
                    <p className="text-lg font-semibold text-foreground">{selectedDriver.totalTrips}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">License Categories</p>
                  <div className="flex gap-2">
                    {selectedDriver.licenseCategories.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-secondary rounded-full text-sm text-foreground capitalize">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
