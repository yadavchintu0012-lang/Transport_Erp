import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const VehiclesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'Truck',
    model: '',
    capacity_tonnage: 0,
    ownership_type: 'owned',
    assigned_driver_id: '',
    insurance_expiry: '',
    fitness_expiry: '',
    permit_expiry: '',
    pollution_expiry: ''
  });

  const canCreate = hasPermission('vehicles', 'create');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/', { params: { search: searchTerm } });
      setVehicles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers/');
      setDrivers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles/', {
        ...formData,
        insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
        fitness_expiry: formData.fitness_expiry ? new Date(formData.fitness_expiry).toISOString() : null,
        permit_expiry: formData.permit_expiry ? new Date(formData.permit_expiry).toISOString() : null,
        pollution_expiry: formData.pollution_expiry ? new Date(formData.pollution_expiry).toISOString() : null,
        assigned_driver_id: formData.assigned_driver_id || null
      });
      setShowAddModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving vehicle');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Commercial Fleet Registry</h2>
          <p className="text-xs text-slate-500">Track owned, leased, and attached vehicles, fitness & permit compliance.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by registration number, type, model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchVehicles()}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-base text-slate-900">{v.vehicle_number}</div>
                <div className="text-xs text-slate-500">{v.vehicle_type} • {v.model || 'Standard'}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ">
                {v.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Capacity</span>
                <span className="font-semibold text-slate-700">{v.capacity_tonnage} Tonnes</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Ownership</span>
                <span className="font-semibold text-slate-700 capitalize">{v.ownership_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase">Assigned Driver</span>
                <span className="font-semibold text-slate-700">{v.assigned_driver?.name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Insurance Expiry:</span>
                <span className="font-medium">{v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fitness Expiry:</span>
                <span className="font-medium">{v.fitness_expiry ? new Date(v.fitness_expiry).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Register New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Vehicle Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 Wheeler Truck"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Capacity (Tonnes)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capacity_tonnage}
                    onChange={(e) => setFormData({ ...formData, capacity_tonnage: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Insurance Expiry Date</label>
                  <input
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Fitness Expiry Date</label>
                  <input
                    type="date"
                    value={formData.fitness_expiry}
                    onChange={(e) => setFormData({ ...formData, fitness_expiry: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
