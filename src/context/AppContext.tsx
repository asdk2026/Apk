import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Product,
  Customer,
  Supplier,
  Invoice,
  Purchase,
  StockMovement,
  PaymentRecord,
  Expense,
  BusinessSettings,
  SyncLog,
  AppNavigationModule,
  UserAccount,
} from '../types';
import {
  STORAGE_KEYS,
  getLocal,
  setLocal,
  DEFAULT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_SYNC_LOGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  deleteAppAndData,
  initDatabase,
} from '../utils/db';
import {
  syncStoreToFirebase,
  fetchStoreFromFirebase,
  deleteProductFromCloud,
  firebaseConfig,
} from '../utils/firebase';
import { translations, Language } from '../utils/i18n';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

interface AppContextType {
  // Navigation & Preferences
  activeModule: AppNavigationModule;
  setActiveModule: (module: AppNavigationModule) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  t: (key: keyof typeof translations['en']) => string;

  // Global Search & Sync
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'syncing';
  triggerSyncNow: () => Promise<void>;
  syncLogs: SyncLog[];

  // Entities
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: Purchase[];
  stockMovements: StockMovement[];
  payments: PaymentRecord[];
  expenses: Expense[];
  settings: BusinessSettings;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;

  addCustomer: (cust: Omit<Customer, 'id' | 'created_at' | 'total_purchases' | 'total_paid' | 'outstanding_due'>) => Customer;
  updateCustomer: (cust: Customer) => void;
  deleteCustomer: (id: string) => void;
  receiveCustomerPayment: (customerId: string, amount: number, paymentMethod: string, notes?: string, invoiceId?: string) => void;

  addSupplier: (supp: Omit<Supplier, 'id' | 'created_at' | 'total_purchased' | 'total_paid' | 'outstanding_due'>) => Supplier;
  updateSupplier: (supp: Supplier) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: string, notes?: string) => void;

  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>) => Invoice;
  cancelInvoice: (invoiceId: string) => void;

  recordPurchase: (purchase: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>) => Purchase;
  adjustStock: (productId: string, variantId: string, adjustmentQty: number, type: 'adjustment_in' | 'adjustment_out' | 'damaged', notes?: string) => void;

  addExpense: (exp: Omit<Expense, 'id' | 'created_at'>) => Expense;
  deleteExpense: (id: string) => void;

  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;

  // Quick Navigation shortcut helper
  openProductInPos?: (product: Product) => void;

  // Admin & User Authentication
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (user: Omit<UserAccount, 'id' | 'created_at'>) => void;
  updateUser: (user: UserAccount) => void;
  deleteUser: (id: string) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;

  // Categories Management
  categories: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;

  // Cloud Database Firebase
  firebaseSyncStatus: 'connected' | 'syncing' | 'synced' | 'error' | 'disconnected';
  syncToFirebase: () => Promise<boolean>;
  syncFromFirebase: () => Promise<boolean>;
  lastFirebaseSync: string | null;

  // System Wipe / Delete App
  deleteEntireApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure DB is initialized
  initDatabase();

  const [activeModule, setActiveModule] = useState<AppNavigationModule>('home');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');

  const [settings, setSettings] = useState<BusinessSettings>(() =>
    getLocal<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() =>
    getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, INITIAL_INVOICES)
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    getLocal<Purchase[]>(STORAGE_KEYS.PURCHASES, [])
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    getLocal<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, [])
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    getLocal<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES)
  );
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() =>
    getLocal<SyncLog[]>(STORAGE_KEYS.SYNC_LOGS, INITIAL_SYNC_LOGS)
  );
  const [users, setUsers] = useState<UserAccount[]>(() =>
    getLocal<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    getLocal<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0])
  );
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [categories, setCategories] = useState<string[]>(() =>
    getLocal<string[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<
    'connected' | 'syncing' | 'synced' | 'error' | 'disconnected'
  >('connected');
  const [lastFirebaseSync, setLastFirebaseSync] = useState<string | null>(() => {
    return localStorage.getItem('bm_last_fb_sync') || null;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Welcome to Business Mind! Offline-First database is active.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: 'notif_2',
      title: 'Rupchanda Soybean Oil (1L Poly) is running low on stock!',
      time: '1h ago',
      type: 'warning',
    },
  ]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('pending');
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync dark class on root document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Translation helper
  const t = useCallback(
    (key: keyof typeof translations['en']): string => {
      const lang = settings.language || 'en';
      const dict = translations[lang] || translations.en;
      return dict[key] || translations.en[key] || String(key);
    },
    [settings.language]
  );

  const setLanguage = useCallback((lang: Language) => {
    setSettings((prev) => {
      const updated = { ...prev, language: lang };
      setLocal(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    setSettings((prev) => {
      const updated = { ...prev, theme };
      setLocal(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setLocal(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Trigger sync
  const triggerSyncNow = useCallback(async () => {
    setSyncStatus('syncing');
    await new Promise((res) => setTimeout(res, 900));
    const nowIso = new Date().toISOString();
    const newLog: SyncLog = {
      id: `sync_${Date.now()}`,
      timestamp: nowIso,
      action: 'Cloud & Multi-Device Sync',
      status: 'synced',
      details: `Successfully synchronized ${products.length} products, ${invoices.length} invoices, and ${customers.length} customers with cloud.`,
    };
    const updatedLogs = [newLog, ...syncLogs].slice(0, 30);
    setSyncLogs(updatedLogs);
    setLocal(STORAGE_KEYS.SYNC_LOGS, updatedLogs);
    updateSettings({ last_sync_time: nowIso });
    setSyncStatus('synced');
  }, [products.length, invoices.length, customers.length, syncLogs, updateSettings]);

  // Products CRUD
  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
      const newProduct: Product = {
        ...data,
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      setLocal(STORAGE_KEYS.PRODUCTS, updated);
      setSyncStatus('pending');
      return newProduct;
    },
    [products]
  );

  const updateProduct = useCallback(
    (product: Product) => {
      const updated = products.map((p) =>
        p.id === product.id ? { ...product, updated_at: new Date().toISOString() } : p
      );
      setProducts(updated);
      setLocal(STORAGE_KEYS.PRODUCTS, updated);
      setSyncStatus('pending');
    },
    [products]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      setLocal(STORAGE_KEYS.PRODUCTS, updated);
      setSyncStatus('pending');
    },
    [products]
  );

  const duplicateProduct = useCallback(
    (id: string) => {
      const found = products.find((p) => p.id === id);
      if (!found) return;
      const duplicated: Product = {
        ...found,
        id: `prod_${Date.now()}_copy`,
        name: `${found.name} (Copy)`,
        code: `${found.code}-COPY`,
        barcode: `${found.barcode ? found.barcode + '9' : ''}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [duplicated, ...products];
      setProducts(updated);
      setLocal(STORAGE_KEYS.PRODUCTS, updated);
      setSyncStatus('pending');
    },
    [products]
  );

  // Customers CRUD
  const addCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'created_at' | 'total_purchases' | 'total_paid' | 'outstanding_due'>): Customer => {
      const newCust: Customer = {
        ...data,
        id: `cust_${Date.now()}`,
        total_purchases: 0,
        total_paid: 0,
        outstanding_due: data.opening_balance || 0,
        created_at: new Date().toISOString(),
      };
      const updated = [newCust, ...customers];
      setCustomers(updated);
      setLocal(STORAGE_KEYS.CUSTOMERS, updated);
      setSyncStatus('pending');
      return newCust;
    },
    [customers]
  );

  const updateCustomer = useCallback(
    (cust: Customer) => {
      const updated = customers.map((c) => (c.id === cust.id ? cust : c));
      setCustomers(updated);
      setLocal(STORAGE_KEYS.CUSTOMERS, updated);
      setSyncStatus('pending');
    },
    [customers]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      const updated = customers.filter((c) => c.id !== id);
      setCustomers(updated);
      setLocal(STORAGE_KEYS.CUSTOMERS, updated);
      setSyncStatus('pending');
    },
    [customers]
  );

  // Receive Customer Payment
  const receiveCustomerPayment = useCallback(
    (
      customerId: string,
      amount: number,
      paymentMethod: string,
      notes?: string,
      invoiceId?: string
    ) => {
      const cust = customers.find((c) => c.id === customerId);
      if (!cust || amount <= 0) return;

      const updatedCust: Customer = {
        ...cust,
        total_paid: cust.total_paid + amount,
        outstanding_due: Math.max(0, cust.outstanding_due - amount),
      };
      const updatedCustomers = customers.map((c) => (c.id === cust.id ? updatedCust : c));
      setCustomers(updatedCustomers);
      setLocal(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

      // Record Payment
      const newPayment: PaymentRecord = {
        id: `pay_${Date.now()}`,
        business_id: settings.business_id,
        type: 'customer',
        party_id: customerId,
        party_name: cust.name,
        party_phone: cust.phone,
        reference_id: invoiceId,
        amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
        notes,
      };
      const updatedPayments = [newPayment, ...payments];
      setPayments(updatedPayments);
      setLocal(STORAGE_KEYS.PAYMENTS, updatedPayments);

      // If specific invoice is targeted, update invoice paid amount
      if (invoiceId) {
        const inv = invoices.find((i) => i.id === invoiceId);
        if (inv) {
          const newPaid = inv.paid_amount + amount;
          const newDue = Math.max(0, inv.grand_total - newPaid);
          const updatedInvoices = invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  paid_amount: newPaid,
                  due_amount: newDue,
                  payment_status: (newDue === 0 ? 'paid' : 'partial') as 'paid' | 'partial',
                  updated_at: new Date().toISOString(),
                }
              : i
          );
          setInvoices(updatedInvoices);
          setLocal(STORAGE_KEYS.INVOICES, updatedInvoices);
        }
      }

      setSyncStatus('pending');
    },
    [customers, payments, invoices, settings.business_id]
  );

  // Suppliers CRUD
  const addSupplier = useCallback(
    (data: Omit<Supplier, 'id' | 'created_at' | 'total_purchased' | 'total_paid' | 'outstanding_due'>): Supplier => {
      const newSupp: Supplier = {
        ...data,
        id: `supp_${Date.now()}`,
        total_purchased: 0,
        total_paid: 0,
        outstanding_due: 0,
        created_at: new Date().toISOString(),
      };
      const updated = [newSupp, ...suppliers];
      setSuppliers(updated);
      setLocal(STORAGE_KEYS.SUPPLIERS, updated);
      setSyncStatus('pending');
      return newSupp;
    },
    [suppliers]
  );

  const updateSupplier = useCallback(
    (supp: Supplier) => {
      const updated = suppliers.map((s) => (s.id === supp.id ? supp : s));
      setSuppliers(updated);
      setLocal(STORAGE_KEYS.SUPPLIERS, updated);
      setSyncStatus('pending');
    },
    [suppliers]
  );

  const recordSupplierPayment = useCallback(
    (supplierId: string, amount: number, paymentMethod: string, notes?: string) => {
      const supp = suppliers.find((s) => s.id === supplierId);
      if (!supp || amount <= 0) return;

      const updatedSupp: Supplier = {
        ...supp,
        total_paid: supp.total_paid + amount,
        outstanding_due: Math.max(0, supp.outstanding_due - amount),
      };
      const updatedSuppliers = suppliers.map((s) => (s.id === supp.id ? updatedSupp : s));
      setSuppliers(updatedSuppliers);
      setLocal(STORAGE_KEYS.SUPPLIERS, updatedSuppliers);

      const newPayment: PaymentRecord = {
        id: `pay_supp_${Date.now()}`,
        business_id: settings.business_id,
        type: 'supplier',
        party_id: supplierId,
        party_name: supp.name,
        party_phone: supp.phone,
        amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
        notes,
      };
      const updatedPayments = [newPayment, ...payments];
      setPayments(updatedPayments);
      setLocal(STORAGE_KEYS.PAYMENTS, updatedPayments);
      setSyncStatus('pending');
    },
    [suppliers, payments, settings.business_id]
  );

  // Invoices & POS
  const createInvoice = useCallback(
    (data: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>): Invoice => {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const count = invoices.length + 1;
      const invoiceNumber = `${settings.invoice_prefix || 'BM-'}${yearMonth}-${String(count).padStart(3, '0')}`;

      const newInvoice: Invoice = {
        ...data,
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        invoice_number: invoiceNumber,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      const updatedInvoices = [newInvoice, ...invoices];
      setInvoices(updatedInvoices);
      setLocal(STORAGE_KEYS.INVOICES, updatedInvoices);

      // Decrement stock for each item & record stock movement
      const updatedProducts = [...products];
      const newMovements: StockMovement[] = [];

      for (const item of newInvoice.items) {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.product_id);
        if (prodIndex >= 0) {
          const prod = { ...updatedProducts[prodIndex] };
          const qualities = prod.qualities.map((q) => {
            if (q.id !== item.quality_id) return q;
            const variants = q.variants.map((v) => {
              if (v.id !== item.variant_id) return v;
              const prev = v.stock_quantity;
              const deducted = Math.max(
                settings.allow_negative_stock ? -999999 : 0,
                prev - item.package_quantity
              );
              newMovements.push({
                id: `mov_${Date.now()}_${v.id}`,
                business_id: settings.business_id,
                product_id: prod.id,
                variant_id: v.id,
                product_name: prod.name,
                variant_info: `${q.name} - ${v.size_weight} ${v.unit}`,
                type: 'sale',
                quantity: item.package_quantity,
                previous_stock: prev,
                new_stock: deducted,
                reference_id: newInvoice.invoice_number,
                timestamp: now.toISOString(),
              });
              return { ...v, stock_quantity: deducted };
            });
            return { ...q, variants };
          });
          prod.qualities = qualities;
          updatedProducts[prodIndex] = prod;
        }
      }

      setProducts(updatedProducts);
      setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);

      const allMovements = [...newMovements, ...stockMovements];
      setStockMovements(allMovements);
      setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

      // Update customer total purchases and due if customer selected
      if (newInvoice.customer_id) {
        const custIndex = customers.findIndex((c) => c.id === newInvoice.customer_id);
        if (custIndex >= 0) {
          const cust = { ...customers[custIndex] };
          cust.total_purchases += newInvoice.grand_total;
          cust.total_paid += newInvoice.paid_amount;
          cust.outstanding_due += newInvoice.due_amount;
          const updatedCusts = [...customers];
          updatedCusts[custIndex] = cust;
          setCustomers(updatedCusts);
          setLocal(STORAGE_KEYS.CUSTOMERS, updatedCusts);
        }
      }

      // Record payment entry if paid amount > 0
      if (newInvoice.paid_amount > 0) {
        const paymentRecord: PaymentRecord = {
          id: `pay_inv_${Date.now()}`,
          business_id: settings.business_id,
          type: 'customer',
          party_id: newInvoice.customer_id,
          party_name: newInvoice.customer_name,
          party_phone: newInvoice.customer_phone,
          reference_id: newInvoice.id,
          reference_number: newInvoice.invoice_number,
          amount: newInvoice.paid_amount,
          payment_date: now.toISOString(),
          payment_method: newInvoice.payment_method,
          notes: `POS invoice payment for ${newInvoice.invoice_number}`,
        };
        const allPayments = [paymentRecord, ...payments];
        setPayments(allPayments);
        setLocal(STORAGE_KEYS.PAYMENTS, allPayments);
      }

      setSyncStatus('pending');
      return newInvoice;
    },
    [invoices, products, settings, stockMovements, customers, payments]
  );

  // Cancel Invoice & return stock
  const cancelInvoice = useCallback(
    (invoiceId: string) => {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv || inv.payment_status === 'cancelled') return;

      const updatedInvoices = invoices.map((i) =>
        i.id === invoiceId
          ? { ...i, payment_status: 'cancelled' as const, updated_at: new Date().toISOString() }
          : i
      );
      setInvoices(updatedInvoices);
      setLocal(STORAGE_KEYS.INVOICES, updatedInvoices);

      // Re-increment stock
      const updatedProducts = [...products];
      const newMovements: StockMovement[] = [];
      const now = new Date().toISOString();

      for (const item of inv.items) {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.product_id);
        if (prodIndex >= 0) {
          const prod = { ...updatedProducts[prodIndex] };
          prod.qualities = prod.qualities.map((q) => {
            if (q.id !== item.quality_id) return q;
            const variants = q.variants.map((v) => {
              if (v.id !== item.variant_id) return v;
              const prev = v.stock_quantity;
              const restored = prev + item.package_quantity;
              newMovements.push({
                id: `mov_ret_${Date.now()}_${v.id}`,
                business_id: settings.business_id,
                product_id: prod.id,
                variant_id: v.id,
                product_name: prod.name,
                variant_info: `${q.name} - ${v.size_weight} ${v.unit}`,
                type: 'sale_return',
                quantity: item.package_quantity,
                previous_stock: prev,
                new_stock: restored,
                reference_id: inv.invoice_number,
                timestamp: now,
              });
              return { ...v, stock_quantity: restored };
            });
            return { ...q, variants };
          });
          updatedProducts[prodIndex] = prod;
        }
      }

      setProducts(updatedProducts);
      setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);

      const allMovements = [...newMovements, ...stockMovements];
      setStockMovements(allMovements);
      setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

      // Revert customer due
      if (inv.customer_id) {
        const custIndex = customers.findIndex((c) => c.id === inv.customer_id);
        if (custIndex >= 0) {
          const cust = { ...customers[custIndex] };
          cust.total_purchases = Math.max(0, cust.total_purchases - inv.grand_total);
          cust.total_paid = Math.max(0, cust.total_paid - inv.paid_amount);
          cust.outstanding_due = Math.max(0, cust.outstanding_due - inv.due_amount);
          const updatedCusts = [...customers];
          updatedCusts[custIndex] = cust;
          setCustomers(updatedCusts);
          setLocal(STORAGE_KEYS.CUSTOMERS, updatedCusts);
        }
      }

      setSyncStatus('pending');
    },
    [invoices, products, settings.business_id, stockMovements, customers]
  );

  // Purchase Recording
  const recordPurchase = useCallback(
    (data: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>): Purchase => {
      const now = new Date();
      const count = purchases.length + 1;
      const purchaseNumber = `PUR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(count).padStart(3, '0')}`;

      const newPurchase: Purchase = {
        ...data,
        id: `pur_${Date.now()}`,
        purchase_number: purchaseNumber,
        created_at: now.toISOString(),
      };

      const updatedPurchases = [newPurchase, ...purchases];
      setPurchases(updatedPurchases);
      setLocal(STORAGE_KEYS.PURCHASES, updatedPurchases);

      // Increase stock for purchased items
      const updatedProducts = [...products];
      const newMovements: StockMovement[] = [];

      for (const item of newPurchase.items) {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.product_id);
        if (prodIndex >= 0) {
          const prod = { ...updatedProducts[prodIndex] };
          prod.qualities = prod.qualities.map((q) => {
            if (q.name !== item.quality_name) return q;
            const variants = q.variants.map((v) => {
              if (v.size_weight !== item.size_weight || v.unit !== item.unit) return v;
              const prev = v.stock_quantity;
              const added = prev + item.quantity;
              newMovements.push({
                id: `mov_pur_${Date.now()}_${v.id}`,
                business_id: settings.business_id,
                product_id: prod.id,
                variant_id: v.id,
                product_name: prod.name,
                variant_info: `${q.name} - ${v.size_weight} ${v.unit}`,
                type: 'purchase',
                quantity: item.quantity,
                previous_stock: prev,
                new_stock: added,
                reference_id: purchaseNumber,
                timestamp: now.toISOString(),
              });
              return { ...v, stock_quantity: added };
            });
            return { ...q, variants };
          });
          updatedProducts[prodIndex] = prod;
        }
      }

      setProducts(updatedProducts);
      setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);

      const allMovements = [...newMovements, ...stockMovements];
      setStockMovements(allMovements);
      setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);

      // Update supplier due
      if (newPurchase.supplier_id) {
        const suppIndex = suppliers.findIndex((s) => s.id === newPurchase.supplier_id);
        if (suppIndex >= 0) {
          const supp = { ...suppliers[suppIndex] };
          supp.total_purchased += newPurchase.grand_total;
          supp.total_paid += newPurchase.paid_amount;
          supp.outstanding_due += newPurchase.supplier_due;
          const updatedSupps = [...suppliers];
          updatedSupps[suppIndex] = supp;
          setSuppliers(updatedSupps);
          setLocal(STORAGE_KEYS.SUPPLIERS, updatedSupps);
        }
      }

      setSyncStatus('pending');
      return newPurchase;
    },
    [purchases, products, settings.business_id, stockMovements, suppliers]
  );

  // Manual Stock Adjustment
  const adjustStock = useCallback(
    (
      productId: string,
      variantId: string,
      adjustmentQty: number,
      type: 'adjustment_in' | 'adjustment_out' | 'damaged',
      notes?: string
    ) => {
      const prodIndex = products.findIndex((p) => p.id === productId);
      if (prodIndex < 0) return;

      const prod = { ...products[prodIndex] };
      let prevStock = 0;
      let newStock = 0;
      let variantDescription = '';

      prod.qualities = prod.qualities.map((q) => {
        const variants = q.variants.map((v) => {
          if (v.id !== variantId) return v;
          prevStock = v.stock_quantity;
          variantDescription = `${q.name} - ${v.size_weight} ${v.unit}`;
          if (type === 'adjustment_in') {
            newStock = prevStock + adjustmentQty;
          } else {
            newStock = Math.max(
              settings.allow_negative_stock ? -999999 : 0,
              prevStock - adjustmentQty
            );
          }
          return { ...v, stock_quantity: newStock };
        });
        return { ...q, variants };
      });

      const updatedProducts = [...products];
      updatedProducts[prodIndex] = prod;
      setProducts(updatedProducts);
      setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);

      const movement: StockMovement = {
        id: `mov_adj_${Date.now()}`,
        business_id: settings.business_id,
        product_id: productId,
        variant_id: variantId,
        product_name: prod.name,
        variant_info: variantDescription,
        type,
        quantity: adjustmentQty,
        previous_stock: prevStock,
        new_stock: newStock,
        notes,
        timestamp: new Date().toISOString(),
      };

      const allMovements = [movement, ...stockMovements];
      setStockMovements(allMovements);
      setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, allMovements);
      setSyncStatus('pending');
    },
    [products, settings.allow_negative_stock, settings.business_id, stockMovements]
  );

  // Expenses CRUD
  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'created_at'>): Expense => {
      const newExp: Expense = {
        ...data,
        id: `exp_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const updated = [newExp, ...expenses];
      setExpenses(updated);
      setLocal(STORAGE_KEYS.EXPENSES, updated);
      setSyncStatus('pending');
      return newExp;
    },
    [expenses]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      setLocal(STORAGE_KEYS.EXPENSES, updated);
      setSyncStatus('pending');
    },
    [expenses]
  );

  // JSON Export / Import
  const exportDatabaseJson = useCallback(() => {
    const backup = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      settings,
      products,
      customers,
      suppliers,
      invoices,
      purchases,
      stockMovements,
      payments,
      expenses,
    };
    return JSON.stringify(backup, null, 2);
  }, [settings, products, customers, suppliers, invoices, purchases, stockMovements, payments, expenses]);

  const importDatabaseJson = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.products || !Array.isArray(data.products)) return false;
      if (data.settings) {
        setSettings(data.settings);
        setLocal(STORAGE_KEYS.SETTINGS, data.settings);
      }
      if (data.products) {
        setProducts(data.products);
        setLocal(STORAGE_KEYS.PRODUCTS, data.products);
      }
      if (data.customers) {
        setCustomers(data.customers);
        setLocal(STORAGE_KEYS.CUSTOMERS, data.customers);
      }
      if (data.suppliers) {
        setSuppliers(data.suppliers);
        setLocal(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      }
      if (data.invoices) {
        setInvoices(data.invoices);
        setLocal(STORAGE_KEYS.INVOICES, data.invoices);
      }
      if (data.purchases) {
        setPurchases(data.purchases);
        setLocal(STORAGE_KEYS.PURCHASES, data.purchases);
      }
      if (data.stockMovements) {
        setStockMovements(data.stockMovements);
        setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, data.stockMovements);
      }
      if (data.payments) {
        setPayments(data.payments);
        setLocal(STORAGE_KEYS.PAYMENTS, data.payments);
      }
      if (data.expenses) {
        setExpenses(data.expenses);
        setLocal(STORAGE_KEYS.EXPENSES, data.expenses);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // Authentication & Staff User Management
  const login = useCallback(
    (email: string, password: string) => {
      const trimmedEmail = email.toLowerCase().trim();
      const found = users.find((u) => u.email.toLowerCase().trim() === trimmedEmail);
      if (!found) {
        return { success: false, error: 'User account not found.' };
      }
      if (found.password && found.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const updatedUser = { ...found, last_login: new Date().toISOString() };
      setCurrentUser(updatedUser);
      setLocal(STORAGE_KEYS.CURRENT_USER, updatedUser);
      return { success: true };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, []);

  const addUser = useCallback((userData: Omit<UserAccount, 'id' | 'created_at'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => {
      const next = [...prev, newUser];
      setLocal(STORAGE_KEYS.USERS, next);
      return next;
    });
  }, []);

  const updateUser = useCallback(
    (updated: UserAccount) => {
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === updated.id ? updated : u));
        setLocal(STORAGE_KEYS.USERS, next);
        return next;
      });
      if (currentUser?.id === updated.id) {
        setCurrentUser(updated);
        setLocal(STORAGE_KEYS.CURRENT_USER, updated);
      }
    },
    [currentUser]
  );

  const deleteUser = useCallback(
    (id: string) => {
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== id);
        setLocal(STORAGE_KEYS.USERS, next);
        return next;
      });
      if (currentUser?.id === id) {
        logout();
      }
    },
    [currentUser, logout]
  );

  const addCategory = useCallback((newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      setLocal(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((catToDelete: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c !== catToDelete);
      setLocal(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });
  }, []);

  const syncToFirebase = useCallback(async (): Promise<boolean> => {
    setFirebaseSyncStatus('syncing');
    try {
      const res = await syncStoreToFirebase({
        products,
        customers,
        suppliers,
        invoices,
        expenses,
        categories,
        settings,
      });
      if (res.success) {
        setFirebaseSyncStatus('synced');
        setLastFirebaseSync(res.syncedAt);
        localStorage.setItem('bm_last_fb_sync', res.syncedAt);
        return true;
      } else {
        setFirebaseSyncStatus('error');
        return false;
      }
    } catch {
      setFirebaseSyncStatus('error');
      return false;
    }
  }, [products, customers, suppliers, invoices, expenses, categories, settings]);

  const syncFromFirebase = useCallback(async (): Promise<boolean> => {
    setFirebaseSyncStatus('syncing');
    try {
      const res = await fetchStoreFromFirebase();
      if (res.success && res.data) {
        if (res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
          setLocal(STORAGE_KEYS.PRODUCTS, res.data.products);
        }
        if (res.data.customers && res.data.customers.length > 0) {
          setCustomers(res.data.customers);
          setLocal(STORAGE_KEYS.CUSTOMERS, res.data.customers);
        }
        if (res.data.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          setLocal(STORAGE_KEYS.CATEGORIES, res.data.categories);
        }
        setFirebaseSyncStatus('synced');
        const now = new Date().toISOString();
        setLastFirebaseSync(now);
        localStorage.setItem('bm_last_fb_sync', now);
        return true;
      } else {
        setFirebaseSyncStatus('error');
        return false;
      }
    } catch {
      setFirebaseSyncStatus('error');
      return false;
    }
  }, []);

  const deleteEntireApp = useCallback(() => {
    deleteAppAndData();
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      activeModule,
      setActiveModule,
      language: settings.language,
      setLanguage,
      theme: settings.theme,
      setTheme,
      t,
      globalSearchQuery,
      setGlobalSearchQuery,
      isOnline,
      syncStatus,
      triggerSyncNow,
      syncLogs,
      products,
      customers,
      suppliers,
      invoices,
      purchases,
      stockMovements,
      payments,
      expenses,
      settings,
      notifications,
      dismissNotification,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      receiveCustomerPayment,
      addSupplier,
      updateSupplier,
      recordSupplierPayment,
      createInvoice,
      cancelInvoice,
      recordPurchase,
      adjustStock,
      addExpense,
      deleteExpense,
      updateSettings,
      exportDatabaseJson,
      importDatabaseJson,
      currentUser,
      users,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      showLoginModal,
      setShowLoginModal,
      categories,
      addCategory,
      deleteCategory,
      firebaseSyncStatus,
      syncToFirebase,
      syncFromFirebase,
      lastFirebaseSync,
      deleteEntireApp,
    }),
    [
      activeModule,
      settings,
      setLanguage,
      setTheme,
      t,
      globalSearchQuery,
      isOnline,
      syncStatus,
      triggerSyncNow,
      syncLogs,
      products,
      customers,
      suppliers,
      invoices,
      purchases,
      stockMovements,
      payments,
      expenses,
      notifications,
      dismissNotification,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      receiveCustomerPayment,
      addSupplier,
      updateSupplier,
      recordSupplierPayment,
      createInvoice,
      cancelInvoice,
      recordPurchase,
      adjustStock,
      addExpense,
      deleteExpense,
      updateSettings,
      exportDatabaseJson,
      importDatabaseJson,
      currentUser,
      users,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      showLoginModal,
      setShowLoginModal,
      categories,
      addCategory,
      deleteCategory,
      firebaseSyncStatus,
      syncToFirebase,
      syncFromFirebase,
      lastFirebaseSync,
      deleteEntireApp,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
