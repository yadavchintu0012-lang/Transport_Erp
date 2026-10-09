import React, { useState, useEffect } from 'react';
import { Settings, Shield, Clock } from 'lucide-react';
import api from '../services/api';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit/');
        setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800">Security & Operational Audit Trail</h2>
        <p className="text-xs text-slate-500">Immutable ledger of employee actions, trip dispatching, financial updates, and logins.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                  {l.created_at ? new Date(l.created_at).toLocaleString() : ''}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">{l.user_name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                    {l.action}
                  </span>
                </td>
                <td className="py-3 px-4">{l.entity_name || 'System'}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                  {JSON.stringify(l.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
