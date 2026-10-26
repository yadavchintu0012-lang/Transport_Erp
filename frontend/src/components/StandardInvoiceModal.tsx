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
    id?: string;
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

// Convert Indian Currency numbers to words
function amountToWordsINR(num: number): string {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  let str = '';
  const convertUnder100 = (val: number) => {
    if (val < 20) return a[val];
    return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
  };

  if (crore > 0) str += convertUnder100(crore) + ' Crore ';
  if (lakh > 0) str += convertUnder100(lakh) + ' Lakh ';
  if (thousand > 0) str += convertUnder100(thousand) + ' Thousand ';
  if (hundred > 0) str += a[hundred] + ' Hundred ';
  if (rest > 0) str += (str !== '' ? 'and ' : '') + convertUnder100(rest) + ' ';

  return ('INR ' + str.trim() + ' Only').replace(/\s+/g, ' ');
}

export const StandardInvoiceModal: React.FC<StandardInvoiceModalProps> = ({ data, onClose }) => {
  const { invoice, organization, customer, trip, payments = [] } = data;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = (d?: string) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container - Constrained to 1 Standard A4 Page in print */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto border border-slate-200 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Screen Controls Header - Hidden during print */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
              TP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-tight">Standard Tax Invoice & Consignment Note</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  1-Page Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Invoice: <strong className="text-white">{invoice.invoice_number}</strong> • Linked Trip: <strong className="text-white">{trip?.trip_number || 'Direct Billing'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={14} />
              <span>Print / Save 1-Page PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 1-PAGE STANDARDIZED PROFESSIONAL INVOICE SHEET */}
        <div className="p-6 sm:p-7 text-slate-900 bg-white flex flex-col justify-between print:p-0 print:m-0 print:max-h-[285mm] print:overflow-hidden select-text font-sans leading-tight">
          
          <div>
            {/* Top Corporate Branding & Invoice Header */}
            <div className="flex justify-between items-start pb-3 border-b-2 border-slate-900 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-11 h-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0 border border-slate-700">
                  TP
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-950 tracking-tight leading-none uppercase">
                    {organization.name || 'Apex Express Logistics Pvt. Ltd.'}
                  </h1>
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mt-1">
                    Goods Transport Agency (GTA) • Fleet & Logistics Operations
                  </p>
                  <div className="text-[10px] text-slate-600 space-y-0.5 mt-1">
                    <p>{organization.address || 'Central Transport Nagar Complex, Main Cargo Hub'}</p>
                    <p>{organization.city || 'Pune'}, {organization.state || 'Maharashtra'} - India</p>
                    <p>
                      <strong>Tel:</strong> {organization.phone || '+91 98765 43210'} | <strong>Email:</strong> {organization.email || 'billing@apexexpress.com'}
                    </p>
                    <p className="font-mono">
                      <strong>GSTIN:</strong> <span className="font-bold text-slate-950">{organization.tax_number || '27AABCA1234F1Z5'}</span> | <strong>PAN:</strong> <span className="font-bold text-slate-950">AABCA1234F</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Metadata Box */}
              <div className="text-right shrink-0">
                <div className="inline-block px-2.5 py-1 bg-slate-950 text-white rounded text-[10px] font-black tracking-widest uppercase mb-1.5">
                  TAX INVOICE
                </div>
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                  [ Original for Recipient ]
                </div>
                <div className="space-y-1 text-[11px] font-mono text-slate-800">
                  <div>
                    <span className="text-slate-500">Invoice #: </span>
                    <strong className="text-slate-950 text-xs font-bold">{invoice.invoice_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date: </span>
                    <strong className="text-slate-900">{formattedDate(invoice.invoice_date)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Due Date: </span>
                    <strong className="text-slate-900">{formattedDate(invoice.due_date)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Status: </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      invoice.status === 'partially_paid' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To (Customer) & Selected Trip Details (2-Column Grid) */}
            <div className="grid grid-cols-2 gap-3 my-3">
              {/* Billed To / Consignee */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                  <span className="font-bold text-blue-800 uppercase tracking-wider text-[9px]">
                    Billed To (Consignee / Customer)
                  </span>
                  <span className="text-slate-400 text-[9px]">Party Code: {customer.id?.slice(0, 8) || 'CUST-DIR'}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-950 uppercase leading-snug">
                  {customer.name}
                </h4>
                <p className="text-slate-600">
                  {customer.billing_address || 'Commercial Depot, Industrial Area'}
                </p>
                <p className="text-slate-600">
                  {customer.city ? customer.city + ', ' : ''}{customer.state || 'India'}
                </p>
                <p className="text-slate-600">
                  <strong>Contact:</strong> {customer.contact_person || 'Logistics Dept'} {customer.phone ? `(${customer.phone})` : ''}
                </p>
                <p className="font-mono text-slate-900 pt-0.5">
                  <strong>GSTIN / UIN:</strong> <span className="font-bold">{customer.tax_number || 'URP (Unregistered Person)'}</span>
                </p>
              </div>

              {/* Selected Trip Details */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200 text-[10px] space-y-1">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1 mb-1">
                  <span className="font-bold text-blue-900 uppercase tracking-wider text-[9px]">
                    Consignment & Selected Trip Movement
                  </span>
                  <span className="font-mono font-bold text-blue-800 text-[10px]">
                    {trip?.trip_number ? `Trip: ${trip.trip_number}` : 'Direct Consignment'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700">
                  <div>
                    <span className="text-slate-500">Vehicle No:</span>{' '}
                    <strong className="text-slate-950 font-bold font-mono">{trip?.vehicle_number || 'MH 12 AB 1234'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Vehicle Type:</span>{' '}
                    <span className="font-medium">{trip?.vehicle_type || 'Heavy Commercial Truck'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Driver:</span>{' '}
                    <span className="font-medium">{trip?.driver_name || 'Assigned Driver'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Driver Mobile:</span>{' '}
                    <span className="font-mono">{trip?.driver_phone || '+91 98000 12345'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Loading (From):</span>{' '}
                    <strong className="text-slate-900">{trip?.pickup_city || 'Origin Depot'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Unloading (To):</span>{' '}
                    <strong className="text-slate-900">{trip?.delivery_city || 'Destination Depot'}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-blue-100 flex items-center justify-between">
                    <span>
                      <span className="text-slate-500">Cargo / Goods:</span>{' '}
                      <strong className="text-slate-900">{trip?.cargo_description || 'Commercial Freight Cargo'}</strong>
                    </span>
                    <span>
                      <span className="text-slate-500">Weight:</span>{' '}
                      <strong className="text-slate-900 font-mono">{trip?.cargo_weight_tonnes || 0} MT</strong>
                    </span>
                  </div>
                  {trip?.customer_po_ref && (
                    <div className="col-span-2 font-mono text-[9px] text-blue-800">
                      <strong>PO / Consignment Ref:</strong> {trip.customer_po_ref}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Transportation Services Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider">
                  <tr>
                    <th className="py-1.5 px-3 w-8 text-center">#</th>
                    <th className="py-1.5 px-3">Description of Transportation Service</th>
                    <th className="py-1.5 px-3 text-center w-24">SAC Code</th>
                    <th className="py-1.5 px-3 text-center w-24">Cargo Weight</th>
                    <th className="py-1.5 px-3 text-right w-36">Taxable Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10px] text-slate-800">
                  <tr>
                    <td className="py-2 px-3 text-center font-bold text-slate-400">1</td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-950 text-[11px]">
                        Freight Transportation Charges ({trip?.pickup_city || 'Origin'} to {trip?.delivery_city || 'Destination'})
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        Consignment Trip: {trip?.trip_number || invoice.invoice_number} • Vehicle: {trip?.vehicle_number || 'Commercial Carrier'} • Cargo: {trip?.cargo_description || 'General Freight'}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                      996511
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">
                      {trip?.cargo_weight_tonnes ? `${trip.cargo_weight_tonnes} MT` : '1 L.S.'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-950 text-[11px]">
                      {(trip?.freight_charges || invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Surcharges if applicable */}
                  {(trip?.additional_charges || 0) > 0 && (
                    <tr className="bg-slate-50/60">
                      <td className="py-1.5 px-3 text-center font-bold text-slate-400">2</td>
                      <td className="py-1.5 px-3 font-medium text-slate-800">
                        Handling, Loading / Unloading & Detention Surcharge
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono text-slate-600">996519</td>
                      <td className="py-1.5 px-3 text-center font-mono text-slate-500">-</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(trip?.additional_charges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}

                  {/* Volume discount if applicable */}
                  {(trip?.discount || 0) > 0 && (
                    <tr className="text-emerald-800 bg-emerald-50/50">
                      <td className="py-1.5 px-3 text-center font-bold text-emerald-600">-</td>
                      <td className="py-1.5 px-3 font-medium">
                        Commercial Volume Transport Discount
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono text-emerald-700">-</td>
                      <td className="py-1.5 px-3 text-center font-mono">-</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold">
                        - {(trip?.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations, Bank Remittance & Settlement Summary Grid */}
            <div className="grid grid-cols-2 gap-3 my-2.5 items-start">
              {/* Left Column: Bank Details & Terms */}
              <div className="space-y-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                    <span className="font-bold text-slate-800 uppercase text-[9px] font-sans">
                      Bank Details for Electronic Remittance (NEFT / RTGS)
                    </span>
                    <ShieldCheck size={12} className="text-emerald-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700 text-[9.5px]">
                    <div><strong>A/C Name:</strong> {organization.name}</div>
                    <div><strong>Bank:</strong> HDFC Bank Ltd</div>
                    <div><strong>A/C Number:</strong> 50200084918231</div>
                    <div><strong>IFSC Code:</strong> HDFC0001229</div>
                    <div className="col-span-2"><strong>UPI ID:</strong> apexexpress@hdfcbank</div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9.5px] text-slate-700 space-y-0.5">
                  <p><strong>Tax Payable under Reverse Charge (RCM):</strong> No</p>
                  <p><strong>Applicable Tax Category:</strong> GTA Forward Charge (5% with ITC restricted)</p>
                  <p className="text-slate-900 font-sans font-bold pt-0.5">
                    Amount in Words: <span className="text-blue-900 font-semibold">{amountToWordsINR(invoice.total_amount)}</span>
                  </p>
                </div>

                {payments.length > 0 && (
                  <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/40 text-[9px] text-emerald-950 space-y-0.5">
                    <span className="font-bold uppercase tracking-wider block">Recorded Advance / Payment Receipts:</span>
                    {payments.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex justify-between font-mono">
                        <span>{p.payment_number} ({formattedDate(p.payment_date)})</span>
                        <span className="font-bold text-emerald-800">INR {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Financial Totals Table */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal (Taxable Freight Value):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    INR {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>GST Amount (CGST 2.5% + SGST 2.5% / IGST 5%):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    INR {invoice.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-black text-slate-950 border-t-2 border-slate-300 pt-1.5">
                  <span className="uppercase tracking-tight">Total Invoice Amount:</span>
                  <span className="font-mono text-blue-800 text-sm">
                    INR {invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-emerald-700 pt-0.5">
                  <span>Less: Advance / Received Amount:</span>
                  <span className="font-mono">
                    INR {invoice.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-black text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                  <span className="uppercase tracking-tight">Net Balance Due:</span>
                  <span className="font-mono text-sm">
                    INR {invoice.balance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Authorized Signatures (Single Row) */}
            <div className="pt-2.5 border-t border-slate-300 grid grid-cols-2 gap-4 items-end text-[9px]">
              <div className="text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-800 uppercase text-[9px]">Standard Terms & Conditions:</p>
                <p>1. Payment strictly due within 30 days of invoice date.</p>
                <p>2. Goods conveyed under standard carrier risk as per Motor Vehicles & Carriage by Road Act.</p>
                <p>3. Disputes subject to judicial jurisdiction at {organization.city || 'Pune'}.</p>
                <p>4. This is an authentic computer-generated Tax Invoice and Consignment Note.</p>
              </div>

              <div className="text-right space-y-4">
                <div className="text-[9.5px] font-bold text-slate-700 uppercase">
                  For {organization.name}
                </div>
                <div className="border-t border-slate-900 inline-block pt-1 min-w-[170px] text-center">
                  <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider block">Authorized Signatory</span>
                  <span className="text-[8.5px] text-slate-400 font-mono block">Digitally Verified • TransportPro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Watermark & Page Numbering */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 mt-2">
            <span>TransportPro ERP Cloud • Logistics Fleet Operations</span>
            <span className="font-bold text-slate-600">Page 1 of 1 (Strictly 1-Page Tax Invoice)</span>
          </div>

        </div>

      </div>

      {/* Embedded Print CSS to Guarantee Strict 1-Page Output */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: 100% !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};