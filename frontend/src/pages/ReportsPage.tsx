import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, IndianRupee, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [plData, setPlData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const canViewProfit = hasPermission('reports', 'view_profit');

  const fetchPL = async () => {
    setLoading(true);
    try {
      if (canViewProfit) {
        const res = await api.get('/reports/profit-loss');
        setPlData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPL();
  }, []);

  const handleExportTrips = () => {
    window.open('/api/v1/reports/trips-csv', '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Operational Reports & Financial Statements</h2>
          <p className="text-xs text-slate-500">Reconciled business performance, freight contribution, and P&L statements.</p>
        </div>
        <button
          onClick={handleExportTrips}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <Download size={14} />
          <span>Download All Trips CSV</span>
        </button>
      </div>

      {canViewProfit && plData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Operational Profit & Loss Statement</h3>
              <p className="text-xs text-slate-500">Accrual-based analysis: Revenue (excl. tax) - Direct Trip Costs - General Overheads</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Operating Profit</span>
              <span className="text-xl font-bold text-emerald-600">INR {plData.operating_profit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* 1. Operating Revenue */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex justify-between">
                <span>1. Freight Revenue</span>
                <span className="text-blue-600">INR {plData.revenue.net_operating_revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Gross Invoiced Freight:</span>
                  <span>INR {plData.revenue.gross_freight.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST Collected:</span>
                  <span>INR {plData.revenue.tax_collected.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. Direct Trip Costs */}
            <div className="p-4 bg-rose-50/40 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex justify-between">
                <span>2. Direct Trip Costs</span>
                <span className="text-rose-600">INR {plData.direct_costs.total_direct_costs.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Diesel & Fuel:</span>
                  <span>INR {plData.direct_costs.diesel.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toll Charges:</span>
                  <span>INR {plData.direct_costs.toll.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Allowance:</span>
                  <span>INR {plData.direct_costs.driver_allowance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loading & Labour:</span>
                  <span>INR {plData.direct_costs.loading_unloading.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 3. Company Overheads */}
            <div className="p-4 bg-purple-50/40 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex justify-between">
                <span>3. Fixed Overheads</span>
                <span className="text-purple-600">INR {plData.overheads.total_overheads.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Workshop / Maintenance / Rent:</span>
                  <span>INR {plData.overheads.total_overheads.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-emerald-900 text-sm">Gross Contribution Margin</div>
              <div className="text-emerald-700">Gross Freight Revenue minus Direct Trip Deductions</div>
            </div>
            <div className="text-base font-bold text-emerald-800">
              INR {plData.gross_contribution.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
