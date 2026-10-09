import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  CheckCircle, 
  MapPin, 
  FileText, 
  Printer,
  Calendar,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StandardInvoiceModal } from '../components/StandardInvoiceModal';

export const TripsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Date Range Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);

  // Dropdown options
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Invoice modal state
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    trip_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    vehicle_id: '',
    driver_id: '',
    customer_po_ref: '',
    pickup_city: '',
    delivery_city: '',
    cargo_description: '',
    cargo_weight_tonnes: 0,
    freight_charges: 0,
    additional_charges: 0,
    discount: 0,
    tax_amount: 0,
    amount_paid: 0,
    diesel_expense: 0,
    toll_expense: 0,
    driver_allowance: 0,
    loading_unloading_expense: 0,
    other_direct_expense: 0
  });

  const canCreate = hasPermission('trips', 'create');
  const canApprove = hasPermission('trips', 'approve');
  const canExport = hasPermission('trips', 'export');

  const fetchTrips = async (overrideStart?: string, overrideEnd?: string) => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const sDate = overrideStart !== undefined ? overrideStart : startDate;
      const eDate = overrideEnd !== undefined ? overrideEnd : endDate;

      if (sDate) {
        params.start_date = new Date(sDate + 'T00:00:00').toISOString();
      }
      if (eDate) {
        params.end_date = new Date(eDate + 'T23:59:59').toISOString();
      }

      const res = await api.get('/trips/', { params });
      setTrips(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [vRes, dRes, cRes] = await Promise.all([
        api.get('/vehicles/'),
        api.get('/drivers/'),
        api.get('/customers/')
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setCustomers(cRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchMasterData();
  }, [statusFilter]);

  const handleApplyDateFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchTrips();
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateRange(false);
    fetchTrips('', '');
  };

  const handleOpenInvoice = async (tripId: string) => {
    try {
      const res = await api.get('/trips/' + tripId + '/invoice');
      setInvoiceData(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error loading invoice');
    }
  };

  const handleCreateTrip = async (e: React.FormEvent, andGenerateInvoice = false) => {
    e.preventDefault();
    try {
      const res = await api.post('/trips/', {
        ...formData,
        trip_date: new Date(formData.trip_date).toISOString()
      });
      setShowAddModal(false);
      fetchTrips();

      // Reset form
      setFormData({
        trip_date: new Date().toISOString().split('T')[0],
        customer_id: '',
        vehicle_id: '',
        driver_id: '',
        customer_po_ref: '',
        pickup_city: '',
        delivery_city: '',
        cargo_description: '',
        cargo_weight_tonnes: 0,
        freight_charges: 0,
        additional_charges: 0,
        discount: 0,
        tax_amount: 0,
        amount_paid: 0,
        diesel_expense: 0,
        toll_expense: 0,
        driver_allowance: 0,
        loading_unloading_expense: 0,
        other_direct_expense: 0
      });

      if (andGenerateInvoice && res.data?.id) {
        handleOpenInvoice(res.data.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error creating trip');
    }
  };

  const handleUpdateStatus = async (tripId: string, status: string) => {
    try {
      await api.put('/trips/' + tripId + '/status?status_value=' + status);
      fetchTrips();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error updating status');
    }
  };

  const handleApprove = async (tripId: string) => {
    try {
      await api.put('/trips/' + tripId + '/approve');
      fetchTrips();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error approving trip');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/reports/trips-csv', '_blank');
  };

  const totalCalculated = Math.max(
    0,
    formData.freight_charges + formData.additional_charges + formData.tax_amount - formData.discount
  );
  const dueCalculated = Math.max(0, totalCalculated - formData.amount_paid);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Trip Operations Management</h2>
          <p className="text-xs text-slate-500">Record, dispatch, update, generate tax invoices & bill commercial transport trips.</p>
        </div>
        <div className="flex items-center space-x-3">
          {canExport && (
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus size={15} />
              <span>New Trip Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Trip ID, route, customer PO, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTrips()}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Range Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDateRange(!showDateRange)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              (startDate || endDate || showDateRange)
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar size={14} className={startDate || endDate ? 'text-blue-600' : 'text-slate-400'} />
            <span>
              {startDate && endDate 
                ? `${startDate} → ${endDate}`
                : startDate 
                ? `From ${startDate}`
                : 'Date Range'}
            </span>
            {(startDate || endDate) && (
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDateFilter();
                }}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded text-blue-800"
                title="Clear date filter"
              >
                <X size={12} />
              </span>
            )}
          </button>
        </div>

        {/* Date Range Picker (From Date -> To Date) */}
        {showDateRange && (
          <form 
            onSubmit={handleApplyDateFilter}
            className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs"
          >
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
              <Calendar size={15} className="text-blue-600" />
              <span>Filter Trips by Date Range:</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-slate-500 font-medium">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-slate-500 font-medium">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                Apply Range
              </button>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleClearDateFilter}
                  className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 font-medium rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick date shortcuts */}
            <div className="flex items-center space-x-1 ml-auto text-[11px]">
              <span className="text-slate-400 mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(today);
                  setEndDate(today);
                  fetchTrips(today, today);
                }}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(d);
                  setEndDate(today);
                  fetchTrips(d, today);
                }}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
              >
                Last 7d
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(d);
                  setEndDate(today);
                  fetchTrips(d, today);
                }}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
              >
                Last 30d
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Trip Details</th>
                <th className="py-3 px-4">Route & Cargo</th>
                <th className="py-3 px-4">Fleet & Driver</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.length > 0 ? (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    {/* Trip Details */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-700">{t.trip_number}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.trip_date ? new Date(t.trip_date).toLocaleDateString() : ''}
                      </div>
                      <div className="text-[11px] font-medium text-slate-800 mt-1">
                        {t.customer?.name}
                      </div>
                    </td>

                    {/* Route & Cargo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 font-semibold text-slate-800">
                        <MapPin size={12} className="text-blue-500" />
                        <span>{t.route.pickup_city} &rarr; {t.route.delivery_city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {t.cargo.description || 'General freight'} • {t.cargo.weight_tonnes}T
                      </div>
                    </td>

                    {/* Fleet & Driver */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{t.vehicle?.vehicle_number}</div>
                      <div className="text-[11px] text-slate-500">{t.driver?.name} ({t.driver?.phone})</div>
                    </td>

                    {/* Financials */}
                    <td className="py-3 px-4">
                      {t.financials ? (
                        <>
                          <div className="font-bold text-slate-900">
                            INR {t.financials.total_revenue.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] flex items-center space-x-1.5 mt-0.5">
                            <span className="text-emerald-600 font-medium">Paid: INR {(t.financials.amount_paid || 0).toLocaleString('en-IN')}</span>
                            <span>•</span>
                            <span className="text-rose-600 font-semibold">Due: INR {(t.financials.due_amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Direct exp: INR {t.financials.total_expenses.toLocaleString('en-IN')}
                          </div>
                          {t.profit !== undefined && (
                            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                              Profit: INR {t.profit.toLocaleString('en-IN')}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Restricted</span>
                      )}
                    </td>

                    {/* Status & Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                          t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                        {t.is_approved ? (
                          <span title="Approved" className="text-emerald-500"><CheckCircle size={15} /></span>
                        ) : canApprove && (
                          <button
                            onClick={() => handleApprove(t.id)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700"
                          >
                            Approve
                          </button>
                        )}
                        {/* Invoice Generator button */}
                        <button
                          onClick={() => handleOpenInvoice(t.id)}
                          className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold border border-blue-200 transition-colors"
                          title="Generate & View Tax Invoice"
                        >
                          <FileText size={12} />
                          <span>Invoice</span>
                        </button>
                      </div>

                      {/* Quick Status Changers */}
                      {t.status !== 'completed' && t.status !== 'cancelled' && (
                        <div className="mt-2 flex items-center space-x-1">
                          {t.status === 'dispatched' && (
                            <button
                              onClick={() => handleUpdateStatus(t.id, 'in_transit')}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Dispatch to In-Transit &rarr;
                            </button>
                          )}
                          {t.status === 'in_transit' && (
                            <button
                              onClick={() => handleUpdateStatus(t.id, 'completed')}
                              className="text-[10px] text-emerald-600 hover:underline font-semibold"
                            >
                              Mark Delivered &rarr;
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No trips match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Trip */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Create New Trip Entry</h3>
                <p className="text-xs text-slate-500">Record consignment details, assign vehicle & driver, and generate instant invoice.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={(e) => handleCreateTrip(e, false)} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.trip_date}
                    onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
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
                <div>
                  <label className="font-semibold text-slate-700">PO / Reference No.</label>
                  <input
                    type="text"
                    value={formData.customer_po_ref}
                    onChange={(e) => setFormData({ ...formData, customer_po_ref: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="e.g. PO-9812"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Vehicle Assigned *</label>
                  <select
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_number} ({v.vehicle_type}) - {v.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Driver Assigned *</label>
                  <select
                    required
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Pickup City *</label>
                  <input
                    type="text"
                    required
                    value={formData.pickup_city}
                    onChange={(e) => setFormData({ ...formData, pickup_city: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="e.g. Pune"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Delivery City *</label>
                  <input
                    type="text"
                    required
                    value={formData.delivery_city}
                    onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="e.g. Mumbai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Cargo Description</label>
                  <input
                    type="text"
                    value={formData.cargo_description}
                    onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg"
                    placeholder="e.g. Industrial Machinery"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Weight (Tonnes)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cargo_weight_tonnes}
                    onChange={(e) => setFormData({ ...formData, cargo_weight_tonnes: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Financial Section */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Revenue & Freight Billing</span>
                  <div className="text-xs text-slate-500 flex items-center space-x-3">
                    <span>Total: <strong className="text-slate-900 font-bold">INR {totalCalculated.toLocaleString('en-IN')}</strong></span>
                    <span>Due: <strong className="text-rose-600 font-bold">INR {dueCalculated.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-slate-600">Freight Charge (INR)</label>
                    <input
                      type="number"
                      value={formData.freight_charges}
                      onChange={(e) => setFormData({ ...formData, freight_charges: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Additional (INR)</label>
                    <input
                      type="number"
                      value={formData.additional_charges}
                      onChange={(e) => setFormData({ ...formData, additional_charges: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">GST / Tax (INR)</label>
                    <input
                      type="number"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Discount (INR)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <label className="text-emerald-800 font-semibold block text-[11px]">Amount Paid / Advance Received (INR)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border border-emerald-300 rounded bg-white font-semibold text-emerald-900"
                    />
                  </div>
                  <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                    <label className="text-rose-800 font-semibold block text-[11px]">Due / Balance Amount (INR)</label>
                    <div className="mt-1 p-1.5 bg-white border border-rose-200 rounded font-bold text-rose-700 text-sm">
                      INR {dueCalculated.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Expenses */}
              <div className="p-3 bg-rose-50/50 rounded-lg space-y-3">
                <div className="font-bold text-slate-800">Direct Trip Vouchers (Deductions)</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-slate-600">Diesel (INR)</label>
                    <input
                      type="number"
                      value={formData.diesel_expense}
                      onChange={(e) => setFormData({ ...formData, diesel_expense: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Tolls (INR)</label>
                    <input
                      type="number"
                      value={formData.toll_expense}
                      onChange={(e) => setFormData({ ...formData, toll_expense: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Driver Bhatta (INR)</label>
                    <input
                      type="number"
                      value={formData.driver_allowance}
                      onChange={(e) => setFormData({ ...formData, driver_allowance: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Loading (INR)</label>
                    <input
                      type="number"
                      value={formData.loading_unloading_expense}
                      onChange={(e) => setFormData({ ...formData, loading_unloading_expense: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Other (INR)</label>
                    <input
                      type="number"
                      value={formData.other_direct_expense}
                      onChange={(e) => setFormData({ ...formData, other_direct_expense: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-1 p-1.5 border rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons: Cancel, Save Only, Save & Generate Invoice */}
              <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
                  >
                    Confirm & Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCreateTrip(e, true)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    <FileText size={15} />
                    <span>Dispatch & Generate Invoice</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standard Full-Page Invoice Modal */}
      {invoiceData && (
        <StandardInvoiceModal
          data={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
};