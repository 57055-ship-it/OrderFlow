import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Send,
  ArrowLeft,
  ShoppingCart,
  Layers,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import TableSkeleton from '../components/common/TableSkeleton';

export default function EditOrderPage() {
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [productsMaster, setProductsMaster] = useState([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [indentNumber, setIndentNumber] = useState('');
  const [status, setStatus] = useState('Draft');
  const [productRows, setProductRows] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const [oRes, cRes, pRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ]);

        if (cRes.success) setCustomers(cRes.data || []);
        if (pRes.success) setProductsMaster(pRes.data || []);

        if (oRes.success && oRes.data) {
          const ord = oRes.data;
          setOrderNumber(ord.orderNumber);
          setCustomer(ord.customer?._id || ord.customer);
          setDate(ord.date ? new Date(ord.date).toISOString().split('T')[0] : '');
          setPoNumber(ord.poNumber || '');
          setIndentNumber(ord.indentNumber || '');
          setStatus(ord.status || 'Draft');

          const formattedProducts = (ord.products || []).map((p) => ({
            product: p.product?._id || p.product || '',
            productName: p.productName || '',
            description: p.description || '',
            quantity: p.quantity || 1,
            uom: p.uom || 'PCS'
          }));
          setProductRows(formattedProducts);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [id]);

  const handleSelectProductMaster = (index, productId) => {
    const selected = productsMaster.find((p) => p._id === productId);
    const updated = [...productRows];

    if (selected) {
      updated[index] = {
        ...updated[index],
        product: selected._id,
        productName: selected.name,
        description: selected.description || selected.name,
        uom: selected.defaultUOM || 'PCS'
      };
    }
    setProductRows(updated);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...productRows];
    updated[index][field] = value;
    setProductRows(updated);
  };

  const handleAddProductRow = () => {
    setProductRows([...productRows, { product: '', productName: '', description: '', quantity: 1, uom: 'PCS' }]);
  };

  const handleDuplicateRow = (index) => {
    const target = productRows[index];
    setProductRows([...productRows.slice(0, index + 1), { ...target }, ...productRows.slice(index + 1)]);
  };

  const handleDeleteRow = (index) => {
    if (productRows.length <= 1) {
      toast.warning('An order must contain at least one line item.');
      return;
    }
    setProductRows(productRows.filter((_, i) => i !== index));
  };

  const executeUpdate = async () => {
    setSaving(true);
    setConfirmOpen(false);

    try {
      const payload = {
        customer,
        date,
        poNumber,
        indentNumber,
        status,
        products: productRows
      };

      const res = await api.put(`/orders/${id}`, payload);
      if (res.success) {
        toast.success(`Order ${orderNumber} updated successfully!`);
        navigate(`/orders/${id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const uomOptions = ['PCS', 'Pairs', 'KG', 'Grams', 'Boxes', 'Cartons', 'Sets', 'Dozens', 'Meters', 'Custom'];
  const totalQuantity = productRows.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto pb-28">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Edit Order: <span className="text-primary font-mono">{orderNumber}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Modify line items & indent attributes</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">SECTION 1: ORDER INFORMATION</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Customer
                </label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm text-foreground outline-none"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  PO Number
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl text-sm text-muted-foreground font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Indent Number
                </label>
                <input
                  type="text"
                  value={indentNumber}
                  onChange={(e) => setIndentNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm text-foreground outline-none"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">SECTION 2: PRODUCTS</h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{productRows.length} Products</span>
            </div>

            <div className="space-y-4">
              {productRows.map((row, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground border-b border-border/60 pb-2">
                    <span>LINE ITEM #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        className="p-1 hover:text-foreground hover:bg-muted rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 hover:text-rose-500 hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <div className="sm:col-span-4">
                      <select
                        value={row.product}
                        onChange={(e) => handleSelectProductMaster(idx, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-lg text-xs"
                      >
                        <option value="">-- Catalog Item --</option>
                        {productsMaster.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <select
                        value={row.uom}
                        onChange={(e) => handleRowChange(idx, 'uom', e.target.value)}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-xs"
                      >
                        {uomOptions.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddProductRow}
              className="w-full py-3 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Add Product Line Item
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">SUMMARY</h3>
            </div>
            <div className="space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Order #:</span>
                <span className="font-bold font-mono">{orderNumber}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Products:</span>
                <span className="font-bold">{productRows.length}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="font-extrabold text-foreground">{totalQuantity.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/orders/${id}`)}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-secondary border border-border rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeUpdate}
        title="Update Order"
        message="Are you sure you want to save these modifications to the order?"
        confirmText="Save Changes"
        variant="primary"
        loading={saving}
      />
    </div>
  );
}
