import { BreakdownKey, PlatformKey } from "@/lib/app-state";

export const GA4_PROPERTIES = [
  { id: "ga4_1", name: "BrandX Global" },
  { id: "ga4_2", name: "default-144345" },
];

export interface AccountRecord {
  id: string;
  name: string;
  platform: PlatformKey;
  spend7d: number;
  badge: "SEM" | "Social" | "Video" | "Other";
}

export const ACCOUNTS: AccountRecord[] = [
  { id: "gads_de", name: "Google Ads DE", platform: "google_ads", spend7d: 18650, badge: "SEM" },
  { id: "meta_eu", name: "Meta EU", platform: "meta", spend7d: 12400, badge: "Social" },
  { id: "gads_es", name: "Google Ads ES", platform: "google_ads", spend7d: 9600, badge: "SEM" },
  { id: "tiktok_se", name: "TikTok SE", platform: "tiktok", spend7d: 4200, badge: "Social" },
  { id: "linkedin_global", name: "LinkedIn Global", platform: "linkedin", spend7d: 3100, badge: "Other" },
];

export const PLATFORM_EVENT_OPTIONS = [
  "Purchase",
  "Lead",
  "AddToCart",
  "None",
];

export const GA4_EVENT_OPTIONS = [
  { value: "purchase", label: "purchase" },
  { value: "lead_submit", label: "lead_submit" },
  { value: "sign_up", label: "sign_up" },
];

export const MARKET_CODES = ["DE", "SE", "ES", "FR", "IT", "UK"];

export const CAMPAIGN_SAMPLES = [
  "de | prospecting | q4",
  "ES-BrandX-Retargeting",
  "summer_sale [se]",
  "global_prospecting",
];

export const BREAKDOWN_LABELS: Record<BreakdownKey, string> = {
  market: "Market",
  campaign: "Campaign",
  channel: "Channel",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 100 ? 0 : 0,
  }).format(value);
}
