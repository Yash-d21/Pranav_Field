import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Clock, Wrench, Settings, RefreshCw, CheckSquare, MapPin, BarChart3, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Import Supabase Service (replaces PHP API)
import { SupabaseService } from './services/SupabaseService';

// Import form components
import { DailyPunchInForm } from './components/DailyPunchInForm';
import { CorrectiveMaintenanceForm } from './components/CorrectiveMaintenanceForm';
import { PreventiveMaintenanceForm } from './components/PreventiveMaintenanceForm';
import { ChangeRequestForm } from './components/ChangeRequestForm';
import { GPLiveCheckForm } from './components/GPLiveCheckForm';
import { PatrollerTaskForm } from './components/PatrollerTaskForm';
import { AdminDashboard } from './components/AdminDashboard';
import { UserManagement } from './components/UserManagement';
import { LoginForm } from './components/LoginForm';
import { SetupDiagnostic } from './components/SetupDiagnostic';
import { PWAInstallPrompt, IOSInstallInstructions } from './components/PWAInstallPrompt';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { offlineStorage } from './services/OfflineStorageService';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface BaseRecord {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  createdAt: string;
  activityType: string;
}

export interface PunchInRecord extends BaseRecord {
  name: string;
  location: string;
}

export interface CorrectiveMaintenanceRecord extends BaseRecord {
  location: string;
  issue: string;
  ttNumber: string;
  damageReason: string;
  restorationPossibleAsPerSLA: boolean;
  status: string;
}

export interface FiberTest {
  fiberNo: string;
  distance: number;
  cumulativeLoss: number;
}

export interface PreventiveMaintenanceRecord extends BaseRecord {
  mandalName: string;
  location: string;
  ringName: string;
  noOfGPs: number;
  otdrTestingFromLocation: string;
  otdrTestingToLocation: string;
  gpSpanName: string;
  fiberTests: FiberTest[];
}

export interface ChangeRequestRecord extends BaseRecord {
  mandalName: string;
  ringName: string;
  gpSpanName: string;
  changeRequestNo: string;
  reasonForActivity: string;
  materialConsumedOFC: number;
  materialConsumedPoles: number;
}

export interface GPLiveCheckRecord extends BaseRecord {
  mandal: string;
  ringName: string;
  gpName: string;
  fdmsIssue: boolean;
  terminationIssue: boolean;
  reLocation: boolean;
  fiberIssue: boolean;
  issueDetails: string;
  rackInstalled: boolean;
  routerIssue: boolean;
  sfpModule: boolean;
  upsIssue: boolean;
  mcbIssue: boolean;
  troughRawPowerRouter: boolean;
  apsflPowerMeterConnection: boolean;
}

export interface Photo {
  photoId: string;
  timestamp: string;
  lat?: number;
  lng?: number;
  base64Image: string;
}

export interface PatrollerRecord extends BaseRecord {
  mandalName: string;
  location: string;
  ringName: string;
  noOfGPs: number;
  gpSpanName: string;
  sagLocationIdentified: boolean;
  sagLocationPhotos: Photo[];
  clampDamaged: boolean;
  clampDamagePhotos: Photo[];
  tensionClampCount: number;
  suspensionClampCount: number;
  newPoleBendIdentified: boolean;
  poleDamage: boolean;
  poleDamagePhotos: Photo[];
  poleBendNewPoles: boolean;
  poleBendPhotos: Photo[];
  loopStandIssues: boolean;
  loopStandPhotos: Photo[];
  treeCuttingActivity: boolean;
  treeCuttingPhotos: Photo[];
  jointEnclosureProblems: boolean;
  jointEnclosurePhotos: Photo[];
  cutLocationIdentified: boolean;
  cutLocationPhotos: Photo[];
  otherActivitiesDescription: string;
  otherActivitiesPhotos: Photo[];
}

// Database connection status component
function DatabaseStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600">MySQL Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-600">Database Error</span>
        </>
      )}
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'admin' ? 'admin' : 'punch-in');
  const [dataService] = useState(() => SupabaseService.getInstance());
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [offlineDataCount, setOfflineDataCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize PWA and offline storage
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Initialize offline storage
        await offlineStorage.init();
        
        // Check if PWA is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsPWAInstalled(true);
        }
        
        // Set up online/offline listeners
        offlineStorage.onOnlineStatusChange((online) => {
          setIsOnline(online);
          if (online) {
            // Sync offline data when coming back online
            offlineStorage.syncOfflineData();
          }
        });
        
        // Load offline data count
        const offlineRecords = await offlineStorage.getOfflineRecords();
        setOfflineDataCount(offlineRecords.length);
        
        // Register service worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }
      } catch (error) {
        console.error('PWA initialization error:', error);
      }
    };

    initializePWA();
  }, []);

  // Initialize database connection on app load
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const ready = await dataService.testConnection();
        setIsDatabaseReady(ready);
        if (ready) {
          console.log('Supabase database connected successfully');
          setShowDiagnostic(false);
          
          // Check for existing session
          const session = await dataService.checkSession();
          if (session) {
            setCurrentUser(session);
            setActiveTab(session.role === 'admin' ? 'admin' : 'punch-in');
            toast.success(`Welcome back, ${session.name}!`);
          }
        } else {
          console.log('Database connection failed, but allowing app to continue');
          // Don't show diagnostic, just set as ready
          setIsDatabaseReady(true);
          setShowDiagnostic(false);
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        // Don't block the app, just set as ready
        setIsDatabaseReady(true);
        setShowDiagnostic(false);
      }
    };

    initializeDatabase();
  }, [dataService]);

  // Handle user login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'admin' ? 'admin' : 'punch-in');
  };

  const handleLogout = async () => {
    // Logout from database session
    await dataService.logout();
    dataService.cleanup();
    setCurrentUser(null);
    setActiveTab('punch-in'); // Default to first user tab
    toast.success('Logged out successfully');
  };

  // Show setup diagnostic if database connection failed
  if (showDiagnostic || !isDatabaseReady) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Field Maintenance Tracker - Setup</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DatabaseStatus isConnected={isDatabaseReady} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowDiagnostic(false);
                    setIsDatabaseReady(true);
                  }}
                >
                  Skip Setup & Continue
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="py-8">
          <SetupDiagnostic />
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const formTabs = currentUser.role === 'admin' ? [
    // Admin users only see admin tabs
    { id: 'admin', label: 'Admin Dashboard', icon: BarChart3, color: 'bg-gray-600' },
    { id: 'users', label: 'User Management', icon: User, color: 'bg-indigo-600' }
  ] : [
    // Regular users see maintenance form tabs
    { id: 'punch-in', label: 'Daily Punch-In', icon: Clock, color: 'bg-blue-500' },
    { id: 'corrective', label: 'Corrective Maintenance', icon: Wrench, color: 'bg-red-500' },
    { id: 'preventive', label: 'Preventive Maintenance', icon: Settings, color: 'bg-green-500' },
    { id: 'change-request', label: 'Change Request', icon: RefreshCw, color: 'bg-orange-500' },
    { id: 'gp-live-check', label: 'GP Live Check', icon: CheckSquare, color: 'bg-purple-500' },
    { id: 'patroller', label: 'Patroller Task', icon: MapPin, color: 'bg-teal-500' }
  ];

  return (
    <ResponsiveLayout currentPage={activeTab} onNavigate={setActiveTab}>
      <Toaster position="top-right" />
      
      {/* PWA Install Prompts */}
      <PWAInstallPrompt />
      <IOSInstallInstructions />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Field Maintenance</h1>
                {isPWAInstalled && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs hidden sm:inline-flex">
                    PWA
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <DatabaseStatus isConnected={isDatabaseReady} />
              {!isOnline && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs hidden sm:inline">Offline</span>
                </div>
              )}
              {offlineDataCount > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                  {offlineDataCount}
                </Badge>
              )}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline truncate max-w-20">
                  {currentUser.name}
                </span>
                <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {currentUser.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <TabsList className={`grid w-full gap-1 sm:gap-2 ${
              currentUser.role === 'admin' 
                ? 'grid-cols-2' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            }`}>
              {formTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-2"
                >
                  <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Regular User Forms - Only shown for non-admin users */}
            {currentUser.role !== 'admin' && (
              <>
                <TabsContent value="punch-in" className="p-3 sm:p-4 lg:p-6">
                  <DailyPunchInForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>

                <TabsContent value="corrective" className="p-3 sm:p-4 lg:p-6">
                  <CorrectiveMaintenanceForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>

                <TabsContent value="preventive" className="p-3 sm:p-4 lg:p-6">
                  <PreventiveMaintenanceForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>

                <TabsContent value="change-request" className="p-3 sm:p-4 lg:p-6">
                  <ChangeRequestForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>

                <TabsContent value="gp-live-check" className="p-3 sm:p-4 lg:p-6">
                  <GPLiveCheckForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>

                <TabsContent value="patroller" className="p-3 sm:p-4 lg:p-6">
                  <PatrollerTaskForm currentUser={currentUser} dataService={dataService} />
                </TabsContent>
              </>
            )}

            {/* Admin Only Tabs */}
            {currentUser.role === 'admin' && (
              <>
                <TabsContent value="admin" className="p-3 sm:p-4 lg:p-6">
                  <AdminDashboard dataService={dataService} />
                </TabsContent>

                <TabsContent value="users" className="p-3 sm:p-4 lg:p-6">
                  <UserManagement dataService={dataService} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </main>
    </ResponsiveLayout>
  );
}

export default App;