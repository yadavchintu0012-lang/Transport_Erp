import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Search
} from 'lucide-react';
import api from '../../services/api';

interface PlatformLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  details: any;
  user_id: string;
  ip_address: string | null;
  created_at: string | null;
}

export const SaasAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<PlatformLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/saas/audit-logs?page=${page}&per_page=25`);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Administrative Audit Trail</h1>
          <p className="text-sm text-slate-500">Immutable ledger of platform-level events, tenant overrides, and administrative operations.</p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Payload / Context</th>
                <th className="py-3 px-4">Admin User ID</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No platform audit events recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.entity} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      <code className="text-[11px]">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {log.user_id ? log.user_id.slice(0, 8) : 'System'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total platform records: {total}</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-semibold text-slate-800">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < 25}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
