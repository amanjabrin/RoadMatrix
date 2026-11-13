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
  FileText,
  Radio,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Loader2
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
import { ServiceNotConnected } from '@/components/common/ServiceNotConnected';
import { mockDrivers } from '@/data/mockData';

const licenseCategories: { value: LicenseCategory; label: string }[] = [
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'bike', label: 'Bike' },
];

export function Drivers() {
  const { 
    state, 
    loadData, 
    isLicenseValid, 
    hasRole, 
    apiAddDriver, 
    apiUpdateDriver, 
    apiDeleteDriver, 
    apiSetDriverStatus 
  } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'all'>('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isServiceConnected = state.servicesHealth.driver;
  const activeDriversList = isServiceConnected ? state.drivers : (isDemoMode ? mockDrivers : []);

  const canAdd = hasRole(['fleet_manager']);
  const canEdit = hasRole(['fleet_manager']);
  const canDelete = hasRole(['fleet_manager']);
  const canChangeStatus = hasRole(['safety_officer', 'fleet_manager']);
  const canExport = true;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategories: [] as LicenseCategory[],
  });

  const filteredDrivers = activeDriversList.filter((driver) => {
    const name = driver.name || '';
    const email = driver.email || '';
    const licenseNumber = driver.licenseNumber || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      licenseNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionError(null);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSetDriverStatus = async (driverId: string, status: DriverStatus) => {
    setActionError(null);
    try {
      await apiSetDriverStatus(driverId, status);
      setSelectedDriver((prev) => prev && prev.id === driverId ? { ...prev, status } : prev);
    } catch (e) {
      setActionError((e as Error).message || 'Failed to update driver status');
    }
  };

  const openAddDialog = () => {
    setEditingDriverId(null);
    resetForm();
    setError('');
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (driver: Driver, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDriverId(driver.id);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : '',
      licenseCategories: driver.licenseCategories as LicenseCategory[],
    });
    setError('');
    setIsFormDialogOpen(true);
  };

  const handleDeleteDriver = async (driverId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setActionError(null);
    try {
      await apiDeleteDriver(driverId);
      if (selectedDriver && selectedDriver.id === driverId) {
        setSelectedDriver(null);
      }
    } catch (err) {
      setActionError((err as Error).message || 'Failed to delete driver');
    }
  };

  const handleSaveDriver = async () => {
    setError('');
    if (!formData.name.trim()) {
      setError('Driver full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      setError('License number is required');
      return;
    }
    if (!formData.licenseExpiry) {
      setError('License expiry date is required');
      return;
    }
    if (formData.licenseCategories.length === 0) {
      setError('At least one license category must be selected');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDriverId) {
        const updated = await apiUpdateDriver(editingDriverId, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          licenseExpiry: formData.licenseExpiry,
          licenseCategories: formData.licenseCategories,
        });
        if (updated) {
          setIsFormDialogOpen(false);
          resetForm();
          if (selectedDriver && selectedDriver.id === editingDriverId) {
            setSelectedDriver(updated);
          }
        }
      } else {
        const created = await apiAddDriver({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          licenseExpiry: formData.licenseExpiry,
          licenseCategories: formData.licenseCategories,
          status: 'on_duty',
          safetyScore: 85,
          joinDate: new Date().toISOString().slice(0, 10),
          totalTrips: 0,
          completedTrips: 0,
        });
        if (created) {
          setIsFormDialogOpen(false);
          resetForm();
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to save driver');
    } finally {
      setIsSubmitting(false);
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
    setEditingDriverId(null);
    setError('');
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
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Full Name *</Label>
        <Input
          placeholder="e.g., Alex Rivera"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="fleet-input w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Email *</Label>
          <Input
            type="email"
            placeholder="driver@roadmatrix.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Phone *</Label>
          <Input
            placeholder="+91-98765-01010"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">License Number *</Label>
          <Input
            placeholder="e.g., DL-03-2022-001"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">License Expiry *</Label>
          <Input
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            className="fleet-input w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Authorized Vehicle Categories *</Label>
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

  if (!isServiceConnected && !isDemoMode) {
    return (
      <ServiceNotConnected
        serviceName="Driver Management Service"
        serviceId="driver-service"
        port={8084}
        route="/api/v1/driver/**"
        description="Driver records, performance safety scoring, and compliance verification microservice."
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
            <span><strong>Demo Wireframe Mode:</strong> Backend microservice (<code className="font-mono text-amber-200">driver-service :8084</code>) is offline. Showing sample layout for evaluation.</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsDemoMode(false)} className="text-xs h-7 border-amber-500/40 text-amber-300 hover:bg-amber-500/20">
            Exit Demo
          </Button>
        </div>
      )}

      {/* Action Error Alert */}
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
          <h1 className="text-2xl font-bold text-foreground">Driver Registry & Safety</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage driver records, certifications, and duty status</p>
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
                const html = `<!DOCTYPE html><html><head><title>Drivers ${date}</title></head><body><h1>RoadMatrix Drivers</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>License</th><th>Expiry</th><th>Status</th><th>Safety</th><th>Trips</th><th>Completed</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
            <Button onClick={openAddDialog} className="btn-cyan flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          )}
        </div>
      </div>

      {/* Compliance Warning */}
      <div className="fleet-card p-4 bg-secondary/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Drivers with expired licenses or suspended status are automatically excluded from trip dispatching.</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drivers by name, email, or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="fleet-input w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DriverStatus | 'all')}>
            <SelectTrigger className="fleet-input w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="all">All Status ({activeDriversList.length})</SelectItem>
              <SelectItem value="on_duty">On Duty</SelectItem>
              <SelectItem value="off_duty">Off Duty</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Showing {filteredDrivers.length} of {activeDriversList.length} drivers
          </span>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            No drivers found matching your search.
          </div>
        ) : (
          filteredDrivers.map((driver) => {
            const isLicenseExpired = !isLicenseValid(driver.id);
            const daysLeft = daysUntilExpiry(driver.licenseExpiry);
            const completionRate = driver.totalTrips > 0 
              ? Math.round((driver.completedTrips / driver.totalTrips) * 100) 
              : 0;

            return (
              <div 
                key={driver.id} 
                className="fleet-card p-5 cursor-pointer fleet-card-hover group relative" 
                onClick={() => openDetailView(driver)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="w-6 h-6 text-[#30F2FF]" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <button 
                        onClick={(e) => openEditDialog(driver, e)} 
                        title="Edit Driver"
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={(e) => handleDeleteDriver(driver.id, e)} 
                        title="Delete Driver"
                        className="p-1.5 hover:bg-rose-500/20 rounded-md text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground truncate">{driver.name}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground truncate" title={driver.email}>{driver.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground shrink-0" />
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
          })
        )}
      </div>

      {/* Add / Edit Driver Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="fleet-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingDriverId ? 'Edit Driver Profile' : 'Add New Driver'}
            </DialogTitle>
          </DialogHeader>
          {renderDriverForm()}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => setIsFormDialogOpen(false)} 
              variant="outline" 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDriver} 
              className="btn-cyan flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                editingDriverId ? 'Update Driver' : 'Add Driver'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="fleet-card border-border max-w-lg">
          {selectedDriver && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selectedDriver.name}</DialogTitle>
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          const target = selectedDriver;
                          setSelectedDriver(null);
                          openEditDialog(target);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteDriver(selectedDriver.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {canChangeStatus && (
                <div className="py-4 border-b border-border/30">
                  <p className="text-sm font-medium text-foreground mb-2">Change Duty Status</p>
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
