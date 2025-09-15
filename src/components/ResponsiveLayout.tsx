import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, X, Home, Users, BarChart3, Settings, Smartphone } from 'lucide-react';
// Simple utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function ResponsiveLayout({ children, currentPage, onNavigate }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'punch-in', label: 'Punch In', icon: Home, href: '/punch-in' },
    { id: 'users', label: 'Users', icon: Users, href: '/users' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              <span className="sm:hidden">FM</span>
              <span className="hidden sm:inline">Field Maintenance</span>
            </h2>
            <p className="text-sm text-gray-500">PWA Edition</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-blue-600 text-white"
              )}
              onClick={() => {
                onNavigate?.(item.id);
                setSidebarOpen(false);
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          {isMobile && "📱 Mobile View"}
          {isTablet && "📱 Tablet View"}
          {isDesktop && "🖥️ Desktop View"}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b px-3 py-2 flex items-center justify-between sticky top-0 z-40">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-base truncate flex-1 mx-2">
            <span className="sm:hidden">FM</span>
            <span className="hidden sm:inline">Field Maintenance</span>
          </h1>
          
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-3 w-3 text-white" />
          </div>
        </header>

        {/* Mobile Content */}
        <main className="px-3 py-4 pb-20 min-h-screen">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-1 z-40 safe-area-pb">
          <div className="flex justify-around max-w-full">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-2 min-w-0 flex-1",
                    isActive && "text-blue-600"
                  )}
                  onClick={() => onNavigate?.(item.id)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
        {/* Tablet Sidebar */}
        <aside className="w-60 bg-white border-r flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Tablet Content */}
        <main className="flex-1 overflow-auto min-w-0">
          <header className="bg-white border-b px-4 py-3">
            <h1 className="text-xl font-semibold">
              <span className="sm:hidden">FM</span>
              <span className="hidden sm:inline">Field Maintenance</span>
            </h1>
            <p className="text-gray-600 text-sm">Professional maintenance tracking system</p>
          </header>
          
          <div className="p-4 max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Desktop Content */}
      <main className="flex-1 overflow-auto min-w-0">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="sm:hidden">FM</span>
                <span className="hidden sm:inline">Field Maintenance</span>
              </h1>
              <p className="text-gray-600 mt-1">Professional maintenance tracking and management system</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Desktop View
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

// Responsive Grid Component
export function ResponsiveGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

// Responsive Card Component
export function ResponsiveCard({ 
  children, 
  className,
  mobile = "p-4",
  tablet = "p-6", 
  desktop = "p-8"
}: { 
  children: React.ReactNode; 
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg border shadow-sm",
      mobile,
      "sm:", tablet,
      "lg:", desktop,
      className
    )}>
      {children}
    </div>
  );
}

// Responsive Text Component
export function ResponsiveText({ 
  children, 
  className,
  mobile = "text-sm",
  tablet = "text-base",
  desktop = "text-lg"
}: { 
  children: React.ReactNode; 
  className?: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) {
  return (
    <div className={cn(
      mobile,
      "sm:", tablet,
      "lg:", desktop,
      className
    )}>
      {children}
    </div>
  );
}
