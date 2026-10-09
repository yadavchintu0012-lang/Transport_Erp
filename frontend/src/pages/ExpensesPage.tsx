import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, CheckCircle, IndianRupee } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExpensesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'office_rent',
    amount: 0,
    is_trip_direct: false,
    vendor_name: '',
    payment_method: 'bank_transfer',
    notes: ''
  });

  const canCreate = hasPermission('expenses', 'create');
  const canApprove = hasPermission('expenses', 'approve');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses/');
      setExpenses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses/', {
        ...formData,
        expense_date: new Date(formData.expense_date).toISOString()
      });
      setShowAddModal(false);
      fetchExpenses();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving expense');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Expense Management & Vouchers</h2>
          <p className="text-xs text-slate-500">Track company overheads, maintenance bills, workshop repairs & office rent.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Expense ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Vendor / Payee</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-blue-700">{e.expense_number}</td>
                <td className="py-3 px-4">{new Date(e.expense_date).toLocaleDateString()}</td>
                <td className="py-3 px-4 capitalize font-medium text-slate-800">{e.category.replace('_', ' ')}</td>
                <td className="py-3 px-4">{e.vendor_name || 'N/A'}</td>
                <td className="py-3 px-4 font-bold text-slate-900">INR {e.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold ">
                    {e.is_trip_direct ? 'Trip Direct' : 'General Overhead'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Record Expense Voucher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg capitalize"
                  >
                    <option value="office_rent">Office Rent</option>
                    <option value="vehicle_maintenance">Vehicle Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="road_tax">Road Tax</option>
                    <option value="administrative">Administrative</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Amount (INR ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Shree Ram Spares"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
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
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
