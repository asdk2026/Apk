import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  UserCheck,
  Truck,
  DollarSign,
  Calendar,
  AlertTriangle,
  History,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DueManagement: React.FC = () => {
  const {
    t,
    settings,
    customers,
    suppliers,
    invoices,
    purchases,
    payments,
    receiveCustomerPayment,
    recordSupplierPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier' | 'payments'>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Collection Modal
  const [targetCustomer, setTargetCustomer] = useState<{ id: string; name: string; due: number } | null>(null);
  const [targetSupplier, setTargetSupplier] = useState<{ id: string; name: string; due: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Total Dues
  const totalCustomerDue = useMemo(
    () => customers.reduce((acc, c) => acc + c.outstanding_due, 0),
    [customers]
  );

  const totalSupplierDue = useMemo(
    () => suppliers.reduce((acc, s) => acc + s.outstanding_due, 0),
    [suppliers]
  );

  // Invoices with outstanding due
  const dueInvoices = useMemo(
    () => invoices.filter((i) => i.due_amount > 0 && i.payment_status !== 'cancelled'),
    [invoices]
  );

  // Purchases with outstanding supplier due
  const duePurchases = useMemo(
    () => purchases.filter((p) => p.supplier_due > 0 && p.payment_status !== 'cancelled'),
    [purchases]
  );

  const handleReceiveCustomerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer || paymentAmount <= 0) return;
    receiveCustomerPayment(targetCustomer.id, paymentAmount, paymentMethod, paymentNotes);
    alert(`Received ${settings.currency}${paymentAmount} from ${targetCustomer.name}`);
    setTargetCustomer(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSupplier || paymentAmount <= 0) return;
    recordSupplierPayment(targetSupplier.id, paymentAmount, paymentMethod, paymentNotes);
    alert(`Paid ${settings.currency}${paymentAmount} to ${targetSupplier.name}`);
    setTargetSupplier(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>{t('due')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor accounts receivable (customer credit) and accounts payable (supplier debt).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'customer'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('customerDueTab')}
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'supplier'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('supplierDueTab')}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'payments'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('paymentHistory')} ({payments.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              Total Customer Due (Receivables)
            </span>
            <span className="font-mono text-2xl font-bold text-amber-400">
              {settings.currency}{totalCustomerDue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              From {customers.filter((c) => c.outstanding_due > 0).length} customers
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              Total Supplier Due (Payables)
            </span>
            <span className="font-mono text-2xl font-bold text-rose-400">
              {settings.currency}{totalSupplierDue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              To {suppliers.filter((s) => s.outstanding_due > 0).length} suppliers
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab 1: Customer Due */}
      {activeTab === 'customer' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-white">Outstanding Customer Balances</span>
              <span className="text-[11px] text-slate-400">
                {customers.filter((c) => c.outstanding_due > 0).length} accounts with balance
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('customerName')}</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">{t('totalPurchases')}</th>
                    <th className="py-3 px-4 text-right">{t('totalCollected')}</th>
                    <th className="py-3 px-4 text-right">{t('remainingDue')}</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {customers
                    .filter((c) => c.outstanding_due > 0)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {c.name}
                          <span className="text-[10px] text-slate-500 block font-normal">{c.code}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {c.phone}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {settings.currency}{c.total_purchases.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-teal-400">
                          {settings.currency}{c.total_paid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                          {settings.currency}{c.outstanding_due.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setTargetCustomer({ id: c.id, name: c.name, due: c.outstanding_due });
                              setPaymentAmount(c.outstanding_due);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-[11px]"
                          >
                            {t('receivePayment')}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Due */}
      {activeTab === 'supplier' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-white">Supplier Payable Accounts</span>
              <span className="text-[11px] text-slate-400">
                {suppliers.filter((s) => s.outstanding_due > 0).length} suppliers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('supplierName')}</th>
                    <th className="py-3 px-4">{t('supplierPhone')}</th>
                    <th className="py-3 px-4 text-right">Total Purchased</th>
                    <th className="py-3 px-4 text-right">Paid (৳)</th>
                    <th className="py-3 px-4 text-right">{t('remainingDue')}</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {suppliers
                    .filter((s) => s.outstanding_due > 0)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{s.phone}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {settings.currency}{s.total_purchased.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-teal-400">
                          {settings.currency}{s.total_paid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          {settings.currency}{s.outstanding_due.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setTargetSupplier({ id: s.id, name: s.name, due: s.outstanding_due });
                              setPaymentAmount(s.outstanding_due);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 font-semibold text-[11px]"
                          >
                            {t('makePayment')}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Records History */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No payments logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            p.type === 'customer'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-teal-500/15 text-teal-400'
                          }`}
                        >
                          {p.type === 'customer' ? 'Customer Received' : 'Supplier Paid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{p.party_name}</td>
                      <td className="py-3 px-4 text-slate-300">{p.payment_method}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {settings.currency}{p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {p.reference_number || p.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customer Payment Collection Modal */}
      {targetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Receive Customer Payment</h3>
              <button onClick={() => setTargetCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiveCustomerPayment} className="space-y-3.5 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-sm text-white">{targetCustomer.name}</span>
                <span className="text-amber-400 font-mono block mt-0.5">
                  Total Due: {settings.currency}{targetCustomer.due}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount to Receive (৳) *</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash / MFS">bKash / MFS</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Card">Bank Card</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Receipt # or MFS Transaction ID"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Payment Modal */}
      {targetSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">Record Supplier Payment</h3>
              <button onClick={() => setTargetSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySupplier} className="space-y-3.5 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-sm text-white">{targetSupplier.name}</span>
                <span className="text-rose-400 font-mono block mt-0.5">
                  Payable Due: {settings.currency}{targetSupplier.due}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Amount Paid (৳) *</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-teal-400 font-mono font-bold focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Cheque / EFT</option>
                  <option value="bKash / MFS">bKash / MFS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cheque / Voucher Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cheque #49281 City Bank"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTargetSupplier(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
