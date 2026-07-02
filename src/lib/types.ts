export type Resource = "transactions" | "wallets" | "categories" | "assets" | "debts" | "goals";

export type TransactionType = "income" | "expense" | "transfer";
export type AssetType = "cash" | "gold" | "stock" | "crypto" | "fund" | "insurance" | "other";
export type PriceSource = "manual" | "goldapi";
export type WalletType = "cash" | "bank" | "credit_card" | "savings" | "investment";
export type DebtStatus = "installing" | "paid";
export type DebtPaymentMode = "next" | "custom" | "payoff";
export type UserRole = "admin" | "user";
export type UserStatus = "active" | "disabled";

export type AssetLot = {
  id: string;
  purchaseDate: string;
  quantity: number;
  buyPrice: number;
  note: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  name: string;
  category: string;
  wallet: string;
  amount: number;
  paid: boolean;
  scheduleMode: "once" | "monthly";
  monthsCount: number;
  dayOfMonth: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  id: string;
  name: string;
  walletType: WalletType;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
};

export type Asset = {
  id: string;
  name: string;
  assetType: AssetType;
  symbol: string;
  priceSource: PriceSource;
  priceCurrency: string;
  purchaseDate: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  lastPriceUpdatedAt: string;
  lots: AssetLot[];
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type Debt = {
  id: string;
  name: string;
  owner: string;
  debtType: string;
  totalAmount: number;
  paidAmount: number;
  monthlyPayment: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  dueDate: string;
  status: DebtStatus;
  showInCalendar: boolean;
  payments: DebtPayment[];
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type DebtPayment = {
  id: string;
  date: string;
  wallet: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  note: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type AppUser = {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  passwordSalt: string;
  role: UserRole;
  status: UserStatus;
  authProvider: "env" | "local";
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DataShape = {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  assets: Asset[];
  debts: Debt[];
  goals: Goal[];
};
