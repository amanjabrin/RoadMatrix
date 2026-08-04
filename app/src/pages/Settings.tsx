import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useFleet } from '@/context/FleetContext';
import { 
  User, 
  Bell, 
  Shield, 
  Truck, 
  Save,
  CheckCircle2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { state } = useFleet();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    phone: '+1-555-0199',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    maintenanceReminders: true,
    tripUpdates: true,
    fuelAlerts: false,
    safetyAlerts: true,
  });

  // Fleet settings
  const [fleetSettings, setFleetSettings] = useState({
    autoDispatch: false,
    maintenanceThreshold: 5000,
    fuelEfficiencyTarget: 8.5,
    safetyScoreThreshold: 75,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and fleet preferences</p>
      </div>

      {/* Appearance - Theme */}
      <div className="fleet-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose dark or light mode for the interface.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'btn-cyan' : ''}
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'btn-cyan' : ''}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
            className={theme === 'system' ? 'btn-cyan' : ''}
          >
            <Monitor className="w-4 h-4 mr-2" />
            System
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#30F2FF]/10 data-[state=active]:text-[#30F2FF]">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#30F2FF]/10 data-[state=active]:text-[#30F2FF]">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="fleet" className="data-[state=active]:bg-[#30F2FF]/10 data-[state=active]:text-[#30F2FF]">
            <Truck className="w-4 h-4 mr-2" />
            Fleet
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#30F2FF]/10 data-[state=active]:text-[#30F2FF]">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="fleet-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Full Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Email Address</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Phone Number</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Role</Label>
                <Input
                  value={state.currentUser?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''}
                  disabled
                  className="fleet-input w-full max-w-md bg-secondary/50"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Button onClick={handleSave} className="btn-cyan flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              {saved && (
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="fleet-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Maintenance Reminders</p>
                  <p className="text-xs text-muted-foreground">Get notified about upcoming maintenance</p>
                </div>
                <Switch
                  checked={notifications.maintenanceReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, maintenanceReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Trip Updates</p>
                  <p className="text-xs text-muted-foreground">Real-time notifications for trip status changes</p>
                </div>
                <Switch
                  checked={notifications.tripUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, tripUpdates: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Fuel Alerts</p>
                  <p className="text-xs text-muted-foreground">Notifications for unusual fuel consumption</p>
                </div>
                <Switch
                  checked={notifications.fuelAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, fuelAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Safety Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified about safety score changes</p>
                </div>
                <Switch
                  checked={notifications.safetyAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, safetyAlerts: checked })}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSave} className="btn-cyan flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="mt-6">
          <div className="fleet-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Fleet Configuration</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Dispatch</p>
                  <p className="text-xs text-muted-foreground">Automatically assign nearest available vehicle</p>
                </div>
                <Switch
                  checked={fleetSettings.autoDispatch}
                  onCheckedChange={(checked) => setFleetSettings({ ...fleetSettings, autoDispatch: checked })}
                />
              </div>

              <div className="py-3 border-b border-border/30">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Maintenance Threshold (km)
                </Label>
                <Input
                  type="number"
                  value={fleetSettings.maintenanceThreshold}
                  onChange={(e) => setFleetSettings({ ...fleetSettings, maintenanceThreshold: parseInt(e.target.value) || 0 })}
                  className="fleet-input w-full max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Alert when vehicle approaches this mileage
                </p>
              </div>

              <div className="py-3 border-b border-border/30">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Fuel Efficiency Target (km/L)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={fleetSettings.fuelEfficiencyTarget}
                  onChange={(e) => setFleetSettings({ ...fleetSettings, fuelEfficiencyTarget: parseFloat(e.target.value) || 0 })}
                  className="fleet-input w-full max-w-xs"
                />
              </div>

              <div className="py-3">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Safety Score Threshold
                </Label>
                <Input
                  type="number"
                  value={fleetSettings.safetyScoreThreshold}
                  onChange={(e) => setFleetSettings({ ...fleetSettings, safetyScoreThreshold: parseInt(e.target.value) || 0 })}
                  className="fleet-input w-full max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum acceptable safety score for drivers
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSave} className="btn-cyan flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="fleet-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="fleet-input w-full max-w-md"
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t border-border/30 mt-6">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" className="text-[#30F2FF] border-[#30F2FF]/50">
                  Enable 2FA
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSave} className="btn-cyan flex items-center gap-2">
                <Save className="w-4 h-4" />
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
