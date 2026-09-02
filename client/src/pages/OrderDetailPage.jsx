import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit,
  Copy,
  Printer,
  FileDown,
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  ShieldAlert,
  Layers,
  History
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import TableSkeleton from '../components/common/TableSkeleton';
import OrderAuditHistory from '../components/orders/OrderAuditHistory';
import OrderPrintView from '../components/orders/OrderPrintView';
import { generateOrderPDF } from '../utils/pdfGenerator';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'history'

  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    try {
      const [oRes, sRes] = await Promise.all([api.get(`/orders/${id}`), api.get('/settings')]);
      if (oRes.success) setOrder(oRes.data);
      if (sRes.success) setSettings(sRes.data || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Order status changed to ${newStatus}`);
        setOrder({ ...order, status: newStatus });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post(`/orders/${id}/duplicate`);
      if (res.success) {
        toast.success(`Duplicated into new Order ${res.data.orderNumber}`);
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Order not found.
      </div>
    );
  }

  const totalQuantity = (order.products || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Printable Hidden Section */}
      <OrderPrintView order={order} settings={settings} />

      {/* Main Screen Content (no-print) */}
      <div className="no-print space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {order.orderNumber}
                </h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Created on {order.date ? new Date(order.date).toLocaleDateString() : ''} by {order.createdBy?.name || 'System'}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Change Selector */}
            <select
              value={order.status}
              disabled={statusChanging}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 bg-muted/60 border border-border rounded-xl text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              <option value="Draft">Status: Draft</option>
              <option value="Submitted">Status: Submitted</option>
              <option value="Processing">Status: Processing</option>
              <option value="Completed">Status: Completed</option>
              <option value="Cancelled">Status: Cancelled</option>
            </select>

            <button
              onClick={() => navigate(`/orders/${id}/edit`)}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>

            <button
              onClick={handleDuplicate}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" /> Duplicate
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button
              onClick={() => generateOrderPDF(order, settings)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Order Details Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Customer Info */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              <User className="w-4 h-4 text-primary" /> Customer Information
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">{order.customer?.name}</h4>
              <p className="text-xs text-muted-foreground font-medium">{order.customer?.companyName}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Email: <span className="text-foreground">{order.customer?.email || 'N/A'}</span></p>
              <p>Phone: <span className="text-foreground">{order.customer?.phone || 'N/A'}</span></p>
              <p>Address: <span className="text-foreground">{order.customer?.address || 'N/A'}</span></p>
            </div>
          </div>

          {/* Card 2: Order Reference */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              <FileText className="w-4 h-4 text-blue-500" /> Reference Numbers
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PO Number:</span>
                <span className="font-mono font-semibold text-foreground">{order.poNumber || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indent Number:</span>
                <span className="font-mono font-semibold text-foreground">{order.indentNumber || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium text-foreground">
                  {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Summary Totals */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              <Layers className="w-4 h-4 text-emerald-500" /> Order Summary
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Line Items:</span>
                <span className="font-bold text-foreground">{order.products?.length || 0} Products</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-muted-foreground">Total Quantity Aggregate:</span>
                <span className="text-xl font-extrabold text-primary">{totalQuantity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Products List vs Modification History) */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center border-b border-border px-6 pt-4 gap-4">
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'items'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Product Items ({order.products?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Modification History ({order.history?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'items' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Product Description</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-center">UOM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(order.products || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">{item.description}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                          {item.quantity ? item.quantity.toLocaleString() : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-xs text-muted-foreground">
                          {item.uom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <OrderAuditHistory history={order.history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
