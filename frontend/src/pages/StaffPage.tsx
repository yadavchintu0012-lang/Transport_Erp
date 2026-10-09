import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserPlus, Key } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StaffPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role_id: ''
  });

  const canCreate = hasPermission('staff', 'create');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        api.get('/staff/'),
        api.get('/staff/roles')
      ]);
      setStaffList(sRes.data || []);
      setRoles(rRes.data || []);
      if (rRes.data && rRes.data.length > 0) {
        setFormData(prev => ({ ...prev, role_id: rRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/staff/', formData);
      setShowAddStaffModal(false);
      fetchData();
      setFormData({ full_name: '', email: '', password: '', phone: '', role_id: roles[0]?.id || '' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error creating staff');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Staff Accounts & RBAC Permissions</h2>
          <p className="text-xs text-slate-500">Configure team access, assign system or custom roles, and restrict financial data.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <UserPlus size={15} />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <tr key={s.membership_id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-slate-900">{s.full_name}</td>
                <td className="py-3 px-4">{s.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                    {s.role?.name || 'Member'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {s.last_login_at ? new Date(s.last_login_at).toLocaleString() : 'Never'}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold ">
                    {s.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Add Staff Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Role & Access Level *</label>
                <select
                  required
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
