import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import {
  Product,
  Customer,
  Supplier,
  Invoice,
  Expense,
  BusinessSettings,
  UserAccount,
  FirebaseUserRole,
  UserPermissions,
} from '../types';
import {
  ROOT_ADMIN_EMAIL,
  ADMIN_PERMISSIONS,
  normalizePermissions,
} from './permissions';

export const firebaseConfig = {
  apiKey: "AIzaSyB17To9ztkbK-_q7SX4F75PdD9soseNsB8",
  authDomain: "business-mind-bc746.firebaseapp.com",
  projectId: "business-mind-bc746",
  storageBucket: "business-mind-bc746.firebasestorage.app",
  messagingSenderId: "908586681408",
  appId: "1:908586681408:web:35cefab6bd5d7f390b0ba5",
  measurementId: "G-V90BGBS8C2",
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

let appInstance: FirebaseApp | null = null;
let secondaryAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let secondaryAuthInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    const existing = getApps().find((a) => a.name === '[DEFAULT]');
    appInstance = existing || initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getSecondaryFirebaseApp(): FirebaseApp {
  if (!secondaryAppInstance) {
    const existing = getApps().find((a) => a.name === 'AdminWorkerApp');
    secondaryAppInstance = existing || initializeApp(firebaseConfig, 'AdminWorkerApp');
  }
  return secondaryAppInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getSecondaryFirebaseAuth(): Auth {
  if (!secondaryAuthInstance) {
    secondaryAuthInstance = getAuth(getSecondaryFirebaseApp());
  }
  return secondaryAuthInstance;
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = getFirebaseFirestore();
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable; offline cache mode active.');
    }
    return false;
  }
}

function sanitizeEmailKey(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_');
}

export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || '';
  const msg = error?.message || 'Authentication error occurred.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Invalid email or password. Please verify your credentials or ask Admin.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists in Firebase Authentication.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password or Google sign-in is not enabled in Firebase Console (Authentication → Sign-in method).';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completion.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please wait a moment and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection.';
  }
  return msg;
}

/**
 * Ensures the signed-in Firebase Auth user is authorized in Firestore.
 * Only ROOT_ADMIN_EMAIL can auto-bootstrap; all other users MUST already have
 * a Firestore profile in `users/{uid}` or an Admin pre-authorization in `invited_users/{email}`.
 */
export async function resolveAuthorizedUserProfile(fbUser: FirebaseUser): Promise<UserAccount> {
  const db = getFirebaseFirestore();
  const userEmail = (fbUser.email || '').toLowerCase().trim();
  const userRef = doc(db, 'users', fbUser.uid);

  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data() as UserAccount;
    const normalized: UserAccount = {
      ...data,
      uid: fbUser.uid,
      email: userEmail || data.email,
      permissions: normalizePermissions(data.role, data.permissions),
    };
    if (!normalized.isActive) {
      await signOut(getFirebaseAuth());
      throw new Error('Your account has been disabled by an Administrator.');
    }
    await updateDoc(userRef, {
      last_login: new Date().toISOString(),
    }).catch(() => {});
    return normalized;
  }

  // Root Admin bootstrap on first sign-in
  if (userEmail === ROOT_ADMIN_EMAIL) {
    const now = new Date().toISOString();
    const adminProfile: UserAccount = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'Primary Admin',
      email: ROOT_ADMIN_EMAIL,
      role: 'admin',
      isActive: true,
      permissions: structuredClone(ADMIN_PERMISSIONS),
      created_at: now,
      created_by: 'system_root',
      updated_at: now,
      last_login: now,
    };
    await setDoc(userRef, adminProfile);
    await setDoc(doc(db, 'admins', fbUser.uid), {
      uid: fbUser.uid,
      email: ROOT_ADMIN_EMAIL,
      created_at: now,
    });
    return adminProfile;
  }

  // Check if Admin pre-authorized this email
  if (userEmail) {
    const inviteRef = doc(db, 'invited_users', sanitizeEmailKey(userEmail));
    const inviteSnap = await getDoc(inviteRef);
    if (inviteSnap.exists()) {
      const invite = inviteSnap.data() as Partial<UserAccount>;
      const role: FirebaseUserRole = invite.role || 'user';
      const now = new Date().toISOString();
      const newProfile: UserAccount = {
        uid: fbUser.uid,
        name: fbUser.displayName || invite.name || userEmail.split('@')[0],
        email: userEmail,
        phone: invite.phone || '',
        role,
        isActive: invite.isActive !== false,
        permissions: normalizePermissions(role, invite.permissions),
        created_at: invite.created_at || now,
        created_by: invite.created_by || 'admin',
        updated_at: now,
        last_login: now,
      };
      await setDoc(userRef, newProfile);
      if (role === 'admin') {
        await setDoc(doc(db, 'admins', fbUser.uid), {
          uid: fbUser.uid,
          email: userEmail,
          created_at: now,
        });
      }
      await deleteDoc(inviteRef).catch(() => {});
      return newProfile;
    }
  }

  // Unauthorized: nobody except Admin can create accounts
  await signOut(getFirebaseAuth());
  throw new Error(
    'Access Denied: Public registration is disabled. Only an Admin can create or authorize accounts.'
  );
}

export async function signInWithFirebaseEmail(email: string, password: string): Promise<UserAccount> {
  try {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return await resolveAuthorizedUserProfile(cred.user);
  } catch (err: any) {
    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function signInWithFirebaseGoogle(): Promise<UserAccount> {
  try {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return await resolveAuthorizedUserProfile(cred.user);
  } catch (err: any) {
    throw new Error(formatFirebaseAuthError(err));
  }
}

/**
 * One-time Root Admin Initial Setup strictly restricted to ROOT_ADMIN_EMAIL.
 */
export async function bootstrapRootAdminAccount(
  email: string,
  password: string,
  name: string
): Promise<UserAccount> {
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail !== ROOT_ADMIN_EMAIL) {
    throw new Error(
      `Only the designated Root Admin (${ROOT_ADMIN_EMAIL}) can initialize the system.`
    );
  }
  try {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    const db = getFirebaseFirestore();
    const now = new Date().toISOString();
    const adminProfile: UserAccount = {
      uid: cred.user.uid,
      name: name.trim() || 'Primary Admin',
      email: cleanEmail,
      role: 'admin',
      isActive: true,
      permissions: structuredClone(ADMIN_PERMISSIONS),
      created_at: now,
      created_by: 'system_root',
      updated_at: now,
      last_login: now,
    };
    await setDoc(doc(db, 'users', cred.user.uid), adminProfile);
    await setDoc(doc(db, 'admins', cred.user.uid), {
      uid: cred.user.uid,
      email: cleanEmail,
      created_at: now,
    });
    return adminProfile;
  } catch (err: any) {
    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

/**
 * Admin-only: Create a new User / Manager / Admin in Firebase Auth + Firestore
 * using a secondary Firebase App instance so the Admin's session stays intact.
 */
export async function createStaffUserByAdmin(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: FirebaseUserRole;
  permissions: UserPermissions;
  adminUid: string;
}): Promise<UserAccount> {
  const cleanEmail = params.email.toLowerCase().trim();
  const secondaryAuth = getSecondaryFirebaseAuth();
  const db = getFirebaseFirestore();
  const now = new Date().toISOString();

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, params.password);
    if (params.name.trim()) {
      await updateProfile(cred.user, { displayName: params.name.trim() });
    }

    const newUid = cred.user.uid;
    const normalizedPerms = normalizePermissions(params.role, params.permissions);

    const newAccount: UserAccount = {
      uid: newUid,
      name: params.name.trim(),
      email: cleanEmail,
      phone: params.phone?.trim() || '',
      role: params.role,
      isActive: true,
      permissions: normalizedPerms,
      created_at: now,
      created_by: params.adminUid,
      updated_at: now,
    };

    await setDoc(doc(db, 'users', newUid), newAccount);
    if (params.role === 'admin') {
      await setDoc(doc(db, 'admins', newUid), {
        uid: newUid,
        email: cleanEmail,
        created_at: now,
      });
    }

    await signOut(secondaryAuth);
    return newAccount;
  } catch (err: any) {
    await signOut(secondaryAuth).catch(() => {});
    throw new Error(formatFirebaseAuthError(err));
  }
}

/**
 * Admin-only: Update an existing user's role, active state, name, phone, or granular permissions.
 */
export async function updateStaffUserByAdmin(
  uid: string,
  updates: Partial<Pick<UserAccount, 'name' | 'phone' | 'role' | 'isActive' | 'permissions'>>
): Promise<void> {
  const db = getFirebaseFirestore();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('User record not found in Firestore.');
  }

  const existing = snap.data() as UserAccount;
  const nextRole = updates.role ?? existing.role;
  const nextPerms = normalizePermissions(nextRole, updates.permissions ?? existing.permissions);
  const now = new Date().toISOString();

  await updateDoc(userRef, {
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
    ...(updates.isActive !== undefined ? { isActive: updates.isActive } : {}),
    role: nextRole,
    permissions: nextPerms,
    updated_at: now,
  });

  const adminRef = doc(db, 'admins', uid);
  if (nextRole === 'admin') {
    await setDoc(adminRef, {
      uid,
      email: existing.email,
      updated_at: now,
    });
  } else {
    await deleteDoc(adminRef).catch(() => {});
  }
}

/**
 * Admin-only: Revoke and delete a staff user's Firestore access profile.
 */
export async function deleteStaffUserByAdmin(uid: string): Promise<void> {
  const db = getFirebaseFirestore();
  await deleteDoc(doc(db, 'users', uid));
  await deleteDoc(doc(db, 'admins', uid)).catch(() => {});
}

export function subscribeToCurrentUserProfile(
  uid: string,
  onUpdate: (user: UserAccount | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseFirestore();
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data() as UserAccount;
      onUpdate({
        ...data,
        uid,
        permissions: normalizePermissions(data.role, data.permissions),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      if (onError) onError(error);
    }
  );
}

export function subscribeToAllUsers(
  onUpdate: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseFirestore();
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snap) => {
      const list: UserAccount[] = [];
      snap.forEach((d) => {
        const data = d.data() as UserAccount;
        list.push({
          ...data,
          uid: d.id,
          permissions: normalizePermissions(data.role, data.permissions),
        });
      });
      list.sort((a, b) => {
        const order = { admin: 0, manager: 1, user: 2 };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      if (onError) onError(error);
    }
  );
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

    const settingsDoc = doc(db, 'system', 'business_settings');
    batch.set(settingsDoc, {
      ...payload.settings,
      updated_at_cloud: new Date().toISOString(),
    });

    const categoriesDoc = doc(db, 'system', 'categories');
    batch.set(categoriesDoc, {
      list: payload.categories,
      updated_at_cloud: new Date().toISOString(),
    });

    payload.products.slice(0, 50).forEach((prod) => {
      const prodRef = doc(db, 'products', prod.id);
      batch.set(prodRef, prod);
    });

    payload.customers.slice(0, 50).forEach((cust) => {
      const custRef = doc(db, 'customers', cust.id);
      batch.set(custRef, cust);
    });

    payload.suppliers.slice(0, 50).forEach((supp) => {
      const suppRef = doc(db, 'suppliers', supp.id);
      batch.set(suppRef, supp);
    });

    payload.invoices.slice(0, 50).forEach((inv) => {
      const invRef = doc(db, 'invoices', inv.id);
      batch.set(invRef, inv);
    });

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
    handleFirestoreError(error, OperationType.WRITE, 'batch_sync');
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

    const prodSnap = await getDocs(collection(db, 'products'));
    const products: Product[] = [];
    prodSnap.forEach((d) => {
      products.push(d.data() as Product);
    });

    const custSnap = await getDocs(collection(db, 'customers'));
    const customers: Customer[] = [];
    custSnap.forEach((d) => {
      customers.push(d.data() as Customer);
    });

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
    handleFirestoreError(error, OperationType.LIST, 'store_pull');
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
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}
