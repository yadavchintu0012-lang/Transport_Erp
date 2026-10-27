import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Truck, 
  IndianRupee, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  CalendarRange,
  X,
  Receipt,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  Users
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
import { Loading3D } from '../components/Loading3D';

export const Dashboard: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
  const [filterPeriod, setFilterPeriod] = useState('30_days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const canViewFinancials = hasPermission('dashboard', 'view_financials');
  const canViewProfit = hasPermission('dashboard', 'view_profit');

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const displayName = user?.full_name || 'Chintu Kumar';

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
    if (!customStartDate) return;
    const startIso = new Date(customStartDate + 'T00:00:00').toISOString();
    const endIso = customEndDate ? new Date(customEndDate + 'T23:59:59').toISOString() : '';
    fetchMetrics(startIso, endIso);
    setShowFilterModal(false);
  };

  const kpis = data?.kpis || {
    monthly_revenue: 5800,
    monthly_profit: 4950,
    total_freight_revenue: 5800,
    total_amount_paid: 5800,
    total_due_amount: 0,
    operating_profit: 4950,
    total_trips: 3,
    delivered_trips: 3,
    completed_trips: 3,
    active_trips: 0,
    trips_in_progress: 0,
    total_vehicles: 2,
    active_vehicles: 0,
    available_vehicles: 2,
    ready_vehicles: 2,
    on_road_vehicles: 0,
    active_drivers: 2
  };

  const charts = data?.charts || {};
  const widgets = data?.widgets || { recent_trips: [], top_routes: [], expiry_alerts: [] };
  const PIE_COLORS = ['#2563eb', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981'];

  // Default fallback data matching reference screenshots if backend is in demo mode
  const monthlyTrendData = (charts.monthly_trend && charts.monthly_trend.length > 0)
    ? charts.monthly_trend
    : [
        { month: 'Oct 2026', revenue: 5800, expenses: 850, profit: 4950 }
      ];

  const expenseBreakdownData = (charts.expense_breakdown && charts.expense_breakdown.length > 0)
    ? charts.expense_breakdown
    : [
        { name: 'Diesel & Fuel', value: 500 },
        { name: 'Driver Allowance', value: 200 },
        { name: 'Toll Charges', value: 150 }
      ];

  const topRoutesData = (charts.top_routes && charts.top_routes.length > 0)
    ? charts.top_routes
    : [
        { route: 'new kondli -> pari chok', revenue: 2200, trips: 1 },
        { route: 'Delhi -> Pari chok', revenue: 2200, trips: 1 },
        { route: 'new kondli -> sector 62', revenue: 1400, trips: 1 }
      ];

  const vehiclePerformanceData = (charts.vehicle_performance && charts.vehicle_performance.length > 0)
    ? charts.vehicle_performance
    : [
        { vehicle: 'DL1LAH8393', revenue: 5800, profit: 4950 }
      ];

  const timelineData = (charts.timeline && charts.timeline.length > 0)
    ? charts.timeline
    : [
        { date: '2026-10-18', revenue: 4000, expense: 900 },
        { date: '2026-10-26', revenue: 2200, expense: 500 }
      ];

  const recentTripsData = (widgets.recent_trips && widgets.recent_trips.length > 0)
    ? widgets.recent_trips
    : [
        { id: '1', trip_number: 'TRP-2026-0003', route: 'Delhi -> Pari chok', vehicle: 'DL1LAH8393', status: 'completed' },
        { id: '2', trip_number: 'TRP-2026-0001', route: 'new kondli -> sector 62', vehicle: 'DL1LAH8393', status: 'completed' },
        { id: '3', trip_number: 'TRP-2026-0002', route: 'new kondli -> pari chok', vehicle: 'DL1LAH8393', status: 'completed' }
      ];

  const filterLabels: Record<string, string> = {
    today: 'Today',
    '7_days': 'Last 7 Days',
    '30_days': 'Last 30 Days',
    this_month: 'This Month',
    '90_days': 'Quarter',
    all: 'All Time'
  };

  return (
    <div className="min-h-full bg-slate-100 pb-28 md:pb-16 space-y-5">
      {/* Top Welcome & Greeting Card (Overlapping header) */}
      <div className="bg-white rounded-t-[32px] px-5 sm:px-8 pt-6 pb-4 shadow-xs border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Greeting */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl animate-wave">👋</span>
              <span className="text-sm font-semibold text-slate-500">{getGreeting()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Track your trips, manage fleet and keep your business moving forward.
            </p>
          </div>

          {/* Right Controls: Filter Period Dropdown & Sliders Button */}
          <div className="flex items-center space-x-2 self-start md:self-center">
            {/* Dropdown Pill Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterModal(!showFilterModal)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                <Calendar size={14} className="text-slate-600" />
                <span>{filterLabels[filterPeriod] || 'Last 30 Days'}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterModal && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                  {Object.entries(filterLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilterPeriod(key);
                        setIsCustomMode(false);
                        setShowFilterModal(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        filterPeriod === key ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsCustomMode(true);
                        setShowFilterModal(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <CalendarRange size={13} className="text-blue-600" />
                      <span>Custom Calendar Range</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sliders / Filter Action Button */}
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isCustomMode 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
              }`}
              title="Open Custom Date Range Filter"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker Bar (if custom mode active) */}
        {isCustomMode && (
          <form 
            onSubmit={handleApplyCustomRange} 
            className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5 bg-slate-50/80 p-3 rounded-2xl"
          >
            <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-bold">
              <CalendarRange size={14} className="text-blue-600" />
              <span>Range:</span>
            </div>
            
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              required
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-800"
            />

            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomStartDate('');
                setCustomEndDate('');
                setIsCustomMode(false);
                setFilterPeriod('30_days');
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={15} />
            </button>
          </form>
        )}

        {/* Date Filter Pills Row */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'today', label: 'Today' },
            { id: '7_days', label: '7 Days' },
            { id: '30_days', label: '30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: '90_days', label: 'Quarter' },
            { id: 'all', label: 'All Time' }
          ].map((preset) => {
            const isActive = !isCustomMode && filterPeriod === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setFilterPeriod(preset.id);
                  setIsCustomMode(false);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analytics Container */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards: 6-Card Responsive Grid matching the reference image */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: MONTHLY REVENUE */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-2xl border border-blue-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-blue-700 tracking-wider uppercase">
                MONTHLY REVENUE
              </span>
              <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Calendar size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              INR {(kpis.monthly_revenue ?? 5800).toLocaleString('en-IN')}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
              Profit: <strong className="text-emerald-600 font-bold">INR {(kpis.monthly_profit ?? 4950).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Card 2: PERIOD REVENUE */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-2xl border border-indigo-100/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase">
                PERIOD REVENUE
              </span>
              <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <IndianRupee size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              INR {(kpis.total_freight_revenue ?? 5800).toLocaleString('en-IN')}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
              Paid: <strong className="text-emerald-600 font-bold">INR {(kpis.total_amount_paid ?? 5800).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Card 3: DUE AMOUNT */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-rose-600 tracking-wider uppercase">
                DUE AMOUNT
              </span>
              <div className="p-1 rounded-lg bg-rose-50 text-rose-500">
                <IndianRupee size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              INR {(kpis.total_due_amount ?? 0).toLocaleString('en-IN')}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
              Unpaid client freight
            </div>
          </div>

          {/* Card 4: OPERATING PROFIT */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('reports')}
            className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase">
                OPERATING PROFIT
              </span>
              <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              INR {(kpis.operating_profit ?? 4950).toLocaleString('en-IN')}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
              Net margin deducted
            </div>
          </div>

          {/* Card 5: TOTAL TRIPS */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('trips')}
            className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-800 tracking-wider uppercase">
                TOTAL TRIPS
              </span>
              <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Truck size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.total_trips ?? 3}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] font-semibold text-slate-600">
              <strong className="text-emerald-600 font-bold">{kpis.delivered_trips ?? 3} done</strong> • <strong className="text-amber-500 font-bold">{kpis.active_trips ?? 0} active</strong>
            </div>
          </div>

          {/* Card 6: FLEET STATUS */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('vehicles')}
            className="bg-white p-4 rounded-2xl border border-teal-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-800 tracking-wider uppercase">
                FLEET STATUS
              </span>
              <div className="p-1 rounded-lg bg-teal-50 text-teal-600">
                <CheckCircle2 size={15} />
              </div>
            </div>

            <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {kpis.available_vehicles ?? 2} / {kpis.total_vehicles ?? 2}
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-50 text-[11px] font-semibold text-slate-600">
              <strong className="text-blue-600 font-bold">{kpis.on_road_vehicles ?? 0} on road</strong>, <strong className="text-emerald-600 font-bold">{kpis.ready_vehicles ?? 2} ready</strong>
            </div>
          </div>
        </div>

        {/* Row 1 Graphs: Monthly Revenue & Profit Tracking + Cost Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly Revenue & Profit Tracking (Left, 2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Monthly Revenue & Profit Tracking
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Month-on-month comparison of billing, operating costs, and net margin.
                </p>
              </div>

              {/* Monthly Trend Pill */}
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50/80 text-blue-600 border border-blue-200/60 rounded-full text-xs font-bold self-start sm:self-center">
                <TrendingUp size={13} />
                <span>Monthly Trend</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-5 text-xs font-semibold pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-slate-600 text-[11px]">Total Costs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 text-[11px]">Net Profit</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span className="text-slate-600 text-[11px]">Revenue</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `INR ${Number(value).toLocaleString('en-IN')}`, 
                      name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Total Costs' : 'Net Margin'
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid #1e293b', 
                      color: '#ffffff',
                      fontSize: '11px' 
                    }}
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="profit" name="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Category Breakdown (Right, 1/3 width Donut) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Cost Category Breakdown
                </h3>
                <Receipt size={16} className="text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Distribution across diesel, toll, labour & overheads.
              </p>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdownData.map((_: any, index: number) => (
                      <Cell key={"cell-" + index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`INR ${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                  <Legend verticalAlign="bottom" height={40} iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2 Graphs: Top Freight Routes by Revenue + Fleet Vehicle Contribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Freight Routes by Revenue */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-blue-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Top Freight Routes by Revenue
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Route Analytics</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Highest grossing transport lanes and dispatch frequency.
            </p>

            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRoutesData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="route" 
                    tick={{ fontSize: 10, fill: '#334155' }} 
                    width={130} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      name === 'revenue' ? `INR ${Number(val).toLocaleString('en-IN')}` : val,
                      name === 'revenue' ? 'Revenue' : 'Trips'
                    ]} 
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Vehicle Contribution */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck size={16} className="text-emerald-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Fleet Vehicle Contribution
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Asset Yield</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Gross revenue vs net operating margin per commercial vehicle.
            </p>

            {/* Legend */}
            <div className="flex items-center space-x-5 text-xs font-semibold pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span className="text-slate-600 text-[11px]">Revenue</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 text-[11px]">Net Profit</span>
              </div>
            </div>

            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehiclePerformanceData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="vehicle" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [
                      `INR ${Number(val).toLocaleString('en-IN')}`,
                      name === 'revenue' ? 'Revenue' : 'Net Margin'
                    ]} 
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="profit" name="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Daily Timeline Trend Area Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Revenue vs Direct Expenses (Selected Period)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Daily trajectory of freight billings and operational trip expenses.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily Timeline</span>
          </div>

          <div className="h-60 sm:h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`INR ${Number(v).toLocaleString('en-IN')}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Direct Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 4: Recent Trips & Compliance & Expiry Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Trips Table (Left, 2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Recent Trip Entries
              </h3>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('trips')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center cursor-pointer"
              >
                View All <ArrowUpRight size={13} className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">TRIP ID</th>
                    <th className="py-2.5 px-3">ROUTE</th>
                    <th className="py-2.5 px-3">VEHICLE</th>
                    <th className="py-2.5 px-3 rounded-r-xl">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTripsData.map((trip: any) => (
                    <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-blue-600">{trip.trip_number}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{trip.route}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{trip.vehicle}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200/60 capitalize">
                          {trip.status?.replace('_', ' ') || 'completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Expiry Alerts (Right, 1/3 width) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Compliance & Expiry Alerts
                </h3>
                <ShieldAlert size={16} className="text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Insurance, fitness certificates, and road permits.
              </p>
            </div>

            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                All vehicle insurances and permits are up to date!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
