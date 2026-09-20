import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ServiceHealthMap } from '@/types';

interface MicroserviceStatusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  healthMap: ServiceHealthMap;
  onRefresh: () => Promise<void> | void;
}

export function MicroserviceStatusModal({
  isOpen,
  onOpenChange,
  healthMap,
  onRefresh,
}: MicroserviceStatusModalProps) {
  const services = [
    {
      id: 'service-registry',
      name: 'Eureka Service Registry',
      port: 8761,
      route: 'http://localhost:8761',
      isOnline: healthMap.eureka,
      category: 'Core Infrastructure',
      db: 'In-Memory Registry',
    },
    {
      id: 'config-server',
      name: 'Spring Cloud Config Server',
      port: 8888,
      route: 'http://localhost:8888',
      isOnline: healthMap.eureka,
      category: 'Core Infrastructure',
      db: 'Git / Local Config',
    },
    {
      id: 'api-gateway',
      name: 'Spring Cloud API Gateway',
      port: 8080,
      route: '/api/v1/**',
      isOnline: healthMap.gateway,
      category: 'Core Infrastructure',
      db: 'Reactive Proxy',
    },
    {
      id: 'auth-service',
      name: 'Authentication & Security Service',
      port: 8081,
      route: '/api/v1/auth/**',
      isOnline: healthMap.auth,
      category: 'Domain Microservices',
      db: 'roadmatrix_auth',
    },
    {
      id: 'fleet-service',
      name: 'Fleet & Vehicle Management Service',
      port: 8083,
      route: '/api/v1/fleet/**',
      isOnline: healthMap.fleet,
      category: 'Domain Microservices',
      db: 'roadmatrix_fleet',
    },
    {
      id: 'maintenance-service',
      name: 'Maintenance & Service Log Service',
      port: 8086,
      route: '/api/v1/maintenance/**',
      isOnline: healthMap.maintenance,
      category: 'Domain Microservices',
      db: 'roadmatrix_maintenance',
    },
    {
      id: 'expense-service',
      name: 'Expense & Fuel Logging Service',
      port: 8087,
      route: '/api/v1/expense/**',
      isOnline: healthMap.expense,
      category: 'Domain Microservices',
      db: 'roadmatrix_expense',
    },
    {
      id: 'driver-service',
      name: 'Driver Management Service',
      port: 8084,
      route: '/api/v1/driver/**',
      isOnline: healthMap.driver,
      category: 'Domain Microservices',
      db: 'roadmatrix_driver',
    },
    {
      id: 'trip-service',
      name: 'Trip Dispatcher & Route Service',
      port: 8085,
      route: '/api/v1/trip/**',
      isOnline: healthMap.trip,
      category: 'Domain Microservices',
      db: 'roadmatrix_trip',
    },
    {
      id: 'report-service',
      name: 'Analytics & Reporting Service',
      port: 8089,
      route: '/api/v1/report/**',
      isOnline: healthMap.report,
      category: 'Domain Microservices',
      db: 'roadmatrix_report',
    },
    {
      id: 'notification-service',
      name: 'Alert & Notification Service',
      port: 8088,
      route: '/api/v1/notification/**',
      isOnline: healthMap.notification,
      category: 'Domain Microservices',
      db: 'roadmatrix_notification',
    },
  ];

  const onlineCount = services.filter(s => s.isOnline).length;
  const totalCount = services.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fleet-card border-border max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#30F2FF]/10 text-[#30F2FF]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Microservices Topology Health
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time connection status across Spring Boot microservices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-secondary border border-border text-foreground">
              {onlineCount}/{totalCount} Online
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRefresh()}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  svc.isOnline
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-rose-500/5 border-rose-500/20 opacity-85'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                    {svc.isOnline ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    {svc.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                      svc.isOnline
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {svc.isOnline ? 'Online' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mt-2 pt-2 border-t border-border/40">
                  <span>Port :{svc.port}</span>
                  <span className="truncate max-w-[150px]">{svc.route}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-secondary/40 rounded-xl text-xs text-muted-foreground flex items-center justify-between">
          <span>Central Gateway: <strong className="text-foreground">http://localhost:8080</strong></span>
          <span>Discovery: <strong className="text-foreground">Eureka (8761)</strong></span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
