import { NextRequest, NextResponse } from "next/server";
import { addResource, readResource, updateResource } from "@/lib/firebase-store";
import type { Debt, DebtPayment, DebtPaymentMode, Wallet } from "@/lib/types";

export const dynamic = "force-dynamic";

function numberValue(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function nextMonthlyPayment(debt: Debt) {
  const remaining = Math.max(0, Number(debt.totalAmount || 0) - Number(debt.paidAmount || 0));
  if (!remaining) return 0;
  if (Number(debt.monthlyPayment || 0) > 0) return Math.min(Number(debt.monthlyPayment), remaining + monthlyInterest(debt, remaining));
  const monthsLeft = Math.max(1, Number(debt.termMonths || 0) - (debt.payments?.length || 0));
  return remaining / monthsLeft + monthlyInterest(debt, remaining);
}

function monthlyInterest(debt: Debt, remaining: number) {
  return remaining * (Number(debt.interestRate || 0) / 100 / 12);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const mode = String(body.mode || "next") as DebtPaymentMode;
    const wallet = String(body.wallet || "");
    const date = String(body.date || new Date().toISOString().slice(0, 10));
    const note = String(body.note || "");

    if (!wallet) throw new Error("กรุณาเลือกกระเป๋าที่ใช้จ่าย");

    const debts = await readResource<Debt>("debts");
    const debt = debts.find((item) => item.id === id);
    if (!debt) throw new Error("ไม่พบหนี้");

    const wallets = await readResource<Wallet>("wallets");
    const targetWallet = wallets.find((item) => item.id === wallet || item.name === wallet);
    if (!targetWallet) throw new Error("ไม่พบกระเป๋าเงิน");

    const remaining = Math.max(0, Number(debt.totalAmount || 0) - Number(debt.paidAmount || 0));
    if (!remaining) throw new Error("หนี้รายการนี้ผ่อนเสร็จแล้ว");

    const interestAmount = monthlyInterest(debt, remaining);
    const requestedAmount = mode === "payoff" ? remaining + interestAmount : mode === "custom" ? numberValue(body.amount) : nextMonthlyPayment(debt);
    if (requestedAmount <= 0) throw new Error("จำนวนเงินต้องมากกว่า 0");

    const principalAmount = Math.min(remaining, Math.max(0, requestedAmount - interestAmount));
    const amount = principalAmount + interestAmount;
    const stamp = new Date().toISOString();
    const payment: DebtPayment = {
      id: crypto.randomUUID(),
      date,
      wallet: targetWallet.name,
      amount,
      principalAmount,
      interestAmount,
      note,
      createdAt: stamp
    };
    const payments = [...(Array.isArray(debt.payments) ? debt.payments : []), payment];
    const paidAmount = Math.min(Number(debt.totalAmount || 0), Number(debt.paidAmount || 0) + principalAmount);

    await addResource("transactions", {
      date,
      type: "expense",
      name: `ชำระหนี้ ${debt.name}`,
      category: "ชำระหนี้",
      wallet: targetWallet.name,
      amount,
      paid: true,
      note: note || `ชำระหนี้ ${debt.name}`
    });

    const updated = await updateResource("debts", id, {
      ...debt,
      paidAmount,
      status: paidAmount >= Number(debt.totalAmount || 0) ? "paid" : "installing",
      payments
    });

    return NextResponse.json({ debt: updated, payment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "จ่ายค่างวดไม่สำเร็จ" }, { status: 400 });
  }
}
