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
  { 
    value: "purchase", 
    label: "purchase", 
    count: 348, 
    type: "main_conversion",
    description: "Completed purchases with revenue"
  },
  { 
    value: "lead_submit", 
    label: "lead_submit", 
    count: 127, 
    type: "main_conversion",
    description: "Lead form submissions"
  },
  { 
    value: "sign_up", 
    label: "sign_up", 
    count: 89, 
    type: "main_conversion",
    description: "User registrations"
  },
  { 
    value: "add_to_cart", 
    label: "add_to_cart", 
    count: 1247, 
    type: "micro_conversion",
    description: "Items added to shopping cart"
  },
  { 
    value: "view_item", 
    label: "view_item", 
    count: 5432, 
    type: "micro_conversion",
    description: "Product page views"
  },
  { 
    value: "begin_checkout", 
    label: "begin_checkout", 
    count: 456, 
    type: "micro_conversion",
    description: "Checkout process started"
  },
];

export const MARKET_CODES = ["DE", "SE", "ES", "FR", "IT", "UK"];

export const COUNTRY_REGION_OPTIONS = [
  { value: "global", label: "Global", type: "global" },
  { value: "multi-region", label: "Multi-region", type: "regional" },
  { value: "europe", label: "Europe", type: "regional" },
  { value: "north-america", label: "North America", type: "regional" },
  { value: "asia-pacific", label: "Asia Pacific", type: "regional" },
  { value: "latin-america", label: "Latin America", type: "regional" },
  { value: "us", label: "United States", type: "country", iso: "US" },
  { value: "uk", label: "United Kingdom", type: "country", iso: "GB" },
  { value: "ca", label: "Canada", type: "country", iso: "CA" },
  { value: "de", label: "Germany", type: "country", iso: "DE" },
  { value: "fr", label: "France", type: "country", iso: "FR" },
  { value: "au", label: "Australia", type: "country", iso: "AU" },
  { value: "jp", label: "Japan", type: "country", iso: "JP" },
  { value: "br", label: "Brazil", type: "country", iso: "BR" },
  { value: "mx", label: "Mexico", type: "country", iso: "MX" },
  { value: "es", label: "Spain", type: "country", iso: "ES" },
  { value: "it", label: "Italy", type: "country", iso: "IT" },
  { value: "nl", label: "Netherlands", type: "country", iso: "NL" },
  { value: "se", label: "Sweden", type: "country", iso: "SE" },
  { value: "dk", label: "Denmark", type: "country", iso: "DK" },
  { value: "no", label: "Norway", type: "country", iso: "NO" },
  { value: "fi", label: "Finland", type: "country", iso: "FI" },
  { value: "pl", label: "Poland", type: "country", iso: "PL" },
  { value: "in", label: "India", type: "country", iso: "IN" },
  { value: "sg", label: "Singapore", type: "country", iso: "SG" },
  { value: "kr", label: "South Korea", type: "country", iso: "KR" },
];

// Detected platforms based on GA4 events
export const DETECTED_PLATFORMS = [
  {
    id: "google_ads",
    name: "Google Ads",
    icon: "GAD",
    color: "bg-blue-500",
    required: true,
    description: "Search and display campaigns"
  },
  {
    id: "meta",
    name: "Meta",
    icon: "META",
    color: "bg-blue-600",
    required: true,
    description: "Facebook and Instagram ads"
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    icon: "TT",
    color: "bg-black",
    required: true,
    description: "TikTok advertising platform"
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    icon: "LI",
    color: "bg-blue-700",
    required: false,
    description: "Professional network advertising"
  }
];

// Platform-specific ad accounts
export const PLATFORM_AD_ACCOUNTS = {
  google_ads: [
    { id: "gads_1", name: "BrandX Search Campaigns", accountId: "123-456-7890" },
    { id: "gads_2", name: "BrandX Shopping", accountId: "123-456-7891" },
    { id: "gads_3", name: "BrandX Display Network", accountId: "123-456-7892" },
  ],
  meta: [
    { id: "meta_1", name: "BrandX Facebook", accountId: "act_1234567890" },
    { id: "meta_2", name: "BrandX Instagram", accountId: "act_1234567891" },
    { id: "meta_3", name: "BrandX Retargeting", accountId: "act_1234567892" },
  ],
  tiktok: [
    { id: "tiktok_1", name: "BrandX TikTok Main", accountId: "1234567890123456" },
    { id: "tiktok_2", name: "BrandX TikTok Creative", accountId: "1234567890123457" },
  ],
  linkedin: [
    { id: "linkedin_1", name: "BrandX Professional", accountId: "123456789" },
  ]
};

// Platform-specific conversion events with smart mapping
export const PLATFORM_CONVERSION_EVENTS = {
  google_ads: [
    { value: "purchase", label: "Purchase", isDefault: true },
    { value: "lead", label: "Lead" },
    { value: "sign_up", label: "Sign Up" },
  ],
  meta: [
    { value: "purchase", label: "Purchase", isDefault: true },
    { value: "lead", label: "Lead" },
    { value: "complete_registration", label: "Complete Registration" },
  ],
  tiktok: [
    { value: "complete_payment", label: "Complete Payment", isDefault: true },
    { value: "submit_form", label: "Submit Form" },
    { value: "sign_up", label: "Sign Up" },
  ],
  linkedin: [
    { value: "purchase_conversion", label: "Purchase Conversion", isDefault: false },
    { value: "lead_generation", label: "Lead Generation", isDefault: true },
    { value: "sign_up_conversion", label: "Sign Up Conversion", isDefault: false },
    { value: "download_whitepaper", label: "Download Whitepaper", isDefault: false },
    { value: "request_demo", label: "Request Demo", isDefault: false },
  ]
};

// Smart mapping suggestions based on GA4 event
export const SMART_EVENT_MAPPING = {
  purchase: {
    google_ads: "purchase",
    meta: "purchase", 
    tiktok: "complete_payment",
    linkedin: "purchase_conversion"
  },
  lead_submit: {
    google_ads: "lead",
    meta: "lead",
    tiktok: "submit_form", 
    linkedin: "lead_generation"
  },
  sign_up: {
    google_ads: "sign_up",
    meta: "complete_registration",
    tiktok: "sign_up",
    linkedin: "sign_up_conversion"
  }
};

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
