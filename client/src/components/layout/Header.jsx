import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, LogOut, User, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlobalSearch from './GlobalSearch';
import NotificationsDropdown from './NotificationsDropdown';

export default function Header({ onOpenMobileNav }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title from Route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Executive Dashboard';
    if (path.startsWith('/orders/new')) return 'Create New Order';
    if (path.startsWith('/orders/')) return 'Order Details';
    if (path.startsWith('/orders')) return 'Order & Indent Management';
    if (path.startsWith('/customers/')) return 'Customer Details';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/products')) return 'Product Catalog Master';
    if (path.startsWith('/reports')) return 'Business Analytics & Reports';
    if (path.startsWith('/activity-logs')) return 'System Activity & Audit Logs';
    if (path.startsWith('/users')) return 'User & Access Management';
    if (path.startsWith('/settings')) return 'System & Company Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-none">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:block flex-1 max-w-md mx-6">
        <GlobalSearch />
      </div>

      {/* Right Actions: Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationsDropdown />

        {/* Theme Toggle Button */}
        <button
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={`Current theme: ${theme}. Click to switch.`}
        >
          {theme === 'light' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : theme === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-400" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted transition-colors focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-md shadow-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{user?.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-bold text-foreground">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold tracking-wider text-primary uppercase">{user?.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" /> Settings & Profile
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
