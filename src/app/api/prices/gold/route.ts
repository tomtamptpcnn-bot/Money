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

type GoldPriceResult = {
  price: number;
  updatedAt: string;
  provider: string;
};

export const dynamic = "force-dynamic";
const routeVersion = "gold-price-v5-fast-primary";
const priceFetchTimeoutMs = 2500;

const defaultThaiGoldApiUrl = "https://api.chnwt.dev/thai-gold-api/latest";
const goldTradersDetailsUrl = "https://www.goldtraders.or.th/api/GoldPrices/Details?readjson=false";
const classicGoldTradersUrl = "https://classic.goldtraders.or.th/Default.aspx";
const thaiGoldTodayUrl = "https://xn--42cah7d0cxcvbbb9x.com/";
const goldTradersHeaders = {
  Accept: "application/json,text/plain,*/*",
  Referer: "https://www.goldtraders.or.th/",
  "User-Agent": "Mozilla/5.0"
};

function getThaiGoldApiUrl() {
  const explicitUrl = process.env.GOLD_PRICE_API_URL?.trim();
  const legacyValue = process.env.GOLDAPI_KEY?.trim();
  if (explicitUrl) return explicitUrl;
  if (legacyValue?.startsWith("http")) return legacyValue;
  return defaultThaiGoldApiUrl;
}

function hasCustomGoldApiUrl() {
  const explicitUrl = process.env.GOLD_PRICE_API_URL?.trim();
  const legacyValue = process.env.GOLDAPI_KEY?.trim();
  return Boolean((explicitUrl && explicitUrl !== defaultThaiGoldApiUrl) || (legacyValue?.startsWith("http") && legacyValue !== defaultThaiGoldApiUrl));
}

function parsePrice(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  return Number(value.replace(/,/g, "").trim());
}

function textFromHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function textInElement(html: string, id: string) {
  const match = html.match(new RegExp(`<span[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)</span>`, "i"));
  return match ? textFromHtml(match[1]) : "";
}

function timeoutSignal() {
  return AbortSignal.timeout(priceFetchTimeoutMs);
}

async function readJson<T>(response: Response, providerName: string): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.replace(/\s+/g, " ").slice(0, 80);
    throw new Error(`${providerName} ไม่ได้ส่ง JSON กลับมา${preview ? `: ${preview}` : ""}`);
  }
}

async function fetchThaiGoldPrice() {
  const providerUrl = getThaiGoldApiUrl();
  const response = await fetch(providerUrl, {
    signal: timeoutSignal(),
    cache: "no-store"
  });
  const body = await readJson<ThaiGoldApiResponse>(response, providerUrl);
  if (!response.ok) throw new Error(body.error || body.message || `ดึงราคาทองไม่สำเร็จจาก ${providerUrl}`);

  const price = body.response?.price;
  const sellPrice = parsePrice(price?.gold_bar?.sell) || parsePrice(price?.gold_bar?.buy) || parsePrice(price?.gold?.sell) || parsePrice(price?.gold?.buy);
  if (!sellPrice) throw new Error(`ไม่พบราคาทองจาก ${providerUrl}`);

  const updateDate = body.response?.update_date?.trim();
  const updateTime = body.response?.update_time?.trim();

  return {
    price: sellPrice,
    updatedAt: updateDate ? `${updateDate}${updateTime ? ` ${updateTime}` : ""}` : new Date().toISOString(),
    provider: providerUrl
  };
}

async function fetchGoldTradersPrice() {
  const response = await fetch(goldTradersDetailsUrl, {
    headers: goldTradersHeaders,
    signal: timeoutSignal(),
    cache: "no-store"
  });
  const body = await readJson<GoldTradersPriceRow[]>(response, "สมาคมค้าทองคำ");
  if (!response.ok) throw new Error("ดึงราคาทองจากสมาคมค้าทองคำไม่สำเร็จ");

  const latest = Array.isArray(body)
    ? [...body].sort((a, b) => String(b.asTime || "").localeCompare(String(a.asTime || "")))[0]
    : undefined;
  const price = parsePrice(latest?.bL_SellPrice);
  if (!price) throw new Error("ไม่พบราคาทองคำแท่ง 96.5% ขายออกจากสมาคมค้าทองคำ");

  return {
    price,
    updatedAt: latest?.asTime || new Date().toISOString(),
    provider: "สมาคมค้าทองคำ JSON API"
  };
}

async function fetchClassicGoldTradersPrice() {
  const response = await fetch(classicGoldTradersUrl, {
    headers: goldTradersHeaders,
    signal: timeoutSignal(),
    cache: "no-store"
  });
  const body = await response.text();
  if (!response.ok) throw new Error("ดึงราคาทองจากหน้า classic ของสมาคมค้าทองคำไม่สำเร็จ");

  const price = parsePrice(textInElement(body, "DetailPlace_uc_goldprices1_lblBLSell"));
  if (!price) throw new Error("ไม่พบราคาทองคำแท่ง 96.5% ขายออกจากหน้า classic ของสมาคมค้าทองคำ");

  return {
    price,
    updatedAt: textInElement(body, "DetailPlace_uc_goldprices1_lblAsTime") || new Date().toISOString(),
    provider: "สมาคมค้าทองคำ classic"
  };
}

async function fetchThaiGoldTodayPrice() {
  const response = await fetch(thaiGoldTodayUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0"
    },
    signal: timeoutSignal(),
    cache: "no-store"
  });
  const body = (await response.text()).replace(/\0/g, "");
  if (!response.ok) throw new Error("ดึงราคาทองจากราคาทองคำวันนี้ไม่สำเร็จ");

  const priceRow = body.match(/ทองคำแท่ง<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
  const price = parsePrice(priceRow?.[2]);
  if (!price) throw new Error("ไม่พบราคาทองคำแท่ง 96.5% ขายออกจากราคาทองคำวันนี้");

  const dateRow = body.match(/data-column=วันที่\/เวลา>([^<]+)<\/td>\s*<td[^>]+data-column=คร้ังที่>([^<]+)<\/td>/i);

  return {
    price,
    updatedAt: dateRow ? `${dateRow[1].trim()} (ครั้งที่ ${dateRow[2].trim()})` : new Date().toISOString(),
    provider: "ราคาทองคำวันนี้"
  };
}

async function fetchGoldPrice(): Promise<GoldPriceResult> {
  if (hasCustomGoldApiUrl()) return fetchThaiGoldPrice();

  try {
    return await fetchThaiGoldTodayPrice();
  } catch (primaryError) {
    try {
      return await fetchGoldTradersPrice();
    } catch (fallbackError) {
      try {
        return await fetchClassicGoldTradersPrice();
      } catch (secondFallbackError) {
        try {
          return await fetchThaiGoldPrice();
        } catch (lastError) {
          const primaryMessage = primaryError instanceof Error ? primaryError.message : "ราคาทองคำวันนี้ล้มเหลว";
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "สมาคมค้าทองคำล้มเหลว";
          const secondFallbackMessage = secondFallbackError instanceof Error ? secondFallbackError.message : "หน้า classic ของสมาคมค้าทองคำล้มเหลว";
          const lastMessage = lastError instanceof Error ? lastError.message : "provider สำรองล้มเหลว";
          throw new Error(`${primaryMessage}; ${fallbackMessage}; ${secondFallbackMessage}; ${lastMessage}`);
        }
      }
    }
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

    return NextResponse.json({ updated: updated.length, assets: updated, provider: price.provider, routeVersion });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อัปเดตราคาทองไม่สำเร็จ", routeVersion }, { status: 400 });
  }
}
