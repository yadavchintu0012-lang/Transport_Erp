import React from 'react';
import { Printer, Download, X, Building, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InvoiceData {
  invoice: {
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: string;
    notes?: string;
  };
  organization: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    currency?: string;
  };
  customer: {
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    billing_address?: string;
    city?: string;
    state?: string;
    tax_number?: string;
  };
  trip?: {
    trip_number: string;
    trip_date: string;
    customer_po_ref?: string;
    pickup_city: string;
    pickup_address?: string;
    delivery_city: string;
    delivery_address?: string;
    cargo_description?: string;
    cargo_weight_tonnes?: number;
    vehicle_number?: string;
    vehicle_type?: string;
    driver_name?: string;
    driver_phone?: string;
    freight_charges: number;
    additional_charges: number;
    discount: number;
    tax_amount: number;
    total_revenue: number;
    amount_paid: number;
    due_amount: number;
  };
  payments?: Array<{
    id: string;
    payment_number: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number?: string;
  }>;
}

interface StandardInvoiceModalProps {
  data: InvoiceData;
  onClose: () => void;
}

export const StandardInvoiceModal: React.FC<StandardInvoiceModalProps> = ({ data, onClose }) => {
  const { invoice, organization, customer, trip, payments = [] } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto border border-slate-200 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Action Header - Hidden during print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              TP
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Tax Invoice & Consignment Note</h3>
              <p className="text-xs text-slate-400">Invoice: {invoice.invoice_number} • Trip: {trip?.trip_number || 'Direct'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-md transition-colors"
            >
              <Printer size={15} />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE 1-PAGE STANDARD TAX INVOICE */}
        <div className="p-8 sm:p-10 text-slate-800 space-y-6 text-xs bg-white min-h-[1050px] flex flex-col justify-between print:p-8">
          
          <div className="space-y-6">
            {/* Top Company & Invoice Header */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    TP
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{organization.name}</h1>
                    <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-widest">Transport & Logistics Fleet Management</span>
                  </div>
                </div>
                <div className="text-slate-600 space-y-0.5 pt-1 text-[11px]">
                  <p>{organization.address || 'Central Transport Complex, Transport Nagar'}</p>
                  <p>{organization.city || 'Pune'}, {organization.state || 'Maharashtra'} - India</p>
                  <p><strong>Phone:</strong> {organization.phone || '+91 98765 43210'} | <strong>Email:</strong> {organization.email || 'billing@apexexpress.com'}</p>
                  <p className="font-mono text-[11px]"><strong>GSTIN / Tax ID:</strong> <span className="font-bold text-slate-900">{organization.tax_number || '27AABCA1234F1Z5'}</span></p>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-black tracking-widest uppercase">
                  TAX INVOICE
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="text-slate-500">Invoice No:</span> <strong className="text-slate-900 text-sm">{invoice.invoice_number}</strong></div>
                  <div><span className="text-slate-500">Invoice Date:</span> <strong className="text-slate-800">{new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div><span className="text-slate-500">Payment Due:</span> <strong className="text-slate-800">{new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div>
                    <span className="text-slate-500">Status: </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      invoice.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To (Customer) & Consignment Details Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">Billed To (Customer / Consignee)</span>
                <h4 className="text-sm font-bold text-slate-900">{customer.name}</h4>
                <p className="text-slate-600">{customer.billing_address || 'Customer Commercial Depot'}</p>
                <p className="text-slate-600">{customer.city ? customer.city + ', ' : ''}{customer.state || 'India'}</p>
                <p className="text-slate-600"><strong>Contact:</strong> {customer.contact_person || 'Logistics Incharge'} ({customer.phone || 'N/A'})</p>
                <p className="font-mono text-[11px]"><strong>GSTIN:</strong> {customer.tax_number || 'URP (Unregistered Person)'}</p>
              </div>

              <div className="space-y-1 border-l border-slate-200 pl-6">
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">Consignment & Fleet Movement</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 text-[11px]">
                  <div><span className="text-slate-400">Trip No:</span> <strong className="text-slate-800">{trip?.trip_number || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">PO Ref:</span> <strong className="text-slate-800">{trip?.customer_po_ref || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Vehicle No:</span> <strong className="text-slate-900 font-bold">{trip?.vehicle_number || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Type:</span> {trip?.vehicle_type || 'Commercial Truck'}</div>
                  <div><span className="text-slate-400">From:</span> <strong>{trip?.pickup_city || 'Origin'}</strong></div>
                  <div><span className="text-slate-400">To:</span> <strong>{trip?.delivery_city || 'Destination'}</strong></div>
                  <div className="col-span-2 pt-1 border-t border-slate-200 mt-1">
                    <span className="text-slate-400">Cargo:</span> <span className="font-medium text-slate-800">{trip?.cargo_description || 'General Cargo'} ({trip?.cargo_weight_tonnes || 0} Tonnes)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Description of Transportation Service</th>
                    <th className="py-2.5 px-4 text-center">SAC Code</th>
                    <th className="py-2.5 px-4 text-right">Taxable Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-3 px-4 text-center font-bold text-slate-400">1</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">Freight Transportation Charges</div>
                      <div className="text-[11px] text-slate-500">Route: {trip?.pickup_city} to {trip?.delivery_city} • Goods: {trip?.cargo_description}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">996511</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      INR {(trip?.freight_charges || invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {(trip?.additional_charges || 0) > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 text-center text-slate-400">2</td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-800">Additional Handling / Loading Surcharge</div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600">996519</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                        INR {(trip?.additional_charges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {(trip?.discount || 0) > 0 && (
                    <tr className="text-emerald-700 bg-emerald-50/40">
                      <td className="py-2.5 px-4 text-center">-</td>
                      <td className="py-2.5 px-4 font-medium">Commercial Volume Discount</td>
                      <td className="py-2.5 px-4 text-center">-</td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        - INR {(trip?.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Settlement Summary */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              {/* Payment Receipts & Bank Info */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Bank Details for Direct Remittance</span>
                  <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                    <p><strong>Account Name:</strong> {organization.name}</p>
                    <p><strong>Bank:</strong> HDFC Bank Ltd (Corporate Branch)</p>
                    <p><strong>Account No:</strong> 50200084918231</p>
                    <p><strong>IFSC Code:</strong> HDFC0001229</p>
                    <p><strong>UPI ID:</strong> apexexpress@hdfcbank</p>
                  </div>
                </div>

                {payments.length > 0 && (
                  <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Recorded Receipts & Advances</span>
                    {payments.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-[11px] text-slate-600 border-b border-slate-100 pb-1">
                        <span>{p.payment_number} ({new Date(p.payment_date).toLocaleDateString()})</span>
                        <span className="font-bold text-emerald-700">INR {p.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals Table */}
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Freight:</span>
                    <span className="font-mono font-medium">INR {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable GST / Taxes (5% RCM / Forward):</span>
                    <span className="font-mono font-medium">INR {invoice.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-300 pt-2">
                    <span>Total Invoiced Amount:</span>
                    <span className="font-mono text-blue-700">INR {invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
                    <span>Total Amount Paid / Advance:</span>
                    <span className="font-mono">INR {invoice.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <span>Balance Due Amount:</span>
                    <span className="font-mono">INR {invoice.balance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
                <p>1. Payment is strictly due within 30 days of the invoice date.</p>
                <p>2. Goods were transported in good condition as per consignment note.</p>
                <p>3. Disputes subject to local jurisdiction at {organization.city || 'Pune'}.</p>
                <p>4. This is a computer-generated tax invoice and requires no physical seal.</p>
              </div>

              <div className="text-right space-y-8">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  For {organization.name}
                </div>
                <div className="border-t border-slate-400 inline-block pt-1 min-w-[180px] text-center">
                  <span className="text-[11px] font-bold text-slate-800">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer watermark & page count */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>TransportPro ERP • Integrated Fleet & Transport Billing SaaS</span>
            <span>Page 1 of 1 • System Generated Original for Recipient</span>
          </div>
        </div>

      </div>
    </div>
  );
};