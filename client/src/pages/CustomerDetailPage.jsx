import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart, Users, Mail, Phone, MapPin, FileText, Layers } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import TableSkeleton from '../components/common/TableSkeleton';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load customer details');
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const customer = data?.customer;
  const stats = data?.stats || {};
  const orders = data?.orders || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{customer?.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{customer?.companyName || 'Individual Customer Profile'}</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/orders/new?customer=${customer?._id}`)}
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Order for Customer
        </button>
      </div>

      {/* KPI Stats & Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Details Card */}
        <div className="md:col-span-2 p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground border-b border-border pb-2">Client Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block font-semibold uppercase">Contact Person</span>
              <span className="text-foreground font-medium">{customer?.contactPerson || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-semibold uppercase">Email</span>
              <span className="text-foreground font-medium">{customer?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-semibold uppercase">Phone</span>
              <span className="text-foreground font-medium">{customer?.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block font-semibold uppercase">Delivery / Billing Address</span>
              <span className="text-foreground font-medium">{customer?.address || 'N/A'}</span>
            </div>
          </div>
          {customer?.notes && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground text-xs block font-semibold uppercase">Account Notes</span>
              <p className="text-xs text-foreground mt-1 bg-muted/30 p-3 rounded-xl">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Aggregate Stats Cards */}
        <div className="space-y-4">
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders Placed</span>
            <p className="text-3xl font-extrabold text-primary">{stats.totalOrders || 0}</p>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Product Quantity Ordered</span>
            <p className="text-3xl font-extrabold text-emerald-500">{(stats.totalProductsOrdered || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Customer Order History */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-foreground">Order Indents History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">PO #</th>
                <th className="py-3.5 px-4">Indent #</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No order indents found for this customer.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary">{ord.orderNumber}</td>
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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/orders/${ord._id}`)}
                        className="px-3 py-1 text-xs font-semibold bg-secondary border border-border rounded-lg"
                      >
                        View Order
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
