import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Tag, Download } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { exportProductsToExcel } from '../utils/excelExporter';

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'General',
    defaultUOM: 'PCS'
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&limit=12&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setProducts(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', description: '', category: 'General', defaultUOM: 'PCS' });
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      description: prod.description || '',
      category: prod.category || 'General',
      defaultUOM: prod.defaultUOM || 'PCS'
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Product name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, formData);
        if (res.success) {
          toast.success('Product updated successfully!');
          setModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.post('/products', formData);
        if (res.success) {
          toast.success('Product created successfully!');
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/products/${deleteId}`);
      if (res.success) {
        toast.success('Product removed from catalog.');
        setDeleteId(null);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const uomOptions = ['PCS', 'Pairs', 'KG', 'Grams', 'Boxes', 'Cartons', 'Sets', 'Dozens', 'Meters', 'Custom'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Product Catalog Master</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage product specifications, SKUs & default units of measure.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportProductsToExcel(products)}
            className="px-3.5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product Item
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
              placeholder="Search product name, SKU, description..."
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

      {/* Product Catalog Datatable */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="Add items to your catalog to enable fast auto-population during order creation."
          actionButton={
            <button onClick={openAddModal} className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow">
              Add First Product
            </button>
          }
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU / Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Default UOM</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">{prod.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono font-semibold text-primary">
                      {prod.sku || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-muted text-muted-foreground">
                        {prod.defaultUOM}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                      {prod.description || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(prod._id)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground">{editingProduct ? 'Edit Product Item' : 'Add New Product'}</h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premium Cotton Yarn 40s"
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">SKU / Code (Unique)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-YRN-40S"
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Packaging, Textiles..."
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Default UOM *</label>
                <select
                  value={formData.defaultUOM}
                  onChange={(e) => setFormData({ ...formData, defaultUOM: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                >
                  {uomOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Default description pre-filled in order creation..."
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
                  {saving ? 'Saving...' : 'Save Product'}
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
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to remove this product from the master catalog?"
        confirmText="Delete Product"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
