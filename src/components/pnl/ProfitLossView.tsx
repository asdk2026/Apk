import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculatePnL } from '../../utils/pricing';

export const ProfitLossView: React.FC = () => {
  const { t, settings, invoices, expenses } = useApp();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // Filtered invoices and expenses by selected period
  const { periodInvoices, periodExpenses } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const matchDate = (dateIso: string) => {
      if (period === 'all') return true;
      if (period === 'today') return dateIso.startsWith(todayStr);
      const d = new Date(dateIso);
      if (period === 'week') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    };

    return {
      periodInvoices: invoices.filter((i) => matchDate(i.date)),
      periodExpenses: expenses.filter((e) => matchDate(e.date)),
    };
  }, [invoices, expenses, period]);

  // Financial aggregates
  const pnl = useMemo(() => {
    let grossSales = 0;
    let salesReturns = 0;
    let cogs = 0;
    let cashCollected = 0;

    for (const inv of periodInvoices) {
      if (inv.payment_status === 'cancelled') {
        salesReturns += inv.grand_total;
      } else {
        grossSales += inv.grand_total;
        cashCollected += inv.paid_amount;
        // Calculate exact COGS from items
        for (const item of inv.items) {
          const itemUnitCost = item.purchase_cost || 0;
          cogs += itemUnitCost * item.package_quantity;
        }
      }
    }

    const operatingExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);

    return {
      ...calculatePnL(grossSales, salesReturns, cogs, operatingExpenses),
      cashCollected,
      outstandingReceivables: Math.max(0, grossSales - salesReturns - cashCollected),
    };
  }, [periodInvoices, periodExpenses]);

  // Expenses by Category breakdown
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of periodExpenses) {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodExpenses]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>{t('pnl')} - Income Statement</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Accurate revenue, cost of goods sold (COGS), operating expenses, and net profit margins.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                period === p
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'today'
                ? t('today')
                : p === 'week'
                ? t('thisWeek')
                : p === 'month'
                ? t('thisMonth')
                : p === 'year'
                ? t('thisYear')
                : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Sales */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">{t('netSales')}</span>
          <span className="font-mono text-2xl font-bold text-white">
            {settings.currency}{pnl.netSales.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Gross: {settings.currency}{pnl.grossSales.toLocaleString()}
          </span>
        </div>

        {/* Gross Profit */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">{t('grossProfit')}</span>
          <span className={`font-mono text-2xl font-bold ${pnl.grossProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            {settings.currency}{pnl.grossProfit.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            COGS: {settings.currency}{pnl.cogs.toLocaleString()}
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">{t('operatingExpenses')}</span>
          <span className="font-mono text-2xl font-bold text-purple-400">
            {settings.currency}{pnl.operatingExpenses.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {periodExpenses.length} expense entries
          </span>
        </div>

        {/* Net Profit & Margin */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">{t('netProfit')}</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {pnl.profitMarginPercent}% Margin
            </span>
          </div>
          <span className={`font-mono text-2xl font-bold ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {settings.currency}{pnl.netProfit.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Net bottom line after all costs
          </span>
        </div>
      </div>

      {/* Detailed Ledger & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Income Statement Table (col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>{t('incomeStatement')}</span>
            <span className="text-xs font-mono text-slate-400 capitalize">{period}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-300 font-medium">{t('grossSales')}</span>
              <span className="font-mono font-bold text-white">{settings.currency}{pnl.grossSales.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1 text-rose-400">
              <span>Less: {t('salesReturns')}</span>
              <span className="font-mono">-{settings.currency}{pnl.salesReturns.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-t border-slate-800 font-bold text-white">
              <span>{t('netSales')}</span>
              <span className="font-mono text-emerald-400">{settings.currency}{pnl.netSales.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1 text-slate-400">
              <span>Less: {t('cogs')} (Direct Inventory Cost)</span>
              <span className="font-mono text-rose-400">-{settings.currency}{pnl.cogs.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-b border-slate-800 font-bold text-sm text-white">
              <span>{t('grossProfit')}</span>
              <span className="font-mono text-teal-400">{settings.currency}{pnl.grossProfit.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1 text-slate-400">
              <span>Less: {t('operatingExpenses')} (Shop Overheads)</span>
              <span className="font-mono text-rose-400">-{settings.currency}{pnl.operatingExpenses.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 font-bold text-base text-white border border-slate-800">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>{t('netProfit')}</span>
              </span>
              <span className={`font-mono ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {settings.currency}{pnl.netProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Cash Collection vs Receivables Distinction */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Actual Cash In Hand</span>
              <span className="font-mono font-bold text-sm text-teal-400 mt-1 block">
                {settings.currency}{pnl.cashCollected.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Uncollected Credit (Due)</span>
              <span className="font-mono font-bold text-sm text-amber-400 mt-1 block">
                {settings.currency}{pnl.outstandingReceivables.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Operating Expenses Breakdown (col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Operating Expense Breakdown</span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </h3>

          {expensesByCategory.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              No operating expenses recorded for this period.
            </p>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.map(([cat, amt]) => {
                const percent = pnl.operatingExpenses > 0 ? (amt / pnl.operatingExpenses) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="font-mono font-semibold text-white">
                        {settings.currency}{amt.toLocaleString()} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
