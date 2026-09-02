import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, User, Clock, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/common/Pagination';
import TableSkeleton from '../components/common/TableSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const toast = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let endpoint = `/activity-logs?page=${page}&limit=20&search=${encodeURIComponent(search)}`;
      if (actionFilter) endpoint += `&action=${actionFilter}`;
      if (entityFilter) endpoint += `&entityType=${entityFilter}`;

      const res = await api.get(endpoint);
      if (res.success) {
        setLogs(res.data || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> System Activity & Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete audit trail of user logins, order edits, status modifications & system changes (Admin Only).
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, entity name or description..."
              className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs text-foreground outline-none"
          >
            <option value="">All Entity Types</option>
            <option value="Order">Order</option>
            <option value="Customer">Customer</option>
            <option value="Product">Product</option>
            <option value="User">User</option>
            <option value="Settings">Settings</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
          </button>
        </form>
      </div>

      {/* Logs Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Activity Logs Found"
          description="There are no audit trail log entries recorded matching your query."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-secondary border border-border text-foreground font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-primary">{log.entityName || log.entityType}</td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-md">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}
