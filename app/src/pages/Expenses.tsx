import { useState, useMemo } from 'react';
import { useFleet } from '@/context/FleetContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { 
  Plus, 
  Fuel, 
  IndianRupee, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Filter,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#30F2FF', '#27D796', '#F5A623', '#FF4D6D', '#A6ACB8'];

export function Expenses() {
  const { state, getVehicleById, getVehicleOperationalCost, hasRole, apiAddFuelLog } = useFleet();
  const chartTheme = useChartTheme();
  
  // Only Financial Analyst can add fuel logs
  const canManage = hasRole(['financial_analyst']);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    liters: '',
    cost: '',
    date: '',
    odometerReading: '',
    station: '',
  });

  // Filter fuel logs
  const filteredLogs = useMemo(() => {
    return state.fuelLogs
      .filter((log) => vehicleFilter === 'all' || log.vehicleId === vehicleFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.fuelLogs, vehicleFilter]);

  // Calculate totals
  const totalFuelCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);
  const totalLiters = filteredLogs.reduce((sum, log) => sum + log.liters, 0);
  const totalMaintenanceCost = useMemo(() => {
    const vehicleIds = vehicleFilter === 'all'
      ? state.vehicles.map(v => v.id)
      : [vehicleFilter];
    return vehicleIds.reduce((sum, id) => sum + getVehicleOperationalCost(id), 0);
  }, [state.vehicles, vehicleFilter, getVehicleOperationalCost]);

  // Total operational cost per vehicle (Fuel + Maintenance per Vehicle ID)
  const operationalCostByVehicle = useMemo(() => {
    return state.vehicles
      .filter(v => v.status !== 'retired')
      .map((vehicle) => {
        const fuelCost = state.fuelLogs
          .filter(f => f.vehicleId === vehicle.id)
          .reduce((sum, f) => sum + f.cost, 0);
        const maintenanceCost = state.maintenanceLogs
          .filter(m => m.vehicleId === vehicle.id && m.status === 'completed')
          .reduce((sum, m) => sum + m.cost, 0);
        return {
          vehicle,
          fuelCost,
          maintenanceCost,
          total: fuelCost + maintenanceCost,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [state.vehicles, state.fuelLogs, state.maintenanceLogs]);

  // Chart data - cost by vehicle
  const costByVehicleData = useMemo(() => {
    const data = state.vehicles
      .filter(v => vehicleFilter === 'all' || v.id === vehicleFilter)
      .map((vehicle) => {
        const fuelCost = state.fuelLogs
          .filter(f => f.vehicleId === vehicle.id)
          .reduce((sum, f) => sum + f.cost, 0);
        const maintCost = state.maintenanceLogs
          .filter(m => m.vehicleId === vehicle.id && m.status === 'completed')
          .reduce((sum, m) => sum + m.cost, 0);
        return {
          name: vehicle.name,
          fuel: fuelCost,
          maintenance: maintCost,
        };
      })
      .filter(d => d.fuel > 0 || d.maintenance > 0)
      .slice(0, 6);
    return data;
  }, [state.vehicles, state.fuelLogs, state.maintenanceLogs, vehicleFilter]);

  // Expense breakdown data
  const expenseBreakdown = useMemo(() => {
    const fuel = totalFuelCost;
    const maintenance = state.maintenanceLogs
      .filter(m => m.status === 'completed')
      .filter(m => vehicleFilter === 'all' || m.vehicleId === vehicleFilter)
      .reduce((sum, m) => sum + m.cost, 0);
    return [
      { name: 'Fuel', value: fuel },
      { name: 'Maintenance', value: maintenance },
    ];
  }, [totalFuelCost, state.maintenanceLogs, vehicleFilter]);

  const handleAddFuelLog = async () => {
    if (!formData.vehicleId || !formData.liters || !formData.cost || !formData.date) return;
    const f = await apiAddFuelLog({
      vehicleId: formData.vehicleId,
      liters: parseFloat(formData.liters),
      cost: parseFloat(formData.cost),
      date: formData.date,
      odometerReading: parseInt(formData.odometerReading) || 0,
      station: formData.station,
    });
    if (f) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      liters: '',
      cost: '',
      date: '',
      odometerReading: '',
      station: '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fuel & Expense Logging</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage ? 'Track fuel purchases and operational costs' : 'View fuel and expense records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const headers = ['Date', 'Vehicle', 'License', 'Station', 'Liters', 'Cost (₹)', 'Odometer'];
            const rows = filteredLogs.map(log => {
              const v = getVehicleById(log.vehicleId);
              return [formatDate(log.date), v?.name ?? '', v?.licensePlate ?? '', log.station ?? '', log.liters, log.cost, log.odometerReading];
            });
            const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `fuel-logs-${date}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const date = new Date().toISOString().slice(0, 10);
            const rows = filteredLogs.map(log => {
              const v = getVehicleById(log.vehicleId);
              return `<tr><td>${formatDate(log.date)}</td><td>${v?.name ?? ''}</td><td>${v?.licensePlate ?? ''}</td><td>${log.station ?? ''}</td><td>${log.liters}</td><td>₹${log.cost}</td><td>${log.odometerReading}</td></tr>`;
            }).join('');
            const html = `<!DOCTYPE html><html><head><title>Fuel Logs ${date}</title></head><body><h1>FleetFlow Fuel & Expense Logs</h1><p>Generated: ${new Date().toLocaleString()}</p><table border="1"><thead><tr><th>Date</th><th>Vehicle</th><th>License</th><th>Station</th><th>Liters</th><th>Cost (₹)</th><th>Odometer</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
              Log Fuel
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="kpi-label">Total Fuel Cost</p>
          <p className="kpi-value">{formatCurrency(totalFuelCost)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">+5%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Total Liters</p>
          <p className="kpi-value">{formatNumber(totalLiters)}</p>
          <p className="text-xs text-muted-foreground mt-2">Across all vehicles</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Maintenance Cost</p>
          <p className="kpi-value">{formatCurrency(totalMaintenanceCost)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400">-2%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Operational Cost</p>
          <p className="kpi-value">{formatCurrency(totalFuelCost + totalMaintenanceCost)}</p>
          <p className="text-xs text-muted-foreground mt-2">Fuel + Maintenance</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Vehicle */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cost by Vehicle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByVehicleData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="name" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={11} />
                <YAxis stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartTheme.tooltipText,
                  }}
                  labelStyle={{ color: chartTheme.tooltipText }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="fuel" stackId="a" fill="#30F2FF" />
                <Bar dataKey="maintenance" stackId="a" fill="#27D796" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartTheme.tooltipText,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {expenseBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Total Operational Cost per Vehicle */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Total Operational Cost per Vehicle</h3>
        <div className="fleet-card overflow-hidden">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>License Plate</th>
                <th>Fuel Cost</th>
                <th>Maintenance Cost</th>
                <th>Total Operational Cost</th>
              </tr>
            </thead>
            <tbody>
              {operationalCostByVehicle.map(({ vehicle, fuelCost, maintenanceCost, total }) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{vehicle.name}</span>
                    </div>
                  </td>
                  <td className="mono text-muted-foreground">{vehicle.licensePlate}</td>
                  <td>{formatCurrency(fuelCost)}</td>
                  <td>{formatCurrency(maintenanceCost)}</td>
                  <td className="font-medium text-foreground">{formatCurrency(total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Fuel Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Fuel Logs</h3>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="fleet-input w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by vehicle" />
            </SelectTrigger>
            <SelectContent className="fleet-card border-border">
              <SelectItem value="all">All Vehicles</SelectItem>
              {state.vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="fleet-card overflow-hidden">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Station</th>
                <th>Liters</th>
                <th>Cost</th>
                <th>Odometer</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 10).map((log) => {
                const vehicle = getVehicleById(log.vehicleId);
                return (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(log.date)}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-foreground">{vehicle?.name}</p>
                        <p className="text-xs text-muted-foreground">{vehicle?.licensePlate}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-muted-foreground">{log.station || '-'}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Fuel className="w-4 h-4 text-muted-foreground" />
                        {formatNumber(log.liters)} L
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        {formatCurrency(log.cost)}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-muted-foreground mono">
                        {formatNumber(log.odometerReading)} km
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Log Dialog - Only for Fleet Manager and Financial Analyst */}
      {canManage && (
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="fleet-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log Fuel Purchase</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Liters</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.liters}
                  onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Cost (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Odometer (km)</Label>
                <Input
                  type="number"
                  placeholder="Current reading"
                  value={formData.odometerReading}
                  onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                  className="fleet-input w-full"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Station (Optional)</Label>
              <Input
                placeholder="e.g., Shell Station #4521"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                className="fleet-input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddFuelLog} className="btn-cyan flex-1">
              Log Fuel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
