export type MeasurementUnit =
  | 'kg'
  | 'g'
  | 'L'
  | 'ml'
  | 'pcs'
  | 'dozen'
  | 'box'
  | 'packet'
  | 'ft'
  | 'in'
  | 'm'
  | 'yard';

export interface ProductVariant {
  id: string;
  quality_id: string;
  size_weight: number;
  unit: MeasurementUnit | string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_alert?: number;
  barcode?: string;
}

export interface ProductQuality {
  id: string;
  name: string;
  variants: ProductVariant[];
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  code: string; // SKU / Code
  barcode: string;
  category: string;
  brand?: string;
  description?: string;
  image_url?: string;
  qualities: ProductQuality[];
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  code: string;
  opening_balance: number;
  notes?: string;
  total_purchases: number;
  total_paid: number;
  outstanding_due: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_purchased: number;
  total_paid: number;
  outstanding_due: number;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  product_id: string;
  product_name: string;
  quality_id: string;
  quality_name: string;
  variant_id: string;
  base_size_weight: number;
  base_price: number;
  unit: string;
  selected_size_weight: number;
  unit_price: number; // Editable calculated price
  package_quantity: number; // Multiplier
  line_total: number;
  purchase_cost: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  invoice_number: string;
  date: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  discount_amount: number;
  additional_charges: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string;
  payment_status: 'paid' | 'partial' | 'due' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  product_id: string;
  product_name: string;
  quality_name: string;
  size_weight: number;
  unit: string;
  purchase_price: number;
  quantity: number;
  line_total: number;
}

export interface Purchase {
  id: string;
  business_id: string;
  purchase_number: string;
  purchase_date: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_phone: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  additional_charges: number;
  grand_total: number;
  paid_amount: number;
  supplier_due: number;
  payment_status: 'paid' | 'partial' | 'due' | 'cancelled';
  notes?: string;
  created_at: string;
}

export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'sale_return'
  | 'damaged';

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_info: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string;
  notes?: string;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  business_id: string;
  type: 'customer' | 'supplier';
  party_id?: string;
  party_name: string;
  party_phone?: string;
  reference_id?: string; // invoice_id or purchase_id
  reference_number?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

export interface Expense {
  id: string;
  business_id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  payment_method: string;
  notes?: string;
  attachment_url?: string;
  created_at: string;
}

export interface BusinessSettings {
  business_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  currency: string;
  tax_rate: number;
  invoice_prefix: string;
  invoice_footer: string;
  low_stock_threshold: number;
  allow_negative_stock: boolean;
  language: 'en' | 'bn';
  theme: 'dark' | 'light';
  auto_sync: boolean;
  auto_firebase_sync?: boolean;
  last_sync_time?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'synced' | 'pending' | 'failed';
  details: string;
}

export type AppNavigationModule =
  | 'home'
  | 'product'
  | 'invoice'
  | 'sales_history'
  | 'customers'
  | 'stock'
  | 'purchases'
  | 'due'
  | 'pnl'
  | 'reports'
  | 'barcode'
  | 'expenses'
  | 'settings';

export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Sales Staff';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  last_login?: string;
}
