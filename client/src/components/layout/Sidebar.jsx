import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  History,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

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
    <aside
      className={`relative hidden md:flex flex-col bg-card border-r border-border transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-foreground">OrderFlow</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Enterprise
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip on Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">{user?.name}</span>
              <span className="text-[11px] text-muted-foreground capitalize">{user?.role?.toLowerCase()}</span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase ${
                isAdmin
                  ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
