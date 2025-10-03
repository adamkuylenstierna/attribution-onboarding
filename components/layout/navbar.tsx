"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { actions } = useAppState();
  const showReset = process.env.NODE_ENV !== "production";

  const handleMockData = () => {
    // Configure GA4
    actions.updateGa4Property("ga4_1", {
      brandName: "BrandX Global",
      countryRegion: "europe",
      isConfigured: true
    });
    actions.updateGa4({ selectedPropertyId: "ga4_1" });

    // Connect platforms with accounts
    actions.updatePlatformConnection("google_ads", {
      isConnected: true,
      isAuthenticated: true,
      linkLater: false,
      selectedAccounts: [
        { id: "gads_1", name: "BrandX Search Campaigns", accountId: "123-456-7890" }
      ]
    });

    actions.updatePlatformConnection("meta", {
      isConnected: true,
      isAuthenticated: true,
      linkLater: false,
      selectedAccounts: [
        { id: "meta_1", name: "BrandX Facebook", accountId: "act_1234567890" }
      ]
    });

    actions.updatePlatformConnection("tiktok", {
      isConnected: true,
      isAuthenticated: true,
      linkLater: false,
      selectedAccounts: [
        { id: "tiktok_1", name: "BrandX TikTok Main", accountId: "1234567890123456" }
      ]
    });

    actions.updatePlatformConnection("linkedin", {
      isConnected: true,
      isAuthenticated: true,
      linkLater: false,
      selectedAccounts: [
        { id: "linkedin_1", name: "BrandX Professional", accountId: "123456789" }
      ]
    });

    // Set main conversion
    actions.updateConversion({
      mainGa4Event: "purchase",
      hasRevenue: true,
      platformEventMap: {
        google_ads: "purchase",
        meta: "purchase",
        tiktok: "complete_payment",
        linkedin: "purchase_conversion"
      }
    });

    // Set breakdown statuses
    actions.updateBreakdownHub({
      channel: { status: "auto_mapped" },
      market: { status: "in_progress" },
      campaign: { status: "in_progress" }
    });

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className={cn("hidden flex-1 justify-center lg:flex")}> 
          <Stepper key={pathname} />
        </div>
        <div className="flex items-center gap-2">
          {showReset ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleMockData}
              >
                Mock data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.reset()}
              >
                Reset flow
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div className="border-t lg:hidden">
        <div className="mx-auto max-w-6xl px-5 py-2.5">
          <Stepper key={`${pathname}-mobile`} />
        </div>
      </div>
    </header>
  );
}
