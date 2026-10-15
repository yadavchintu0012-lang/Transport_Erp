import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight,
  RefreshCw,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import api from '../../services/api';

interface DashboardData {
  period_days: number;
  companies: {
    total: number;
    active: number;
    suspended: number;
    demo: number;
    new_this_month: number;
    new_in_period: number;
  };
  subscriptions: {
    trial: number;
    active_paid: number;
    cancelled: number;
    suspended: number;
    expired: number;
    trial_to_paid_conversion_pct: number;
  };
  revenue: {
    total_collected: number;
    mrr: number;
    arr: number;
  };
  plan_distribution: Array<{ plan: string; count: number; code: string }>;
  registrations_chart: Array<{ date: string; registrations: number }>;
}

interface SaasDashboardProps {
  onNavigateTab: (tab: string, meta?: any) => void;
}

export const SaasDashboard: React.FC<SaasDashboardProps> = ({ onNavigateTab }) => {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/saas/dashboard?days=${days}`);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load SaaS metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [days]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Platform Super Admin
            </span>
            <span className="text-xs text-slate-400">• Realtime Metrics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">SaaS Management Command Center</h1>
          <p className="text-sm text-slate-500">Monitor all registered transport companies, subscriptions, MRR, and platform health.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { label: '7D', value: 7 },
              { label: '30D', value: 30 },
              { label: '90D', value: 90 },
              { label: '1Y', value: 365 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDays(option.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  days === option.value
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row 1: Companies & Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div 
          onClick={() => onNavigateTab('saas-accounts')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Companies</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {isLoading ? '...' : (data?.companies.total ?? 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center">
              <CheckCircle2 size={13} className="mr-1" />
              {data?.companies.active ?? 0} active
            </span>
            <span className="text-rose-500 font-semibold flex items-center">
              <ShieldAlert size={13} className="mr-1" />
              {data?.companies.suspended ?? 0} suspended
            </span>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Recurring (MRR)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {isLoading ? '...' : `₹${(data?.revenue.mrr ?? 0).toLocaleString('en-IN')}`}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>ARR: ₹{(data?.revenue.arr ?? 0).toLocaleString('en-IN')}</span>
            <span className="text-blue-600 font-semibold">{data?.subscriptions.active_paid ?? 0} paid subs</span>
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collected Rev</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {isLoading ? '...' : `₹${(data?.revenue.total_collected ?? 0).toLocaleString('en-IN')}`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Verified payments received across all organizations
          </div>
        </div>

        {/* Trial Conversion Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trial to Paid</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-3">
            {isLoading ? '...' : `${data?.subscriptions.trial_to_paid_conversion_pct ?? 0}%`}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{data?.subscriptions.trial ?? 0} active trials</span>
            <span className="text-slate-400">{data?.subscriptions.cancelled ?? 0} cancelled</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registrations Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">New Registrations Trend</h2>
              <p className="text-xs text-slate-500">Transport company signups over the selected period</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              +{data?.companies.new_in_period ?? 0} new in period
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.registrations_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickFormatter={(val) => val.slice(5)} 
                />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#regGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Plan Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Plan Distribution</h2>
              <p className="text-xs text-slate-500">Subscribers grouped by active tier</p>
            </div>
            <button
              onClick={() => onNavigateTab('saas-plans')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
            >
              Plans <ArrowUpRight size={14} className="ml-0.5" />
            </button>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.plan_distribution || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="plan" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 flex-1">
            {(data?.plan_distribution || []).map((p) => (
              <div key={p.code} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{p.plan}</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                  {p.count} accounts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateTab('saas-accounts')}
          className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <Building2 className="text-blue-400" size={24} />
            <ArrowUpRight className="text-slate-400 group-hover:text-white transition-colors" size={20} />
          </div>
          <h3 className="font-bold text-lg mt-3">Manage Transport Companies</h3>
          <p className="text-xs text-slate-300 mt-1">Browse, filter, suspend, reactivate or alter plans for any registered logistics business.</p>
        </div>

        <div 
          onClick={() => onNavigateTab('saas-plans')}
          className="p-5 rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-800 text-white cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <Layers className="text-indigo-300" size={24} />
            <ArrowUpRight className="text-slate-400 group-hover:text-white transition-colors" size={20} />
          </div>
          <h3 className="font-bold text-lg mt-3">Pricing & Subscription Tiers</h3>
          <p className="text-xs text-slate-300 mt-1">Configure starter, professional, and enterprise tiers, monthly/annual fees, and fleet limits.</p>
        </div>

        <div 
          onClick={() => onNavigateTab('saas-analytics')}
          className="p-5 rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 text-white cursor-pointer hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="text-blue-300" size={24} />
            <ArrowUpRight className="text-slate-400 group-hover:text-white transition-colors" size={20} />
          </div>
          <h3 className="font-bold text-lg mt-3">Platform Analytics & Growth</h3>
          <p className="text-xs text-slate-300 mt-1">Deep-dive into 12-month registration velocity, top accounts by billing, and subscription retention.</p>
        </div>
      </div>
    </div>
  );
};
