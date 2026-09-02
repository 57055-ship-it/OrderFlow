import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Filter, FileText, Calendar, Layers } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import TableSkeleton from '../components/common/TableSkeleton';
import { exportOrdersToExcel } from '../utils/excelExporter';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('orders'); // 'orders' | 'customers' | 'products'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [customers, setCustomers] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchAux = async () => {
      try {
        const res = await api.get('/customers?limit=100');
        if (res.success) setCustomers(res.data || []);
      } catch (err) {}
    };
    fetchAux();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let endpoint = `/reports/${reportType}?`;
      if (dateFrom) endpoint += `dateFrom=${dateFrom}&`;
      if (dateTo) endpoint += `dateTo=${dateTo}&`;
      if (customerFilter) endpoint += `customer=${customerFilter}&`;
      if (statusFilter) endpoint += `status=${statusFilter}&`;

      const res = await api.get(endpoint);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, dateFrom, dateTo, customerFilter, statusFilter]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Business Analytics & Reports</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Generate customer, product, and volume indents reporting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button
            onClick={() => exportOrdersToExcel(reportData?.orders || [])}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="no-print flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setReportType('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'orders' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Orders Breakdown
        </button>
        <button
          onClick={() => setReportType('customers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'customers' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Customer-wise Report
        </button>
        <button
          onClick={() => setReportType('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'products' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Product-wise Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="no-print p-4 bg-card border border-border rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-muted-foreground mb-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="block font-semibold text-muted-foreground mb-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl outline-none"
          />
        </div>
        <div>
          <label className="block font-semibold text-muted-foreground mb-1">Customer</label>
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl outline-none"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-muted-foreground mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Report Summary Results */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : reportType === 'orders' ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-card border border-border rounded-2xl">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Filtered Orders</span>
              <p className="text-2xl font-extrabold text-foreground mt-1">{reportData?.summary?.totalOrders || 0}</p>
            </div>
            <div className="p-5 bg-card border border-border rounded-2xl">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Items Quantity Aggregate</span>
              <p className="text-2xl font-extrabold text-primary mt-1">
                {(reportData?.summary?.totalItemsQuantity || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-5 bg-card border border-border rounded-2xl">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Completed Orders</span>
              <p className="text-2xl font-extrabold text-emerald-500 mt-1">
                {reportData?.summary?.statusBreakdown?.Completed || 0}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">PO #</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(reportData?.orders || []).map((ord) => (
                  <tr key={ord._id}>
                    <td className="py-3 px-4 font-bold text-primary font-mono">{ord.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{ord.customer?.name}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {ord.date ? new Date(ord.date).toLocaleDateString() : ''}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">{ord.poNumber || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-xs">{ord.products?.length || 0} items</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportType === 'customers' ? (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4 text-center">Number of Orders</th>
                <th className="py-3.5 px-4 text-right">Total Quantity Ordered</th>
                <th className="py-3.5 px-4">Last Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(reportData || []).map((item) => (
                <tr key={item.customerId}>
                  <td className="py-3.5 px-4 font-bold text-foreground">{item.customerName}</td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">{item.companyName || '—'}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-primary">{item.orderCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-500">
                    {item.totalQuantityOrdered.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Product Description</th>
                <th className="py-3.5 px-4 text-center">Times Ordered</th>
                <th className="py-3.5 px-4 text-right">Total Quantity</th>
                <th className="py-3.5 px-4 text-center">UOM</th>
                <th className="py-3.5 px-4">Last Ordered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(reportData || []).map((prod, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-4 font-bold text-foreground">{prod._id}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-primary">{prod.orderCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-500">
                    {prod.totalQuantity ? prod.totalQuantity.toLocaleString() : '0'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs">{prod.uom}</td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {prod.lastOrderedDate ? new Date(prod.lastOrderedDate).toLocaleDateString() : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
