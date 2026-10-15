import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Check, 
  Edit3, 
  Users, 
  Truck, 
  TrendingUp, 
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

interface Plan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  trial_days: number;
  max_vehicles: number;
  max_staff: number;
  max_trips_monthly: number;
  features: string[];
  is_active: boolean;
  is_visible: boolean;
  sort_order: number;
  subscriber_count: number;
}

export const SaasPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    trial_days: 14,
    max_vehicles: 5,
    max_staff: 3,
    max_trips_monthly: 50,
    features: '',
    is_active: true,
    is_visible: true,
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/saas/plans');
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditPlan(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      price_monthly: 1999,
      price_yearly: 19990,
      trial_days: 14,
      max_vehicles: 10,
      max_staff: 5,
      max_trips_monthly: 100,
      features: 'all_trips, invoicing, basic_reports',
      is_active: true,
      is_visible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Plan) => {
    setEditPlan(p);
    setFormData({
      name: p.name,
      code: p.code,
      description: p.description || '',
      price_monthly: p.price_monthly,
      price_yearly: p.price_yearly,
      trial_days: p.trial_days || 14,
      max_vehicles: p.max_vehicles,
      max_staff: p.max_staff,
      max_trips_monthly: p.max_trips_monthly,
      features: Array.isArray(p.features) ? p.features.join(', ') : '',
      is_active: p.is_active,
      is_visible: p.is_visible,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      ...formData,
      features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editPlan) {
        await api.patch(`/admin/saas/plans/${editPlan.id}`, payload);
      } else {
        await api.post('/admin/saas/plans', payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save subscription plan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription Tiers & Packaging</h1>
          <p className="text-sm text-slate-500">Configure pricing, vehicle quotas, feature entitlements, and active subscribers.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus size={16} />
          <span>Create New Tier</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-xl border p-6 flex flex-col justify-between shadow-xs transition-all ${
              p.is_active ? 'border-slate-200 hover:border-blue-400 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {p.code}
                </span>
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                  title="Edit Plan"
                >
                  <Edit3 size={15} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-3">{p.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{p.description || 'Standard enterprise logistics tier.'}</p>

              {/* Price */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline">
                <span className="text-3xl font-extrabold text-slate-900">₹{p.price_monthly.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">/ month</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                or ₹{p.price_yearly.toLocaleString('en-IN')} billed annually
              </div>

              {/* Limits */}
              <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-slate-500">
                    <Truck size={13} className="mr-1.5 text-slate-400" /> Max Vehicles:
                  </span>
                  <span className="font-bold text-slate-900">{p.max_vehicles} trucks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-slate-500">
                    <Users size={13} className="mr-1.5 text-slate-400" /> Max Staff:
                  </span>
                  <span className="font-bold text-slate-900">{p.max_staff} members</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-slate-500">
                    <TrendingUp size={13} className="mr-1.5 text-slate-400" /> Monthly Trips:
                  </span>
                  <span className="font-bold text-slate-900">{p.max_trips_monthly} trips</span>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-5 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Features Included</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {p.features && p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check size={14} className="text-emerald-500 mr-2 shrink-0" />
                      <span>{feat.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {p.subscriber_count} Active Subscribers
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                p.is_visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {p.is_visible ? 'Public' : 'Hidden'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                {editPlan ? 'Edit Subscription Tier' : 'Create New Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Slug</label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled={!!editPlan}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_monthly}
                    onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_yearly}
                    onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Vehicles</label>
                  <input
                    type="number"
                    value={formData.max_vehicles}
                    onChange={(e) => setFormData({ ...formData, max_vehicles: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Staff</label>
                  <input
                    type="number"
                    value={formData.max_staff}
                    onChange={(e) => setFormData({ ...formData, max_staff: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Trips</label>
                  <input
                    type="number"
                    value={formData.max_trips_monthly}
                    onChange={(e) => setFormData({ ...formData, max_trips_monthly: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="all_trips, invoicing, pnl_reports, csv_export"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Active for new subscriptions</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Publicly visible on pricing list</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {isSaving ? 'Saving...' : 'Save Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
