import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

interface Account {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  tax_number: string | null;
  is_active: boolean;
  is_demo: boolean;
  created_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_last_login: string | null;
  user_count: number;
  vehicle_count: number;
  subscription: {
    status: string;
    billing_cycle: string;
    start_date: string | null;
    expiry_date: string | null;
    trial_end_date: string | null;
    amount_paid: number;
    plan_name: string | null;
    plan_code: string | null;
    price_monthly: number;
  } | null;
}

interface SaasAccountsPageProps {
  onSelectAccount: (orgId: string) => void;
}

export const SaasAccountsPage: React.FC<SaasAccountsPageProps> = ({ onSelectAccount }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [subStatus, setSubStatus] = useState<string>('');
  const [planCode, setPlanCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | 'change_plan' | null;
    account: Account | null;
  }>({ type: null, account: null });
  const [actionReason, setActionReason] = useState('');
  const [targetPlan, setTargetPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (subStatus) params.append('sub_status', subStatus);
      if (planCode) params.append('plan_code', planCode);
      params.append('page', page.toString());
      params.append('per_page', '15');

      const res = await api.get(`/admin/saas/accounts?${params.toString()}`);
      setAccounts(res.data.accounts);
      setTotal(res.data.total);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, status, subStatus, planCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAccounts();
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/admin/saas/accounts/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transport_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Could not export CSV');
    }
  };

  const executeAction = async () => {
    if (!actionModal.account) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const orgId = actionModal.account.id;
      if (actionModal.type === 'suspend') {
        await api.patch(`/admin/saas/accounts/${orgId}/suspend`, { reason: actionReason });
      } else if (actionModal.type === 'activate') {
        await api.patch(`/admin/saas/accounts/${orgId}/activate`, { reason: actionReason });
      } else if (actionModal.type === 'change_plan') {
        await api.patch(`/admin/saas/accounts/${orgId}/plan`, { plan_code: targetPlan, reason: actionReason });
      }
      setActionModal({ type: null, account: null });
      setActionReason('');
      fetchAccounts();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transport Companies & Accounts</h1>
          <p className="text-sm text-slate-500">Directory of all registered logistics organizations ({total} total)</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchAccounts}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition-colors"
            title="Reload Accounts"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by company name, owner email, GSTIN, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 flex items-center">
            <Filter size={13} className="mr-1.5" /> Filters:
          </span>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={subStatus}
            onChange={(e) => { setSubStatus(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">Subscription: All</option>
            <option value="active">Active Paid</option>
            <option value="trial">Free Trial</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={planCode}
            onChange={(e) => { setPlanCode(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="">Plan: All</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {(search || status || subStatus || planCode) && (
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setSubStatus('');
                setPlanCode('');
                setPage(1);
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Primary Contact / Owner</th>
                <th className="py-3 px-4">Plan & Billing</th>
                <th className="py-3 px-4">Fleet / Staff</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                    Loading accounts...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transport companies matched your search criteria.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                          {acc.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center">
                            {acc.name}
                            {acc.is_demo && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {acc.city ? `${acc.city}, ` : ''}{acc.state || 'India'}
                            {acc.tax_number ? ` • GSTIN: ${acc.tax_number}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{acc.owner_name || 'No Owner Assigned'}</div>
                      <div className="text-xs text-slate-400">{acc.owner_email || acc.email || '—'}</div>
                      {acc.owner_last_login && (
                        <div className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <Clock size={11} className="mr-1" />
                          Login: {new Date(acc.owner_last_login).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      {acc.subscription?.plan_name ? (
                        <div>
                          <span className="font-semibold text-slate-900">{acc.subscription.plan_name}</span>
                          <div className="text-xs text-slate-400">
                            ₹{acc.subscription.price_monthly}/mo • {acc.subscription.billing_cycle}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Active Plan</span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3 text-xs text-slate-600">
                        <span className="flex items-center" title="Vehicles">
                          <Truck size={13} className="mr-1 text-slate-400" />
                          {acc.vehicle_count}
                        </span>
                        <span className="flex items-center" title="Staff Members">
                          <Users size={13} className="mr-1 text-slate-400" />
                          {acc.user_count}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>
                          {acc.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                              Suspended
                            </span>
                          )}
                        </div>
                        {acc.subscription?.status && (
                          <div className="text-[11px] uppercase font-bold text-slate-400">
                            Sub: {acc.subscription.status}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {acc.created_at ? new Date(acc.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectAccount(acc.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center"
                          title="View Details"
                        >
                          <Eye size={13} className="mr-1" />
                          View
                        </button>

                        {acc.is_active ? (
                          <button
                            onClick={() => {
                              setActionModal({ type: 'suspend', account: acc });
                              setActionReason('');
                              setActionError(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Suspend Company"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActionModal({ type: 'activate', account: acc });
                              setActionReason('');
                              setActionError(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                            title="Reactivate Company"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {accounts.length} of {total} accounts</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Suspend / Activate / Change Plan Modal */}
      {actionModal.type && actionModal.account && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                {actionModal.type === 'suspend' && 'Suspend Company Account'}
                {actionModal.type === 'activate' && 'Reactivate Company Account'}
                {actionModal.type === 'change_plan' && 'Modify Subscription Plan'}
              </h3>
              <button
                onClick={() => setActionModal({ type: null, account: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <div className="text-sm text-slate-600">
              Target: <strong className="text-slate-900">{actionModal.account.name}</strong>
            </div>

            {actionModal.type === 'suspend' && (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start space-x-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>Suspending this account prevents all company members from logging in and executing trips.</span>
                </div>
                <label className="block text-xs font-semibold text-slate-700 mt-2">Reason for Suspension</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Non-payment of subscription dues, terms of service violation..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            )}

            {actionModal.type === 'activate' && (
              <p className="text-xs text-slate-500">
                Are you sure you want to reactivate this organization? Its staff members will immediately regain full access to their operations and dashboards.
              </p>
            )}

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal({ type: null, account: null })}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeAction}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors ${
                  actionModal.type === 'suspend'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
