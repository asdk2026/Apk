import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  Package,
  TrendingUp,
  Boxes,
  Users,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const {
    t,
    settings,
    products,
    invoices,
    expenses,
    purchases,
    customers,
  } = useApp();

  const [reportType, setReportType] = useState<
    'daily' | 'monthly' | 'products' | 'valuation' | 'customers'
  >('daily');

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // Export CSV helper
  const handleExportCsv = () => {
    let rows: string[][] = [];
    let filename = `BusinessMind_Report_${reportType}.csv`;

    if (reportType === 'daily' || reportType === 'monthly') {
      rows.push(['Date', 'Invoice #', 'Customer', 'Grand Total', 'Paid Amount', 'Due Amount', 'Status']);
      invoices.forEach((i) => {
        rows.push([
          new Date(i.date).toLocaleDateString(),
          i.invoice_number,
          `"${i.customer_name}"`,
          String(i.grand_total),
          String(i.paid_amount),
          String(i.due_amount),
          i.payment_status,
        ]);
      });
    } else if (reportType === 'valuation') {
      rows.push(['Product', 'Quality', 'Size/Weight', 'Stock Qty', 'Cost Price', 'Selling Price', 'Valuation Cost', 'Potential Value']);
      products.forEach((p) => {
        p.qualities.forEach((q) => {
          q.variants.forEach((v) => {
            rows.push([
              `"${p.name}"`,
              `"${q.name}"`,
              `"${v.size_weight} ${v.unit}"`,
              String(v.stock_quantity),
              String(v.purchase_price),
              String(v.selling_price),
              String(v.stock_quantity * v.purchase_price),
              String(v.stock_quantity * v.selling_price),
            ]);
          });
        });
      });
    } else {
      rows.push(['Customer', 'Phone', 'Total Purchased', 'Total Paid', 'Outstanding Due']);
      customers.forEach((c) => {
        rows.push([`"${c.name}"`, c.phone, String(c.total_purchases), String(c.total_paid), String(c.outstanding_due)]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inventory Valuation Aggregates
  const valuation = useMemo(() => {
    let totalStockUnits = 0;
    let totalCostValuation = 0;
    let potentialRetailRevenue = 0;

    for (const p of products) {
      for (const q of p.qualities) {
        for (const v of q.variants) {
          totalStockUnits += v.stock_quantity;
          totalCostValuation += v.stock_quantity * v.purchase_price;
          potentialRetailRevenue += v.stock_quantity * v.selling_price;
        }
      }
    }

    const potentialGrossProfit = potentialRetailRevenue - totalCostValuation;

    return {
      totalStockUnits,
      totalCostValuation,
      potentialRetailRevenue,
      potentialGrossProfit,
    };
  }, [products]);

  // Product-wise sales aggregate
  const productSales = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};

    invoices.forEach((inv) => {
      if (inv.payment_status === 'cancelled') return;
      inv.items.forEach((item) => {
        if (!map[item.product_id]) {
          map[item.product_id] = { name: item.product_name, qty: 0, revenue: 0, profit: 0 };
        }
        map[item.product_id].qty += item.package_quantity;
        map[item.product_id].revenue += item.line_total;
        const cost = (item.purchase_cost || 0) * item.package_quantity;
        map[item.product_id].profit += item.line_total - cost;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [invoices]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>{t('reports')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit daily/monthly performance, best-selling goods, and real-time inventory valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('exportExcel')}</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print')}</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs (no-print) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
        {[
          { id: 'daily', label: t('dailyReport') },
          { id: 'monthly', label: t('monthlyReport') },
          { id: 'products', label: t('productWiseSales') },
          { id: 'valuation', label: t('inventoryValuation') },
          { id: 'customers', label: 'Customer Balances' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              reportType === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Valuation Strip (if inventory valuation selected) */}
      {reportType === 'valuation' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total Stocked Units</span>
            <span className="font-mono text-xl font-bold text-white">
              {valuation.totalStockUnits}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">{t('totalStockValue')}</span>
            <span className="font-mono text-xl font-bold text-emerald-400">
              {settings.currency}{valuation.totalCostValuation.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">{t('potentialRevenue')}</span>
            <span className="font-mono text-xl font-bold text-teal-400">
              {settings.currency}{valuation.potentialRetailRevenue.toLocaleString()}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Unrealized Gross Margin</span>
            <span className="font-mono text-xl font-bold text-purple-400">
              {settings.currency}{valuation.potentialGrossProfit.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Report Data Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs print-area">
        {/* Print Title Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white capitalize">{reportType} Statement</h3>
            <span className="text-[11px] text-slate-500">
              {settings.business_name} · Generated on {new Date().toLocaleDateString()}
            </span>
          </div>
          <span className="font-mono text-xs text-emerald-400 font-semibold">
            Currency: {settings.currency} (BDT)
          </span>
        </div>

        {reportType === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">{t('productName')}</th>
                  <th className="py-3 px-4 text-center">Total Qty Sold</th>
                  <th className="py-3 px-4 text-right">Revenue (৳)</th>
                  <th className="py-3 px-4 text-right">Estimated Gross Margin (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {productSales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  productSales.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {item.qty}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-white">
                        {settings.currency}{item.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-400">
                        {settings.currency}{item.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : reportType === 'valuation' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Quality & Size</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Cost (৳)</th>
                  <th className="py-3 px-4 text-right">Selling (৳)</th>
                  <th className="py-3 px-4 text-right">Valuation (Cost)</th>
                  <th className="py-3 px-4 text-right">Retail Potential</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {products.flatMap((p) =>
                  p.qualities.flatMap((q) =>
                    q.variants.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {q.name} ({v.size_weight} {v.unit})
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {v.stock_quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {settings.currency}{v.purchase_price}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {settings.currency}{v.selling_price}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {settings.currency}{(v.stock_quantity * v.purchase_price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal-400">
                          {settings.currency}{(v.stock_quantity * v.selling_price).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Total (৳)</th>
                  <th className="py-3 px-4 text-right">Collected (৳)</th>
                  <th className="py-3 px-4 text-right">Due (৳)</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{inv.customer_name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {settings.currency}{inv.grand_total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-400">
                      {settings.currency}{inv.paid_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {settings.currency}{inv.due_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {inv.payment_method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
