import React from 'react';
import { format } from 'date-fns';

export default function OrderPrintView({ order, settings = {} }) {
  if (!order) return null;

  return (
    <div className="hidden print:block print-container p-8 bg-white text-black font-sans">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {settings.companyName || 'OrderFlow Enterprise'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{settings.address || '750 Industrial Parkway, Suite 500, New York, NY 10001'}</p>
          <p className="text-xs text-slate-500">Phone: {settings.phone} | Email: {settings.email}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800">Order Document</h2>
          <p className="text-lg font-mono font-semibold text-blue-600 mt-1">{order.orderNumber}</p>
          <p className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold uppercase">{order.status}</span></p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 text-sm">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Customer Details</p>
          <p className="font-bold text-slate-900 mt-1">{order.customer?.name}</p>
          <p className="text-slate-700">{order.customer?.companyName}</p>
          <p className="text-xs text-slate-600 mt-1">{order.customer?.address}</p>
        </div>

        <div className="space-y-1 text-right">
          <p><span className="text-slate-500 font-medium">Order Date:</span> {order.date ? format(new Date(order.date), 'dd MMM yyyy') : ''}</p>
          <p><span className="text-slate-500 font-medium">PO Number:</span> {order.poNumber || 'N/A'}</p>
          <p><span className="text-slate-500 font-medium">Indent Number:</span> {order.indentNumber || 'N/A'}</p>
        </div>
      </div>

      {/* Product Line Table */}
      <table className="w-full text-left text-sm border-collapse mb-12">
        <thead>
          <tr className="border-b-2 border-slate-900 bg-slate-100">
            <th className="py-2.5 px-3 font-bold w-12 text-center">#</th>
            <th className="py-2.5 px-3 font-bold">Product Description</th>
            <th className="py-2.5 px-3 font-bold text-right w-32">Quantity</th>
            <th className="py-2.5 px-3 font-bold text-center w-24">UOM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {(order.products || []).map((prod, idx) => (
            <tr key={idx}>
              <td className="py-3 px-3 text-center text-slate-500">{idx + 1}</td>
              <td className="py-3 px-3 font-medium text-slate-900">{prod.description}</td>
              <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                {prod.quantity ? prod.quantity.toLocaleString() : '0'}
              </td>
              <td className="py-3 px-3 text-center text-slate-700 font-medium">{prod.uom}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures Footer */}
      <div className="grid grid-cols-3 gap-8 pt-16 border-t border-slate-300 text-xs text-slate-600">
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">Prepared By</div>
          <p>Authorized Signature</p>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">Approved By</div>
          <p>Manager Signature</p>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">Customer Confirmation</div>
          <p>Received & Verified Signature</p>
        </div>
      </div>
    </div>
  );
}
