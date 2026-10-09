import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, CheckCircle, IndianRupee, Printer } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StandardInvoiceModal } from '../components/StandardInvoiceModal';

export const InvoicesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [printInvoiceData, setPrintInvoiceData] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [customers, setCustomers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_amount: 0,
    notes: ''
  });

  const canCreate = hasPermission('accounts', 'create');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices/');
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/');
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/invoices/', {
        ...formData,
        invoice_date: new Date(formData.invoice_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString()
      });
      setShowAddModal(false);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving invoice');
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await api.get("/invoices/" + id);
      setSelectedInvoice(res.data);
      setPaymentAmount(res.data.invoice.balance_amount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.post("/invoices/" + selectedInvoice.invoice.id + "/payments", {
        amount: paymentAmount,
        payment_date: new Date().toISOString(),
        payment_method: 'bank_transfer'
      });
      handleOpenDetail(selectedInvoice.invoice.id);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error recording payment');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Invoices & Accounts Ledger</h2>
          <p className="text-xs text-slate-500">Freight billing, partial payment tracking, tax calculation and receivables.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={15} />
            <span>Generate Invoice</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date & Due</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Balance Due</th>
              <th className="py-3 px-4">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-blue-700">{inv.invoice_number}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{inv.customer?.name}</td>
                <td className="py-3 px-4">
                  <div>{new Date(inv.invoice_date).toLocaleDateString()}</div>
                  <div className="text-[10px] text-slate-400">Due: {new Date(inv.due_date).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">INR {inv.total_amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-bold text-rose-600">INR {inv.balance_amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold ">
                      {inv.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleOpenDetail(inv.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Settle
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await api.get(`/invoices/${inv.id}`);
                          setPrintInvoiceData(res.data);
                        } catch (e: any) {
                          alert(e.response?.data?.detail || 'Error loading invoice');
                        }
                      }}
                      className="flex items-center space-x-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium border border-slate-300"
                      title="View & Print Standard 1-Page Invoice"
                    >
                      <Printer size={12} />
                      <span>Print</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail / Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedInvoice.invoice.invoice_number}</h3>
                <div className="text-xs text-slate-500">Billed to: <strong className="text-slate-700">{selectedInvoice.customer?.name}</strong></div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPrintInvoiceData(selectedInvoice)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100"
                >
                  <Printer size={14} />
                  <span>Print Tax Invoice (1-Page)</span>
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs text-center">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Invoice Total</span>
                <span className="font-bold text-sm text-slate-900">INR {selectedInvoice.invoice.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Amount Paid</span>
                <span className="font-bold text-sm text-emerald-600">INR {selectedInvoice.invoice.paid_amount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Outstanding Balance</span>
                <span className="font-bold text-sm text-rose-600">INR {selectedInvoice.invoice.balance_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Record Form if balance remains */}
            {selectedInvoice.invoice.balance_amount > 0 && (
              <form onSubmit={handleRecordPayment} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">Record Customer Payment</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      max={selectedInvoice.invoice.balance_amount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 text-xs border rounded-lg bg-white"
                      placeholder="Payment amount"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Receive Payment
                  </button>
                </div>
              </form>
            )}

            {/* Payment History */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700">Receipts & Payment History</h4>
              {selectedInvoice.payments.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2">Receipt #</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Method</th>
                      <th className="p-2">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-2 font-semibold text-blue-700">{p.payment_number}</td>
                        <td className="p-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="p-2 capitalize">{p.payment_method.replace('_', ' ')}</td>
                        <td className="p-2 font-bold text-emerald-600">INR {p.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-slate-400 py-3 text-center">No payment entries recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">Generate Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Customer *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Subtotal Freight (INR ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">GST / Tax Amount (INR )</label>
                  <input
                    type="number"
                    value={formData.tax_amount}
                    onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
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
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Page Standard Tax Invoice & Consignment Note */}
      {printInvoiceData && (
        <StandardInvoiceModal
          data={printInvoiceData}
          onClose={() => setPrintInvoiceData(null)}
        />
      )}
    </div>
  );
};
