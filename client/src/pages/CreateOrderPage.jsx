import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Send,
  X,
  Search,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  Layers,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState([]);
  const [productsMaster, setProductsMaster] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [customer, setCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNumber, setPoNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [indentNumber, setIndentNumber] = useState('');
  const [status, setStatus] = useState('Draft');

  // Product Rows Array
  const [productRows, setProductRows] = useState([
    { product: '', productName: '', description: '', quantity: 1, uom: 'PCS' }
  ]);

  // Confirmation Modal State
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [pendingSubmitType, setPendingSubmitType] = useState('Submit Order'); // 'Save Draft' or 'Submit Order'

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [cRes, pRes, sRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
          api.get('/settings')
        ]);

        if (cRes.success) setCustomers(cRes.data || []);
        if (pRes.success) setProductsMaster(pRes.data || []);
        if (sRes.success) {
          setSettings(sRes.data || {});
          if (sRes.data?.defaultUOM) {
            setProductRows([{ product: '', productName: '', description: '', quantity: 1, uom: sRes.data.defaultUOM }]);
          }
        }
      } catch (err) {
        toast.error('Failed to load customers or product master catalog.');
      }
    };

    loadInitialData();
  }, []);

  // Product selection handler - auto populates description and UOM
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
    } else {
      updated[index] = {
        ...updated[index],
        product: '',
        productName: '',
        description: '',
        uom: settings.defaultUOM || 'PCS'
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
    setProductRows([
      ...productRows,
      { product: '', productName: '', description: '', quantity: 1, uom: settings.defaultUOM || 'PCS' }
    ]);
  };

  const handleDuplicateRow = (index) => {
    const target = productRows[index];
    const duplicated = { ...target };
    setProductRows([...productRows.slice(0, index + 1), duplicated, ...productRows.slice(index + 1)]);
  };

  const handleDeleteRow = (index) => {
    if (productRows.length <= 1) {
      toast.warning('An order must contain at least one product line item.');
      return;
    }
    setProductRows(productRows.filter((_, i) => i !== index));
  };

  // Validation before submission
  const validateForm = () => {
    if (!customer) {
      toast.error('Please select a Customer.');
      return false;
    }
    if (!date) {
      toast.error('Please select an Order Date.');
      return false;
    }
    if (productRows.length === 0) {
      toast.error('At least one product row is required.');
      return false;
    }

    for (let i = 0; i < productRows.length; i++) {
      const p = productRows[i];
      if (!p.description || p.description.trim() === '') {
        toast.error(`Product row #${i + 1} requires a description.`);
        return false;
      }
      if (!p.quantity || Number(p.quantity) <= 0) {
        toast.error(`Product row #${i + 1} quantity must be greater than 0.`);
        return false;
      }
      if (!p.uom) {
        toast.error(`Product row #${i + 1} requires a UOM.`);
        return false;
      }
    }
    return true;
  };

  const handleSaveDraftClick = () => {
    if (!validateForm()) return;
    setStatus('Draft');
    setPendingSubmitType('Draft');
    executeSubmit('Draft');
  };

  const handleSubmitOrderClick = () => {
    if (!validateForm()) return;
    setPendingSubmitType('Submitted');
    setSubmitConfirmOpen(true);
  };

  const executeSubmit = async (targetStatus) => {
    setLoading(true);
    setSubmitConfirmOpen(false);

    try {
      const payload = {
        customer,
        date,
        poNumber,
        indentNumber,
        status: targetStatus,
        products: productRows
      };

      const res = await api.post('/orders', payload);
      if (res.success && res.data) {
        toast.success(`Order ${res.data.orderNumber} ${targetStatus === 'Draft' ? 'saved as Draft' : 'submitted successfully'}!`);
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Aggregates
  const totalQuantity = productRows.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0);
  const selectedCustomerObj = customers.find((c) => c._id === customer);

  const uomOptions = ['PCS', 'Pairs', 'KG', 'Grams', 'Boxes', 'Cartons', 'Sets', 'Dozens', 'Meters', 'Custom'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto pb-28">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Create New Order</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Order & Indent entry workspace</p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Columns: Main Order Entry Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* SECTION 1: ORDER INFORMATION */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">SECTION 1: ORDER INFORMATION</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Customer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  PO Number
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g. PO-12345"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                />
              </div>

              {/* Order Number (Auto-generated prompt) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Order Number (Auto-generated)
                </label>
                <input
                  type="text"
                  value={orderNumber || `${settings.orderPrefix || 'ORD-'}000XXX (Auto)`}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl text-sm text-muted-foreground font-mono outline-none cursor-not-allowed"
                />
              </div>

              {/* Indent Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Indent Number
                </label>
                <input
                  type="text"
                  value={indentNumber}
                  onChange={(e) => setIndentNumber(e.target.value)}
                  placeholder="e.g. IND-4567"
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary focus:bg-background rounded-xl text-sm text-foreground outline-none transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCTS ROW SYSTEM */}
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">SECTION 2: PRODUCTS</h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {productRows.length} Line Item{productRows.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Product Table System */}
            <div className="space-y-4">
              {productRows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground border-b border-border/60 pb-2">
                    <span>LINE ITEM #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(idx)}
                        className="p-1 hover:text-foreground hover:bg-muted rounded transition-colors"
                        title="Duplicate Row"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Catalog Selection */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Select Catalog Product
                      </label>
                      <select
                        value={row.product}
                        onChange={(e) => handleSelectProductMaster(idx, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-lg text-xs text-foreground outline-none"
                      >
                        <option value="">-- Select Product Master --</option>
                        {productsMaster.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku || p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Product Description */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Description <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                        placeholder="Enter item description or custom specification..."
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-lg text-xs text-foreground outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-lg text-xs text-foreground font-mono outline-none"
                      />
                    </div>

                    {/* UOM */}
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        UOM
                      </label>
                      <select
                        value={row.uom}
                        onChange={(e) => handleRowChange(idx, 'uom', e.target.value)}
                        className="w-full px-2 py-2 bg-background border border-border focus:border-primary rounded-lg text-xs text-foreground outline-none"
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

            {/* Add Line Item Button */}
            <button
              type="button"
              onClick={handleAddProductRow}
              className="w-full py-3 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Add Product Line Item
            </button>
          </div>
        </div>

        {/* Right 1-Column: ORDER SUMMARY SIDEBAR */}
        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">ORDER SUMMARY</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Selected Customer:</span>
                <span className="font-bold text-foreground truncate max-w-[160px]">
                  {selectedCustomerObj ? selectedCustomerObj.name : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium text-foreground">{date}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Line Items Count:</span>
                <span className="font-bold text-primary">{productRows.length} Products</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Total Units Aggregate:</span>
                <span className="font-extrabold text-foreground text-lg">{totalQuantity.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Validation Notice</p>
              <p>Saving as Draft allows subsequent editing. Submitting advances order to active status.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraftClick}
              disabled={loading}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            <button
              type="button"
              onClick={handleSubmitOrderClick}
              disabled={loading}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Order
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        onConfirm={() => executeSubmit('Submitted')}
        title="Submit Order"
        message="Are you sure you want to submit this order? Its status will change to Submitted."
        confirmText="Confirm & Submit"
        variant="primary"
        loading={loading}
      />
    </div>
  );
}
