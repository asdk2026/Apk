import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Edit2,
  Trash2,
  Receipt,
  Eye,
  X,
  Save,
  DollarSign,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

export const CustomerManagement: React.FC = () => {
  const {
    t,
    settings,
    customers,
    invoices,
    payments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    receiveCustomerPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);

  // Receive Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Add / Edit form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  // Open Edit Form
  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email || '');
    setFormAddress(cust.address);
    setFormCode(cust.code);
    setFormOpeningBalance(cust.opening_balance);
    setFormNotes(cust.notes || '');
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormCode(`CUST-${customers.length + 101}`);
    setFormOpeningBalance(0);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Please provide customer name and phone number.');
      return;
    }

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        code: formCode.trim(),
        notes: formNotes.trim(),
      });
    } else {
      addCustomer({
        business_id: settings.business_id,
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        code: formCode.trim() || `CUST-${Date.now().toString().slice(-4)}`,
        opening_balance: formOpeningBalance || 0,
        notes: formNotes.trim(),
      });
    }
    setShowAddModal(false);
    setEditingCustomer(null);
  };

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer || paymentAmount <= 0) return;
    receiveCustomerPayment(
      paymentModalCustomer.id,
      paymentAmount,
      paymentMethod,
      paymentNotes
    );
    alert(`Payment of ${settings.currency}${paymentAmount} received from ${paymentModalCustomer.name}`);
    setPaymentModalCustomer(null);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      if (!q) return true;
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.phone.includes(q)) return true;
      if (c.code.toLowerCase().includes(q)) return true;
      if (c.address.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [customers, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>{t('customers')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer accounts, purchase histories, credit limits, and outstanding receivables.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCustomer')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, code, address..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">{t('customerName')}</th>
                <th className="py-3 px-4">{t('customerPhone')}</th>
                <th className="py-3 px-4 text-right">{t('totalPurchases')}</th>
                <th className="py-3 px-4 text-right">{t('totalCollected')}</th>
                <th className="py-3 px-4 text-right">{t('dueAmount')}</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {c.name}
                    {c.address && (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {c.address}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {settings.currency}{c.total_purchases.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-teal-400 font-medium">
                    {settings.currency}{c.total_paid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={c.outstanding_due > 0 ? 'text-amber-400' : 'text-slate-400'}>
                      {settings.currency}{c.outstanding_due.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="View Ledger Statement"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPaymentModalCustomer(c);
                          setPaymentAmount(c.outstanding_due);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-[11px]"
                        title="Receive Payment"
                      >
                        {t('receivePayment')}
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete customer ${c.name}?`)) {
                            deleteCustomer(c.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger Statement Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">{selectedCustomer.name} - Statement</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-200">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{t('totalPurchases')}</span>
                  <span className="font-mono font-bold text-sm text-white mt-1 block">
                    {settings.currency}{selectedCustomer.total_purchases.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{t('totalCollected')}</span>
                  <span className="font-mono font-bold text-sm text-teal-400 mt-1 block">
                    {settings.currency}{selectedCustomer.total_paid.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">{t('dueAmount')}</span>
                  <span className="font-mono font-bold text-sm text-amber-400 mt-1 block">
                    {settings.currency}{selectedCustomer.outstanding_due.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Invoices by customer */}
              <div>
                <h4 className="font-bold text-xs text-white mb-2">Customer Invoice History</h4>
                {invoices.filter((i) => i.customer_id === selectedCustomer.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg">No invoice history found.</p>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {invoices
                      .filter((i) => i.customer_id === selectedCustomer.id)
                      .map((inv) => (
                        <div key={inv.id} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-emerald-400">{inv.invoice_number}</span>
                            <span className="text-[10px] text-slate-400 block">{new Date(inv.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-white block">
                              {settings.currency}{inv.grand_total}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Paid: {settings.currency}{inv.paid_amount} | Due: {settings.currency}{inv.due_amount}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Payment transactions by customer */}
              <div>
                <h4 className="font-bold text-xs text-white mb-2">Payment Transaction History</h4>
                {payments.filter((p) => p.party_id === selectedCustomer.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg">No payments recorded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {payments
                      .filter((p) => p.party_id === selectedCustomer.id)
                      .map((pay) => (
                        <div key={pay.id} className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-slate-200">{pay.payment_method}</span>
                            <span className="text-[10px] text-slate-400 block">{new Date(pay.payment_date).toLocaleDateString()}</span>
                          </div>
                          <span className="font-mono font-bold text-teal-400">
                            +{settings.currency}{pay.amount}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-sm text-white">Receive Due Payment</h3>
              <button
                onClick={() => setPaymentModalCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="p-5 space-y-4 text-xs text-slate-200">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Customer</span>
                <span className="font-bold text-sm text-white">{paymentModalCustomer.name}</span>
                <span className="text-amber-400 font-mono block mt-1">
                  Outstanding Due: {settings.currency}{paymentModalCustomer.outstanding_due}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payment Amount (৳) *</label>
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash / MFS">bKash / MFS</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Card">Bank Card</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Receipt Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. bKash TrxID #892831"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-sm text-white">
                {editingCustomer ? t('editCustomer') : t('addCustomer')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCustomer(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 text-xs text-slate-200">
              <div>
                <label className="block text-slate-300 font-medium mb-1">{t('customerName')} *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahim Chowdhury"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t('customerPhone')} *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01819-xxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t('customerCode')}</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{t('customerAddress')}</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="House, Road, Area, City"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t('openingBalance')} (৳)</label>
                  <input
                    type="number"
                    value={formOpeningBalance}
                    onChange={(e) => setFormOpeningBalance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Credit term, special discounts..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
