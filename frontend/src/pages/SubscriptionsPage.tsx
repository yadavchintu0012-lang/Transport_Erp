import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ArrowRight, Shield } from 'lucide-react';
import api from '../services/api';

export const SubscriptionsPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get('/subscriptions/plans'),
          api.get('/subscriptions/my-plan')
        ]);
        setPlans(pRes.data || []);
        setCurrentSub(sRes.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Workspace Subscription Plan</h2>
            <p className="text-xs text-slate-500 mt-1">Manage software licensing, vehicle limits, and billing cycles.</p>
          </div>
          {currentSub && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Shield size={15} className="text-emerald-600" />
              <span>Current: {currentSub.plan?.name} ({currentSub.status.toUpperCase()})</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentSub?.plan?.code === p.code;
          return (
            <div 
              key={p.id}
              className="g-white rounded-xl border p-6 flex flex-col justify-between space-y-6 transition-all "
            >
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">INR {p.price_monthly.toLocaleString('en-IN')}</span>
                  <span className="ml-1 text-xs text-slate-500">/month</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Billed yearly at INR {p.price_yearly.toLocaleString('en-IN')}</div>

                <div className="mt-6 space-y-2.5 text-xs text-slate-600 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Up to <strong>{p.max_vehicles} Vehicles</strong> in registry</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Up to <strong>{p.max_staff} Staff Members</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Up to <strong>{p.max_trips_monthly} Trips</strong> per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Complete P&L & CSV Exports</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isCurrent}
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-colors "
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
