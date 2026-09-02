import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  Printer,
  FileDown,
  Trash2,
  RefreshCw,
  MoreVertical,
  CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateOrderPDF } from '../utils/pdfGenerator';
import { exportOrdersToExcel } from '../utils/excelExporter';

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusTab, setStatusTab] = useState('All');
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Dialog & Menu states
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const { user, isEmployee } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/orders?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (statusTab !== 'All') url += `&status=${statusTab}`;
      if (customerFilter) url += `&customer=${customerFilter}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;

      const res = await api.get(url);
      if (res.success) {
        setOrders(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusTab, customerFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    const fetchAuxiliary = async () => {
      try {
        const [cRes, sRes] = await Promise.all([api.get('/customers?limit=100'), api.get('/settings')]);
        if (cRes.success) setCustomers(cRes.data || []);
        if (sRes.success) setSettings(sRes.data || {});
      } catch (err) {
        console.error('[Aux Data Error]', err);
      }
    };
    fetchAuxiliary();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleDuplicate = async (orderId) => {
    try {
      const res = await api.post(`/orders/${orderId}/duplicate`);
      if (res.success) {
        toast.success(`Duplicated successfully into ${res.data.orderNumber}!`);
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate order');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/orders/${deleteId}`);
      if (res.success) {
        toast.success('Order deleted successfully.');
        setOrders(orders.filter((o) => o._id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setStatusTab('All');
    setSearch('');
    setCustomerFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const statusTabs = ['All', 'Draft', 'Submitted', 'Processing', 'Completed', 'Cancelled'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">All Orders</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage and track indents across their lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs sm:text-sm border border-border rounded-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => navigate('/orders/new')}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Order
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              statusTab === tab
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, PO, Indent..."
              className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
            />
          </div>

          <select
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
            title="Date From"
          />

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
              title="Date To"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="p-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Orders Data Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="No indents match your selected search or filter criteria."
          actionButton={
            <button
              onClick={() => navigate('/orders/new')}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow"
            >
              Create First Order
            </button>
          }
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">PO #</th>
                  <th className="py-3.5 px-4">Indent #</th>
                  <th className="py-3.5 px-4 text-center">Items</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary">{ord.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{ord.customer?.name || 'N/A'}</span>
                        <span className="text-[11px] text-muted-foreground">{ord.customer?.companyName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {ord.date ? new Date(ord.date).toLocaleDateString() : ''}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">{ord.poNumber || '—'}</td>
                    <td className="py-3.5 px-4 text-xs font-mono">{ord.indentNumber || '—'}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-xs">
                      {ord.products?.length || 0} line items
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">{ord.createdBy?.name || 'System'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/orders/${ord._id}`)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/orders/${ord._id}/edit`)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit Order"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(ord._id)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Duplicate Order"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateOrderPDF(ord, settings)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => setDeleteId(ord._id)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete Order"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
