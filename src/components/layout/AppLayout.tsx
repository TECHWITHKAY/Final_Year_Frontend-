import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, Package, Store, BarChart3, Leaf, Download, Shield, ClipboardList,
  PenSquare, Settings, Menu, X, LogOut, User, ChevronLeft
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard', public: true },
  { label: 'Commodities', icon: Package, path: '/commodities', public: true },
  { label: 'Markets', icon: Store, path: '/markets', public: true },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', public: false },
  { label: 'Seasonal Guide', icon: Leaf, path: '/seasonal', public: true },
  { label: 'Export Data', icon: Download, path: '/export', public: false },
];

const adminItems = [
  { label: 'Admin Panel', icon: Shield, path: '/admin', roles: ['ADMIN'] },
  { label: 'Pending Submissions', icon: ClipboardList, path: '/admin/pending', roles: ['ADMIN'] },
  { label: 'Submit Price', icon: PenSquare, path: '/submit-price', roles: ['FIELD_AGENT', 'ADMIN'] },
];

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🇬🇭</span>
          {sidebarOpen && <span className="font-display text-lg font-bold text-primary">CommodityGH</span>}
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto hidden lg:block text-muted-foreground hover:text-foreground">
          <ChevronLeft className={`h-4 w-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.filter(item => item.public || isAuthenticated).map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-green-50 text-[#1B5E20] font-bold border-l-4 border-l-[#1B5E20] shadow-sm'
                : 'text-muted-foreground font-medium border-l-4 border-l-transparent hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}

        {isAuthenticated && adminItems.filter(item => user && item.roles.includes(user.role)).length > 0 && (
          <>
            <div className="my-3 border-t border-border" />
            {adminItems.filter(item => user && item.roles.includes(user.role)).map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-green-50 text-[#1B5E20] font-bold border-l-4 border-l-[#1B5E20] shadow-sm'
                    : 'text-muted-foreground font-medium border-l-4 border-l-transparent hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {isAuthenticated && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-card shadow-lg">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-secondary transition">Sign In</Link>
                <Link to="/register" className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition">Register</Link>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden sm:inline text-muted-foreground">Welcome,</span>
                <span className="font-medium text-foreground">{user?.fullName}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
