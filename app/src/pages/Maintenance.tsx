import { useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { 
  Plus, 
  Wrench, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Clock,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  MoreHorizontal,
  Check,
  Play,
  Filter
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { MaintenanceType, MaintenanceStatus } from '@/types';

const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_rotation', label: 'Tire Rotation' },
  { value: 'brake_inspection', label: 'Brake Inspection' },
  { value: 'general_service', label: 'General Service' },
  { value: 'repair', label: 'Repair' },
];

export function Maintenance() {
  const { state, getVehicleById, getMaintenanceAlerts, hasRole, apiAddMaintenance, apiSetMaintenanceStatus } = useFleet();
  
  // Only Safety Officer can add maintenance / Log Service (Fleet Manager view only, no actions)
  const canManage = hasRole(['safety_officer']);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'oil_change' as MaintenanceType,
    description: '',
    scheduledDate: '',
    cost: '',
    serviceProvider: '',
  });

  // Filter logs
  const filteredLogs = state.maintenanceLogs.filter((log) => {
    if (statusFilter === 'all') return true;
    return log.status === statusFilter;
  });

  const upcomingMaintenance = getMaintenanceAlerts();

  const handleAddMaintenance = async () => {
    if (!formData.vehicleId || !formData.scheduledDate) return;
    const m = await apiAddMaintenance({
      vehicleId: formData.vehicleId,
      type: formData.type,
      description: formData.description,
      status: 'scheduled',
      scheduledDate: formData.scheduledDate,
      cost: parseFloat(formData.cost) || 0,
      serviceProvider: formData.serviceProvider,
    });
    if (m) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateStatus = async (logId: string, newStatus: MaintenanceStatus) => {
    await apiSetMaintenanceStatus(logId, newStatus);
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'oil_change',
      description: '',
      scheduledDate: '',
      cost: '',
      serviceProvider: '',
    });
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getTypeLabel = (type: MaintenanceType) => {
    return maintenanceTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance & Service Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage ? 'Track vehicle health and service history' : 'View maintenance records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const getTypeLabel = (t: string) => maintenanceTypes.find(m => m.value === t)?.label || t;
            const headers = ['Vehicle', 'License', 'Type', 'Description', 'Status', 'Scheduled', 'Completed', 'Cost (₹)', 'Service Provider'];
            const rows = filteredLogs.map(log => {
              const v = getVehicleById(log.vehicleId);
              return [v?.name ?? '', v?.licensePlate ?? '', getTypeLabel(log.type), log.description ?? '', log.status, formatDate(log.scheduledDate), log.completedDate ? formatDate(log.completedDate) : '', log.cost ?? 0, log.serviceProvider ?? ''];
            });
            const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `maintenance-${date}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const getTypeLabel = (t: string) => maintenanceTypes.find(m => m.value === t)?.label || t;
            const rows = filteredLogs.map(log => {
              const v = getVehicleById(log.vehicleId);
              return `<tr><td>${v?.name ?? ''}</td><td>${v?.licensePlate ?? ''}</td><td>${getTypeLabel(log.type)}</td><td>${log.description ?? ''}</td><td>${log.status}</td><td>${formatDate(log.scheduledDate)}</td><td>${log.completedDate ? formatDate(log.completedDate) : '-'}</td><td>₹${log.cost ?? 0}</td><td>${log.serviceProvider ?? ''}</td></tr>`;
            }).join('');
            const html = `<!DOCTYPE html><html><head><title>Maintenance ${date}</title></head><body><h1>RoadMatrix Maintenance & Service Logs</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>Vehicle</th><th>License</th><th>Type</th><th>Description</th><th>Status</th><th>Scheduled</th><th>Completed</th><th>Cost (₹)</th><th>Service Provider</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
              Log Service
            </Button>
          )}
        </div>
      </div>

      {/* Alerts Banner */}
      {upcomingMaintenance.length > 0 && (
        <div className="fleet-card p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-foreground">
              <strong>{upcomingMaintenance.length}</strong> vehicles require maintenance attention
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="kpi-label">Scheduled</p>
              <p className="kpi-value">
                {state.maintenanceLogs.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="kpi-label">In Progress</p>
              <p className="kpi-value">
                {state.maintenanceLogs.filter(m => m.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="kpi-label">Completed (30d)</p>
              <p className="kpi-value">
                {state.maintenanceLogs.filter(m => m.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service History */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Service History</h3>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MaintenanceStatus | 'all')}>
              <SelectTrigger className="fleet-input w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="fleet-card border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="fleet-card overflow-hidden">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Cost (₹)</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const vehicle = getVehicleById(log.vehicleId);
                  return (
                    <tr key={log.id}>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-foreground">{vehicle?.name}</p>
                          <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{getTypeLabel(log.type)}</span>
                        </div>
                        {log.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                            {log.description}
                          </p>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(log.scheduledDate)}
                        </div>
                      </td>
                      <td>
                        <span className={cn('status-pill', getStatusColor(log.status))}>
                          {log.status === 'in_progress' ? 'In Progress' : log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          {formatCurrency(log.cost)}
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
                              {log.status === 'scheduled' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(log.id, 'in_progress')}>
                                  <Play className="w-4 h-4 mr-2 text-blue-400" />
                                Start Service
                              </DropdownMenuItem>
                            )}
                            {log.status === 'in_progress' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(log.id, 'completed')}>
                                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                                Mark Complete
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
        </div>

        {/* Upcoming Maintenance */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Maintenance</h3>
          <div className="space-y-3">
            {upcomingMaintenance.map((log) => {
              const vehicle = getVehicleById(log.vehicleId);
              return (
                <div key={log.id} className="fleet-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{vehicle?.name}</p>
                      <p className="text-xs text-muted-foreground">{getTypeLabel(log.type)}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      log.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                    )}>
                      {log.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Due {formatDate(log.scheduledDate)}
                  </div>
                </div>
              );
            })}
            {upcomingMaintenance.length === 0 && (
              <div className="fleet-card p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Maintenance Dialog */}
      {/* Add Maintenance Dialog - Only for Fleet Manager and Safety Officer */}
      {canManage && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fleet-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Log Maintenance Service</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Vehicle</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {state.vehicles.filter(v => v.status !== 'retired').map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} · {vehicle.licensePlate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Service Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as MaintenanceType })}
                >
                  <SelectTrigger className="fleet-input w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="fleet-card border-border">
                    {maintenanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Description</Label>
                <Textarea
                  placeholder="Describe the service needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="fleet-input w-full min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Estimated Cost (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="fleet-input w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Service Provider</Label>
                <Input
                  placeholder="e.g., Quick Lube Pro"
                  value={formData.serviceProvider}
                  onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddMaintenance} className="btn-cyan flex-1">
                Log Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
