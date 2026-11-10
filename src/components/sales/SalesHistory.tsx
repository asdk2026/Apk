import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Printer,
  RotateCcw,
  DollarSign,
  CreditCard,
  TrendingUp,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { InvoiceReceiptModal } from '../invoice/InvoiceReceiptModal';

export const SalesHistory: React.FC = () => {
  const { t, settings, invoices, cancelInvoice } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspectInvoice, setInspectInvoice] = useState<Invoice | null>(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return invoices.filter((inv) => {
      // Date filter
      if (dateFilter === 'today') {
        if (!inv.date.startsWith(todayStr)) return false;
      } else if (dateFilter === 'week') {
        const invDate = new Date(inv.date);
        const diffDays = (now.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (dateFilter === 'month') {
        const invDate = new Date(inv.date);
        if (
          invDate.getMonth() !== now.getMonth() ||
          invDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && inv.payment_status !== statusFilter) {
        return false;
      }

      // Search query
      if (!q) return true;
      if (inv.invoice_number.toLowerCase().includes(q)) return true;
      if (inv.customer_name.toLowerCase().includes(q)) return true;
      if (inv.customer_phone && inv.customer_phone.includes(q)) return true;
      return false;
    });
  }, [invoices, searchQuery, dateFilter, statusFilter]);

  // Summaries
  const nonCancelled = useMemo(
    () => filteredInvoices.filter((i) => i.payment_status !== 'cancelled'),
    [filteredInvoices]
  );

  const totalSales = useMemo(
    () => nonCancelled.reduce((acc, i) => acc + i.grand_total, 0),
    [nonCancelled]
  );

  const totalCollected = useMemo(
    () => nonCancelled.reduce((acc, i) => acc + i.paid_amount, 0),
    [nonCancelled]
  );

  const totalDue = useMemo(
    () => nonCancelled.reduce((acc, i) => acc + i.due_amount, 0),
    [nonCancelled]
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>{t('salesHistory')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit completed sales, filter by date ranges, reprint receipts, and process returns.
          </p>
        </div>
      </div>

      {/* Metric Summaries Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Sales</span>
          <span className="font-mono text-lg font-bold text-white">
            {settings.currency}{totalSales.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {nonCancelled.length} active invoices
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">{t('totalCollected')}</span>
          <span className="font-mono text-lg font-bold text-teal-400">
            {settings.currency}{totalCollected.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Cash / MFS in hand</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">{t('totalDue')}</span>
          <span className="font-mono text-lg font-bold text-amber-400">
            {settings.currency}{totalDue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Receivables balance</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Records</span>
          <span className="font-mono text-lg font-bold text-purple-400">
            {filteredInvoices.length}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Including cancelled
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice # or customer name/phone..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">{t('allDates')}</option>
              <option value="today">{t('today')}</option>
              <option value="week">{t('thisWeek')}</option>
              <option value="month">{t('thisMonth')}</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">{t('paidStatus')}</option>
              <option value="partial">{t('partialStatus')}</option>
              <option value="due">{t('dueStatus')}</option>
              <option value="cancelled">{t('cancelledStatus')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List / Table */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No sales records found</p>
          <p className="text-xs text-slate-500 mt-0.5">Completed POS invoices will appear here.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('invoiceNumber')}</th>
                  <th className="py-3 px-4">{t('invoiceDate')}</th>
                  <th className="py-3 px-4">{t('customerName')}</th>
                  <th className="py-3 px-4 text-right">{t('grandTotal')}</th>
                  <th className="py-3 px-4 text-right">{t('paidAmount')}</th>
                  <th className="py-3 px-4 text-right">{t('dueAmount')}</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString()} {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-white block">{inv.customer_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{inv.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {settings.currency}{inv.grand_total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-400 font-medium">
                      {settings.currency}{inv.paid_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={inv.due_amount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                        {settings.currency}{inv.due_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          inv.payment_status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : inv.payment_status === 'partial'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : inv.payment_status === 'cancelled'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setInspectInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View / Print Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.payment_status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to cancel invoice #${inv.invoice_number}? This will return all items to stock.`
                                )
                              ) {
                                cancelInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title={t('cancelSale')}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details / Receipt Modal */}
      {inspectInvoice && (
        <InvoiceReceiptModal
          invoice={inspectInvoice}
          onClose={() => setInspectInvoice(null)}
        />
      )}
    </div>
  );
};
