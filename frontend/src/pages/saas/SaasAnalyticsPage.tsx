import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Building2, 
  Users, 
  RefreshCw,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';
import api from '../../services/api';

interface AnalyticsData {
  top_orgs_by_revenue: Array<{ name: string; revenue: number }>;
  monthly_registrations: Array<{ month: string; count: number }>;
  company_status_breakdown: Array<{ status: string; count: number }>;
  subscription_status_breakdown: Array<{ status: string; count: number }>;
}

export const SaasAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/saas/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics & SaaS Growth</h1>
          <p className="text-sm text-slate-500">Longitudinal registration velocity, top revenue accounts, and subscription health.</p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Row 1: Monthly Signups Velocity */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">12-Month Company Registration Velocity</h2>
            <p className="text-xs text-slate-500">New transport organizations onboarded per month</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
            Trailing 12 Months
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthly_registrations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Top Accounts by Revenue & Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Orgs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Top Logistics Accounts by Revenue</h2>
          <p className="text-xs text-slate-500 mb-4">Leading organizations by total paid subscription fees</p>

          <div className="space-y-3">
            {(!data?.top_orgs_by_revenue || data.top_orgs_by_revenue.length === 0) ? (
              <div className="text-xs text-slate-400 py-8 text-center">No revenue data available.</div>
            ) : (
              data.top_orgs_by_revenue.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{org.name}</span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    ₹{(org.revenue || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscription Health Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Subscription Health Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">Distribution of subscription statuses</p>

          <div className="space-y-3">
            {(data?.subscription_status_breakdown || []).map((sub, idx) => (
              <div key={sub.status} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 uppercase tracking-wide">
                  {sub.status}
                </span>
                <span className="px-2.5 py-1 rounded-full font-bold bg-white border border-slate-200 text-slate-900">
                  {sub.count} accounts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
