import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { Header } from './components/common/Header';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ProductManagement } from './components/product/ProductManagement';
import { InvoicePOS } from './components/invoice/InvoicePOS';
import { SalesHistory } from './components/sales/SalesHistory';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { StockManagement } from './components/stock/StockManagement';
import { PurchaseManagement } from './components/purchases/PurchaseManagement';
import { DueManagement } from './components/due/DueManagement';
import { ProfitLossView } from './components/pnl/ProfitLossView';
import { ReportsView } from './components/reports/ReportsView';
import { BarcodeScannerView } from './components/barcode/BarcodeScannerView';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { SettingsView } from './components/settings/SettingsView';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { ProductFormModal } from './components/product/ProductFormModal';
import { AdminLoginModal } from './components/common/AdminLoginModal';
import { Product } from './types';

function AppContent() {
  const { activeModule, setActiveModule, updateProduct, deleteProduct } = useApp();
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick handoff from search or details modal to POS
  const handleOpenPosWithProduct = (prod: Product) => {
    setActiveModule('invoice');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onSelectProduct={(prod) => setInspectedProduct(prod)} />

        {/* Viewport Content Router */}
        <main className="flex-1 overflow-y-auto">
          {activeModule === 'home' && (
            <HomeDashboard onOpenPosWithProduct={handleOpenPosWithProduct} />
          )}
          {activeModule === 'product' && (
            <ProductManagement onOpenPosWithProduct={handleOpenPosWithProduct} />
          )}
          {activeModule === 'invoice' && <InvoicePOS />}
          {activeModule === 'sales_history' && <SalesHistory />}
          {activeModule === 'customers' && <CustomerManagement />}
          {activeModule === 'stock' && <StockManagement />}
          {activeModule === 'purchases' && <PurchaseManagement />}
          {activeModule === 'due' && <DueManagement />}
          {activeModule === 'pnl' && <ProfitLossView />}
          {activeModule === 'reports' && <ReportsView />}
          {activeModule === 'barcode' && (
            <BarcodeScannerView
              onAddProductToInvoice={(prod, qual, variant) => {
                setActiveModule('invoice');
              }}
            />
          )}
          {activeModule === 'expenses' && <ExpenseManagement />}
          {activeModule === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Fixed Mobile Bottom Nav */}
      <BottomNav />

      {/* Global Product Details Modal (opened from header search or shortcuts) */}
      {inspectedProduct && (
        <ProductDetailsModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onEdit={(prod) => {
            setInspectedProduct(null);
            setEditingProduct(prod);
          }}
          onDelete={(id) => {
            deleteProduct(id);
            setInspectedProduct(null);
          }}
          onSell={(prod) => {
            setInspectedProduct(null);
            handleOpenPosWithProduct(prod);
          }}
        />
      )}

      {/* Global Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          initialProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {}}
          onUpdate={(prod) => updateProduct(prod)}
        />
      )}

      {/* Admin Panel Login & Staff Profile Modal */}
      <AdminLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
