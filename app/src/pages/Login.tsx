import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useFleet } from '@/context/FleetContext';
import { Truck, Eye, EyeOff, AlertCircle, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginProps {
  onForgotPassword?: () => void;
}

export function Login({ onForgotPassword }: LoginProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { login } = useFleet();
  const isDark = resolvedTheme !== 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden login-page">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="absolute top-6 right-6 z-20 p-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(48,242,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48,242,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#30F2FF]/20 dark:bg-[#30F2FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#30F2FF]/15 dark:bg-[#30F2FF]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#30F2FF]/5 dark:bg-[#30F2FF]/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#30F2FF]/30 to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="fleet-card p-8 animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#30F2FF]/10 flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 text-[#30F2FF]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in to RoadMatrix</h1>
            <p className="text-sm text-muted-foreground mt-1">Fleet operations, simplified.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Login Form */}
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

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="fleet-input w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border bg-input" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => onForgotPassword?.()}
                className="text-[#30F2FF] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-cyan w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-xs text-muted-foreground text-center">
            By signing in, you agree to the{' '}
            <a href="#" className="text-[#30F2FF] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#30F2FF] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
