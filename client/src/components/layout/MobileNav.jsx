import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  History,
  UserCheck,
  Settings,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Orders', path: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { label: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Activity Logs', path: '/activity-logs', icon: History, roles: ['ADMIN'] },
    { label: 'Users', path: '/users', icon: UserCheck, roles: ['ADMIN'] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER'] }
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || 'EMPLOYEE'));

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

      <div className="relative w-4/5 max-w-xs bg-card border-r border-border h-full flex flex-col z-10 p-4 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-foreground">OrderFlow</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
