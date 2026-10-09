import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, FileText, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CustomersPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    customer_type: 'business',
    contact_person: '',
    phone: '',
    email: '',
    billing_address: '',
    city: '',
    state: '',
    tax_number: '',
    credit_limit: 0,
    opening_balance: 0
  });

  const canCreate = hasPermission('customers', 'create');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers/', { params: { search: searchTerm } });
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers/', formData);
      setShowAddModal(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving customer');
    }
  };

  const handleViewStatement = async (customerId: string) => {
    try {
      const res = await api.get("/customers/" + customerId + "/statement");
      setSelectedStatement(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Customer & Corporate Directory</h2>
          <p className="text-xs text-slate-500">Track client companies, outstanding billing, GST details and ledgers.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone, GSTIN, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-base text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500 capitalize">{c.customer_type} • {c.city || 'HQ'}</div>
              </div>
              <button
                onClick={() => handleViewStatement(c.id)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
              >
                Statement
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-2.5">
              <div className="flex items-center space-x-2">
                <Phone size={13} className="text-slate-400" />
                <span>{c.phone || 'No phone'} ({c.contact_person || 'Contact'})</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                GSTIN: <span className="font-semibold text-slate-700">{c.tax_number || 'Unregistered'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Total Billed</span>
                <span className="font-bold text-slate-800">INR {c.total_billed.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Outstanding</span>
                <span className="font-bold text-rose-600">INR {c.outstanding_balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Customer Account Statement</h3>
                <p className="text-xs text-slate-500">{selectedStatement.customer.name}</p>
              </div>
              <button onClick={() => setSelectedStatement(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-700">Issued Invoices</h4>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-2">Invoice #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Balance</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedStatement.invoices.map((inv: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold text-blue-700">{inv.invoice_number}</td>
                      <td className="p-2">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td className="p-2">INR {inv.total_amount.toLocaleString('en-IN')}</td>
                      <td className="p-2 font-semibold text-rose-600">INR {inv.balance_amount.toLocaleString('en-IN')}</td>
                      <td className="p-2 capitalize">{inv.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Register New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Motors Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">GSTIN / Tax No.</label>
                  <input
                    type="text"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
