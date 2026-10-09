import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Receipt, 
  AlertTriangle, 
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  Users,
  MapPin,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const [filterPeriod, setFilterPeriod] = useState('30_days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const canViewFinancials = hasPermission('dashboard', 'view_financials');
  const canViewProfit = hasPermission('dashboard', 'view_profit');

  const fetchMetrics = async (overrideStart?: string, overrideEnd?: string) => {
    setLoading(true);
    try {
      let startDate = overrideStart !== undefined ? overrideStart : '';
      let endDate = overrideEnd !== undefined ? overrideEnd : '';

      if (!isCustomMode && !overrideStart && !overrideEnd) {
        const now = new Date();
        if (filterPeriod === 'today') {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          startDate = d.toISOString();
        } else if (filterPeriod === '7_days') {
          const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          startDate = d.toISOString();
        } else if (filterPeriod === '30_days') {
          const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          startDate = d.toISOString();
        } else if (filterPeriod === 'this_month') {
          const d = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate = d.toISOString();
        } else if (filterPeriod === '90_days') {
          const d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          startDate = d.toISOString();
        } else if (filterPeriod === 'all') {
          startDate = '';
          endDate = '';
        }
      }

      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get('/dashboard/metrics', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCustomMode) {
      fetchMetrics();
    }
  }, [filterPeriod, isCustomMode]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStartDate) {
      alert('Please select a From date');
      return;
    }
    const startIso = new Date(customStartDate + 'T00:00:00').toISOString();
    const endIso = customEndDate ? new Date(customEndDate + 'T23:59:59').toISOString() : '';
    fetchMetrics(startIso, endIso);
  };

  const handlePresetSelect = (preset: string) => {
    setIsCustomMode(false);
    setFilterPeriod(preset);
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { kpis, charts, widgets } = data;
  const PIE_COLORS = ['#2563eb', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Filter Bar with Custom Date Range Calendar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Operational & Financial Overview</h2>
            <p className="text-xs text-slate-500">Live operational metrics, profit margins, and revenue analytics derived directly from real database records.</p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: '7_days', label: '7 Days' },
              { id: '30_days', label: '30 Days' },
              { id: 'this_month', label: 'This Month' },
              { id: '90_days', label: 'Quarter' },
              { id: 'all', label: 'All Time' }
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !isCustomMode && filterPeriod === preset.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isCustomMode 
                  ? 'bg-blue-50 text-blue-700 border-blue-300' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar size={13} />
              <span>Calendar Range</span>
            </button>
          </div>
        </div>

        {/* Custom Calendar Date Range Picker (From Date -> To Date) */}
        {isCustomMode && (
          <form 
            onSubmit={handleApplyCustomRange} 
            className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-xs text-slate-700 font-semibold">
              <Calendar size={15} className="text-blue-600" />
              <span>Select Date Range:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-500 font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                required
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-500 font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Apply Range
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setIsCustomMode(false);
                  setFilterPeriod('30_days');
                }}
                className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KPI Cards Grid (Featuring Monthly Revenue & Due Amount KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Monthly Revenue KPI */}
        {canViewFinancials && (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Monthly Revenue</span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><Calendar size={16} /></div>
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              INR {(kpis.monthly_revenue || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Profit: <span className="text-emerald-600 font-semibold">INR {(kpis.monthly_profit || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Selected Period Freight Revenue */}
        {canViewFinancials && (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-indigo-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Period Revenue</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><IndianRupee size={16} /></div>
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              INR {kpis.total_freight_revenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Paid: <span className="text-emerald-600 font-semibold">INR {(kpis.total_amount_paid || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Outstanding Due Amount KPI (Requested!) */}
        {canViewFinancials && (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs cursor-pointer hover:border-rose-500 hover:shadow-sm transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Due Amount</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><IndianRupee size={16} /></div>
            </div>
            <div className="mt-2 text-xl font-bold text-rose-600">
              INR {(kpis.total_due_amount || kpis.pending_receivables || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Unpaid client freight
            </div>
          </div>
        )}

        {/* Operating Profit */}
        {canViewProfit ? (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('reports')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Profit</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
            </div>
            <div className="mt-2 text-xl font-bold text-emerald-600">
              INR {kpis.operating_profit.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Net margin deducted
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Crew</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={16} /></div>
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">{kpis.active_drivers} Drivers</div>
            <div className="mt-1 text-[11px] text-slate-500">Active roster on road</div>
          </div>
        )}

        {/* Total Trips */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('trips')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Trips</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={16} /></div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{kpis.total_trips}</div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 space-x-1.5">
            <span className="text-emerald-600 font-medium">{kpis.completed_trips} done</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{kpis.trips_in_progress} active</span>
          </div>
        </div>

        {/* Fleet Availability */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('vehicles')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fleet Status</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={16} /></div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{kpis.available_vehicles} / {kpis.total_vehicles}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span className="text-blue-600 font-semibold">{kpis.active_vehicles} on road</span>, {kpis.available_vehicles} ready
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Monthly Trend History & Cost Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Profit Trend History */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monthly Revenue & Profit Tracking</h3>
              <p className="text-[11px] text-slate-400">Month-on-month comparison of billing, operating costs, and net margin.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              Monthly Trend
            </span>
          </div>
          <div className="h-72">
            {charts.monthly_trend && charts.monthly_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly_trend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `INR ${Number(val).toLocaleString('en-IN')}`,
                      name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Total Costs' : 'Net Margin'
                    ]} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(v) => v === 'revenue' ? 'Revenue' : v === 'expenses' ? 'Total Costs' : 'Net Profit'} 
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" name="expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="profit" name="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No monthly data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cost Category Breakdown</h3>
              <p className="text-[11px] text-slate-400">Distribution across diesel, toll, labour & overheads.</p>
            </div>
            <Receipt size={16} className="text-slate-400" />
          </div>
          <div className="h-72">
            {charts.expense_breakdown && charts.expense_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.expense_breakdown}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.expense_breakdown.map((_: any, index: number) => (
                      <Cell key={"cell-" + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => ["INR " + Number(v).toLocaleString("en-IN"), "Amount"]} />
                  <Legend verticalAlign="bottom" height={40} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No expense records in this range.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Top Freight Lanes & Vehicle Fleet Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top High-Yield Routes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <MapPin size={16} className="text-blue-600" />
                <span>Top Freight Routes by Revenue</span>
              </h3>
              <p className="text-[11px] text-slate-400">Highest grossing transport lanes and dispatch frequency.</p>
            </div>
            <span className="text-xs text-slate-400">Route Analytics</span>
          </div>
          <div className="h-64">
            {charts.top_routes && charts.top_routes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.top_routes} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="route" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      name === 'revenue' ? `INR ${Number(val).toLocaleString('en-IN')}` : val,
                      name === 'revenue' ? 'Revenue' : 'Trips'
                    ]} 
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No route movements in selected period.
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Fleet Profitability & Output */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Truck size={16} className="text-emerald-600" />
                <span>Fleet Vehicle Contribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">Gross revenue vs net operating margin per commercial vehicle.</p>
            </div>
            <span className="text-xs text-slate-400">Asset Yield</span>
          </div>
          <div className="h-64">
            {charts.vehicle_performance && charts.vehicle_performance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.vehicle_performance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `INR ${Number(val).toLocaleString('en-IN')}`,
                      name === 'revenue' ? 'Total Revenue' : 'Net Margin'
                    ]} 
                  />
                  <Legend verticalAlign="top" height={30} formatter={(v) => v === 'revenue' ? 'Revenue' : 'Net Profit'} />
                  <Bar dataKey="revenue" name="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="profit" name="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No vehicle trip assignments found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Daily Timeline Trend Area Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Revenue vs Direct Expenses (Selected Period)</h3>
            <p className="text-[11px] text-slate-400">Daily trajectory of freight billings and operational trip expenses.</p>
          </div>
          <span className="text-xs text-slate-400">Daily Timeline</span>
        </div>
        <div className="h-60">
          {charts.timeline && charts.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.timeline}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`INR ${Number(v).toLocaleString('en-IN')}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Direct Expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No daily transactions in the selected date range.
            </div>
          )}
        </div>
      </div>

      {/* Widgets: Recent Trips & Expiry Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table Widget */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Trip Entries</h3>
            <button 
              onClick={() => onNavigateTab && onNavigateTab('trips')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All <ArrowUpRight size={13} className="ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Trip ID</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {widgets.recent_trips.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-semibold text-blue-700">{trip.trip_number}</td>
                    <td className="py-2 px-3">{trip.route}</td>
                    <td className="py-2 px-3">{trip.vehicle}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full font-medium text-[11px] ">
                        {trip.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiry Alerts Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Compliance & Expiry Alerts</h3>
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
          <div className="space-y-3">
            {widgets.expiry_alerts.length > 0 ? (
              widgets.expiry_alerts.map((alert: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-start space-x-3">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-amber-900">{alert.type}: {alert.target}</div>
                    <div className="text-amber-700">Expires on {alert.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                All vehicle insurances and permits are up to date!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
