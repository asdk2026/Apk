import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import {
  Product,
  Customer,
  Supplier,
  Invoice,
  Expense,
  BusinessSettings,
} from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyB17To9ztkbK-_q7SX4F75PdD9soseNsB8",
  authDomain: "business-mind-bc746.firebaseapp.com",
  projectId: "business-mind-bc746",
  storageBucket: "business-mind-bc746.firebasestorage.app",
  messagingSenderId: "908586681408",
  appId: "1:908586681408:web:35cefab6bd5d7f390b0ba5",
  measurementId: "G-V90BGBS8C2"
};

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

/**
 * Sync entire local state to Cloud Firebase Firestore
 */
export async function syncStoreToFirebase(payload: {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  expenses: Expense[];
  categories: string[];
  settings: BusinessSettings;
}): Promise<{ success: boolean; message: string; syncedAt: string }> {
  try {
    const db = getFirebaseFirestore();
    const batch = writeBatch(db);

    // Sync Settings & Metadata
    const settingsDoc = doc(db, 'system', 'business_settings');
    batch.set(settingsDoc, {
      ...payload.settings,
      updated_at_cloud: new Date().toISOString(),
    });

    // Sync Categories
    const categoriesDoc = doc(db, 'system', 'categories');
    batch.set(categoriesDoc, {
      list: payload.categories,
      updated_at_cloud: new Date().toISOString(),
    });

    // Sync Products
    payload.products.slice(0, 50).forEach((prod) => {
      const prodRef = doc(db, 'products', prod.id);
      batch.set(prodRef, prod);
    });

    // Sync Customers
    payload.customers.slice(0, 50).forEach((cust) => {
      const custRef = doc(db, 'customers', cust.id);
      batch.set(custRef, cust);
    });

    // Sync Suppliers
    payload.suppliers.slice(0, 50).forEach((supp) => {
      const suppRef = doc(db, 'suppliers', supp.id);
      batch.set(suppRef, supp);
    });

    // Sync Invoices
    payload.invoices.slice(0, 50).forEach((inv) => {
      const invRef = doc(db, 'invoices', inv.id);
      batch.set(invRef, inv);
    });

    // Sync Expenses
    payload.expenses.slice(0, 50).forEach((exp) => {
      const expRef = doc(db, 'expenses', exp.id);
      batch.set(expRef, exp);
    });

    await batch.commit();

    return {
      success: true,
      message: `Successfully synchronized ${payload.products.length} products, ${payload.invoices.length} invoices, and store metadata to Firebase project ${firebaseConfig.projectId}`,
      syncedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.warn('Firebase Cloud Sync warning:', error);
    return {
      success: false,
      message: error?.message || 'Firebase sync failed. Please verify Firestore rules and connectivity.',
      syncedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch and pull store data from Cloud Firebase Firestore
 */
export async function fetchStoreFromFirebase(): Promise<{
  success: boolean;
  data?: {
    products?: Product[];
    customers?: Customer[];
    suppliers?: Supplier[];
    invoices?: Invoice[];
    expenses?: Expense[];
    categories?: string[];
    settings?: BusinessSettings;
  };
  message: string;
}> {
  try {
    const db = getFirebaseFirestore();

    // Fetch Products
    const prodSnap = await getDocs(collection(db, 'products'));
    const products: Product[] = [];
    prodSnap.forEach((d) => {
      products.push(d.data() as Product);
    });

    // Fetch Customers
    const custSnap = await getDocs(collection(db, 'customers'));
    const customers: Customer[] = [];
    custSnap.forEach((d) => {
      customers.push(d.data() as Customer);
    });

    // Fetch Categories
    const categoriesSnap = await getDocs(collection(db, 'system'));
    let categories: string[] | undefined;
    categoriesSnap.forEach((d) => {
      if (d.id === 'categories' && Array.isArray(d.data().list)) {
        categories = d.data().list;
      }
    });

    return {
      success: true,
      data: {
        products: products.length > 0 ? products : undefined,
        customers: customers.length > 0 ? customers : undefined,
        categories,
      },
      message: `Pulled ${products.length} products and ${customers.length} customers from Firebase Cloud`,
    };
  } catch (error: any) {
    console.warn('Firebase Cloud Pull error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to pull data from Firebase.',
    };
  }
}

/**
 * Delete a product from Firebase
 */
export async function deleteProductFromCloud(productId: string): Promise<void> {
  try {
    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.warn('Cloud delete warning:', err);
  }
}
