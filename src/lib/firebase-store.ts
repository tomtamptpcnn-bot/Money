import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { monthKey } from "./utils";
import type { AppUser, Asset, Category, DataShape, Debt, Goal, Resource, Transaction, Wallet } from "./types";

type Config<T extends Record<string, unknown>> = {
  collectionName: string;
  seed: Omit<T, "id" | "createdAt" | "updatedAt">[];
};

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const defaultAdminUsername = "tomtam";
const defaultAdminPassword = "TomTam22";
const seedChecked = new Set<Resource>();

const configs: {
  transactions: Config<Transaction>;
  wallets: Config<Wallet>;
  categories: Config<Category>;
  assets: Config<Asset>;
  debts: Config<Debt>;
  goals: Config<Goal>;
} = {
  transactions: {
    collectionName: "transactions",
    seed: []
  },
  wallets: {
    collectionName: "wallets",
    seed: [
      { name: "เงินสด", walletType: "cash", balance: 0, currency: "THB", icon: "Banknote", color: "#91d4c7", note: "" },
      { name: "บัญชีธนาคาร", walletType: "bank", balance: 0, currency: "THB", icon: "Landmark", color: "#a7c7e7", note: "" },
      { name: "บัตรเครดิต", walletType: "credit_card", balance: 0, currency: "THB", icon: "CreditCard", color: "#ffb3a7", note: "" }
    ]
  },
  categories: {
    collectionName: "categories",
    seed: [
      { name: "อาหาร", type: "expense", icon: "Utensils", color: "#ffb3a7" },
      { name: "เดินทาง", type: "expense", icon: "Train", color: "#ffd166" },
      { name: "บ้าน", type: "expense", icon: "Home", color: "#c6d8ff" },
      { name: "ช้อปปิ้ง", type: "expense", icon: "ShoppingBag", color: "#f7b2d9" },
      { name: "สุขภาพ", type: "expense", icon: "HeartPulse", color: "#b8e0d2" },
      { name: "บันเทิง", type: "expense", icon: "Sparkles", color: "#d8c2ff" },
      { name: "ประกัน", type: "expense", icon: "ShieldCheck", color: "#a7c7e7" },
      { name: "ครอบครัว", type: "expense", icon: "UsersRound", color: "#ffd6a5" },
      { name: "บัตรเครดิต", type: "expense", icon: "CreditCard", color: "#ffb3a7" },
      { name: "คอนโด", type: "expense", icon: "Building2", color: "#c6d8ff" },
      { name: "ช้อปปี้", type: "expense", icon: "ShoppingBag", color: "#f7b2d9" },
      { name: "เงินเดือน", type: "income", icon: "BriefcaseBusiness", color: "#91d4c7" },
      { name: "โบนัส", type: "income", icon: "Gift", color: "#ffd166" },
      { name: "ปันผล", type: "income", icon: "TrendingUp", color: "#a7c7e7" },
      { name: "ขายของ", type: "income", icon: "Store", color: "#f7b2d9" }
    ]
  },
  assets: {
    collectionName: "assets",
    seed: []
  },
  debts: {
    collectionName: "debts",
    seed: []
  },
  goals: {
    collectionName: "goals",
    seed: [
      { name: "เงินฉุกเฉิน", targetAmount: 100000, currentAmount: 0, targetDate: new Date().toISOString().slice(0, 10), icon: "Umbrella", color: "#91d4c7", note: "" }
    ]
  }
};

function firebaseConfig(): FirebaseOptions {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    throw new Error("ยังไม่ได้ตั้งค่า Firebase ให้คัดลอก .env.example เป็น .env.local แล้วใส่ค่า NEXT_PUBLIC_FIREBASE_* ให้ครบ");
  }
  return config;
}

function db() {
  const app = getApps()[0] ?? initializeApp(firebaseConfig());
  return getFirestore(app);
}

function collectionRef(resource: Resource) {
  return collection(db(), configs[resource].collectionName);
}

function usersRef() {
  return collection(db(), "users");
}

function normalizeRow<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value === undefined || value === null ? "" : value])
  ) as T;
}

function assetQuantity(asset: Asset) {
  if (Array.isArray(asset.lots) && asset.lots.length) {
    return asset.lots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
  }
  return Number(asset.quantity || 0);
}

function seedRows(resource: Resource) {
  const stamp = now();
  return configs[resource].seed.map((item) => ({
    id: id(),
    ...item,
    createdAt: "createdAt" in item ? item.createdAt : stamp,
    updatedAt: "updatedAt" in item ? item.updatedAt : stamp
  })) as Record<string, unknown>[];
}

async function ensureSeed(resource: Resource) {
  if (seedChecked.has(resource)) return;
  if (!configs[resource].seed.length) {
    seedChecked.add(resource);
    return;
  }

  const snapshot = await getDocs(collectionRef(resource));
  if (snapshot.empty && configs[resource].seed.length) {
    await writeRows(resource, seedRows(resource));
    seedChecked.add(resource);
    return;
  }
  if (resource !== "categories") {
    seedChecked.add(resource);
    return;
  }

  const existing = snapshot.docs.map((item) => item.data() as Partial<Category>);
  const missing = configs.categories.seed.filter((seed) => !existing.some((item) => item.name === seed.name && item.type === seed.type));
  if (!missing.length) {
    seedChecked.add(resource);
    return;
  }

  const stamp = now();
  const batch = writeBatch(db());
  for (const item of missing) {
    const itemId = id();
    batch.set(doc(collectionRef(resource), itemId), { id: itemId, ...item, createdAt: stamp, updatedAt: stamp });
  }
  await batch.commit();
  seedChecked.add(resource);
}

async function writeRows<T extends Record<string, unknown>>(resource: Resource, rows: T[]) {
  const existing = await getDocs(collectionRef(resource));
  let batch = writeBatch(db());
  let operations = 0;

  for (const item of existing.docs) {
    batch.delete(item.ref);
    operations += 1;
    if (operations === 450) {
      await batch.commit();
      batch = writeBatch(db());
      operations = 0;
    }
  }

  for (const row of rows.map(normalizeRow)) {
    const itemId = String(row.id || id());
    const payload = { ...row, id: itemId };
    batch.set(doc(collectionRef(resource), itemId), payload);
    operations += 1;
    if (operations === 450) {
      await batch.commit();
      batch = writeBatch(db());
      operations = 0;
    }
  }

  if (operations) await batch.commit();
}

export async function resetData() {
  for (const resource of Object.keys(configs) as Resource[]) {
    await writeRows(resource, seedRows(resource));
  }
}

export async function readResource<T extends Record<string, unknown>>(resource: Resource): Promise<T[]> {
  await ensureSeed(resource);
  const snapshot = await getDocs(collectionRef(resource));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as unknown as T);
}

export async function listData(): Promise<DataShape> {
  const [transactions, wallets, categories, assets, debts, goals] = await Promise.all([
    readResource<Transaction>("transactions"),
    readResource<Wallet>("wallets"),
    readResource<Category>("categories"),
    readResource<Asset>("assets"),
    readResource<Debt>("debts"),
    readResource<Goal>("goals")
  ]);

  return {
    transactions: transactions.sort((a, b) => String(b.date).localeCompare(String(a.date))),
    wallets,
    categories,
    assets,
    debts,
    goals
  };
}

export async function addResource<T extends Record<string, unknown>>(resource: Resource, input: T) {
  const stamp = now();
  const item = normalizeRow({ id: id(), ...input, createdAt: stamp, updatedAt: stamp });
  await setDoc(doc(collectionRef(resource), item.id), item);
  if (resource === "transactions") await applyTransactionDelta(item as unknown as Transaction, 1);
  return item;
}

export async function updateResource<T extends Record<string, unknown>>(resource: Resource, itemId: string, input: T) {
  const snapshot = await getDoc(doc(collectionRef(resource), itemId));
  if (!snapshot.exists()) throw new Error("ไม่พบรายการ");
  const previous = { id: snapshot.id, ...snapshot.data() } as Record<string, unknown>;
  const next = normalizeRow({ ...previous, ...input, id: itemId, createdAt: previous.createdAt, updatedAt: now() });
  await setDoc(doc(collectionRef(resource), itemId), next);
  if (resource === "transactions") {
    await applyTransactionDelta(previous as unknown as Transaction, -1);
    await applyTransactionDelta(next as unknown as Transaction, 1);
  }
  return next;
}

export async function updateResourceBatch<T extends Record<string, unknown>>(resource: Resource, updates: { id: string; input: T }[]) {
  if (!updates.length) return [];

  const rows = await readResource<Record<string, unknown>>(resource);
  const stamp = now();
  const nextRows = updates.map(({ id: itemId, input }) => {
    const previous = rows.find((row) => row.id === itemId);
    if (!previous) throw new Error("ไม่พบรายการ");
    return {
      previous,
      next: normalizeRow({ ...previous, ...input, id: itemId, createdAt: previous.createdAt, updatedAt: stamp })
    };
  });

  let batch = writeBatch(db());
  let operations = 0;

  for (const { next } of nextRows) {
    batch.set(doc(collectionRef(resource), String(next.id)), next);
    operations += 1;
    if (operations === 450) {
      await batch.commit();
      batch = writeBatch(db());
      operations = 0;
    }
  }

  if (operations) await batch.commit();

  if (resource === "transactions") {
    for (const { previous, next } of nextRows) {
      await applyTransactionDelta(previous as unknown as Transaction, -1);
      await applyTransactionDelta(next as unknown as Transaction, 1);
    }
  }

  return nextRows.map(({ next }) => next);
}

export async function deleteResource(resource: Resource, itemId: string) {
  const snapshot = await getDoc(doc(collectionRef(resource), itemId));
  if (!snapshot.exists()) throw new Error("ไม่พบรายการ");
  const item = { id: snapshot.id, ...snapshot.data() } as Record<string, unknown>;
  await deleteDoc(doc(collectionRef(resource), itemId));
  if (resource === "transactions") await applyTransactionDelta(item as unknown as Transaction, -1);
  return item;
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicUser(user: AppUser) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

export async function ensureDefaultAdminUser() {
  const users = await getDocs(usersRef());
  const existing = users.docs.map((item) => ({ id: item.id, ...item.data() }) as AppUser).find((user) => user.username === defaultAdminUsername);
  if (existing) return publicUser(existing);

  const stamp = now();
  const passwordSalt = id();
  const passwordHash = await hashPassword(defaultAdminPassword, passwordSalt);
  const user: AppUser = normalizeRow({
    id: id(),
    username: defaultAdminUsername,
    displayName: "Tomtam",
    passwordHash,
    passwordSalt,
    role: "admin",
    status: "active",
    authProvider: "local",
    lastLoginAt: "",
    createdAt: stamp,
    updatedAt: stamp
  });

  await setDoc(doc(usersRef(), user.id), user);
  return publicUser(user);
}

export async function validateUserCredentials(username: string, password: string) {
  await ensureDefaultAdminUser();
  const users = await getDocs(usersRef());
  const user = users.docs.map((item) => ({ id: item.id, ...item.data() }) as AppUser).find((item) => item.username === username);
  if (!user || user.status !== "active") return null;
  const passwordHash = await hashPassword(password, user.passwordSalt);
  if (passwordHash !== user.passwordHash) return null;
  return publicUser(user);
}

export async function recordUserLogin(username: string) {
  const users = await getDocs(usersRef());
  const user = users.docs.map((item) => ({ id: item.id, ...item.data() }) as AppUser).find((item) => item.username === username);
  if (!user) return null;
  const next = normalizeRow({ ...user, lastLoginAt: now(), updatedAt: now() });
  await setDoc(doc(usersRef(), user.id), next);
  return publicUser(next);
}

export async function listUsers() {
  const users = await getDocs(usersRef());
  return users.docs.map((item) => publicUser({ id: item.id, ...item.data() } as AppUser));
}

async function applyTransactionDelta(transaction: Transaction, direction: 1 | -1) {
  if (transaction.type === "transfer") return;
  if (transaction.paid === false) return;
  const rows = await readResource<Wallet>("wallets");
  const wallet = rows.find((item) => item.name === transaction.wallet || item.id === transaction.wallet);
  if (!wallet) return;
  const signed = transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount);
  const next = {
    ...wallet,
    balance: Number(wallet.balance || 0) + signed * direction,
    updatedAt: now()
  };
  await setDoc(doc(collectionRef("wallets"), wallet.id), normalizeRow(next));
}

export function buildSummaryFromData(data: DataShape) {
  const thisMonth = monthKey(new Date());
  const monthly = new Map<string, { month: string; income: number; expense: number }>();
  const expenseCategories = new Map<string, number>();
  const incomeCategories = new Map<string, number>();

  for (const transaction of data.transactions) {
    if (transaction.paid === false) continue;
    const key = monthKey(transaction.date);
    const point = monthly.get(key) ?? { month: key, income: 0, expense: 0 };
    if (transaction.type === "income") point.income += Number(transaction.amount || 0);
    if (transaction.type === "expense") {
      point.expense += Number(transaction.amount || 0);
      expenseCategories.set(transaction.category, (expenseCategories.get(transaction.category) ?? 0) + Number(transaction.amount || 0));
    }
    if (transaction.type === "income") {
      incomeCategories.set(transaction.category, (incomeCategories.get(transaction.category) ?? 0) + Number(transaction.amount || 0));
    }
    monthly.set(key, point);
  }

  const current = data.transactions.filter((transaction) => transaction.paid !== false && monthKey(transaction.date) === thisMonth);
  const monthIncome = current.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const monthExpense = current.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const walletTotal = data.wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
  const assetValue = data.assets.reduce((sum, asset) => sum + assetQuantity(asset) * Number(asset.currentPrice || 0), 0);
  const debtRemaining = data.debts.reduce((sum, debt) => sum + Math.max(0, Number(debt.totalAmount || 0) - Number(debt.paidAmount || 0)), 0);

  return {
    totals: {
      walletTotal,
      monthIncome,
      monthExpense,
      cashflow: monthIncome - monthExpense,
      assetValue,
      debtRemaining,
      netWorth: walletTotal + assetValue - debtRemaining
    },
    monthly: Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month)).slice(-12),
    expenseCategories: Array.from(expenseCategories.entries()).map(([name, value]) => ({ name, value })),
    incomeCategories: Array.from(incomeCategories.entries()).map(([name, value]) => ({ name, value })),
    recent: data.transactions.slice(0, 8)
  };
}

export async function buildSummary() {
  return buildSummaryFromData(await listData());
}

export async function exportDataBackup() {
  const data = await listData();
  const summary = buildSummaryFromData(data);
  return {
    exportedAt: now(),
    source: "firebase",
    data,
    summary
  };
}
