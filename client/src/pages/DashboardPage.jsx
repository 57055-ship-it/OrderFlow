import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  Plus,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import TableSkeleton from '../components/common/TableSkeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('[Dashboard Stats Error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Top Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Operational Overview</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time metrics, status breakdowns & recent indent activity.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/orders/new')}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Order
          </button>
          <button
            onClick={() => navigate('/customers')}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs sm:text-sm border border-border rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs sm:text-sm border border-border rounded-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs sm:text-sm border border-border rounded-xl transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> View Reports
          </button>
        </div>
      </div>

      {/* Top KPI Cards Grid (7 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KPICard title="Total Orders" value={kpis.totalOrders || 0} icon={ShoppingCart} color="blue" />
        <KPICard title="Draft Orders" value={kpis.draftOrders || 0} icon={Clock} color="slate" />
        <KPICard title="Submitted" value={kpis.submittedOrders || 0} icon={Send} color="indigo" />
        <KPICard title="Processing" value={kpis.processingOrders || 0} icon={Loader2} color="amber" />
        <KPICard title="Completed" value={kpis.completedOrders || 0} icon={CheckCircle2} color="emerald" />
        <KPICard title="Total Customers" value={kpis.totalCustomers || 0} icon={Users} color="purple" />
        <KPICard title="Total Products" value={kpis.totalProducts || 0} icon={Package} color="rose" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Monthly Orders Trend */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Orders Overview</h3>
              <p className="text-xs text-muted-foreground">Order volume breakdown for the past 6 months</p>
            </div>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ordersByMonth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Order Status Distribution</h3>
            <p className="text-xs text-muted-foreground">Proportion of orders by current stage</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ordersByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(charts.ordersByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {(charts.ordersByStatus || []).map((st) => (
              <span key={st.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                {st.name}: <strong className="text-foreground">{st.count}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Datatable */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground">Latest indents submitted into the system</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{ord.customer?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {ord.date ? new Date(ord.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">{ord.products?.length || 0} items</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">{ord.createdBy?.name || 'System'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/orders/${ord._id}`)}
                        className="px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
