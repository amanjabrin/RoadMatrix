import { useState } from 'react';
import { 
  ServerOff, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceNotConnectedProps {
  serviceName: string;
  serviceId: string;
  port: number;
  route: string;
  description: string;
  onRetry: () => Promise<void> | void;
  onToggleDemoMode?: () => void;
  isDemoMode?: boolean;
}

export function ServiceNotConnected({
  serviceName,
  serviceId,
  port,
  route,
  description,
  onRetry,
  onToggleDemoMode,
  isDemoMode = false,
}: ServiceNotConnectedProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 600);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-card/90 backdrop-blur-xl shadow-2xl p-8 md:p-10">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
              <ServerOff className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{serviceName}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Service Offline (503)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="border-border/80 hover:bg-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin text-[#30F2FF]' : ''}`} />
              {isRetrying ? 'Checking...' : 'Check Connection'}
            </Button>
            {onToggleDemoMode && (
              <Button
                onClick={onToggleDemoMode}
                className={isDemoMode ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold" : "btn-cyan flex items-center gap-2"}
              >
                {isDemoMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isDemoMode ? 'Exit Demo View' : 'Preview Demo UI'}
              </Button>
            )}
          </div>
        </div>

        {/* Technical Architecture Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Service Identifier</div>
            <div className="font-mono text-sm font-bold text-foreground">{serviceId}</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Target Port</div>
            <div className="font-mono text-sm font-bold text-foreground">:{port}</div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/40 border border-border/50">
            <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Gateway Route</div>
            <div className="font-mono text-sm font-bold text-[#30F2FF]">{route}</div>
          </div>
        </div>

        {/* Microservices Topology Visual */}
        <div className="p-6 rounded-xl bg-secondary/20 border border-border/40 mb-8">
          <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#30F2FF]" />
            Microservices Communication Flow
          </h4>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>React App (:5173)</span>
            </div>
            <div className="text-muted-foreground font-bold">──▶</div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>API Gateway (:8080)</span>
            </div>
            <div className="text-muted-foreground font-bold">──✖──</div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-rose-500/40 text-rose-400">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{serviceId} (:{port})</span>
            </div>
          </div>
        </div>

        {/* Help Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
          <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Microservice Status Notice:</strong>
            Is service ka Spring Boot backend abhi start ya register nahi hua hai. Jab aap backend me <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono">{serviceId}</code> ko port <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono">:{port}</code> par start karenge, Eureka aur API Gateway automatically isko connect kar lenge.
          </div>
        </div>
      </div>
    </div>
  );
}
