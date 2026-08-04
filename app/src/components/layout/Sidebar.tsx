import { useFleet } from '@/context/FleetContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Route,
  Wrench,
  Fuel,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck, roles: ['fleet_manager', 'dispatcher'] },
  { id: 'trips', label: 'Trip Dispatcher', icon: Route, roles: ['fleet_manager', 'dispatcher'] },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['fleet_manager', 'safety_officer'] },
  { id: 'expenses', label: 'Fuel & Expenses', icon: Fuel, roles: ['fleet_manager', 'financial_analyst'] },
  { id: 'drivers', label: 'Drivers', icon: Users, roles: ['fleet_manager', 'safety_officer', 'dispatcher'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['fleet_manager', 'financial_analyst'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['fleet_manager'] },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { state, logout, hasRole } = useFleet();

  const handleLogout = () => {
    logout();
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole([role as any]))
  );

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#30F2FF]/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#30F2FF]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FleetFlow</h1>
            <p className="text-xs text-muted-foreground">Fleet Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'sidebar-link w-full',
                    isActive && 'active'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border/50">
        {state.currentUser && (
          <div className="mb-4 px-4 py-3 bg-secondary/50 rounded-lg">
            <p className="text-sm font-medium text-foreground">{state.currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{state.currentUser.role.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
