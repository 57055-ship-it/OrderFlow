import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Users, Building, Mail, Phone, MapPin, Download } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { exportCustomersToExcel } from '../utils/excelExporter';

export default function CustomersListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal State for Add / Edit Customer
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?page=${page}&limit=12&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setCustomers(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', companyName: '', contactPerson: '', phone: '', email: '', address: '', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      companyName: cust.companyName || '',
      contactPerson: cust.contactPerson || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      notes: cust.notes || ''
    });
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Customer name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        const res = await api.put(`/customers/${editingCustomer._id}`, formData);
        if (res.success) {
          toast.success('Customer updated successfully!');
          setModalOpen(false);
          fetchCustomers();
        }
      } else {
        const res = await api.post('/customers', formData);
        if (res.success) {
          toast.success('New customer created!');
          setModalOpen(false);
          fetchCustomers();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/customers/${deleteId}`);
      if (res.success) {
        toast.success('Customer removed successfully.');
        setDeleteId(null);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Customer Directory</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage client accounts, contact details & indents history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCustomersToExcel(customers)}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name, company, email..."
              className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customer List */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customers Found"
          description="Add your first customer to start assigning order indents."
          actionButton={
            <button onClick={openAddModal} className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow">
              Add Customer
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((cust) => (
            <div key={cust._id} className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-tight">{cust.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{cust.companyName || 'Individual Client'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                  {cust.contactPerson && (
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" /> {cust.contactPerson}
                    </p>
                  )}
                  {cust.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {cust.email}
                    </p>
                  )}
                  {cust.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {cust.phone}
                    </p>
                  )}
                  {cust.address && (
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {cust.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/customers/${cust._id}`)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Details & Orders &rarr;
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(cust)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted" title="Edit">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(cust._id)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={(p) => setPage(p)} />

      {/* Add / Edit Customer Form Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Inc."
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Robert Vance"
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Billing / Delivery Address..."
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions or terms..."
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none h-20"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-secondary border border-border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl shadow"
                >
                  {saving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? Orders associated with this customer must be cleared first."
        confirmText="Delete Customer"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
