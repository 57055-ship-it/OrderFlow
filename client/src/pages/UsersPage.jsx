import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit, Trash2, Shield, Lock, Mail, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'EMPLOYEE', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'EMPLOYEE',
      isActive: u.isActive !== undefined ? u.isActive : true
    });
    setModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required.');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Password is required when creating a user.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const res = await api.put(`/users/${editingUser._id}`, formData);
        if (res.success) {
          toast.success('User updated successfully!');
          setModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await api.post('/users', formData);
        if (res.success) {
          toast.success('New user created!');
          setModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      const res = await api.patch(`/users/${u._id}/status`, { isActive: !u.isActive });
      if (res.success) {
        toast.success(`User ${u.name} ${!u.isActive ? 'activated' : 'deactivated'}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Status change failed');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/users/${deleteId}`);
      if (res.success) {
        toast.success('User removed successfully.');
        setDeleteId(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> User & Role Access Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure application user credentials, roles (Admin, Manager, Employee) & account active status.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Users Datatable */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">{u.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                            : u.role === 'MANAGER'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-all ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(u._id)}
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
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground">{editingUser ? 'Edit User Credentials' : 'Add New User'}</h3>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Password {editingUser ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">Account Active</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
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
                  {saving ? 'Saving...' : 'Save User'}
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
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user account? The action cannot be performed on the last active administrator."
        confirmText="Delete User"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
