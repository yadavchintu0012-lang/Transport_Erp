import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DriversPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_expiry: '',
    employment_type: 'permanent',
    salary_amount: 0
  });

  const canCreate = hasPermission('drivers', 'create');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drivers/', { params: { search: searchTerm } });
      setDrivers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/drivers/', {
        ...formData,
        license_expiry: formData.license_expiry ? new Date(formData.license_expiry).toISOString() : null
      });
      setShowAddModal(false);
      fetchDrivers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error adding driver');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Drivers & Crew Registry</h2>
          <p className="text-xs text-slate-500">Manage commercial driving licences, duty status, and compensation.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by driver name, phone number, license..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchDrivers()}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-base text-slate-900">{d.name}</div>
                <div className="text-xs text-slate-500 font-medium capitalize">{d.employment_type} Driver</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ">
                {d.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-2.5">
              <div className="flex items-center space-x-2">
                <Phone size={13} className="text-slate-400" />
                <span>{d.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award size={13} className="text-slate-400" />
                <span className="font-mono text-[11px]">{d.license_number}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Completed: <strong className="text-slate-800">{d.total_trips} trips</strong></span>
              <span>Exp: {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Register New Driver</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Licence Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Licence Expiry Date</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
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
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
