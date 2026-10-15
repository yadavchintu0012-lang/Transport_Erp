import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  CreditCard, 
  Users, 
  Truck, 
  FileText, 
  Clock, 
  Lock, 
  Plus, 
  MessageSquare,
  History,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../../services/api';

interface AccountDetail {
  organization: {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    tax_number: string | null;
    currency: string;
    logo_url: string | null;
    is_active: boolean;
    is_demo: boolean;
    created_at: string | null;
    updated_at: string | null;
  };
  subscription: {
    id: string | null;
    status: string | null;
    billing_cycle: string | null;
    start_date: string | null;
    trial_end_date: string | null;
    expiry_date: string | null;
    auto_renew: boolean | null;
    suspended_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    amount_paid: number;
    plan: {
      id: string;
      name: string;
      code: string;
      price_monthly: number;
      price_yearly: number;
      max_vehicles: number;
      max_staff: number;
      max_trips_monthly: number;
      features: string[];
    } | null;
  } | null;
  members: Array<{
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    role_code: string;
    is_active: boolean;
    joined_at: string | null;
    last_login: string | null;
  }>;
  usage: {
    vehicles: number;
    drivers: number;
    trips: number;
    invoices: number;
    plan_limits: {
      max_vehicles?: number;
      max_staff?: number;
      max_trips_monthly?: number;
    };
  };
  recent_activity: Array<{
    action: string;
    entity: string;
    entity_id: string;
    details: any;
    created_at: string | null;
    user_id: string;
  }>;
  admin_notes: Array<{
    id: string;
    note: string;
    category: string;
    created_by: string;
    created_at: string | null;
  }>;
}

interface SaasAccountDetailPageProps {
  orgId: string;
  onBack: () => void;
}

export const SaasAccountDetailPage: React.FC<SaasAccountDetailPageProps> = ({ orgId, onBack }) => {
  const [data, setData] = useState<AccountDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'members' | 'usage' | 'notes' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note form
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] = useState('general');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Plan modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState('professional');
  const [planChangeReason, setPlanChangeReason] = useState('');
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/saas/accounts/${orgId}`);
      setData(res.data);
      if (res.data?.subscription?.plan?.code) {
        setSelectedPlanCode(res.data.subscription.plan.code);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load organization details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orgId]);

  const handleToggleStatus = async () => {
    if (!data) return;
    const isActivating = !data.organization.is_active;
    const confirmMsg = isActivating
      ? `Reactivate account '${data.organization.name}'?`
      : `Suspend account '${data.organization.name}'? All users will lose system access.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (isActivating) {
        await api.patch(`/admin/saas/accounts/${orgId}/activate`, {});
      } else {
        const reason = prompt('Enter suspension reason:', 'Admin manual suspension');
        if (!reason) return;
        await api.patch(`/admin/saas/accounts/${orgId}/suspend`, { reason });
      }
      fetchDetail();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update organization status.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await api.post(`/admin/saas/accounts/${orgId}/notes`, {
        note: newNote,
        category: noteCategory
      });
      setNewNote('');
      fetchDetail();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to save admin note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleChangePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPlan(true);
    try {
      await api.patch(`/admin/saas/accounts/${orgId}/plan`, {
        plan_code: selectedPlanCode,
        reason: planChangeReason
      });
      setPlanModalOpen(false);
      setPlanChangeReason('');
      fetchDetail();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to change plan.');
    } finally {
      setIsChangingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="animate-spin inline-block mr-2" size={24} />
        Loading organization profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center text-sm text-blue-600 font-semibold mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Accounts
        </button>
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error || 'Organization profile not found.'}
        </div>
      </div>
    );
  }

  const { organization, subscription, members, usage, recent_activity, admin_notes } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={14} className="mr-1.5" />
        Back to Transport Accounts
      </button>

      {/* Account Hero Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md shadow-blue-500/20">
            {organization.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{organization.name}</h1>
              {organization.is_active ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                  Suspended
                </span>
              )}
              {organization.is_demo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  DEMO ORG
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4">
              <span>ID: <code className="text-slate-600">{organization.id}</code></span>
              <span>Slug: {organization.slug}</span>
              <span>Created: {new Date(organization.created_at || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPlanModalOpen(true)}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center"
          >
            <CreditCard size={14} className="mr-1.5 text-blue-600" />
            Change Plan
          </button>

          {organization.is_active ? (
            <button
              onClick={handleToggleStatus}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center"
            >
              <ShieldAlert size={14} className="mr-1.5" />
              Suspend Account
            </button>
          ) : (
            <button
              onClick={handleToggleStatus}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center"
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              Reactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 text-sm overflow-x-auto">
        {[
          { id: 'overview', label: 'Company Overview', icon: Building2 },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'members', label: `Staff & Users (${members.length})`, icon: Users },
          { id: 'usage', label: 'Operational Usage', icon: Truck },
          { id: 'notes', label: `Admin Notes (${admin_notes.length})`, icon: MessageSquare },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Business Contact Details</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-medium text-slate-800">{organization.email || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number</span>
                <span className="font-medium text-slate-800">{organization.phone || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">GSTIN / Tax Number</span>
                <span className="font-medium text-slate-800">{organization.tax_number || 'Unregistered'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Currency</span>
                <span className="font-medium text-slate-800">{organization.currency}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Registered Operating Address</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block">Street Address</span>
                <span className="font-medium text-slate-800">{organization.address || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 block">City</span>
                  <span className="font-medium text-slate-800">{organization.city || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">State</span>
                  <span className="font-medium text-slate-800">{organization.state || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Postal Code</span>
                  <span className="font-medium text-slate-800">{organization.postal_code || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription & Billing */}
      {activeTab === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Current Subscription Tier</h3>
                <p className="text-xs text-slate-500">Assigned tier and billing cadence</p>
              </div>
              <button
                onClick={() => setPlanModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Upgrade / Downgrade
              </button>
            </div>

            {subscription?.plan ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Plan Name</span>
                  <span className="text-sm font-bold text-slate-900">{subscription.plan.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Monthly Price</span>
                  <span className="text-sm font-bold text-slate-900">₹{subscription.plan.price_monthly}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Billing Cycle</span>
                  <span className="text-sm font-bold text-slate-900 uppercase">{subscription.billing_cycle || 'Monthly'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block">Subscription Status</span>
                  <span className="text-sm font-bold text-emerald-600 uppercase">{subscription.status}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-xs">
                No active plan associated with this transport organization.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <span className="text-slate-400 block">Start Date</span>
                <span className="font-medium text-slate-800">
                  {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Trial End Date</span>
                <span className="font-medium text-slate-800">
                  {subscription?.trial_end_date ? new Date(subscription.trial_end_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiry Date</span>
                <span className="font-medium text-slate-800">
                  {subscription?.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString() : 'Unlimited / Auto'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Revenue Summary</h3>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <span className="text-xs text-emerald-700 block font-semibold">Total Revenue Collected</span>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                ₹{(subscription?.amount_paid || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">Directly recorded collected payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Staff & Users */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined At</th>
                <th className="py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {members.map((m) => (
                <tr key={m.user_id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{m.full_name}</div>
                    <div className="text-slate-400">{m.email} {m.phone ? `• ${m.phone}` : ''}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {m.is_active ? (
                      <span className="text-emerald-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Disabled</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {m.last_login ? new Date(m.last_login).toLocaleString() : 'Never logged in'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Usage */}
      {activeTab === 'usage' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 uppercase font-semibold">Registered Vehicles</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{usage.vehicles}</div>
            <div className="text-xs text-slate-500 mt-1">
              Plan limit: {usage.plan_limits.max_vehicles ? `${usage.plan_limits.max_vehicles} trucks` : 'Unlimited'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 uppercase font-semibold">Drivers on Roster</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{usage.drivers}</div>
            <div className="text-xs text-slate-500 mt-1">Active drivers assigned</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Trips Executed</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{usage.trips}</div>
            <div className="text-xs text-slate-500 mt-1">
              Monthly quota: {usage.plan_limits.max_trips_monthly || 'Unlimited'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-400 uppercase font-semibold">Freight Invoices</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{usage.invoices}</div>
            <div className="text-xs text-slate-500 mt-1">Billed freight ledger entries</div>
          </div>
        </div>
      )}

      {/* Tab 5: Admin Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Add Private Super Admin Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex gap-3">
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="billing">Billing & Dues</option>
                  <option value="support">Support Escalation</option>
                  <option value="compliance">Compliance / Fraud</option>
                </select>
                <input
                  type="text"
                  placeholder="Record note, customer request, or administrative reason..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  {isAddingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
            {admin_notes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No internal admin notes recorded for this organization yet.
              </div>
            ) : (
              admin_notes.map((n) => (
                <div key={n.id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{n.created_by}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {n.category}
                      </span>
                      <span className="text-slate-400">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600">{n.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Audit Activity */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recent_activity.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{a.action}</td>
                  <td className="py-3 px-4 text-slate-500">{a.entity} ({a.entity_id?.slice(0, 8)})</td>
                  <td className="py-3 px-4 text-slate-600">
                    <code className="text-[11px] bg-slate-50 p-1 rounded">
                      {typeof a.details === 'object' ? JSON.stringify(a.details) : a.details || '—'}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Plan Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Change Subscription Plan</h3>
              <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Tier</label>
                <select
                  value={selectedPlanCode}
                  onChange={(e) => setSelectedPlanCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                >
                  <option value="starter">Starter Fleet (5 Vehicles, ₹1,499/mo)</option>
                  <option value="professional">Professional Logistics (25 Vehicles, ₹3,999/mo)</option>
                  <option value="enterprise">Enterprise Freight (100 Vehicles, ₹8,999/mo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Administrative Change</label>
                <textarea
                  value={planChangeReason}
                  onChange={(e) => setPlanChangeReason(e.target.value)}
                  placeholder="e.g. Upgraded upon request, promotional override..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPlan}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {isChangingPlan ? 'Updating...' : 'Save Plan Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
