"use client";

import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Coins,
  Copy,
  CreditCard,
  Download,
  Edit3,
  Gift,
  HeartPulse,
  Home,
  Landmark,
  LogOut,
  Moon,
  MoreHorizontal,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  Target,
  Train,
  Trash2,
  TrendingUp,
  Umbrella,
  Utensils,
  UsersRound,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn, money, todayInput } from "@/lib/utils";
import type { Asset, AssetLot, Category, DataShape, Debt, DebtPaymentMode, Goal, Resource, Transaction, Wallet } from "@/lib/types";

type View = "dashboard" | "transactions" | "wallets" | "categories" | "assets" | "debts" | "goals" | "reports" | "settings";

const emptyData: DataShape = { transactions: [], wallets: [], categories: [], assets: [], debts: [], goals: [] };
const iconMap = {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Circle,
  Coins,
  CreditCard,
  Gift,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Target,
  Train,
  TrendingUp,
  Umbrella,
  Utensils,
  UsersRound,
  WalletCards
};
const iconNames = Object.keys(iconMap);
const palette = ["#91d4c7", "#ffb3a7", "#ffd166", "#a7c7e7", "#f7b2d9", "#c6d8ff", "#b8e0d2", "#d8c2ff"];

const iconLabels: Record<string, string> = {
  ArrowDownCircle: "ลูกศรลง",
  ArrowUpCircle: "ลูกศรขึ้น",
  Banknote: "ธนบัตร",
  Boxes: "กล่อง",
  BriefcaseBusiness: "กระเป๋างาน",
  Building2: "คอนโด",
  Circle: "วงกลม",
  Coins: "เหรียญ",
  CreditCard: "บัตรเครดิต",
  Gift: "ของขวัญ",
  HeartPulse: "สุขภาพ",
  Home: "บ้าน",
  Landmark: "ธนาคาร",
  MoreHorizontal: "อื่น ๆ",
  PiggyBank: "กระปุกออมสิน",
  ReceiptText: "ใบเสร็จ",
  ShieldCheck: "ประกัน",
  ShoppingBag: "ถุงช้อปปิ้ง",
  Smartphone: "มือถือ",
  Sparkles: "ประกาย",
  Store: "ร้านค้า",
  Target: "เป้าหมาย",
  Train: "รถไฟ",
  TrendingUp: "กราฟขึ้น",
  Umbrella: "ร่ม",
  Utensils: "อาหาร",
  UsersRound: "ครอบครัว",
  WalletCards: "กระเป๋าเงิน"
};

const nav: { id: View; label: string; icon: typeof ReceiptText }[] = [
  { id: "dashboard", label: "ภาพรวม", icon: BarChart3 },
  { id: "transactions", label: "รายการเงิน/ปฏิทิน", icon: CalendarDays },
  { id: "wallets", label: "กระเป๋าเงิน", icon: WalletCards },
  { id: "categories", label: "หมวดหมู่", icon: Boxes },
  { id: "assets", label: "ทรัพย์สิน", icon: Coins },
  { id: "debts", label: "หนี้สิน", icon: CreditCard },
  { id: "goals", label: "เป้าหมาย", icon: Target },
  { id: "reports", label: "รายงาน", icon: BarChart3 },
  { id: "settings", label: "ตั้งค่า", icon: Settings }
];

const resourceLabels: Record<Resource, string> = {
  transactions: "รายการเงิน",
  wallets: "กระเป๋าเงิน",
  categories: "หมวดหมู่",
  assets: "ทรัพย์สิน",
  debts: "หนี้สิน",
  goals: "เป้าหมาย"
};

const assetTypeLabels: Record<string, string> = {
  cash: "เงินสด",
  gold: "ทอง",
  stock: "หุ้น",
  crypto: "คริปโต",
  fund: "กองทุน",
  insurance: "ประกัน",
  other: "อื่น ๆ"
};

const categoryTypeLabels: Record<string, string> = {
  income: "รายรับ",
  expense: "รายจ่าย"
};

const walletTypeLabels: Record<string, string> = {
  cash: "เงินสด",
  bank: "บัญชีธนาคาร",
  credit_card: "บัตรเครดิต",
  savings: "เงินออม",
  investment: "เงินลงทุน"
};

const walletTypeIcons: Record<string, keyof typeof iconMap> = {
  cash: "Banknote",
  bank: "Landmark",
  credit_card: "CreditCard",
  savings: "PiggyBank",
  investment: "TrendingUp"
};

const currencyOptions = [
  ["THB", "THB - บาท"],
  ["USD", "USD - ดอลลาร์"],
  ["EUR", "EUR - ยูโร"],
  ["JPY", "JPY - เยน"],
  ["GBP", "GBP - ปอนด์"]
];

const priceSymbolOptions = [
  ["THAI_GOLD_BAR", "ทองคำแท่ง 96.5% ขายออก", Coins],
  ["XAU", "ทองคำโลก XAU", Sparkles],
  ["CUSTOM", "กำหนดเอง", MoreHorizontal]
] as const;

const priceSymbolLabels = Object.fromEntries(priceSymbolOptions.map(([value, label]) => [value, label]));

type Summary = {
  totals: { walletTotal: number; monthIncome: number; monthExpense: number; cashflow: number; assetValue: number; debtRemaining: number; netWorth: number };
  monthly: { month: string; income: number; expense: number }[];
  expenseCategories: { name: string; value: number }[];
  incomeCategories: { name: string; value: number }[];
  recent: Transaction[];
};

type ToastMessage = {
  id: number;
  title: string;
  description?: string;
  tone?: "success" | "error";
};
type NotifyFn = (title: string, description?: string, tone?: ToastMessage["tone"]) => void;

const emptySummary: Summary = { totals: { walletTotal: 0, monthIncome: 0, monthExpense: 0, cashflow: 0, assetValue: 0, debtRemaining: 0, netWorth: 0 }, monthly: [], expenseCategories: [], incomeCategories: [], recent: [] };

export default function HomePage() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<DataShape>(emptyData);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [theme, setTheme] = useState("light");
  const [editor, setEditor] = useState<{ resource: Resource; item?: Record<string, unknown> } | null>(null);

  function notify(title: string, description?: string, tone: ToastMessage["tone"] = "success") {
    setToast({ id: Date.now(), title, description, tone });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/data?summary=1");
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const body = await res.json();
      setData(body.data);
      setSummary(body.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  async function save(resource: Resource, payload: Record<string, unknown>, item?: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      if (resource === "transactions" && !item?.id && payload.scheduleMode === "monthly") {
        const items = expandMonthlyTransactions(payload);
        for (const entry of items) {
          const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error ?? "บันทึกไม่สำเร็จ");
        }
        setEditor(null);
        await load();
        notify("สร้างรายการประจำแล้ว", `เพิ่ม ${items.length} รายการสำเร็จ`);
        return;
      }
      if (resource === "transactions" && item?.id && payload.scheduleMode === "monthly") {
        const items = expandMonthlyTransactions(payload);
        const endpoint = `/api/${resource}/${item.id}`;
        const res = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items[0] ?? payload) });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "บันทึกไม่สำเร็จ");

        const missingItems = items.slice(1).filter((entry) => !hasMatchingScheduledTransaction(data.transactions, entry, String(item.id)));
        for (const entry of missingItems) {
          const createRes = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
          const createBody = await createRes.json();
          if (!createRes.ok) throw new Error(createBody.error ?? "สร้างรายการล่วงหน้าไม่สำเร็จ");
        }

        setEditor(null);
        await load();
        notify("อัปเดตรายการประจำแล้ว", missingItems.length ? `เพิ่มรายการล่วงหน้าอีก ${missingItems.length} เดือน` : "ไม่มีเดือนใหม่ที่ต้องเพิ่ม");
        return;
      }
      const endpoint = item?.id ? `/api/${resource}/${item.id}` : `/api/${resource}`;
      const res = await fetch(endpoint, { method: item?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "บันทึกไม่สำเร็จ");
      setEditor(null);
      await load();
      notify(item?.id ? "อัปเดตสำเร็จ" : "บันทึกสำเร็จ", `${resourceLabels[resource]}ถูกบันทึกแล้ว`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError(message);
      notify("ทำรายการไม่สำเร็จ", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(resource: Resource, itemId: string) {
    if (!confirm("ลบรายการนี้ใช่ไหม?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/${resource}/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      await load();
      notify("ลบสำเร็จ", `${resourceLabels[resource]}ถูกลบแล้ว`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      setError(message);
      notify("ลบไม่สำเร็จ", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeTransactions(itemIds: string[]) {
    if (!itemIds.length) return;
    if (!confirm(`ลบรายการเงิน ${itemIds.length} รายการใช่ไหม?`)) return;
    setSaving(true);
    setError("");
    try {
      for (const itemId of itemIds) {
        const res = await fetch(`/api/transactions/${itemId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("ลบบางรายการไม่สำเร็จ");
      }
      await load();
      notify("ลบสำเร็จ", `ลบรายการเงิน ${itemIds.length} รายการแล้ว`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "ลบไม่สำเร็จ";
      setError(message);
      notify("ลบไม่สำเร็จ", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function copyPreviousMonthTransactions(targetMonth: string) {
    const sourceMonth = shiftMonthKey(targetMonth, -1);
    const sourceItems = data.transactions.filter((transaction) => transaction.date.startsWith(sourceMonth));
    if (!sourceItems.length) {
      notify("ไม่มีรายการให้คัดลอก", `ไม่พบรายการในเดือน ${formatMonthLabel(sourceMonth)}`, "error");
      return;
    }
    if (!confirm(`คัดลอก ${sourceItems.length} รายการจาก ${formatMonthLabel(sourceMonth)} มา ${formatMonthLabel(targetMonth)} ใช่ไหม?`)) return;

    setSaving(true);
    setError("");
    try {
      for (const transaction of sourceItems) {
        const entry = copyTransactionToMonth(transaction, targetMonth);
        const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "คัดลอกรายการไม่สำเร็จ");
      }
      await load();
      notify("คัดลอกสำเร็จ", `เพิ่มรายการใหม่ ${sourceItems.length} รายการใน ${formatMonthLabel(targetMonth)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "คัดลอกรายการไม่สำเร็จ";
      setError(message);
      notify("คัดลอกรายการไม่สำเร็จ", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTransactionPaid(transaction: Transaction) {
    setSaving(true);
    setError("");
    try {
      const nextPaid = transaction.paid === false;
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...transaction, paid: nextPaid })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "อัปเดตสถานะไม่สำเร็จ");
      await load();
      notify(nextPaid ? "ทำเครื่องหมายว่าจ่ายแล้ว" : "เปลี่ยนเป็นยังไม่จ่าย", transactionTitle(transaction));
    } catch (err) {
      const message = err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ";
      setError(message);
      notify("อัปเดตสถานะไม่สำเร็จ", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen pb-24 lg:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-card/90 p-5 backdrop-blur lg:block">
        <Brand />
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
          ))}
        </nav>
      </aside>

      <section className="lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">MoneyTomtam</p>
            <h1 className="text-xl font-bold tracking-normal lg:text-2xl">{nav.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={load} title="รีเฟรช">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="สลับธีม">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={logout} title="ออกจากระบบ">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
          {error ? <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {loading ? <LoadingGrid /> : <ViewRenderer view={view} data={data} summary={summary} setEditor={setEditor} remove={remove} removeTransactions={removeTransactions} toggleTransactionPaid={toggleTransactionPaid} copyPreviousMonthTransactions={copyPreviousMonthTransactions} reload={load} notify={notify} />}
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.map((item) => (
          <button key={item.id} className={cn("grid min-w-20 place-items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-muted-foreground", view === item.id && "bg-accent text-accent-foreground")} onClick={() => setView(item.id)}>
            <item.icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {view === "transactions" ? (
        <Button className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full p-0 shadow-lg lg:hidden" onClick={() => setEditor({ resource: "transactions" })} title="เพิ่มรายการ">
          <Plus className="h-6 w-6" />
        </Button>
      ) : null}

      <EditorDialog editor={editor} data={data} saving={saving} onClose={() => setEditor(null)} onSave={save} />
      <ToastNotice toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
        <PiggyBank className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-black tracking-normal">MoneyTomtam</h2>
        <p className="text-xs text-muted-foreground">บันทึกการเงินส่วนตัว</p>
      </div>
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: (typeof nav)[number]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground", active && "bg-accent text-accent-foreground")}>
      <item.icon className="h-5 w-5" />
      {item.label}
    </button>
  );
}

function ViewRenderer({ view, data, summary, setEditor, remove, removeTransactions, toggleTransactionPaid, copyPreviousMonthTransactions, reload, notify }: { view: View; data: DataShape; summary: Summary; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void; removeTransactions: (itemIds: string[]) => void; toggleTransactionPaid: (transaction: Transaction) => void; copyPreviousMonthTransactions: (targetMonth: string) => void; reload: () => Promise<void>; notify: NotifyFn }) {
  if (view === "dashboard") return <Dashboard data={data} summary={summary} setEditor={setEditor} remove={remove} />;
  if (view === "transactions") return <Transactions data={data} setEditor={setEditor} remove={remove} removeTransactions={removeTransactions} toggleTransactionPaid={toggleTransactionPaid} copyPreviousMonthTransactions={copyPreviousMonthTransactions} />;
  if (view === "wallets") return <Collection title="กระเป๋าเงิน" resource="wallets" rows={data.wallets} setEditor={setEditor} remove={remove} render={(item) => <WalletRow wallet={item as Wallet} />} />;
  if (view === "categories") return <Collection title="หมวดหมู่" resource="categories" rows={data.categories} setEditor={setEditor} remove={remove} render={(item) => <NameRow item={item as Category} extra={categoryTypeLabels[(item as Category).type] ?? (item as Category).type} />} />;
  if (view === "assets") return <AssetsView data={data} setEditor={setEditor} remove={remove} reload={reload} notify={notify} />;
  if (view === "debts") return <DebtsView data={data} setEditor={setEditor} remove={remove} reload={reload} notify={notify} />;
  if (view === "goals") return <Collection title="เป้าหมาย" resource="goals" rows={data.goals} setEditor={setEditor} remove={remove} render={(item) => <GoalRow goal={item as Goal} />} />;
  if (view === "reports") return <Reports summary={summary} />;
  return <SettingsPanel reload={reload} notify={notify} />;
}

function Dashboard({ data, summary, setEditor, remove }: { data: DataShape; summary: Summary; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void }) {
  const cards = [
    ["ยอดเงินรวม", summary.totals.walletTotal, WalletCards],
    ["รายรับเดือนนี้", summary.totals.monthIncome, ArrowUpCircle],
    ["รายจ่ายเดือนนี้", summary.totals.monthExpense, ArrowDownCircle],
    ["ทรัพย์สินสุทธิ", summary.totals.netWorth, Sparkles]
  ] as const;
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-black tracking-normal">{money(value)}</p>
              </div>
              <Icon className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ยอดคงเหลือแยกตามกระเป๋า</CardTitle>
            <Button size="sm" onClick={() => setEditor({ resource: "wallets" })}><Plus className="h-4 w-4" />เพิ่มกระเป๋า</Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.wallets.length ? data.wallets.map((wallet) => (
              <div key={wallet.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <WalletRow wallet={wallet} />
                  <RowActions onEdit={() => setEditor({ resource: "wallets", item: wallet as unknown as Record<string, unknown> })} onDelete={() => remove("wallets", wallet.id)} />
                </div>
                {wallet.note ? <p className="mt-2 text-xs text-muted-foreground">{wallet.note}</p> : null}
              </div>
            )) : <Empty text="ยังไม่มีกระเป๋าเงิน" />}
          </CardContent>
        </Card>
        <CashflowCalendar data={data} />
      </div>
            <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>เป้าหมายการออม</CardTitle>
            <Button size="sm" onClick={() => setEditor({ resource: "goals" })}><Plus className="h-4 w-4" />เพิ่ม</Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.goals.length ? data.goals.slice(0, 4).map((goal) => <GoalRow key={goal.id} goal={goal} />) : <Empty text="เพิ่มเป้าหมายแรกของคุณได้เลย" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>รายการล่าสุด</CardTitle>
            <Button size="sm" onClick={() => setEditor({ resource: "transactions" })}><Plus className="h-4 w-4" />เพิ่ม</Button>
          </CardHeader>
          <CardContent className="grid gap-2">
            {summary.recent.length ? summary.recent.map((transaction) => <TransactionLine key={transaction.id} transaction={transaction} />) : <Empty text="ยังไม่มีรายการล่าสุด" />}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_.9fr]">
        <ChartCard title="รายรับรายจ่ายรายเดือน">
          {summary.monthly.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={summary.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="income" name="รายรับ" stroke="#2f9e85" fill="#91d4c7" />
                <Area type="monotone" dataKey="expense" name="รายจ่าย" stroke="#df6b63" fill="#ffb3a7" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty text="ยังไม่มีรายการเงินสำหรับสร้างกราฟ" />}
        </ChartCard>
        <ChartCard title="หมวดหมู่รายจ่าย">
          {summary.expenseCategories.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie dataKey="value" data={summary.expenseCategories} nameKey="name" outerRadius={90} label>
                  {summary.expenseCategories.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => money(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty text="ยังไม่มีรายจ่าย" />}
        </ChartCard>
      </div>
    </div>
  );
}

function Transactions({ data, setEditor, remove, removeTransactions, toggleTransactionPaid, copyPreviousMonthTransactions }: { data: DataShape; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void; removeTransactions: (itemIds: string[]) => void; toggleTransactionPaid: (transaction: Transaction) => void; copyPreviousMonthTransactions: (targetMonth: string) => void }) {
  const [selectedDate, setSelectedDate] = useState(todayInput());
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState(todayInput().slice(0, 7));
  const [category, setCategory] = useState("all");
  const [wallet, setWallet] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedTransactions = useMemo(() => data.transactions.filter((transaction) => transaction.date === selectedDate), [data.transactions, selectedDate]);
  const selectedDebts = useMemo(() => debtItemsForDate(data, selectedDate), [data, selectedDate]);
  const filtered = useMemo(() => data.transactions.filter((t) => {
    const matchesSearch = `${t.name ?? ""} ${t.category} ${t.wallet} ${t.note}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "all" || t.type === type;
    const matchesMonth = !month || t.date.startsWith(month);
    const matchesCategory = category === "all" || t.category === category;
    const matchesWallet = wallet === "all" || t.wallet === wallet;
    return matchesSearch && matchesType && matchesMonth && matchesCategory && matchesWallet;
  }), [data.transactions, query, type, month, category, wallet]);
  const allFilteredSelected = Boolean(filtered.length && filtered.every((transaction) => selectedIds.includes(transaction.id)));

  useEffect(() => {
    setSelectedIds((ids) => ids.filter((id) => filtered.some((transaction) => transaction.id === id)));
  }, [filtered]);

  function toggleSelected(id: string) {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function toggleAllFiltered() {
    setSelectedIds(allFilteredSelected ? [] : filtered.map((transaction) => transaction.id));
  }

  function targetMonth() {
    return month || selectedDate.slice(0, 7);
  }

  return (
    <div className="grid gap-4">
      <CashflowCalendar data={data} expanded selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setDayDialogOpen(true); }} />
      <DayTransactionsDialog
        open={dayDialogOpen}
        date={selectedDate}
        transactions={selectedTransactions}
        debts={selectedDebts}
        onOpenChange={setDayDialogOpen}
        onAdd={() => {
          setDayDialogOpen(false);
          setEditor({ resource: "transactions", item: { date: selectedDate } });
        }}
        onEdit={(transaction) => {
          setDayDialogOpen(false);
          setEditor({ resource: "transactions", item: transaction as unknown as Record<string, unknown> });
        }}
        onDelete={(id) => remove("transactions", id)}
        onTogglePaid={toggleTransactionPaid}
      />
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-end">
        <Field label="ค้นหา"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ชื่อรายการ หมวดหมู่ กระเป๋า โน้ต" /></div></Field>
        <Field label="เดือน"><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></Field>
        <Field label="ประเภท"><Select value={type} onChange={setType} options={[["all", "ทั้งหมด"], ["income", "รายรับ"], ["expense", "รายจ่าย"], ["transfer", "โอน"]]} /></Field>
        <Field label="หมวดหมู่"><Select value={category} onChange={setCategory} options={[["all", "ทั้งหมด"], ...uniqueOptions(data.categories.map((item) => [item.name, item.name]))]} /></Field>
        <Field label="กระเป๋าเงิน"><Select value={wallet} onChange={setWallet} options={[["all", "ทั้งหมด"], ...data.wallets.map((item) => [item.name, item.name])]} /></Field>
        <Button variant="outline" onClick={() => copyPreviousMonthTransactions(targetMonth())}><Copy className="h-4 w-4" />คัดลอกเดือนก่อน</Button>
        <Button className="lg:ml-auto" onClick={() => setEditor({ resource: "transactions" })}><Plus className="h-4 w-4" />เพิ่มรายการ</Button>
      </div>
      <Card>
        <CardContent className="grid gap-2 p-4">
          {filtered.length ? (
            <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Input className="h-4 w-4" type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} />
                เลือกทั้งหมดที่แสดง
              </label>
              <Button variant="destructive" disabled={!selectedIds.length} onClick={() => removeTransactions(selectedIds)}>
                <Trash2 className="h-4 w-4" />ลบที่เลือก {selectedIds.length ? `(${selectedIds.length})` : ""}
              </Button>
            </div>
          ) : null}
          {filtered.length ? filtered.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-3 rounded-md border p-3">
              <Input className="h-4 w-4 shrink-0" type="checkbox" checked={selectedIds.includes(transaction.id)} onChange={() => toggleSelected(transaction.id)} aria-label={`เลือก ${transactionTitle(transaction)}`} />
              <TransactionLine transaction={transaction} className="flex-1" onTogglePaid={() => toggleTransactionPaid(transaction)} />
              <RowActions onEdit={() => setEditor({ resource: "transactions", item: transaction as unknown as Record<string, unknown> })} onDelete={() => remove("transactions", transaction.id)} />
            </div>
          )) : <Empty text="ไม่พบรายการตามตัวกรอง" />}
        </CardContent>
      </Card>
    </div>
  );
}

function DayTransactionsDialog({ open, date, transactions, debts, onOpenChange, onAdd, onEdit, onDelete, onTogglePaid }: { open: boolean; date: string; transactions: Transaction[]; debts: { id: string; date: string; category: string; amount: number; paid: boolean }[]; onOpenChange: (open: boolean) => void; onAdd: () => void; onEdit: (transaction: Transaction) => void; onDelete: (id: string) => void; onTogglePaid: (transaction: Transaction) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <DialogTitle>รายการวันที่ {date}</DialogTitle>
            <DialogDescription>{transactions.length + debts.length} รายการในวันนี้</DialogDescription>
          </div>
          <Button onClick={onAdd}><Plus className="h-4 w-4" />เพิ่มในวันนี้</Button>
        </div>
        <div className="grid gap-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-3 rounded-md border p-3">
              <TransactionLine transaction={transaction} className="flex-1" onTogglePaid={() => onTogglePaid(transaction)} />
              <RowActions onEdit={() => onEdit(transaction)} onDelete={() => onDelete(transaction.id)} />
            </div>
          ))}
          {debts.map((item) => (
            <div key={item.id} className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-destructive">{item.category}</p>
                  <p className="text-xs text-muted-foreground">รายการหนี้ที่ตั้งให้แสดงในปฏิทิน • รอจ่าย</p>
                </div>
                <p className="shrink-0 font-black text-destructive">-{money(item.amount)}</p>
              </div>
            </div>
          ))}
          {!transactions.length && !debts.length ? <Empty text="ยังไม่มีรายการในวันนี้" /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Collection({ title, resource, rows, render, setEditor, remove }: { title: string; resource: Resource; rows: Record<string, unknown>[]; render: (item: Record<string, unknown>) => React.ReactNode; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} รายการ</p>
        <Button onClick={() => setEditor({ resource })}><Plus className="h-4 w-4" />เพิ่ม</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.length ? rows.map((item) => (
          <Card key={String(item.id)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">{render(item)}</div>
                <RowActions onEdit={() => setEditor({ resource, item })} onDelete={() => remove(resource, String(item.id))} />
              </div>
            </CardContent>
          </Card>
        )) : <div className="md:col-span-2 xl:col-span-3"><Empty text={`ยังไม่มี${title}`} /></div>}
      </div>
    </div>
  );
}

function AssetsView({ data, setEditor, remove, reload, notify }: { data: DataShape; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void; reload: () => Promise<void>; notify: NotifyFn }) {
  const [updatingGold, setUpdatingGold] = useState(false);
  const [message, setMessage] = useState("");
  const assetGroups = useMemo(() => summarizeAssets(data.assets), [data.assets]);

  async function updateGoldPrices() {
    setUpdatingGold(true);
    setMessage("");
    try {
      const res = await fetch("/api/prices/gold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "THB" })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "อัปเดตราคาทองไม่สำเร็จ");
      setMessage(`อัปเดตราคาทองแล้ว ${body.updated} รายการ`);
      await reload();
      notify("อัปเดตราคาทองสำเร็จ", `อัปเดตทรัพย์สิน ${body.updated} รายการแล้ว`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปเดตราคาทองไม่สำเร็จ";
      setMessage(message);
      notify("อัปเดตราคาไม่สำเร็จ", message, "error");
    } finally {
      setUpdatingGold(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{data.assets.length} รายการ</p>
          {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={updateGoldPrices} disabled={updatingGold}>
            <RefreshCcw className="h-4 w-4" />{updatingGold ? "กำลังอัปเดต..." : "อัปเดตราคาทอง"}
          </Button>
          <Button onClick={() => setEditor({ resource: "assets" })}><Plus className="h-4 w-4" />เพิ่มทรัพย์สิน</Button>
        </div>
      </div>
      {assetGroups.length ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>สรุปทรัพย์สินรวม</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {assetGroups.map((group) => (
              <div key={group.key} className="rounded-md border bg-background p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <NameRow item={{ name: group.name, icon: "Coins", color: "#ffd166" }} extra={`${group.lotCount} ล็อต • ${assetTypeLabels[group.assetType] ?? group.assetType}`} />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:min-w-[720px]">
                    <SummaryMetric label="จำนวนรวม" value={formatQuantity(group.quantity)} />
                    <SummaryMetric label="ราคาเฉลี่ย" value={money(group.averageBuyPrice, group.currency)} />
                    <SummaryMetric label="ต้นทุนรวม" value={money(group.totalCost, group.currency)} />
                    <SummaryMetric label="มูลค่าปัจจุบัน" value={money(group.currentValue, group.currency)} />
                    <SummaryMetric label="กำไร/ขาดทุน" value={`${group.profit >= 0 ? "+" : ""}${money(group.profit, group.currency)}`} tone={group.profit >= 0 ? "income" : "expense"} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.assets.length ? [...data.assets].sort((a, b) => String(b.purchaseDate || b.createdAt).localeCompare(String(a.purchaseDate || a.createdAt))).map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1"><AssetRow asset={asset} /></div>
                <RowActions onEdit={() => setEditor({ resource: "assets", item: asset as unknown as Record<string, unknown> })} onDelete={() => remove("assets", asset.id)} />
              </div>
            </CardContent>
          </Card>
        )) : <div className="md:col-span-2 xl:col-span-3"><Empty text="ยังไม่มีทรัพย์สิน" /></div>}
      </div>
    </div>
  );
}

function summarizeAssets(assets: Asset[]) {
  const groups = new Map<string, {
    key: string;
    name: string;
    assetType: Asset["assetType"];
    currency: string;
    lotCount: number;
    quantity: number;
    totalCost: number;
    currentValue: number;
    averageBuyPrice: number;
    profit: number;
  }>();

  for (const asset of assets) {
    const symbol = asset.symbol || asset.assetType;
    const currency = asset.priceCurrency || "THB";
    const key = `${asset.assetType}:${symbol}:${currency}`;
    const quantity = assetQuantity(asset);
    const totalCost = assetCost(asset);
    const currentValue = quantity * Number(asset.currentPrice || 0);
    const current = groups.get(key) ?? {
      key,
      name: asset.assetType === "gold" ? "ทองคำรวม" : `${assetTypeLabels[asset.assetType] ?? asset.assetType}รวม`,
      assetType: asset.assetType,
      currency,
      lotCount: 0,
      quantity: 0,
      totalCost: 0,
      currentValue: 0,
      averageBuyPrice: 0,
      profit: 0
    };
    current.lotCount += 1;
    current.quantity += quantity;
    current.totalCost += totalCost;
    current.currentValue += currentValue;
    current.averageBuyPrice = current.quantity ? current.totalCost / current.quantity : 0;
    current.profit = current.currentValue - current.totalCost;
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((a, b) => b.currentValue - a.currentValue);
}

function SummaryMetric({ label, value, tone }: { label: string; value: string; tone?: "income" | "expense" }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate font-black", tone === "income" ? "text-primary" : tone === "expense" ? "text-destructive" : "")}>{value}</p>
    </div>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 4 }).format(value);
}

function newAssetLot(): AssetLot {
  return { id: crypto.randomUUID(), purchaseDate: todayInput(), quantity: 1, buyPrice: 0, note: "" };
}

function assetLots(asset: Partial<Asset> | Record<string, unknown>): AssetLot[] {
  const rawLots = (asset as { lots?: unknown }).lots;
  if (Array.isArray(rawLots) && rawLots.length) {
    return rawLots.map((lot) => {
      const item = lot as Partial<AssetLot>;
      return {
        id: String(item.id || crypto.randomUUID()),
        purchaseDate: String(item.purchaseDate || todayInput()),
        quantity: Number(item.quantity || 0),
        buyPrice: Number(item.buyPrice || 0),
        note: String(item.note || "")
      };
    });
  }
  const quantity = Number((asset as Partial<Asset>).quantity || 0);
  const buyPrice = Number((asset as Partial<Asset>).buyPrice || 0);
  if (!quantity && !buyPrice) return [];
  return [{
    id: crypto.randomUUID(),
    purchaseDate: String((asset as Partial<Asset>).purchaseDate || (asset as Partial<Asset>).createdAt?.slice(0, 10) || todayInput()),
    quantity,
    buyPrice,
    note: String((asset as Partial<Asset>).note || "")
  }];
}

function assetCost(asset: Asset) {
  const lots = assetLots(asset);
  if (lots.length) return lots.reduce((sum, lot) => sum + Number(lot.quantity || 0) * Number(lot.buyPrice || 0), 0);
  return Number(asset.quantity || 0) * Number(asset.buyPrice || 0);
}

function assetQuantity(asset: Asset) {
  const lots = assetLots(asset);
  if (lots.length) return lots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
  return Number(asset.quantity || 0);
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

function WalletRow({ wallet }: { wallet: Wallet }) {
  return <NameRow item={{ ...wallet, icon: wallet.icon || walletTypeIcons[wallet.walletType] || "WalletCards" }} extra={`${walletTypeLabels[wallet.walletType] ?? "กระเป๋าเงิน"} • ${money(Number(wallet.balance || 0), wallet.currency || "THB")}`} />;
}

function NameRow({ item, extra }: { item: { name: string; icon?: string; color?: string }; extra?: string }) {
  const Icon = iconMap[(item.icon as keyof typeof iconMap) || "Circle"] ?? Circle;
  return <div className="flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-md" style={{ background: item.color || "#91d4c7" }}><Icon className="h-5 w-5 text-white" /></div><div className="min-w-0"><p className="truncate font-bold">{item.name}</p>{extra ? <p className="text-sm text-muted-foreground">{extra}</p> : null}</div></div>;
}

function CashflowCalendar({ data, expanded = false, selectedDate, onSelectDate }: { data: DataShape; expanded?: boolean; selectedDate?: string; onSelectDate?: (date: string) => void }) {
  const [selectedWallet, setSelectedWallet] = useState("all");
  const [cycleStartDay, setCycleStartDay] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState(todayInput().slice(0, 7));
  useEffect(() => {
    if (selectedDate) setSelectedMonth(selectedDate.slice(0, 7));
  }, [selectedDate]);
  const startDay = Math.min(28, Math.max(1, Number(cycleStartDay || 1)));
  const period = useMemo(() => buildCalendarPeriod(startDay, selectedMonth), [startDay, selectedMonth]);
  const wallet = data.wallets.find((item) => item.id === selectedWallet || item.name === selectedWallet);
  const displayCurrency = wallet?.currency || "THB";
  const visibleTransactions = useMemo(() => data.transactions.filter((transaction) => {
    const inPeriod = transaction.date >= period.startKey && transaction.date <= period.endKey;
    const inWallet = selectedWallet === "all" || transaction.wallet === wallet?.name || transaction.wallet === wallet?.id;
    return inPeriod && inWallet;
  }), [data.transactions, period.startKey, period.endKey, selectedWallet, wallet?.name, wallet?.id]);
  const debtCalendarItems = useMemo(() => data.debts.flatMap((debt) => {
    if (debt.showInCalendar === false) return [];
    return buildDebtSchedule(debt)
      .filter((row) => !row.paid && row.dueDate >= period.startKey && row.dueDate <= period.endKey)
      .map((row) => ({ id: `${debt.id}-${row.installment}`, date: row.dueDate, category: `งวดหนี้ ${debt.name}`, amount: row.payment, paid: false }));
  }), [data.debts, period.startKey, period.endKey]);
  const dayTotals = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const transaction of visibleTransactions) {
      const point = map.get(transaction.date) ?? { income: 0, expense: 0 };
      if (transaction.type === "income") point.income += Number(transaction.amount || 0);
      if (transaction.type === "expense") point.expense += Number(transaction.amount || 0);
      map.set(transaction.date, point);
    }
    for (const item of debtCalendarItems) {
      const point = map.get(item.date) ?? { income: 0, expense: 0 };
      point.expense += Number(item.amount || 0);
      map.set(item.date, point);
    }
    return map;
  }, [visibleTransactions, debtCalendarItems]);
  const totalIncome = visibleTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = visibleTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>ปฏิทินรายรับรายจ่าย</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{period.label}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="กระเป๋า">
              <Select value={selectedWallet} onChange={setSelectedWallet} options={[["all", "ทุกกระเป๋า"], ...data.wallets.map((item) => [item.id, item.name])]} />
            </Field>
            <Field label="วันเริ่มรอบ">
              <Input type="number" min="1" max="28" value={cycleStartDay} onChange={(event) => setCycleStartDay(event.target.value)} />
            </Field>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
              <div className="flex h-10 items-center justify-between gap-2 rounded-md border bg-background px-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedMonth((month) => shiftMonthKey(month, -1))} aria-label="เดือนก่อนหน้า">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-32 text-center text-sm font-bold">{formatMonthLabel(selectedMonth)}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedMonth((month) => shiftMonthKey(month, 1))} aria-label="เดือนถัดไป">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniTotal label="รายรับรอบนี้" value={totalIncome} currency={displayCurrency} tone="income" />
          <MiniTotal label="รายจ่ายรอบนี้" value={totalExpense} currency={displayCurrency} tone="expense" />
          <MiniTotal label="สุทธิรอบนี้" value={totalIncome - totalExpense} currency={displayCurrency} tone={totalIncome - totalExpense >= 0 ? "income" : "expense"} />
        </div>
        <div className="grid grid-cols-7 overflow-hidden rounded-md border text-xs">
          {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((day) => (
            <div key={day} className="bg-muted p-2 text-center font-bold">{day}</div>
          ))}
          {period.padStart.map((key) => <div key={key} className="min-h-24 border-t bg-muted/25 p-2" />)}
          {period.days.map((day) => {
            const totals = dayTotals.get(day.key) ?? { income: 0, expense: 0 };
            const net = totals.income - totals.expense;
            const transactions = visibleTransactions.filter((transaction) => transaction.date === day.key);
            const debts = debtCalendarItems.filter((item) => item.date === day.key);
            return (
              <button key={day.key} type="button" onClick={() => onSelectDate?.(day.key)} className={cn("border-t p-2 text-left transition-colors hover:bg-accent/60", expanded ? "min-h-36" : "min-h-24", selectedDate === day.key && "bg-primary/10 ring-2 ring-inset ring-primary/40")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{day.day}</p>
                  {transactions.length + debts.length ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{transactions.length + debts.length}</span> : null}
                </div>
                {totals.income ? <p className="mt-1 truncate text-primary">+{money(totals.income, displayCurrency)}</p> : null}
                {totals.expense ? <p className="truncate text-destructive">-{money(totals.expense, displayCurrency)}</p> : null}
                {net ? <p className={cn("mt-1 truncate font-bold", net >= 0 ? "text-primary" : "text-destructive")}>{money(net, displayCurrency)}</p> : null}
                {expanded ? (
                  <div className="mt-2 grid gap-1">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="truncate rounded-sm bg-muted/50 px-2 py-1 text-[11px]">
                        <span className={transaction.type === "income" ? "text-primary" : "text-destructive"}>
                          {transaction.type === "income" ? "+" : "-"}{money(Number(transaction.amount || 0), displayCurrency)}
                        </span>
                        <span className="text-muted-foreground"> • {transactionTitle(transaction)} • {transaction.category} • {transaction.paid === false ? "รอจ่าย" : "จ่ายแล้ว"}</span>
                      </div>
                    ))}
                    {debts.slice(0, Math.max(0, 3 - transactions.length)).map((item) => (
                      <div key={item.id} className="truncate rounded-sm bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
                        -{money(Number(item.amount || 0), displayCurrency)} <span className="text-muted-foreground">• {item.category} • รอจ่าย</span>
                      </div>
                    ))}
                    {transactions.length + debts.length > 3 ? <p className="text-[11px] text-muted-foreground">อีก {transactions.length + debts.length - 3} รายการ</p> : null}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniTotal({ label, value, currency, tone }: { label: string; value: number; currency: string; tone: "income" | "expense" }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-black", tone === "income" ? "text-primary" : "text-destructive")}>{money(value, currency)}</p>
    </div>
  );
}

function debtItemsForDate(data: DataShape, date: string) {
  return data.debts.flatMap((debt) => {
    if (debt.showInCalendar === false) return [];
    return buildDebtSchedule(debt)
      .filter((row) => !row.paid && row.dueDate === date)
      .map((row) => ({ id: `${debt.id}-${row.installment}`, date: row.dueDate, category: `งวดหนี้ ${debt.name}`, amount: row.payment, paid: false }));
  });
}

function buildCalendarPeriod(startDay: number, selectedMonth: string) {
  const [yearText, monthText] = selectedMonth.split("-");
  const year = Number(yearText) || new Date().getFullYear();
  const month = Math.max(0, Math.min(11, (Number(monthText) || new Date().getMonth() + 1) - 1));
  const start = new Date(year, month, startDay);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  const days = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push({ key: dateKey(cursor), day: cursor.getDate() });
  }
  const mondayIndex = (start.getDay() + 6) % 7;
  return {
    startKey: dateKey(start),
    endKey: dateKey(end),
    label: `${dateKey(start)} ถึง ${dateKey(end)}`,
    padStart: Array.from({ length: mondayIndex }, (_, index) => `pad-${index}`),
    days
  };
}

function shiftMonthKey(monthKey: string, offset: number) {
  const [yearText, monthText] = monthKey.split("-");
  const date = new Date(Number(yearText) || new Date().getFullYear(), (Number(monthText) || new Date().getMonth() + 1) - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string) {
  const [yearText, monthText] = monthKey.split("-");
  const date = new Date(Number(yearText) || new Date().getFullYear(), (Number(monthText) || new Date().getMonth() + 1) - 1, 1);
  return date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function expandMonthlyTransactions(payload: Record<string, unknown>) {
  const baseDate = new Date(String(payload.date || todayInput()));
  const count = Math.max(1, Math.min(120, Number(payload.monthsCount || 1)));
  const day = Math.max(1, Math.min(31, Number(payload.dayOfMonth || baseDate.getDate())));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return {
      ...payload,
      date: dateKey(date),
      scheduleMode: "monthly",
      monthsCount: count,
      dayOfMonth: day
    };
  });
}

function copyTransactionToMonth(transaction: Transaction, targetMonth: string) {
  const [, , dayText] = transaction.date.split("-");
  const [yearText, monthText] = targetMonth.split("-");
  const year = Number(yearText) || new Date().getFullYear();
  const month = Math.max(0, Math.min(11, (Number(monthText) || 1) - 1));
  const day = Math.max(1, Number(dayText || 1));
  const lastDay = new Date(year, month + 1, 0).getDate();
  const date = dateKey(new Date(year, month, Math.min(day, lastDay)));
  return {
    date,
    type: transaction.type,
    name: transaction.name || "",
    category: transaction.category,
    wallet: transaction.wallet,
    amount: Number(transaction.amount || 0),
    paid: false,
    scheduleMode: "once",
    monthsCount: 1,
    dayOfMonth: Number(date.slice(-2)),
    note: transaction.note || ""
  };
}

function hasMatchingScheduledTransaction(transactions: Transaction[], entry: Record<string, unknown>, currentId: string) {
  return transactions.some((transaction) => {
    if (transaction.id === currentId) return false;
    return transaction.date === entry.date &&
      transaction.type === entry.type &&
      String(transaction.name || "") === String(entry.name || "") &&
      transaction.category === entry.category &&
      transaction.wallet === entry.wallet &&
      Number(transaction.amount || 0) === Number(entry.amount || 0) &&
      String(transaction.note || "") === String(entry.note || "");
  });
}

function AssetRow({ asset }: { asset: Asset }) {
  const lots = assetLots(asset);
  const quantity = assetQuantity(asset);
  const cost = assetCost(asset);
  const value = quantity * Number(asset.currentPrice || 0);
  const profit = value - cost;
  const averageBuyPrice = quantity ? cost / quantity : 0;
  return (
    <div>
      <NameRow item={{ name: asset.name, icon: "Coins", color: "#ffd166" }} extra={`${assetTypeLabels[asset.assetType] ?? asset.assetType}${asset.symbol ? ` • ${priceSymbolLabel(asset.symbol)}` : ""}`} />
      <p className="mt-3 text-xl font-black">{money(value, asset.priceCurrency || "THB")}</p>
      <p className={cn("text-sm", profit >= 0 ? "text-primary" : "text-destructive")}>{profit >= 0 ? "+" : ""}{money(profit, asset.priceCurrency || "THB")}</p>
      <p className="mt-2 text-xs text-muted-foreground">{lots.length} ล็อต • จำนวนรวม {formatQuantity(quantity)}</p>
      <p className="text-xs text-muted-foreground">ราคาเฉลี่ย {money(averageBuyPrice, asset.priceCurrency || "THB")}</p>
      <p className="mt-2 text-xs text-muted-foreground">ราคาปัจจุบัน {money(Number(asset.currentPrice || 0), asset.priceCurrency || "THB")}</p>
      {asset.lastPriceUpdatedAt ? <p className="text-xs text-muted-foreground">อัปเดตล่าสุด {new Date(asset.lastPriceUpdatedAt).toLocaleString("th-TH")}</p> : null}
      {lots.length ? (
        <div className="mt-3 grid gap-1">
          {lots.slice(0, 3).map((lot) => (
            <p key={lot.id} className="truncate rounded-sm bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
              {lot.purchaseDate} • {formatQuantity(Number(lot.quantity || 0))} @ {money(Number(lot.buyPrice || 0), asset.priceCurrency || "THB")}
            </p>
          ))}
          {lots.length > 3 ? <p className="text-xs text-muted-foreground">อีก {lots.length - 3} ล็อต</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function DebtRow({ debt }: { debt: Debt }) {
  const total = Number(debt.totalAmount || 0);
  const paid = Number(debt.paidAmount || 0);
  const progress = total ? (paid / total) * 100 : 0;
  const status = paid >= total || debt.status === "paid" ? "ผ่อนเสร็จ" : "กำลังผ่อน";
  return <div className="grid gap-2"><NameRow item={{ name: debt.name, icon: "CreditCard", color: "#ffb3a7" }} extra={`${debt.owner || "ตัวเอง"} • ${status} • ${money(Math.max(0, total - paid))} คงเหลือ`} /><Progress value={progress} /><p className="text-xs text-muted-foreground">งวดละ {money(Number(debt.monthlyPayment || 0))} • ดอกเบี้ย {Number(debt.interestRate || 0)}%/ปี • ครบกำหนด {debt.dueDate}</p></div>;
}

function DebtsView({ data, setEditor, remove, reload, notify }: { data: DataShape; setEditor: (value: { resource: Resource; item?: Record<string, unknown> }) => void; remove: (resource: Resource, id: string) => void; reload: () => Promise<void>; notify: NotifyFn }) {
  const [payingId, setPayingId] = useState("");
  const [payment, setPayment] = useState({ mode: "next" as DebtPaymentMode, wallet: data.wallets[0]?.name ?? "", amount: "", date: todayInput(), note: "" });
  const [message, setMessage] = useState("");
  const ownerSummaries = useMemo(() => summarizeDebtsByOwner(data.debts), [data.debts]);
  const debtTotal = ownerSummaries.reduce((sum, owner) => sum + owner.totalAmount, 0);
  const debtRemaining = ownerSummaries.reduce((sum, owner) => sum + owner.remainingAmount, 0);

  async function pay(debt: Debt) {
    setMessage("");
    try {
      const res = await fetch(`/api/debts/${debt.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "จ่ายค่างวดไม่สำเร็จ");
      setPayingId("");
      setMessage(`จ่ายค่างวด ${debt.name} แล้ว ${money(Number(body.payment?.amount || 0))}`);
      await reload();
      notify("จ่ายค่างวดสำเร็จ", `${debt.name} • ${money(Number(body.payment?.amount || 0))}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "จ่ายค่างวดไม่สำเร็จ";
      setMessage(message);
      notify("จ่ายค่างวดไม่สำเร็จ", message, "error");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{data.debts.length} รายการ</p>
          {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
        </div>
        <Button onClick={() => setEditor({ resource: "debts" })}><Plus className="h-4 w-4" />เพิ่มหนี้</Button>
      </div>
      {ownerSummaries.length ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryMetric label="ยอดหนี้ทั้งหมด" value={money(debtTotal)} tone="expense" />
            <SummaryMetric label="ยอดคงเหลือทั้งหมด" value={money(debtRemaining)} tone={debtRemaining <= 0 ? "income" : "expense"} />
            <SummaryMetric label="จ่ายแล้วทั้งหมด" value={money(Math.max(0, debtTotal - debtRemaining))} />
            <SummaryMetric label="เจ้าของหนี้" value={`${ownerSummaries.length} คน`} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ownerSummaries.map((owner) => (
              <Card key={owner.owner} className="border-primary/20 bg-primary/5">
                <CardContent className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <NameRow item={{ name: owner.owner, icon: "UsersRound", color: "#a7c7e7" }} extra={`${owner.count} รายการ • คงเหลือ ${money(owner.remainingAmount)}`} />
                    <p className={cn("shrink-0 text-sm font-black", owner.remainingAmount > 0 ? "text-destructive" : "text-primary")}>{money(owner.remainingAmount)}</p>
                  </div>
                  <Progress value={owner.totalAmount ? (owner.paidAmount / owner.totalAmount) * 100 : 0} />
                  <div className="grid grid-cols-3 gap-2">
                    <SummaryMetric label="ยอดหนี้" value={money(owner.totalAmount)} />
                    <SummaryMetric label="จ่ายแล้ว" value={money(owner.paidAmount)} />
                    <SummaryMetric label="ต่องวด" value={money(owner.monthlyPayment)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4">
        {data.debts.length ? data.debts.map((debt) => {
          const schedule = buildDebtSchedule(debt);
          const nextDue = schedule.find((item) => !item.paid);
          const remaining = Math.max(0, Number(debt.totalAmount || 0) - Number(debt.paidAmount || 0));
          return (
            <Card key={debt.id}>
              <CardContent className="grid gap-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1"><DebtRow debt={debt} /></div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setPayingId(payingId === debt.id ? "" : debt.id);
                      setPayment({ mode: "next", wallet: data.wallets[0]?.name ?? "", amount: nextDue ? String(Math.round(nextDue.payment * 100) / 100) : "", date: todayInput(), note: "" });
                    }}>จ่ายค่างวด</Button>
                    <RowActions onEdit={() => setEditor({ resource: "debts", item: debt as unknown as Record<string, unknown> })} onDelete={() => remove("debts", debt.id)} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <SummaryMetric label="ยอดหนี้" value={money(Number(debt.totalAmount || 0))} />
                  <SummaryMetric label="จ่ายเงินต้นแล้ว" value={money(Number(debt.paidAmount || 0))} />
                  <SummaryMetric label="คงเหลือ" value={money(remaining)} tone={remaining <= 0 ? "income" : "expense"} />
                  <SummaryMetric label="งวดถัดไป" value={nextDue ? `${nextDue.dueDate} • ${money(nextDue.payment)}` : "ผ่อนเสร็จ"} />
                </div>

                {payingId === debt.id ? (
                  <div className="grid gap-3 rounded-md border bg-muted/30 p-3 md:grid-cols-5">
                    <Field label="วิธีจ่าย"><Select value={payment.mode} onChange={(value) => setPayment((old) => ({ ...old, mode: value as DebtPaymentMode }))} options={[["next", "งวดถัดไป"], ["custom", "ระบุเอง"], ["payoff", "จ่ายหมด"]]} /></Field>
                    <Field label="กระเป๋า"><Select value={payment.wallet} onChange={(value) => setPayment((old) => ({ ...old, wallet: value }))} options={data.wallets.map((wallet) => [wallet.name, wallet.name])} /></Field>
                    <Field label="วันที่จ่าย"><Input type="date" value={payment.date} onChange={(event) => setPayment((old) => ({ ...old, date: event.target.value }))} /></Field>
                    <Field label="จำนวนเงิน"><Input type="number" value={payment.mode === "custom" ? payment.amount : ""} disabled={payment.mode !== "custom"} placeholder={payment.mode === "payoff" ? money(remaining) : nextDue ? money(nextDue.payment) : ""} onChange={(event) => setPayment((old) => ({ ...old, amount: event.target.value }))} /></Field>
                    <div className="flex items-end gap-2">
                      <Button className="w-full" onClick={() => pay(debt)}>บันทึกจ่าย</Button>
                    </div>
                    <Field label="โน้ต" className="md:col-span-5"><Input value={payment.note} onChange={(event) => setPayment((old) => ({ ...old, note: event.target.value }))} placeholder="เช่น โอนผ่านแอพธนาคาร" /></Field>
                  </div>
                ) : null}

                <DebtInstallmentBadges schedule={schedule} />
              </CardContent>
            </Card>
          );
        }) : <Empty text="ยังไม่มีหนี้สิน" />}
      </div>
    </div>
  );
}

function summarizeDebtsByOwner(debts: Debt[]) {
  const groups = new Map<string, { owner: string; count: number; totalAmount: number; paidAmount: number; remainingAmount: number; monthlyPayment: number }>();

  for (const debt of debts) {
    const owner = (debt.owner || "ตัวเอง").trim() || "ตัวเอง";
    const totalAmount = Number(debt.totalAmount || 0);
    const paidAmount = Math.min(totalAmount, Number(debt.paidAmount || 0));
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const current = groups.get(owner) ?? { owner, count: 0, totalAmount: 0, paidAmount: 0, remainingAmount: 0, monthlyPayment: 0 };
    current.count += 1;
    current.totalAmount += totalAmount;
    current.paidAmount += paidAmount;
    current.remainingAmount += remainingAmount;
    current.monthlyPayment += debt.status === "paid" ? 0 : Number(debt.monthlyPayment || 0);
    groups.set(owner, current);
  }

  return Array.from(groups.values()).sort((a, b) => b.remainingAmount - a.remainingAmount || a.owner.localeCompare(b.owner));
}

function DebtInstallmentBadges({ schedule }: { schedule: ReturnType<typeof buildDebtSchedule> }) {
  const remaining = schedule.filter((row) => !row.paid).length;
  return (
    <div className="grid gap-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">งวดผ่อนชำระ</p>
        <p className="text-sm text-muted-foreground">เหลือ {remaining} งวด จากทั้งหมด {schedule.length} งวด</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {schedule.map((row) => (
          <span
            key={row.installment}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-black",
              row.paid ? "border-primary/30 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"
            )}
            title={`งวด ${row.installment} • ${row.dueDate} • ${money(row.payment)} • ${row.paid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}`}
          >
            {row.installment}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full border border-primary/30 bg-primary/15" />จ่ายแล้ว</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full border bg-muted" />ยังไม่จ่าย</span>
      </div>
    </div>
  );
}

function DebtScheduleTable({ schedule }: { schedule: ReturnType<typeof buildDebtSchedule> }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-2">งวด</th>
            <th className="p-2">ครบกำหนด</th>
            <th className="p-2 text-right">ค่างวด</th>
            <th className="p-2 text-right">เงินต้น</th>
            <th className="p-2 text-right">ดอกเบี้ย</th>
            <th className="p-2 text-right">คงเหลือ</th>
            <th className="p-2">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {schedule.slice(0, 12).map((row) => (
            <tr key={row.installment} className="border-t">
              <td className="p-2">{row.installment}</td>
              <td className="p-2">{row.dueDate}</td>
              <td className="p-2 text-right">{money(row.payment)}</td>
              <td className="p-2 text-right">{money(row.principal)}</td>
              <td className="p-2 text-right">{money(row.interest)}</td>
              <td className="p-2 text-right">{money(row.remaining)}</td>
              <td className="p-2">{row.paid ? "จ่ายแล้ว" : "รอจ่าย"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {schedule.length > 12 ? <p className="border-t p-2 text-xs text-muted-foreground">แสดง 12 งวดแรกจากทั้งหมด {schedule.length} งวด</p> : null}
    </div>
  );
}

function buildDebtSchedule(debt: Debt) {
  const rows: { installment: number; dueDate: string; payment: number; principal: number; interest: number; remaining: number; paid: boolean }[] = [];
  const total = Number(debt.totalAmount || 0);
  const paidPrincipal = Number(debt.paidAmount || 0);
  const rate = Number(debt.interestRate || 0) / 100 / 12;
  const term = Math.max(1, Number(debt.termMonths || 0) || Math.ceil(total / Math.max(1, Number(debt.monthlyPayment || total))));
  const fixedPayment = Number(debt.monthlyPayment || 0) || (rate ? total * rate / (1 - Math.pow(1 + rate, -term)) : total / term);
  const start = new Date(debt.startDate || debt.dueDate || todayInput());
  let remaining = total;

  for (let index = 0; index < term && remaining > 0.01; index += 1) {
    const interest = remaining * rate;
    const payment = Math.min(remaining + interest, fixedPayment);
    const principal = Math.max(0, payment - interest);
    remaining = Math.max(0, remaining - principal);
    const due = new Date(start);
    due.setMonth(start.getMonth() + index);
    rows.push({
      installment: index + 1,
      dueDate: dateKey(due),
      payment,
      principal,
      interest,
      remaining,
      paid: total - remaining <= paidPrincipal + 0.01
    });
  }

  return rows;
}

function GoalRow({ goal }: { goal: Goal }) {
  const progress = Number(goal.targetAmount || 0) ? (Number(goal.currentAmount || 0) / Number(goal.targetAmount || 0)) * 100 : 0;
  const missing = Math.max(0, Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0));
  return <div className="grid gap-2 rounded-md border p-3"><NameRow item={goal} extra={`${money(Number(goal.currentAmount || 0))} / ${money(Number(goal.targetAmount || 0))}`} /><Progress value={progress} /><p className="text-xs text-muted-foreground">ยังขาด {money(missing)} • {goal.targetDate}</p></div>;
}

function transactionTitle(transaction: Transaction) {
  return String(transaction.name || transaction.category || "รายการเงิน");
}

function TransactionLine({ transaction, className, onTogglePaid }: { transaction: Transaction; className?: string; onTogglePaid?: () => void }) {
  const isIncome = transaction.type === "income";
  const isPaid = transaction.paid !== false;
  const isOverdue = !isPaid && transaction.date < todayInput();
  return (
    <div className={cn("flex min-w-0 items-center justify-between gap-3", className)}>
      {onTogglePaid ? (
        <button
          type="button"
          onClick={onTogglePaid}
          className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-colors hover:bg-accent", isPaid ? "border-primary bg-primary/10 text-primary" : "bg-background text-muted-foreground")}
          title={isPaid ? "จ่ายแล้ว กดเพื่อเปลี่ยนเป็นยังไม่จ่าย" : "ยังไม่จ่าย กดเพื่อทำเครื่องหมายว่าจ่ายแล้ว"}
          aria-label={isPaid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
        >
          <CheckCircle2 className="h-5 w-5" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1 text-left">
        <p className={cn("truncate font-bold", isPaid && "text-muted-foreground line-through", isOverdue && "text-destructive")}>
          {transactionTitle(transaction)}
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground no-underline">{transaction.category}</span>
          <span className={cn("ml-1 rounded-full px-2 py-0.5 text-[11px] no-underline", isPaid ? "bg-primary/15 text-primary" : isOverdue ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{isPaid ? "จ่ายแล้ว" : "ยังไม่จ่าย"}</span>
        </p>
        <p className={cn("truncate text-xs text-muted-foreground", isPaid && "line-through")}>{transaction.date} • {transaction.wallet}{transaction.scheduleMode === "monthly" ? " • รายการประจำ" : ""}{transaction.note ? ` • ${transaction.note}` : ""}</p>
      </div>
      <p className={cn("shrink-0 font-black", isPaid && "text-muted-foreground line-through", !isPaid && (isIncome ? "text-primary" : "text-destructive"))}>{isIncome ? "+" : "-"}{money(Number(transaction.amount || 0))}</p>
    </div>
  );
}

function Reports({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="รายงานรายเดือน">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => money(Number(value))} />
            <Legend />
            <Bar dataKey="income" name="รายรับ" fill="#91d4c7" />
            <Bar dataKey="expense" name="รายจ่าย" fill="#ffb3a7" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <Card>
        <CardHeader><CardTitle>ส่งออกข้อมูล</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <Button asChild><a href="/api/export"><Download className="h-4 w-4" />สำรองข้อมูล JSON</a></Button>
          <Button variant="outline" onClick={() => window.print()}><Download className="h-4 w-4" />ส่งออก PDF</Button>
          <p className="text-sm text-muted-foreground">ข้อมูลหลักเก็บใน Firebase ส่วนไฟล์ JSON ใช้สำหรับสำรองข้อมูลเท่านั้น</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsPanel({ reload, notify }: { reload: () => Promise<void>; notify: NotifyFn }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function resetAll() {
    if (!confirm("รีเซ็ตข้อมูลทั้งหมดใน Firebase และสร้างข้อมูลเริ่มต้นใหม่ใช่ไหม?")) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "รีเซ็ตไม่สำเร็จ");
      setMessage("รีเซ็ตข้อมูลสำเร็จ");
      await reload();
      notify("รีเซ็ตข้อมูลสำเร็จ", "สร้างข้อมูลเริ่มต้นใหม่แล้ว");
    } catch (error) {
      const message = error instanceof Error ? error.message : "รีเซ็ตไม่สำเร็จ";
      setMessage(message);
      notify("รีเซ็ตไม่สำเร็จ", message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle>สกุลเงิน</CardTitle></CardHeader><CardContent><Input value="THB" readOnly /></CardContent></Card>
      <Card>
        <CardHeader><CardTitle>สำรอง / รีเซ็ต</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <Button asChild><a href="/api/export"><Download className="h-4 w-4" />สำรองข้อมูลจาก Firebase</a></Button>
          <Button variant="destructive" disabled={busy} onClick={resetAll}><RefreshCcw className="h-4 w-4" />รีเซ็ตข้อมูล</Button>
          {message ? <p>{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function EditorDialog({ editor, data, saving, onClose, onSave }: { editor: { resource: Resource; item?: Record<string, unknown> } | null; data: DataShape; saving: boolean; onClose: () => void; onSave: (resource: Resource, payload: Record<string, unknown>, item?: Record<string, unknown>) => void }) {
  const item = editor?.item ?? {};
  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => {
    if (editor) setForm(defaultForm(editor.resource, item, data));
  }, [editor, data]);
  if (!editor) return null;
  if (editor.resource === "assets") {
    return <AssetEditorDialog editor={editor} form={form} setForm={setForm} saving={saving} onClose={onClose} onSave={onSave} item={item} />;
  }
  const fields = formFields(editor.resource, data, form);
  return (
    <Dialog open={!!editor} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div>
          <DialogTitle className="text-xl font-black">{item.id ? "แก้ไข" : "เพิ่ม"}{resourceLabels[editor.resource]}</DialogTitle>
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(editor.resource, form, item); }}>
          {fields.map((field) => (
            <Field key={field.name} label={field.label} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              {field.name === "icon" ? <IconSelect value={String(form[field.name] ?? "Circle")} onChange={(value) => setForm((old) => ({ ...old, [field.name]: value }))} /> :
              field.type === "select" ? <Select value={String(form[field.name] ?? "")} onChange={(value) => setForm((old) => {
                if (editor.resource === "transactions" && field.name === "type") {
                  const nextCategory = data.categories.find((category) => category.type === value)?.name ?? "";
                  return { ...old, type: value, category: nextCategory };
                }
                return { ...old, [field.name]: value };
              })} options={field.options ?? []} /> :
                field.type === "textarea" ? <Textarea value={String(form[field.name] ?? "")} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} /> :
                field.type === "color" ? <ColorPicker value={String(form[field.name] ?? palette[0])} onChange={(value) => setForm((old) => ({ ...old, [field.name]: value }))} /> :
                field.type === "checkbox" ? <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm"><input type="checkbox" checked={form[field.name] !== false} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.checked }))} />{field.label}</label> :
                <Input type={field.type} value={String(form[field.name] ?? "")} onChange={(e) => setForm((old) => ({ ...old, [field.name]: e.target.value }))} required={field.required !== false} />}
            </Field>
          ))}
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssetEditorDialog({ editor, form, setForm, saving, onClose, onSave, item }: {
  editor: { resource: Resource; item?: Record<string, unknown> };
  form: Record<string, unknown>;
  setForm: Dispatch<SetStateAction<Record<string, unknown>>>;
  saving: boolean;
  onClose: () => void;
  onSave: (resource: Resource, payload: Record<string, unknown>, item?: Record<string, unknown>) => void;
  item: Record<string, unknown>;
}) {
  const lots = assetLots(form);
  const quantity = lots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
  const totalCost = lots.reduce((sum, lot) => sum + Number(lot.quantity || 0) * Number(lot.buyPrice || 0), 0);
  const averageBuyPrice = quantity ? totalCost / quantity : 0;
  const currentValue = quantity * Number(form.currentPrice || 0);
  const profit = currentValue - totalCost;

  function updateLot(index: number, key: keyof AssetLot, value: string) {
    setForm((old) => {
      const nextLots = assetLots(old).map((lot, lotIndex) => lotIndex === index ? { ...lot, [key]: key === "quantity" || key === "buyPrice" ? Number(value) : value } : lot);
      return { ...old, lots: nextLots };
    });
  }

  function addLot() {
    setForm((old) => ({ ...old, lots: [...assetLots(old), newAssetLot()] }));
  }

  function removeLot(index: number) {
    setForm((old) => {
      const nextLots = assetLots(old).filter((_, lotIndex) => lotIndex !== index);
      return { ...old, lots: nextLots.length ? nextLots : [newAssetLot()] };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanLots = lots
      .filter((lot) => Number(lot.quantity || 0) > 0)
      .map((lot) => ({ ...lot, id: lot.id || crypto.randomUUID(), quantity: Number(lot.quantity || 0), buyPrice: Number(lot.buyPrice || 0), note: lot.note || "" }));
    const nextQuantity = cleanLots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0);
    const nextCost = cleanLots.reduce((sum, lot) => sum + Number(lot.quantity || 0) * Number(lot.buyPrice || 0), 0);
    onSave(editor.resource, {
      ...form,
      lots: cleanLots,
      purchaseDate: cleanLots[0]?.purchaseDate || todayInput(),
      quantity: nextQuantity,
      buyPrice: nextQuantity ? nextCost / nextQuantity : 0
    }, item);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl">
        <div>
          <DialogTitle className="text-xl font-black">{item.id ? "แก้ไข" : "เพิ่ม"}ทรัพย์สิน</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">กรอกทรัพย์สิน 1 รายการ แล้วเพิ่มประวัติซื้อหลายครั้งในตารางเดียว</DialogDescription>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="ชื่อ"><Input value={String(form.name ?? "")} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} required /></Field>
            <Field label="ประเภท"><Select value={String(form.assetType ?? "gold")} onChange={(value) => setForm((old) => ({ ...old, assetType: value }))} options={Object.entries(assetTypeLabels)} /></Field>
            <Field label="สัญลักษณ์ราคา"><PriceSymbolSelect value={String(form.symbol ?? "THAI_GOLD_BAR")} onChange={(value) => setForm((old) => ({ ...old, symbol: value }))} /></Field>
            <Field label="แหล่งราคา"><Select value={String(form.priceSource ?? "manual")} onChange={(value) => setForm((old) => ({ ...old, priceSource: value }))} options={[["manual", "กรอกเอง"], ["goldapi", "ราคาทองไทย"]]} /></Field>
            <Field label="สกุลเงินราคา"><Select value={String(form.priceCurrency ?? "THB")} onChange={(value) => setForm((old) => ({ ...old, priceCurrency: value }))} options={currencyOptions} /></Field>
            <Field label="ราคาปัจจุบันต่อหน่วย"><Input type="number" value={String(form.currentPrice ?? 0)} onChange={(e) => setForm((old) => ({ ...old, currentPrice: e.target.value }))} required /></Field>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>รายการซื้อ</CardTitle>
              <Button type="button" size="sm" onClick={addLot}><Plus className="h-4 w-4" />เพิ่มแถว</Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="hidden grid-cols-[1fr_1fr_1fr_1.3fr_44px] gap-2 text-xs font-bold text-muted-foreground md:grid">
                <span>วันที่ซื้อ</span><span>จำนวน</span><span>ราคาซื้อต่อหน่วย</span><span>บันทึก</span><span />
              </div>
              {lots.map((lot, index) => (
                <div key={lot.id || index} className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_1fr_1.3fr_44px] md:border-0 md:p-0">
                  <Input type="date" value={lot.purchaseDate} onChange={(e) => updateLot(index, "purchaseDate", e.target.value)} required />
                  <Input type="number" value={String(lot.quantity)} onChange={(e) => updateLot(index, "quantity", e.target.value)} min="0" step="0.0001" required />
                  <Input type="number" value={String(lot.buyPrice)} onChange={(e) => updateLot(index, "buyPrice", e.target.value)} min="0" step="0.01" required />
                  <Input value={lot.note} onChange={(e) => updateLot(index, "note", e.target.value)} placeholder="โน้ตของล็อตนี้" />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeLot(index)} title="ลบแถว"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-4">
            <SummaryMetric label="จำนวนรวม" value={formatQuantity(quantity)} />
            <SummaryMetric label="ราคาเฉลี่ย" value={money(averageBuyPrice, String(form.priceCurrency || "THB"))} />
            <SummaryMetric label="ต้นทุนรวม" value={money(totalCost, String(form.priceCurrency || "THB"))} />
            <SummaryMetric label="กำไร/ขาดทุน" value={`${profit >= 0 ? "+" : ""}${money(profit, String(form.priceCurrency || "THB"))}`} tone={profit >= 0 ? "income" : "expense"} />
          </div>

          <Field label="โน้ต"><Textarea value={String(form.note ?? "")} onChange={(e) => setForm((old) => ({ ...old, note: e.target.value }))} /></Field>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaultForm(resource: Resource, item: Record<string, unknown>, data: DataShape) {
  const base = { ...item };
  if (resource === "transactions") {
    const type = String(base.type ?? "expense");
    const defaultCategory = data.categories.find((category) => category.type === type)?.name ?? data.categories[0]?.name ?? "";
    const defaultWallet = data.wallets[0]?.name ?? "";
    const date = String(base.date ?? todayInput());
    return { date, type, name: "", category: defaultCategory, wallet: defaultWallet, amount: "", paid: false, scheduleMode: "once", monthsCount: 1, dayOfMonth: Number(date.slice(-2)), note: "", ...base };
  }
  if (resource === "wallets") return { name: "", walletType: "cash", balance: 0, currency: "THB", icon: "WalletCards", color: palette[0], note: "", ...base };
  if (resource === "categories") return { name: "", type: "expense", icon: "Circle", color: palette[1], ...base };
  if (resource === "assets") {
    const lots = assetLots(base);
    return { name: "", assetType: "gold", symbol: "THAI_GOLD_BAR", priceSource: "goldapi", priceCurrency: "THB", purchaseDate: todayInput(), quantity: 1, buyPrice: 0, currentPrice: 0, lastPriceUpdatedAt: "", note: "", ...base, lots: lots.length ? lots : [newAssetLot()] };
  }
  if (resource === "debts") return { name: "", owner: "ตัวเอง", debtType: "ผ่อนชำระ", totalAmount: 0, paidAmount: 0, monthlyPayment: 0, interestRate: 0, termMonths: 12, startDate: todayInput(), dueDate: todayInput(), status: "installing", showInCalendar: true, payments: [], note: "", ...base };
  return { name: "", targetAmount: 0, currentAmount: 0, targetDate: todayInput(), icon: "Target", color: palette[0], note: "", ...base };
}

function formFields(resource: Resource, data: DataShape, form: Record<string, unknown>) {
  const categoryOptions = uniqueOptions(data.categories.filter((c) => !form.type || c.type === form.type).map((c) => [c.name, `${c.name}`]));
  const walletOptions = uniqueOptions(data.wallets.map((w) => [w.name, w.name]));
  const common = {
    icon: { name: "icon", label: "ไอคอน", type: "select", options: iconNames.map((name) => [name, iconLabels[name] ?? name]) },
    color: { name: "color", label: "สี", type: "color" }
  };
  if (resource === "transactions") return [
    { name: "date", label: "วันที่", type: "date" },
    { name: "type", label: "ประเภท", type: "select", options: [["income", "รายรับ"], ["expense", "รายจ่าย"], ["transfer", "โอน"]] },
    { name: "name", label: "ชื่อรายการ", type: "text", required: false },
    { name: "category", label: "หมวดหมู่", type: "select", options: categoryOptions.length ? categoryOptions : [["", "กรุณาเพิ่มหมวดหมู่ก่อน"]] },
    { name: "wallet", label: "กระเป๋าเงิน", type: "select", options: walletOptions.length ? walletOptions : [["", "กรุณาเพิ่มกระเป๋าเงินก่อน"]] },
    { name: "amount", label: "จำนวนเงิน", type: "number" },
    { name: "paid", label: "จ่าย/รับแล้ว", type: "checkbox" },
    { name: "note", label: "โน้ต", type: "textarea", required: false }
  ];
  if (resource === "wallets") return [
    { name: "walletType", label: "ประเภทกระเป๋า", type: "select", options: Object.entries(walletTypeLabels) },
    { name: "name", label: "ชื่อกระเป๋า", type: "text" },
    { name: "balance", label: "จำนวนเงิน", type: "number" },
    { name: "currency", label: "สกุลเงิน", type: "select", options: currencyOptions },
    common.icon,
    common.color,
    { name: "note", label: "บันทึกช่วยจำ", type: "textarea", required: false }
  ];
  if (resource === "categories") return [{ name: "name", label: "ชื่อ", type: "text" }, { name: "type", label: "ประเภท", type: "select", options: [["income", "รายรับ"], ["expense", "รายจ่าย"]] }, common.icon, common.color];
  if (resource === "assets") return [
    { name: "name", label: "ชื่อ", type: "text" },
    { name: "assetType", label: "ประเภท", type: "select", options: Object.entries(assetTypeLabels) },
    { name: "symbol", label: "สัญลักษณ์ราคา", type: "text" },
    { name: "priceSource", label: "แหล่งราคา", type: "select", options: [["manual", "กรอกเอง"], ["goldapi", "ราคาทองไทย"]] },
    { name: "priceCurrency", label: "สกุลเงินราคา", type: "select", options: currencyOptions },
    { name: "purchaseDate", label: "วันที่ซื้อ", type: "date" },
    { name: "quantity", label: "จำนวนที่ถือ", type: "number" },
    { name: "buyPrice", label: "ราคาซื้อต่อหน่วย", type: "number" },
    { name: "currentPrice", label: "ราคาปัจจุบันต่อหน่วย", type: "number" },
    { name: "note", label: "โน้ต", type: "textarea", required: false }
  ];
  if (resource === "debts") return [
    { name: "name", label: "ชื่อ", type: "text" },
    { name: "owner", label: "หนี้ของใคร", type: "select", options: [["ตัวเอง", "หนี้ตัวเอง"], ["พ่อ", "หนี้พ่อ"], ["แม่", "หนี้แม่"], ["แฟน", "หนี้แฟน"], ["อื่น ๆ", "อื่น ๆ"]] },
    { name: "debtType", label: "ประเภทหนี้", type: "select", options: [["ผ่อนชำระ", "ผ่อนชำระ"], ["บัตรเครดิต", "บัตรเครดิต"], ["สินเชื่อ", "สินเชื่อ"], ["ส่วนตัว", "ส่วนตัว"], ["อื่น ๆ", "อื่น ๆ"]] },
    { name: "status", label: "สถานะ", type: "select", options: [["installing", "กำลังผ่อน"], ["paid", "ผ่อนเสร็จ"]] },
    { name: "showInCalendar", label: "แสดงงวดล่วงหน้าในปฏิทิน", type: "checkbox" },
    { name: "totalAmount", label: "ยอดเงินต้น", type: "number" },
    { name: "paidAmount", label: "จ่ายเงินต้นแล้ว", type: "number" },
    { name: "monthlyPayment", label: "ค่างวดต่อเดือน", type: "number" },
    { name: "interestRate", label: "ดอกเบี้ยต่อปี (%)", type: "number" },
    { name: "termMonths", label: "จำนวนงวด", type: "number" },
    { name: "startDate", label: "วันที่เริ่มผ่อน", type: "date" },
    { name: "dueDate", label: "วันครบกำหนดถัดไป", type: "date" },
    { name: "note", label: "โน้ต", type: "textarea", required: false }
  ];
  return [{ name: "name", label: "ชื่อ", type: "text" }, { name: "targetAmount", label: "เป้าหมาย", type: "number" }, { name: "currentAmount", label: "ออมแล้ว", type: "number" }, { name: "targetDate", label: "วันที่ต้องการ", type: "date" }, common.icon, common.color, { name: "note", label: "โน้ต", type: "textarea", required: false }];
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-2", className)}><Label>{label}</Label>{children}</div>;
}

function IconSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border bg-background p-2 sm:grid-cols-2">
      {iconNames.map((name) => {
        const Icon = iconMap[name as keyof typeof iconMap] ?? Circle;
        const active = value === name;
        return (
          <button
            key={name}
            type="button"
            className={cn("flex h-10 items-center gap-2 rounded-md border px-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground", active ? "border-primary bg-primary/10 text-primary" : "border-transparent")}
            onClick={() => onChange(name)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{iconLabels[name] ?? name}</span>
          </button>
        );
      })}
    </div>
  );
}

function PriceSymbolSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-2 rounded-md border bg-background p-2">
      {priceSymbolOptions.map(([symbol, label, Icon]) => {
        const active = value === symbol;
        return (
          <button
            key={symbol}
            type="button"
            className={cn("flex h-10 items-center gap-2 rounded-md border px-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground", active ? "border-primary bg-primary/10 text-primary" : "border-transparent")}
            onClick={() => onChange(symbol)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function priceSymbolLabel(symbol: string) {
  return priceSymbolLabels[symbol] ?? symbol;
}

function uniqueOptions(options: string[][]) {
  const seen = new Set<string>();
  return options.filter(([value]) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: (string | string[])[] }) {
  return <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option, index) => { const pair = Array.isArray(option) ? option : [option, option]; return <option key={`${pair[0]}-${index}`} value={pair[0]}>{pair[1]}</option>; })}</select>;
}

function ColorPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{palette.map((color) => <button type="button" key={color} className={cn("h-9 w-9 rounded-md border-2", value === color ? "border-foreground" : "border-transparent")} style={{ background: color }} onClick={() => onChange(color)} title={color} />)}<Input className="w-28" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" onClick={onEdit} title="แก้ไข"><Edit3 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={onDelete} title="ลบ"><Trash2 className="h-4 w-4" /></Button></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="grid min-h-32 place-items-center rounded-md border border-dashed bg-muted/35 p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

function LoadingGrid() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />)}</div>;
}

function ToastNotice({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  if (!toast) return null;
  const isError = toast.tone === "error";
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[80] sm:bottom-auto sm:left-auto sm:right-5 sm:top-5 sm:w-[360px]">
      <div className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4 shadow-xl backdrop-blur",
        isError ? "border-destructive/30 bg-destructive/10" : "border-primary/30 bg-primary/10"
      )}>
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", isError ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground")}>
          {isError ? <Circle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-black", isError ? "text-destructive" : "text-primary")}>{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p> : null}
        </div>
        <button className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted" onClick={onClose} aria-label="ปิดข้อความ">ปิด</button>
      </div>
    </div>
  );
}
