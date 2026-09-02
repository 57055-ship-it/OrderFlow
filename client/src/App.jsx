import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersListPage from './pages/OrdersListPage';
import CreateOrderPage from './pages/CreateOrderPage';
import EditOrderPage from './pages/EditOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersListPage from './pages/CustomersListPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ProductsListPage from './pages/ProductsListPage';
import ReportsPage from './pages/ReportsPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Loading OrderFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main Authenticated Layout
const MainLayout = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Authenticated Application Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<DashboardPage />} />

                          {/* Orders */}
                          <Route path="/orders" element={<OrdersListPage />} />
                          <Route path="/orders/new" element={<CreateOrderPage />} />
                          <Route path="/orders/:id" element={<OrderDetailPage />} />
                          <Route path="/orders/:id/edit" element={<EditOrderPage />} />

                          {/* Customers */}
                          <Route
                            path="/customers"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <CustomersListPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customers/:id"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <CustomerDetailPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Products */}
                          <Route
                            path="/products"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <ProductsListPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Reports */}
                          <Route
                            path="/reports"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <ReportsPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Admin Only */}
                          <Route
                            path="/activity-logs"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ActivityLogsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UsersPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Settings */}
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                                <SettingsPage />
                              </ProtectedRoute>
                            }
                          />

                          <Route path="/unauthorized" element={<UnauthorizedPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
