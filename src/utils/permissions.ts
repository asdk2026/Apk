import {
  FirebaseUserRole,
  ModulePermissions,
  ActionPermissions,
  UserPermissions,
} from '../types';

export const ROOT_ADMIN_EMAIL = 'abdullah286205@gmail.com';

export const ADMIN_PERMISSIONS: UserPermissions = {
  modules: {
    home: true,
    product: true,
    invoice: true,
    sales_history: true,
    customers: true,
    stock: true,
    purchases: true,
    due: true,
    pnl: true,
    reports: true,
    barcode: true,
    expenses: true,
    settings: true,
  },
  actions: {
    canAddEditProduct: true,
    canDeleteProduct: true,
    canEditInvoicePrice: true,
    canApplyDiscount: true,
    canCancelInvoice: true,
    canAdjustStock: true,
    canViewProfitLoss: true,
    canManageExpenses: true,
    canManageCloudSync: true,
  },
};

export const DEFAULT_MANAGER_PERMISSIONS: UserPermissions = {
  modules: {
    home: true,
    product: true,
    invoice: true,
    sales_history: true,
    customers: true,
    stock: true,
    purchases: true,
    due: true,
    pnl: false,
    reports: true,
    barcode: true,
    expenses: true,
    settings: false,
  },
  actions: {
    canAddEditProduct: true,
    canDeleteProduct: false,
    canEditInvoicePrice: true,
    canApplyDiscount: true,
    canCancelInvoice: true,
    canAdjustStock: true,
    canViewProfitLoss: false,
    canManageExpenses: true,
    canManageCloudSync: false,
  },
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  modules: {
    home: true,
    product: true,
    invoice: true,
    sales_history: true,
    customers: true,
    stock: false,
    purchases: false,
    due: true,
    pnl: false,
    reports: false,
    barcode: true,
    expenses: false,
    settings: false,
  },
  actions: {
    canAddEditProduct: false,
    canDeleteProduct: false,
    canEditInvoicePrice: false,
    canApplyDiscount: false,
    canCancelInvoice: false,
    canAdjustStock: false,
    canViewProfitLoss: false,
    canManageExpenses: false,
    canManageCloudSync: false,
  },
};

export function getDefaultPermissionsForRole(role: FirebaseUserRole): UserPermissions {
  if (role === 'admin') return structuredClone(ADMIN_PERMISSIONS);
  if (role === 'manager') return structuredClone(DEFAULT_MANAGER_PERMISSIONS);
  return structuredClone(DEFAULT_USER_PERMISSIONS);
}

export function normalizePermissions(
  role: FirebaseUserRole,
  partial?: Partial<UserPermissions>
): UserPermissions {
  if (role === 'admin') {
    return structuredClone(ADMIN_PERMISSIONS);
  }
  const base = getDefaultPermissionsForRole(role);
  return {
    modules: {
      ...base.modules,
      ...(partial?.modules || {}),
    },
    actions: {
      ...base.actions,
      ...(partial?.actions || {}),
    },
  };
}

export const MODULE_PERMISSION_LIST: {
  key: keyof ModulePermissions;
  label: string;
  labelBn: string;
  description: string;
}[] = [
  { key: 'home', label: 'Dashboard (Home)', labelBn: 'হোম ড্যাশবোর্ড', description: 'Sales overview & quick KPIs' },
  { key: 'invoice', label: 'Invoice (POS)', labelBn: 'ইনভয়েস (পিওএস)', description: 'Create sales invoices & billing' },
  { key: 'product', label: 'Products Catalog', labelBn: 'পণ্য তালিকা', description: 'View product variants & prices' },
  { key: 'sales_history', label: 'Sales History', labelBn: 'বিক্রয় ইতিহাস', description: 'View past invoices & receipts' },
  { key: 'customers', label: 'Customers', labelBn: 'কাস্টমার', description: 'View & manage customer directory' },
  { key: 'stock', label: 'Stock Management', labelBn: 'স্টক ম্যানেজমেন্ট', description: 'Inventory counts & stock logs' },
  { key: 'purchases', label: 'Purchases & Suppliers', labelBn: 'ক্রয় ও সাপ্লায়ার', description: 'Supplier restock & purchases' },
  { key: 'due', label: 'Due & Collections', labelBn: 'বাকি হিসাব', description: 'Collect dues & manage credit' },
  { key: 'barcode', label: 'Barcode Scanner', labelBn: 'বারকোড স্ক্যানার', description: 'Scan barcodes into POS' },
  { key: 'expenses', label: 'Expenses', labelBn: 'দোকানের খরচ', description: 'View shop operational expenses' },
  { key: 'reports', label: 'Reports', labelBn: 'রিপোর্ট', description: 'Daily/monthly sales analytics' },
  { key: 'pnl', label: 'Profit & Loss', labelBn: 'লাভ-ক্ষতি', description: 'Financial P&L & cost margins' },
  { key: 'settings', label: 'Settings', labelBn: 'সেটিংস', description: 'Store preferences & backups' },
];

export const ACTION_PERMISSION_LIST: {
  key: keyof ActionPermissions;
  label: string;
  labelBn: string;
  description: string;
}[] = [
  {
    key: 'canAddEditProduct',
    label: 'Add & Edit Products',
    labelBn: 'পণ্য যোগ ও এডিট',
    description: 'Create new products, edit variants & duplicate items',
  },
  {
    key: 'canDeleteProduct',
    label: 'Delete Products',
    labelBn: 'পণ্য ডিলিট',
    description: 'Permanently delete products from catalog',
  },
  {
    key: 'canEditInvoicePrice',
    label: 'Edit Invoice Base / Unit Price',
    labelBn: 'ইনভয়েসে দাম পরিবর্তন',
    description: 'Modify Base Price & Unit Price directly during billing',
  },
  {
    key: 'canApplyDiscount',
    label: 'Apply Invoice Discounts',
    labelBn: 'ডিসকাউন্ট দেওয়া',
    description: 'Apply fixed or percentage discounts on bills',
  },
  {
    key: 'canCancelInvoice',
    label: 'Cancel / Return Invoices',
    labelBn: 'ইনভয়েস বাতিল/রিটার্ন',
    description: 'Cancel completed invoices and restore stock',
  },
  {
    key: 'canAdjustStock',
    label: 'Adjust Stock Levels',
    labelBn: 'স্টক অ্যাডজাস্ট',
    description: 'Perform manual stock in/out or damaged entries',
  },
  {
    key: 'canViewProfitLoss',
    label: 'View Cost Price & Profit',
    labelBn: 'ক্রয়মূল্য ও লাভ দেখা',
    description: 'See purchase cost and profit margin figures',
  },
  {
    key: 'canManageExpenses',
    label: 'Add & Delete Expenses',
    labelBn: 'খরচ যোগ ও ডিলিট',
    description: 'Record new shop expenses or delete entries',
  },
  {
    key: 'canManageCloudSync',
    label: 'Control Cloud Sync',
    labelBn: 'ক্লাউড সিঙ্ক নিয়ন্ত্রণ',
    description: 'Push/pull Firebase Firestore sync & toggle auto-sync',
  },
];
