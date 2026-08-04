import { useState } from 'react';
import { Truck, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as api from '@/lib/api';

interface ForgotPasswordProps {
  onBack: () => void;
  onGoToReset?: () => void;
}

export function ForgotPassword({ onBack, onGoToReset }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResetUrl(null);
    setToken(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setSuccess(true);
      if (res.resetUrl) setResetUrl(res.resetUrl);
      if (res.token) {
        setToken(res.token);
        sessionStorage.setItem('fleetflow_reset_token', res.token);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToReset = () => {
    if (token) {
      sessionStorage.setItem('fleetflow_reset_token', token);
    }
    onGoToReset?.();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#30F2FF]/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#30F2FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#30F2FF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="fleet-card p-8 animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#30F2FF]/10 flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 text-[#30F2FF]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email to reset</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {token ? 'Reset link ready. Click below to set a new password.' : 'If this email exists, a reset link will be sent.'}
              </div>
              {(resetUrl || token) && (
                <Button
                  type="button"
                  onClick={handleGoToReset}
                  className="btn-cyan w-full"
                >
                  Set new password
                </Button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="fleet-input w-full"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="btn-cyan w-full">
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          )}

          <button
            type="button"
            onClick={onBack}
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
