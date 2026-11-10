import React from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle,
  Receipt,
} from 'lucide-react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';

interface InvoiceReceiptModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onNewInvoice?: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  invoice,
  onClose,
  onNewInvoice,
}) => {
  const { t, settings } = useApp();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Invoice #${invoice.invoice_number}\nCustomer: ${invoice.customer_name}\nGrand Total: ${settings.currency}${invoice.grand_total}\nPaid: ${settings.currency}${invoice.paid_amount}\nDue: ${settings.currency}${invoice.due_amount}\nThank you for shopping at ${settings.business_name}!`;
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Invoice details copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const content = `========================================
        ${settings.business_name}
${settings.address}
Phone: ${settings.phone}
========================================
Invoice #: ${invoice.invoice_number}
Date: ${new Date(invoice.date).toLocaleString()}
Customer: ${invoice.customer_name} (${invoice.customer_phone})
----------------------------------------
ITEMS:
${invoice.items
  .map(
    (item, idx) =>
      `${idx + 1}. ${item.product_name} (${item.quality_name} - ${item.selected_size_weight} ${item.unit})\n   Price: ${settings.currency}${item.unit_price} x ${item.package_quantity} = ${settings.currency}${item.line_total}`
  )
  .join('\n')}
----------------------------------------
Subtotal: ${settings.currency}${invoice.subtotal}
Discount: -${settings.currency}${invoice.discount_amount}
Tax/VAT: ${settings.currency}${invoice.tax_amount}
Charges: ${settings.currency}${invoice.additional_charges}
----------------------------------------
GRAND TOTAL: ${settings.currency}${invoice.grand_total}
PAID AMOUNT: ${settings.currency}${invoice.paid_amount}
DUE AMOUNT:  ${settings.currency}${invoice.due_amount}
Payment: ${invoice.payment_method} (${invoice.payment_status.toUpperCase()})
========================================
${settings.invoice_footer}
========================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden on print) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">Invoice Generated</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              title="Share Receipt"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
          <div className="print-area w-full max-w-md bg-white text-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 font-sans text-xs">
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-1 text-sm">
                BM
              </div>
              <h2 className="font-bold text-base text-slate-900 tracking-tight">
                {settings.business_name}
              </h2>
              <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                {settings.address}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Phone: {settings.phone}
              </p>
            </div>

            {/* Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 flex justify-between items-start text-[11px]">
              <div>
                <span className="text-slate-500 block">Invoice To:</span>
                <span className="font-bold text-slate-900 block">{invoice.customer_name}</span>
                <span className="text-slate-600">{invoice.customer_phone}</span>
                {invoice.customer_address && (
                  <span className="text-slate-500 block">{invoice.customer_address}</span>
                )}
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 block">
                  {invoice.invoice_number}
                </span>
                <span className="text-slate-500 block">
                  {new Date(invoice.date).toLocaleDateString()} {new Date(invoice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                  {invoice.payment_method} · {invoice.payment_status}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1">
                        <span className="font-medium text-slate-900 block leading-tight">
                          {item.product_name}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.quality_name} · {item.selected_size_weight} {item.unit}
                        </span>
                      </td>
                      <td className="py-1 text-center font-mono">
                        {item.package_quantity}
                      </td>
                      <td className="py-1 text-right font-mono">
                        {settings.currency}{item.unit_price}
                      </td>
                      <td className="py-1 text-right font-mono font-semibold text-slate-900">
                        {settings.currency}{item.line_total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{settings.currency}{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">-{settings.currency}{invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT / Tax ({invoice.tax_rate}%):</span>
                  <span className="font-mono">+{settings.currency}{invoice.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.additional_charges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Charges:</span>
                  <span className="font-mono">+{settings.currency}{invoice.additional_charges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono">{settings.currency}{invoice.grand_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Paid Amount:</span>
                <span className="font-mono">{settings.currency}{invoice.paid_amount.toFixed(2)}</span>
              </div>
              {invoice.due_amount > 0 && (
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Due Balance:</span>
                  <span className="font-mono">{settings.currency}{invoice.due_amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center text-[10px] text-slate-500">
              <p>{settings.invoice_footer || 'Thank you for your business!'}</p>
              <p className="mt-1 font-mono text-[9px] text-slate-400">
                System Generated via Business Mind POS
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons (no-print) */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {t('close')}
          </button>

          {onNewInvoice && (
            <button
              onClick={() => {
                onClose();
                onNewInvoice();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
            >
              + {t('newInvoice')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
