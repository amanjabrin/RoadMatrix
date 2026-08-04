import { useState, useEffect } from 'react';
import { FleetProvider, useFleet } from '@/context/FleetContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Login } from '@/pages/Login';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { Dashboard } from '@/pages/Dashboard';
import { VehicleRegistry } from '@/pages/VehicleRegistry';
import { TripDispatcher } from '@/pages/TripDispatcher';
import { Maintenance } from '@/pages/Maintenance';
import { Expenses } from '@/pages/Expenses';
import { Drivers } from '@/pages/Drivers';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { cn } from '@/lib/utils';

// Page wrapper with animation
function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

// Main app content
function AppContent() {
  const { state } = useFleet();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onViewAllVehicles={() => setCurrentPage('vehicles')} />;
      case 'vehicles':
        return <VehicleRegistry />;
      case 'trips':
        return <TripDispatcher />;
      case 'maintenance':
        return <Maintenance />;
      case 'expenses':
        return <Expenses />;
      case 'drivers':
        return <Drivers />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const [authPage, setAuthPage] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  // New login → always open Dashboard first
  useEffect(() => {
    if (state.isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('resetToken');
    const tokenFromStorage = sessionStorage.getItem('fleetflow_reset_token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setAuthPage('reset');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (tokenFromStorage) {
      setResetToken(tokenFromStorage);
    }
  }, []);

  if (!state.isAuthenticated) {
    if (authPage === 'reset' && resetToken) {
      return (
        <ResetPassword
          token={resetToken}
          onBack={() => {
            setAuthPage('login');
            setResetToken(null);
            sessionStorage.removeItem('fleetflow_reset_token');
          }}
          onSuccess={() => setAuthPage('login')}
        />
      );
    }
    if (authPage === 'forgot') {
      return (
        <ForgotPassword
          onBack={() => {
            sessionStorage.removeItem('fleetflow_reset_token');
            setResetToken(null);
            setAuthPage('login');
          }}
          onGoToReset={() => {
            const t = sessionStorage.getItem('fleetflow_reset_token');
            if (t) {
              setResetToken(t);
              setAuthPage('reset');
            }
          }}
        />
      );
    }
    return (
      <Login
        onForgotPassword={() => setAuthPage('forgot')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content Area */}
      <div className="ml-60 min-h-screen">
        {/* Header */}
        <Header onPageChange={setCurrentPage} />

        {/* Page Content */}
        <main className="pt-[72px] min-h-screen">
          <PageWrapper key={currentPage}>
            {renderPage()}
          </PageWrapper>
        </main>
      </div>
    </div>
  );
}

// Main App with Provider
function App() {
  return (
    <FleetProvider>
      <AppContent />
    </FleetProvider>
  );
}

export default App;
