import { z } from "zod";
import type { Resource } from "./types";

const requiredText = z.string({ required_error: "กรุณากรอกข้อมูลให้ครบ" }).trim().min(1, "กรุณากรอกข้อมูลให้ครบ");
const requiredCategory = z.string({ required_error: "กรุณาเลือกหมวดหมู่" }).trim().min(1, "กรุณาเลือกหมวดหมู่");
const requiredWallet = z.string({ required_error: "กรุณาเลือกกระเป๋าเงิน" }).trim().min(1, "กรุณาเลือกกระเป๋าเงิน");
const optionalText = z.string().trim().optional().default("");
const amount = z.coerce.number({ invalid_type_error: "กรุณากรอกตัวเลข" }).finite("กรุณากรอกตัวเลข").min(0, "จำนวนต้องไม่ติดลบ");
const color = z.string().trim().min(1).default("#91d4c7");
const assetLot = z.object({
  id: optionalText,
  purchaseDate: requiredText,
  quantity: amount,
  buyPrice: amount,
  note: optionalText
});
const debtPayment = z.object({
  id: optionalText,
  date: requiredText,
  wallet: requiredText,
  amount,
  principalAmount: amount,
  interestAmount: amount,
  note: optionalText,
  createdAt: optionalText
});

export const schemas = {
  transactions: z.object({
    date: requiredText,
    type: z.enum(["income", "expense", "transfer"], { invalid_type_error: "ประเภทไม่ถูกต้อง", required_error: "กรุณาเลือกประเภท" }),
    name: optionalText,
    category: requiredCategory,
    wallet: requiredWallet,
    amount: z.coerce.number({ invalid_type_error: "กรุณากรอกจำนวนเงิน" }).finite("กรุณากรอกจำนวนเงิน").positive("จำนวนเงินต้องมากกว่า 0"),
    paid: z.coerce.boolean().default(false),
    scheduleMode: z.enum(["once", "monthly"], { invalid_type_error: "รูปแบบรายการไม่ถูกต้อง" }).default("once"),
    monthsCount: z.coerce.number().finite().min(1).max(120).default(1),
    dayOfMonth: z.coerce.number().finite().min(1).max(31).default(1),
    note: optionalText
  }),
  wallets: z.object({
    name: requiredText,
    walletType: z.enum(["cash", "bank", "credit_card", "savings", "investment"], { invalid_type_error: "ประเภทกระเป๋าไม่ถูกต้อง", required_error: "กรุณาเลือกประเภทกระเป๋า" }).default("cash"),
    balance: amount,
    currency: requiredText.default("THB"),
    icon: requiredText.default("WalletCards"),
    color,
    note: optionalText
  }),
  categories: z.object({
    name: requiredText,
    type: z.enum(["income", "expense"], { invalid_type_error: "ประเภทไม่ถูกต้อง", required_error: "กรุณาเลือกประเภท" }),
    icon: requiredText.default("Circle"),
    color
  }),
  assets: z.object({
    name: requiredText,
    assetType: z.enum(["cash", "gold", "stock", "crypto", "fund", "insurance", "other"], { invalid_type_error: "ประเภททรัพย์สินไม่ถูกต้อง", required_error: "กรุณาเลือกประเภททรัพย์สิน" }),
    symbol: optionalText.default("THAI_GOLD_BAR"),
    priceSource: z.enum(["manual", "goldapi"], { invalid_type_error: "แหล่งราคาไม่ถูกต้อง" }).default("manual"),
    priceCurrency: requiredText.default("THB"),
    purchaseDate: optionalText,
    quantity: amount,
    buyPrice: amount,
    currentPrice: amount,
    lastPriceUpdatedAt: optionalText,
    lots: z.array(assetLot).optional().default([]),
    note: optionalText
  }),
  debts: z.object({
    name: requiredText,
    owner: requiredText.default("ตัวเอง"),
    debtType: requiredText,
    totalAmount: z.coerce.number({ invalid_type_error: "กรุณากรอกยอดหนี้" }).finite("กรุณากรอกยอดหนี้").positive("ยอดหนี้ต้องมากกว่า 0"),
    paidAmount: amount,
    monthlyPayment: amount,
    interestRate: amount.default(0),
    termMonths: z.coerce.number({ invalid_type_error: "กรุณากรอกจำนวนงวด" }).finite("กรุณากรอกจำนวนงวด").min(0, "จำนวนงวดต้องไม่ติดลบ").default(0),
    startDate: requiredText,
    dueDate: requiredText,
    status: z.enum(["installing", "paid"], { invalid_type_error: "สถานะหนี้ไม่ถูกต้อง" }).default("installing"),
    showInCalendar: z.coerce.boolean().default(true),
    payments: z.array(debtPayment).optional().default([]),
    note: optionalText
  }),
  goals: z.object({
    name: requiredText,
    targetAmount: z.coerce.number({ invalid_type_error: "กรุณากรอกจำนวนเป้าหมาย" }).finite("กรุณากรอกจำนวนเป้าหมาย").positive("จำนวนเป้าหมายต้องมากกว่า 0"),
    currentAmount: amount,
    targetDate: requiredText,
    icon: requiredText.default("Target"),
    color,
    note: optionalText
  })
} satisfies Record<Resource, z.ZodTypeAny>;

export function validateResource(resource: Resource, input: unknown) {
  const result = schemas[resource].safeParse(input);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }
  return result.data;
}
