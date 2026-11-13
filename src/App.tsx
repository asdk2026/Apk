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
import { FirebaseAuthGate } from './components/auth/FirebaseAuthGate';
import { FirebaseAdminPanel } from './components/admin/FirebaseAdminPanel';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { ProductFormModal } from './components/product/ProductFormModal';
import { AdminLoginModal } from './components/common/AdminLoginModal';
import { Product } from './types';
import { ShieldAlert, Loader2 } from 'lucide-react';

function AppContent() {
  const {
    authLoading,
    currentUser,
    isAdmin,
    hasModuleAccess,
    hasActionPermission,
    activeModule,
    setActiveModule,
    updateProduct,
    deleteProduct,
  } = useApp();

  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          Verifying Firebase session & access permissions...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <FirebaseAuthGate />;
  }

  const handleOpenPosWithProduct = (prod: Product) => {
    if (hasModuleAccess('invoice')) {
      setActiveModule('invoice');
    }
  };

  const canAccessActive = hasModuleAccess(activeModule);

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
          {!canAccessActive ? (
            <div className="p-8 max-w-md mx-auto mt-16 text-center bg-slate-900 border border-rose-500/30 rounded-2xl space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <h2 className="text-base font-bold text-white">Access Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your account does not have permission to open this module. Contact your Administrator to request access.
              </p>
            </div>
          ) : (
            <>
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
                  onAddProductToInvoice={() => {
                    if (hasModuleAccess('invoice')) {
                      setActiveModule('invoice');
                    }
                  }}
                />
              )}
              {activeModule === 'expenses' && <ExpenseManagement />}
              {activeModule === 'settings' && <SettingsView />}
              {activeModule === 'admin' && isAdmin && <FirebaseAdminPanel />}
            </>
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Nav */}
      <BottomNav />

      {/* Global Product Details Modal */}
      {inspectedProduct && (
        <ProductDetailsModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onEdit={(prod) => {
            if (!hasActionPermission('canAddEditProduct')) return;
            setInspectedProduct(null);
            setEditingProduct(prod);
          }}
          onDelete={(id) => {
            if (!hasActionPermission('canDeleteProduct')) return;
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
      {editingProduct && hasActionPermission('canAddEditProduct') && (
        <ProductFormModal
          initialProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {}}
          onUpdate={(prod) => updateProduct(prod)}
        />
      )}

      {/* Firebase Account & Access Summary Modal */}
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
