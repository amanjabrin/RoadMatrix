import { useMemo, useState } from 'react';
import { useFleet } from '@/context/FleetContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { 
  TrendingUp, 
  TrendingDown,
  Fuel,
  Wrench,
  IndianRupee,
  BarChart3,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#30F2FF', '#27D796', '#F5A623', '#FF4D6D', '#A6ACB8'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function Analytics() {
  const { state, getVehicleROI, getVehicleById, getVehicleOperationalCost, getFuelEfficiency, hasRole } = useFleet();
  const chartTheme = useChartTheme();
  const [showHealthAudit, setShowHealthAudit] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const canExport = hasRole(['fleet_manager', 'financial_analyst']);

  // Calculate fleet-wide metrics
  const fleetMetrics = useMemo(() => {
    const totalRevenue = state.trips
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.revenue || 0), 0);
    
    const totalFuelCost = state.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = state.maintenanceLogs
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.cost, 0);
    
    const totalAcquisitionCost = state.vehicles
      .filter(v => v.status !== 'retired')
      .reduce((sum, v) => sum + v.acquisitionCost, 0);
    
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    const netProfit = totalRevenue - totalOperationalCost;
    const fleetROI = totalAcquisitionCost > 0 
      ? ((netProfit / totalAcquisitionCost) * 100) 
      : 0;

    return {
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost,
      netProfit,
      fleetROI,
    };
  }, [state.trips, state.fuelLogs, state.maintenanceLogs, state.vehicles]);

  // Vehicle ROI data
  const vehicleROIData = useMemo(() => {
    return state.vehicles
      .filter(v => v.status !== 'retired')
      .map((vehicle) => {
        const roi = getVehicleROI(vehicle.id);
        return {
          name: vehicle.name,
          revenue: roi.revenue,
          costs: roi.costs,
          roi: roi.roi,
        };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 8);
  }, [state.vehicles, state.trips, state.fuelLogs, state.maintenanceLogs]);

  // Cost breakdown by category
  const costBreakdown = useMemo(() => [
    { name: 'Fuel', value: fleetMetrics.totalFuelCost },
    { name: 'Maintenance', value: fleetMetrics.totalMaintenanceCost },
  ], [fleetMetrics]);

  // Vehicle utilization data
  const utilizationData = useMemo(() => {
    const statusCounts = {
      available: state.vehicles.filter(v => v.status === 'available').length,
      onTrip: state.vehicles.filter(v => v.status === 'on_trip').length,
      inShop: state.vehicles.filter(v => v.status === 'in_shop').length,
    };
    return [
      { name: 'Available', value: statusCounts.available, color: '#27D796' },
      { name: 'On Trip', value: statusCounts.onTrip, color: '#30F2FF' },
      { name: 'In Shop', value: statusCounts.inShop, color: '#F5A623' },
    ];
  }, [state.vehicles]);

  // Fuel efficiency by month from backend data
  const fuelEfficiencyData = useMemo(() => {
    const byMonth: Record<string, { distance: number; liters: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = { distance: 0, liters: 0 };
    }
    state.trips.filter(t => t.status === 'completed' && t.completedAt).forEach(t => {
      const dt = new Date(String(t.completedAt));
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (byMonth[key]) byMonth[key].distance += t.distance ?? 0;
    });
    state.fuelLogs.forEach(f => {
      const dt = f.date ? new Date(String(f.date)) : new Date();
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (byMonth[key]) byMonth[key].liters += f.liters ?? 0;
    });
    const sorted = Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b));
    const result = sorted.map(([k, v]) => {
      const [, m] = k.split('-');
      const monthName = MONTHS[parseInt(m, 10) - 1];
      const kmPerLiter = v.liters > 0 ? (v.distance / v.liters) : 0;
      return { month: monthName, kmPerLiter: Number(kmPerLiter.toFixed(1)) };
    });
    return result.length ? result : [{ month: 'No data', kmPerLiter: 0 }];
  }, [state.trips, state.fuelLogs]);

  const handleExport = (format: 'csv' | 'pdf') => {
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const headers = ['Vehicle', 'License Plate', 'Status', 'Revenue', 'Operational Cost', 'ROI %', 'Fuel Efficiency (km/L)'];
      const rows = state.vehicles
        .filter(v => v.status !== 'retired')
        .map(v => {
          const roi = getVehicleROI(v.id);
          const kmPerL = getFuelEfficiency(v.id);
          return [v.name, v.licensePlate, v.status, roi.revenue.toFixed(2), getVehicleOperationalCost(v.id).toFixed(2), roi.roi.toFixed(1), kmPerL.toFixed(2)];
        });
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleetflow-report-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportMessage('CSV downloaded successfully!');
    } else {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setExportMessage('Please allow popups to print report.');
        setTimeout(() => setExportMessage(null), 3000);
        return;
      }
      const vehicleRows = state.vehicles
        .filter(v => v.status !== 'retired')
        .map(v => {
          const roi = getVehicleROI(v.id);
          return `<tr><td>${v.name}</td><td>${v.licensePlate}</td><td>${v.status}</td><td>₹${roi.revenue.toFixed(0)}</td><td>₹${getVehicleOperationalCost(v.id).toFixed(0)}</td><td>${roi.roi.toFixed(1)}%</td></tr>`;
        })
        .join('');
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>FleetFlow Report ${date}</title>
        <style>body{font-family:sans-serif;padding:20px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#1a1d24;color:#fff;}</style>
        </head><body>
        <h1>FleetFlow Operational Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <h2>Fleet Summary</h2>
        <p>Revenue: ₹${fleetMetrics.totalRevenue.toFixed(0)} | Costs: ₹${fleetMetrics.totalOperationalCost.toFixed(0)} | ROI: ${fleetMetrics.fleetROI.toFixed(1)}%</p>
        <h2>Vehicle ROI</h2>
        <table><thead><tr><th>Vehicle</th><th>License</th><th>Status</th><th>Revenue</th><th>Cost</th><th>ROI %</th></tr></thead><tbody>${vehicleRows}</tbody></table>
        </body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
      setExportMessage('PDF/Print dialog opened.');
    }
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleHealthAudit = () => {
    setShowHealthAudit(true);
  };

  // Calculate health audit data
  const healthAuditData = useMemo(() => {
    const vehiclesNeedingMaintenance = state.vehicles.filter(v => 
      state.maintenanceLogs.some(m => m.vehicleId === v.id && m.status !== 'completed')
    );
    
    const vehiclesWithExpiredLicense = state.drivers.filter(d => {
      const expiry = new Date(d.licenseExpiry);
      return expiry < new Date();
    });
    
    const lowSafetyScoreDrivers = state.drivers.filter(d => d.safetyScore < 75);
    
    const highCostVehicles = state.vehicles.filter(v => {
      const roi = getVehicleROI(v.id);
      return roi.roi < 0;
    });

    return {
      vehiclesNeedingMaintenance,
      vehiclesWithExpiredLicense,
      lowSafetyScoreDrivers,
      highCostVehicles,
      overallHealth: (
        (state.vehicles.filter(v => v.status === 'available').length / state.vehicles.length) * 0.4 +
        (state.drivers.filter(d => d.safetyScore >= 80).length / state.drivers.length) * 0.3 +
        (state.maintenanceLogs.filter(m => m.status === 'completed').length / (state.maintenanceLogs.length || 1)) * 0.3
      ) * 100
    };
  }, [state.vehicles, state.drivers, state.maintenanceLogs]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Data-driven insights for your fleet</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleHealthAudit} className="btn-cyan flex items-center gap-2">
            <HeartPulse className="w-4 h-4" />
            Health Audit
          </Button>
          {canExport && (
            <>
              <Button onClick={() => handleExport('csv')} variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Export Success Message */}
      {exportMessage && (
        <div className="fleet-card p-4 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400">{exportMessage}</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="kpi-label">Total Revenue</p>
              <p className="kpi-value">{formatCurrency(fleetMetrics.totalRevenue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">+12%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Fuel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="kpi-label">Fuel Costs</p>
              <p className="kpi-value">{formatCurrency(fleetMetrics.totalFuelCost)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400">+3%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="kpi-label">Maintenance</p>
              <p className="kpi-value">{formatCurrency(fleetMetrics.totalMaintenanceCost)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">-5%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="kpi-label">Fleet ROI</p>
              <p className={cn(
                'kpi-value',
                fleetMetrics.fleetROI >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {fleetMetrics.fleetROI.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">+8%</span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Fuel Efficiency (km/L)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="month" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} />
                <YAxis stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartTheme.tooltipText,
                  }}
                  labelStyle={{ color: chartTheme.tooltipText }}
                  formatter={(value: number) => `${value.toFixed(1)} km/L`}
                />
                <Line
                  type="monotone"
                  dataKey="kmPerLiter"
                  stroke="#30F2FF"
                  strokeWidth={2}
                  dot={{ fill: '#30F2FF', strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Cost Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdown.map((_entry, index) => (
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
            {costBreakdown.map((entry, index) => (
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle ROI */}
        <div className="lg:col-span-2 fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Vehicle ROI Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleROIData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis type="number" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={12} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke={chartTheme.axisStroke} tick={{ fill: chartTheme.tickFill }} fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartTheme.tooltipText,
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'roi') return [`${value.toFixed(1)}%`, 'ROI'];
                    return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Costs'];
                  }}
                />
                <Bar dataKey="roi" fill="#30F2FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="fleet-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fleet Utilization</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartTheme.tooltipText,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {utilizationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle ROI Table */}
      <div className="fleet-card overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground">Detailed Vehicle ROI Report</h3>
        </div>
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Revenue</th>
              <th>Operational Costs</th>
              <th>Acquisition Cost</th>
              <th>Net Profit</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {vehicleROIData.map((vehicle) => {
              const vehicleData = getVehicleById(
                state.vehicles.find(v => v.name === vehicle.name)?.id || ''
              );
              const netProfit = vehicle.revenue - vehicle.costs;
              return (
                <tr key={vehicle.name}>
                  <td>
                    <p className="text-sm font-medium text-foreground">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">{vehicleData?.licensePlate}</p>
                  </td>
                  <td className="text-emerald-400">{formatCurrency(vehicle.revenue)}</td>
                  <td className="text-rose-400">{formatCurrency(vehicle.costs - (vehicleData?.acquisitionCost || 0))}</td>
                  <td className="text-muted-foreground">{formatCurrency(vehicleData?.acquisitionCost || 0)}</td>
                  <td className={cn(netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {formatCurrency(netProfit)}
                  </td>
                  <td>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      vehicle.roi >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    )}>
                      {vehicle.roi.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Health Audit Dialog */}
      <Dialog open={showHealthAudit} onOpenChange={setShowHealthAudit}>
        <DialogContent className="fleet-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-[#30F2FF]" />
              Fleet Health Audit Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Overall Health Score */}
            <div className="fleet-card p-5 bg-gradient-to-r from-[#30F2FF]/10 to-transparent">
              <p className="text-sm text-muted-foreground mb-2">Overall Fleet Health Score</p>
              <div className="flex items-center gap-4">
                <div className={cn(
                  'text-4xl font-bold',
                  healthAuditData.overallHealth >= 80 ? 'text-emerald-400' :
                  healthAuditData.overallHealth >= 60 ? 'text-amber-400' : 'text-rose-400'
                )}>
                  {healthAuditData.overallHealth.toFixed(1)}%
                </div>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full',
                      healthAuditData.overallHealth >= 80 ? 'bg-emerald-400' :
                      healthAuditData.overallHealth >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                    )}
                    style={{ width: `${healthAuditData.overallHealth}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Issues Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="fleet-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">Maintenance Required</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">
                  {healthAuditData.vehiclesNeedingMaintenance.length}
                </p>
                <p className="text-xs text-muted-foreground">vehicles need attention</p>
              </div>

              <div className="fleet-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-medium text-foreground">License Issues</span>
                </div>
                <p className="text-2xl font-bold text-rose-400">
                  {healthAuditData.vehiclesWithExpiredLicense.length}
                </p>
                <p className="text-xs text-muted-foreground">expired licenses</p>
              </div>

              <div className="fleet-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">Low Safety Score</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">
                  {healthAuditData.lowSafetyScoreDrivers.length}
                </p>
                <p className="text-xs text-muted-foreground">drivers below 75</p>
              </div>

              <div className="fleet-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-medium text-foreground">Negative ROI</span>
                </div>
                <p className="text-2xl font-bold text-rose-400">
                  {healthAuditData.highCostVehicles.length}
                </p>
                <p className="text-xs text-muted-foreground">vehicles losing money</p>
              </div>
            </div>

            {/* Detailed Issues */}
            {healthAuditData.vehiclesNeedingMaintenance.length > 0 && (
              <div className="fleet-card p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Vehicles Requiring Maintenance
                </h4>
                <div className="space-y-2">
                  {healthAuditData.vehiclesNeedingMaintenance.map(v => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm text-foreground">{v.name}</span>
                      <span className="text-xs text-amber-400">{v.licensePlate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthAuditData.vehiclesWithExpiredLicense.length > 0 && (
              <div className="fleet-card p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Drivers with Expired Licenses
                </h4>
                <div className="space-y-2">
                  {healthAuditData.vehiclesWithExpiredLicense.map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="text-xs text-rose-400">Expired: {formatDate(d.licenseExpiry)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthAuditData.lowSafetyScoreDrivers.length > 0 && (
              <div className="fleet-card p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Drivers with Low Safety Scores
                </h4>
                <div className="space-y-2">
                  {healthAuditData.lowSafetyScoreDrivers.map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm text-foreground">{d.name}</span>
                      <span className="text-xs text-amber-400">Score: {d.safetyScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthAuditData.highCostVehicles.length > 0 && (
              <div className="fleet-card p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  Vehicles with Negative ROI
                </h4>
                <div className="space-y-2">
                  {healthAuditData.highCostVehicles.map(v => {
                    const roi = getVehicleROI(v.id);
                    return (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm text-foreground">{v.name}</span>
                        <span className="text-xs text-rose-400">ROI: {roi.roi.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="fleet-card p-4 bg-[#30F2FF]/5">
              <h4 className="text-sm font-medium text-foreground mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {healthAuditData.vehiclesNeedingMaintenance.length > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#30F2FF] mt-0.5" />
                    Schedule maintenance for {healthAuditData.vehiclesNeedingMaintenance.length} vehicles
                  </li>
                )}
                {healthAuditData.vehiclesWithExpiredLicense.length > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#30F2FF] mt-0.5" />
                    Renew licenses for {healthAuditData.vehiclesWithExpiredLicense.length} drivers
                  </li>
                )}
                {healthAuditData.lowSafetyScoreDrivers.length > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#30F2FF] mt-0.5" />
                    Provide safety training for low-scoring drivers
                  </li>
                )}
                {healthAuditData.highCostVehicles.length > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#30F2FF] mt-0.5" />
                    Review utilization of negative ROI vehicles
                  </li>
                )}
                {healthAuditData.overallHealth >= 80 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    Fleet is in excellent condition! Keep up the good work.
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowHealthAudit(false)} variant="outline" className="flex-1">
                Close
              </Button>
              {canExport && (
                <Button onClick={() => { handleExport('pdf'); setShowHealthAudit(false); }} className="btn-cyan flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
