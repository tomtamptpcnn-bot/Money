import { NextRequest, NextResponse } from "next/server";
import { readResource, updateResource } from "@/lib/firebase-store";
import type { Asset } from "@/lib/types";

type ThaiGoldApiResponse = {
  status?: string;
  response?: {
    update_date?: string;
    update_time?: string;
    price?: {
      gold?: {
        buy?: string | number;
        sell?: string | number;
      };
      gold_bar?: {
        buy?: string | number;
        sell?: string | number;
      };
    };
  };
  message?: string;
  error?: string;
};

type GoldTradersPriceRow = {
  asTime?: string;
  bL_BuyPrice?: number;
  bL_SellPrice?: number;
  oM965_BuyPrice?: number;
  oM965_SellPrice?: number;
};

export const dynamic = "force-dynamic";

const defaultThaiGoldApiUrl = "https://api.chnwt.dev/thai-gold-api/latest";
const goldTradersDetailsUrl = "https://www.goldtraders.or.th/api/GoldPrices/Details?readjson=false";

function getThaiGoldApiUrl() {
  const explicitUrl = process.env.GOLD_PRICE_API_URL?.trim();
  const legacyValue = process.env.GOLDAPI_KEY?.trim();
  if (explicitUrl) return explicitUrl;
  if (legacyValue?.startsWith("http")) return legacyValue;
  return defaultThaiGoldApiUrl;
}

function parsePrice(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  return Number(value.replace(/,/g, "").trim());
}

async function fetchThaiGoldPrice() {
  const response = await fetch(getThaiGoldApiUrl(), {
    cache: "no-store"
  });
  const body = await response.json() as ThaiGoldApiResponse;
  if (!response.ok) throw new Error(body.error || body.message || "ดึงราคาทองไม่สำเร็จ");

  const price = body.response?.price;
  const sellPrice = parsePrice(price?.gold_bar?.sell) || parsePrice(price?.gold_bar?.buy) || parsePrice(price?.gold?.sell) || parsePrice(price?.gold?.buy);
  if (!sellPrice) throw new Error("ไม่พบราคาทองจากผู้ให้บริการ");

  const updateDate = body.response?.update_date?.trim();
  const updateTime = body.response?.update_time?.trim();

  return {
    price: sellPrice,
    updatedAt: updateDate ? `${updateDate}${updateTime ? ` ${updateTime}` : ""}` : new Date().toISOString()
  };
}

async function fetchGoldTradersPrice() {
  const response = await fetch(goldTradersDetailsUrl, {
    cache: "no-store"
  });
  const body = await response.json() as GoldTradersPriceRow[];
  if (!response.ok) throw new Error("ดึงราคาทองจากสมาคมค้าทองคำไม่สำเร็จ");

  const latest = Array.isArray(body)
    ? [...body].sort((a, b) => String(b.asTime || "").localeCompare(String(a.asTime || "")))[0]
    : undefined;
  const price = parsePrice(latest?.bL_SellPrice);
  if (!price) throw new Error("ไม่พบราคาทองคำแท่ง 96.5% ขายออกจากสมาคมค้าทองคำ");

  return {
    price,
    updatedAt: latest?.asTime || new Date().toISOString()
  };
}

async function fetchGoldPrice() {
  try {
    return await fetchGoldTradersPrice();
  } catch {
    return fetchThaiGoldPrice();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const assetId = typeof body.assetId === "string" ? body.assetId : "";
    const assets = await readResource<Asset>("assets");
    const targets = assets.filter((asset) => {
      const isGold = asset.assetType === "gold";
      const usesGoldApi = !asset.priceSource || asset.priceSource === "goldapi";
      const matchesId = !assetId || asset.id === assetId;
      return isGold && usesGoldApi && matchesId;
    });

    if (!targets.length) throw new Error("ไม่พบทองที่ตั้งค่าให้ใช้ราคาทองอัตโนมัติ");

    const price = await fetchGoldPrice();
    const updated = [];

    for (const asset of targets) {
      const next = {
        ...asset,
        symbol: asset.symbol || "THAI_GOLD_BAR",
        priceSource: "goldapi",
        priceCurrency: "THB",
        currentPrice: price.price,
        lastPriceUpdatedAt: price.updatedAt
      };
      updated.push(await updateResource("assets", asset.id, next));
    }

    return NextResponse.json({ updated: updated.length, assets: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อัปเดตราคาทองไม่สำเร็จ" }, { status: 400 });
  }
}
