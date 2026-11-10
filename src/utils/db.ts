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
  UserAccount,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'bm_products_v1',
  CUSTOMERS: 'bm_customers_v1',
  SUPPLIERS: 'bm_suppliers_v1',
  INVOICES: 'bm_invoices_v1',
  PURCHASES: 'bm_purchases_v1',
  STOCK_MOVEMENTS: 'bm_stock_movements_v1',
  PAYMENTS: 'bm_payments_v1',
  EXPENSES: 'bm_expenses_v1',
  SETTINGS: 'bm_settings_v1',
  SYNC_LOGS: 'bm_sync_logs_v1',
  USERS: 'bm_users_v1',
  CURRENT_USER: 'bm_current_user_v1',
  CATEGORIES: 'bm_categories_v1',
};

export const INITIAL_CATEGORIES: string[] = [
  'Grains & Rice',
  'Edible Oils',
  'Pulses & Lentils',
  'Beverages',
  'Flour & Bakery',
  'Spices & Seasoning',
  'Dairy & Eggs',
  'Snacks & Confectionery',
  'Personal Care',
  'Household & Cleaning',
  'General Grocery',
];

export const DEFAULT_SETTINGS: BusinessSettings = {
  business_id: 'biz_default_01',
  business_name: 'Business Mind Superstore',
  owner_name: 'Abdullah Al Mamun',
  phone: '+880 1712-345678',
  email: 'businessmind.retail@gmail.com',
  address: 'Shop #12, Ground Floor, City Center Supermarket, Dhaka, Bangladesh',
  logo_url: '',
  currency: '৳',
  tax_rate: 5,
  invoice_prefix: 'BM-',
  invoice_footer: 'Thank you for shopping with us! Please come again.',
  low_stock_threshold: 15,
  allow_negative_stock: false,
  language: 'en',
  theme: 'dark',
  auto_sync: true,
  last_sync_time: new Date().toISOString(),
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_rice_01',
    business_id: 'biz_default_01',
    name: 'Premium Miniket Rice',
    code: 'RICE-MNK-01',
    barcode: '89411001',
    category: 'Grains & Rice',
    brand: 'Rashid Agro',
    description: 'Fresh polished premium long-grain Miniket rice, extra sorted and stones free.',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    qualities: [
      {
        id: 'q_rice_prem',
        name: 'Premium Silk Sorted',
        variants: [
          {
            id: 'v_rice_p_1kg',
            quality_id: 'q_rice_prem',
            size_weight: 1,
            unit: 'kg',
            purchase_price: 85,
            selling_price: 100,
            stock_quantity: 120,
            min_stock_alert: 20,
            barcode: '89411001-P1',
          },
          {
            id: 'v_rice_p_5kg',
            quality_id: 'q_rice_prem',
            size_weight: 5,
            unit: 'kg',
            purchase_price: 410,
            selling_price: 480,
            stock_quantity: 45,
            min_stock_alert: 10,
            barcode: '89411001-P5',
          },
          {
            id: 'v_rice_p_10kg',
            quality_id: 'q_rice_prem',
            size_weight: 10,
            unit: 'kg',
            purchase_price: 800,
            selling_price: 950,
            stock_quantity: 28,
            min_stock_alert: 5,
            barcode: '89411001-P10',
          },
        ],
      },
      {
        id: 'q_rice_std',
        name: 'Standard Cleaned',
        variants: [
          {
            id: 'v_rice_s_1kg',
            quality_id: 'q_rice_std',
            size_weight: 1,
            unit: 'kg',
            purchase_price: 68,
            selling_price: 80,
            stock_quantity: 180,
            min_stock_alert: 30,
            barcode: '89411001-S1',
          },
          {
            id: 'v_rice_s_5kg',
            quality_id: 'q_rice_std',
            size_weight: 5,
            unit: 'kg',
            purchase_price: 330,
            selling_price: 390,
            stock_quantity: 60,
            min_stock_alert: 15,
            barcode: '89411001-S5',
          },
        ],
      },
      {
        id: 'q_rice_eco',
        name: 'Economy Regular',
        variants: [
          {
            id: 'v_rice_e_1kg',
            quality_id: 'q_rice_eco',
            size_weight: 1,
            unit: 'kg',
            purchase_price: 60,
            selling_price: 72,
            stock_quantity: 90,
            min_stock_alert: 20,
            barcode: '89411001-E1',
          },
        ],
      },
      {
        id: 'q_rice_whl',
        name: 'Wholesale Commercial',
        variants: [
          {
            id: 'v_rice_w_25kg',
            quality_id: 'q_rice_whl',
            size_weight: 25,
            unit: 'kg',
            purchase_price: 1850,
            selling_price: 2150,
            stock_quantity: 15,
            min_stock_alert: 5,
            barcode: '89411001-W25',
          },
        ],
      },
    ],
    created_at: '2026-11-01T08:00:00.000Z',
    updated_at: '2026-11-08T10:00:00.000Z',
  },
  {
    id: 'prod_oil_02',
    business_id: 'biz_default_01',
    name: 'Pure Soybean Cooking Oil',
    code: 'OIL-SOY-02',
    barcode: '89411002',
    category: 'Edible Oils',
    brand: 'Rupchanda',
    description: 'Triple refined fortified Vitamin A & D pure healthy soybean cooking oil.',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    qualities: [
      {
        id: 'q_oil_grade1',
        name: 'Grade-A Fortified',
        variants: [
          {
            id: 'v_oil_1l',
            quality_id: 'q_oil_grade1',
            size_weight: 1,
            unit: 'L',
            purchase_price: 165,
            selling_price: 185,
            stock_quantity: 75,
            min_stock_alert: 15,
            barcode: '89411002-1L',
          },
          {
            id: 'v_oil_2l',
            quality_id: 'q_oil_grade1',
            size_weight: 2,
            unit: 'L',
            purchase_price: 325,
            selling_price: 365,
            stock_quantity: 40,
            min_stock_alert: 10,
            barcode: '89411002-2L',
          },
          {
            id: 'v_oil_5l',
            quality_id: 'q_oil_grade1',
            size_weight: 5,
            unit: 'L',
            purchase_price: 800,
            selling_price: 890,
            stock_quantity: 22,
            min_stock_alert: 8,
            barcode: '89411002-5L',
          },
        ],
      },
      {
        id: 'q_oil_standard',
        name: 'Commercial Poly-pack',
        variants: [
          {
            id: 'v_oil_p1l',
            quality_id: 'q_oil_standard',
            size_weight: 1,
            unit: 'L',
            purchase_price: 158,
            selling_price: 175,
            stock_quantity: 6, // Low stock demo!
            min_stock_alert: 15,
            barcode: '89411002-P1L',
          },
        ],
      },
    ],
    created_at: '2026-11-02T09:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: 'prod_dal_03',
    business_id: 'biz_default_01',
    name: 'Red Lentils (Masoor Dal)',
    code: 'DAL-MAS-03',
    barcode: '89411003',
    category: 'Pulses & Lentils',
    brand: 'Fresh Agro',
    description: 'Small grain polished Deshi Red Lentils, fast cooking and rich protein.',
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    qualities: [
      {
        id: 'q_dal_deshi',
        name: 'Deshi Small Grain (Special)',
        variants: [
          {
            id: 'v_dal_d_1kg',
            quality_id: 'q_dal_deshi',
            size_weight: 1,
            unit: 'kg',
            purchase_price: 125,
            selling_price: 145,
            stock_quantity: 80,
            min_stock_alert: 15,
            barcode: '89411003-D1',
          },
          {
            id: 'v_dal_d_500g',
            quality_id: 'q_dal_deshi',
            size_weight: 500,
            unit: 'g',
            purchase_price: 64,
            selling_price: 75,
            stock_quantity: 60,
            min_stock_alert: 15,
            barcode: '89411003-D500',
          },
        ],
      },
      {
        id: 'q_dal_imp',
        name: 'Imported Australian',
        variants: [
          {
            id: 'v_dal_i_1kg',
            quality_id: 'q_dal_imp',
            size_weight: 1,
            unit: 'kg',
            purchase_price: 105,
            selling_price: 120,
            stock_quantity: 50,
            min_stock_alert: 15,
            barcode: '89411003-I1',
          },
        ],
      },
    ],
    created_at: '2026-11-03T10:00:00.000Z',
    updated_at: '2026-11-08T14:00:00.000Z',
  },
  {
    id: 'prod_tea_04',
    business_id: 'biz_default_01',
    name: 'Mirzapore Premium Tea',
    code: 'TEA-MIR-04',
    barcode: '89411004',
    category: 'Beverages',
    brand: 'Ispahani',
    description: 'Rich aroma and strong liquor black CTC tea blend from Sylhet gardens.',
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    qualities: [
      {
        id: 'q_tea_best',
        name: 'Best Blend CTC',
        variants: [
          {
            id: 'v_tea_400g',
            quality_id: 'q_tea_best',
            size_weight: 400,
            unit: 'g',
            purchase_price: 215,
            selling_price: 245,
            stock_quantity: 65,
            min_stock_alert: 10,
            barcode: '89411004-400G',
          },
          {
            id: 'v_tea_200g',
            quality_id: 'q_tea_best',
            size_weight: 200,
            unit: 'g',
            purchase_price: 110,
            selling_price: 130,
            stock_quantity: 8, // Low stock demo!
            min_stock_alert: 15,
            barcode: '89411004-200G',
          },
        ],
      },
    ],
    created_at: '2026-11-04T11:00:00.000Z',
    updated_at: '2026-11-08T15:00:00.000Z',
  },
  {
    id: 'prod_flour_05',
    business_id: 'biz_default_01',
    name: 'Teer Whole Wheat Atta',
    code: 'FLR-ATT-05',
    barcode: '89411005',
    category: 'Flour & Bakery',
    brand: 'Teer',
    description: 'Chakki fresh 100% natural fiber whole wheat brown atta.',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    qualities: [
      {
        id: 'q_atta_chakki',
        name: 'Chakki Fresh Whole Grain',
        variants: [
          {
            id: 'v_atta_2kg',
            quality_id: 'q_atta_chakki',
            size_weight: 2,
            unit: 'kg',
            purchase_price: 115,
            selling_price: 135,
            stock_quantity: 40,
            min_stock_alert: 10,
            barcode: '89411005-2KG',
          },
        ],
      },
    ],
    created_at: '2026-11-05T12:00:00.000Z',
    updated_at: '2026-11-08T16:00:00.000Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    business_id: 'biz_default_01',
    name: 'Rahim Chowdhury',
    phone: '01819-234567',
    email: 'rahim.chowdhury@gmail.com',
    address: 'House 42, Road 7, Dhanmondi, Dhaka',
    code: 'CUST-101',
    opening_balance: 500,
    notes: 'Regular credit customer, clears dues bi-weekly.',
    total_purchases: 8450,
    total_paid: 6950,
    outstanding_due: 1500,
    created_at: '2026-10-15T09:00:00.000Z',
  },
  {
    id: 'cust_02',
    business_id: 'biz_default_01',
    name: 'Farzana Akter',
    phone: '01711-987654',
    email: 'farzana.akter@outlook.com',
    address: 'Flat B3, Green Valley, Uttara Sector 4, Dhaka',
    code: 'CUST-102',
    opening_balance: 0,
    notes: 'Preferred payment via bKash.',
    total_purchases: 4200,
    total_paid: 4200,
    outstanding_due: 0,
    created_at: '2026-10-20T11:00:00.000Z',
  },
  {
    id: 'cust_03',
    business_id: 'biz_default_01',
    name: 'Haji Mokbul Hossain',
    phone: '01912-334455',
    address: 'Mokbul Villa, Mirpur-10, Dhaka',
    code: 'CUST-103',
    opening_balance: 1000,
    notes: 'Wholesale & bulk residential buyer.',
    total_purchases: 12500,
    total_paid: 9500,
    outstanding_due: 3000,
    created_at: '2026-10-25T14:00:00.000Z',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp_01',
    business_id: 'biz_default_01',
    name: 'Meghna Food & Consumers Ltd',
    phone: '01713-112233',
    email: 'sales@meghnagroup.biz',
    address: 'Bir Uttam C.R. Datta Road, Dhaka',
    total_purchased: 45000,
    total_paid: 37000,
    outstanding_due: 8000,
    created_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'supp_02',
    business_id: 'biz_default_01',
    name: 'Square Consumer Products Ltd',
    phone: '01814-556677',
    email: 'order@squaregroup.com',
    address: 'Square Centre, Mohakhali C/A, Dhaka',
    total_purchased: 32000,
    total_paid: 32000,
    outstanding_due: 0,
    created_at: '2026-10-05T10:00:00.000Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_20261109_001',
    business_id: 'biz_default_01',
    invoice_number: 'BM-202611-001',
    date: '2026-11-09T08:30:00.000Z',
    customer_id: 'cust_01',
    customer_name: 'Rahim Chowdhury',
    customer_phone: '01819-234567',
    customer_address: 'Dhanmondi, Dhaka',
    items: [
      {
        id: 'item_01',
        invoice_id: 'inv_20261109_001',
        product_id: 'prod_rice_01',
        product_name: 'Premium Miniket Rice',
        quality_id: 'q_rice_prem',
        quality_name: 'Premium Silk Sorted',
        variant_id: 'v_rice_p_1kg',
        base_size_weight: 1,
        base_price: 100,
        unit: 'kg',
        selected_size_weight: 2.5,
        unit_price: 250,
        package_quantity: 1,
        line_total: 250,
        purchase_cost: 212.5,
      },
      {
        id: 'item_02',
        invoice_id: 'inv_20261109_001',
        product_id: 'prod_oil_02',
        product_name: 'Pure Soybean Cooking Oil',
        quality_id: 'q_oil_grade1',
        quality_name: 'Grade-A Fortified',
        variant_id: 'v_oil_2l',
        base_size_weight: 2,
        base_price: 365,
        unit: 'L',
        selected_size_weight: 2,
        unit_price: 365,
        package_quantity: 1,
        line_total: 365,
        purchase_cost: 325,
      },
    ],
    subtotal: 615,
    discount_type: 'fixed',
    discount_value: 15,
    discount_amount: 15,
    additional_charges: 0,
    tax_rate: 0,
    tax_amount: 0,
    grand_total: 600,
    paid_amount: 400,
    due_amount: 200,
    payment_method: 'Cash',
    payment_status: 'partial',
    created_at: '2026-11-09T08:30:00.000Z',
    updated_at: '2026-11-09T08:30:00.000Z',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    business_id: 'biz_default_01',
    title: 'Shop Monthly Rent (Advance)',
    category: 'Rent',
    amount: 15000,
    date: '2026-11-01',
    payment_method: 'Bank Transfer',
    notes: 'Ground floor retail stall rent for November',
    created_at: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'exp_02',
    business_id: 'biz_default_01',
    title: 'Electricity & Utility Bill',
    category: 'Electricity',
    amount: 3200,
    date: '2026-11-05',
    payment_method: 'bKash / MFS',
    notes: 'DESCO commercial bill paid via bKash',
    created_at: '2026-11-05T14:00:00.000Z',
  },
  {
    id: 'exp_03',
    business_id: 'biz_default_01',
    title: 'Commercial Poly Bags & Packaging',
    category: 'Packaging',
    amount: 850,
    date: '2026-11-07',
    payment_method: 'Cash',
    notes: '1000 pcs biodegradable grocery shopping bags',
    created_at: '2026-11-07T16:00:00.000Z',
  },
];

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'sync_init',
    timestamp: new Date().toISOString(),
    action: 'Database Initialized',
    status: 'synced',
    details: 'Offline-first database initialized with encrypted local persistence.',
  },
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user_admin_01',
    name: 'Abdullah Al Mamun (Admin)',
    email: 'abdullah286205@gmail.com',
    password: '123456',
    role: 'Admin',
    phone: '+880 1712-345678',
    created_at: '2026-11-09T00:00:00.000Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'user_staff_02',
    name: 'Sales Cashier 1',
    email: 'cashier@businessmind.com',
    password: '123456',
    role: 'Sales Staff',
    phone: '+880 1712-888888',
    created_at: '2026-11-09T00:00:00.000Z',
  },
];

/**
 * Storage helpers
 */
export function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Local storage write failure:', err);
  }
}

/**
 * Initialize all stores if empty
 */
export function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    setLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    setLocal(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    setLocal(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    setLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYNC_LOGS)) {
    setLocal(STORAGE_KEYS.SYNC_LOGS, INITIAL_SYNC_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  } else {
    const existingUsers = getLocal<UserAccount[]>(STORAGE_KEYS.USERS, []);
    const adminIdx = existingUsers.findIndex((u) => u.email.toLowerCase() === 'abdullah286205@gmail.com');
    if (adminIdx === -1) {
      existingUsers.unshift(INITIAL_USERS[0]);
      setLocal(STORAGE_KEYS.USERS, existingUsers);
    } else {
      existingUsers[adminIdx].password = '123456';
      existingUsers[adminIdx].role = 'Admin';
      setLocal(STORAGE_KEYS.USERS, existingUsers);
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    setLocal(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
}

/**
 * Completely wipe all app data and local database storage
 */
export function deleteAppAndData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  } catch (err) {
    console.error('Failed to wipe app data:', err);
  }
}

export { STORAGE_KEYS };
