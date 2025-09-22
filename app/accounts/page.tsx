"use client";

import { useMemo } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { StepFooter } from "@/components/layout/step-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, AccountRecord } from "@/lib/mock-data";
import { useAppState, PlatformKey } from "@/lib/app-state";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  google_ads: "Google Ads",
  meta: "Meta",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export default function AccountsPage() {
  const {
    state: {
      accounts: { selected },
    },
    actions,
  } = useAppState();

  const selectedIds = useMemo(() => new Set(selected.map((account) => account.id)), [selected]);

  const grouped = useMemo(() => {
    return ACCOUNTS.reduce<Record<PlatformKey, AccountRecord[]>>(
      (acc, account) => {
        acc[account.platform] = acc[account.platform] || [];
        acc[account.platform].push(account);
        return acc;
      },
      {
        google_ads: [],
        meta: [],
        tiktok: [],
        linkedin: [],
      }
    );
  }, []);

  const handleToggle = (account: AccountRecord, checked: boolean) => {
    const current = new Map(selected.map((item) => [item.id, item]));
    if (checked) {
      current.set(account.id, account);
    } else {
      current.delete(account.id);
    }
    actions.updateAccounts(Array.from(current.values()));
  };

  const selectedCount = selected.length;

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Select the ad accounts for this brand"
        description="Choose all platforms where this brand advertises. Leaving one out may cause incomplete results."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ad accounts by platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="multiple" defaultValue={["google_ads", "meta"]}>
              {Object.entries(grouped).map(([platform, platformAccounts]) => {
                const typedPlatform = platform as PlatformKey;
                const platformLabel = PLATFORM_LABELS[typedPlatform];
                const allSelectedOnPlatform = platformAccounts.every((account) =>
                  selectedIds.has(account.id)
                );
                return (
                  <AccordionItem key={platform} value={platform}>
                    <AccordionTrigger className="text-left text-base font-semibold">
                      <div className="flex w-full items-center justify-between gap-3">
                        <span>
                          {platformLabel} ({platformAccounts.length})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center justify-end gap-2 pb-2 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const current = new Map(
                              selected.map((item) => [item.id, item])
                            );
                            if (allSelectedOnPlatform) {
                              platformAccounts.forEach((account) => {
                                current.delete(account.id);
                              });
                            } else {
                              platformAccounts.forEach((account) => {
                                current.set(account.id, account);
                              });
                            }
                            actions.updateAccounts(Array.from(current.values()));
                          }}
                        >
                          {allSelectedOnPlatform ? "Clear all" : "Select all"}
                        </Button>
                      </div>
                      <div className="space-y-3 pb-2">
                        {platformAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-4 py-3"
                          >
                            <Checkbox
                              checked={selectedIds.has(account.id)}
                              onCheckedChange={(checked) =>
                                handleToggle(account, Boolean(checked))
                              }
                            />
                            <div className="flex-1">
                              <p className="font-medium">{account.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {account.id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-dashed border-border/70 bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Context</p>
          <p className="mt-2 text-muted-foreground">
            Include every ad account you use for this brand. You can add more later if needed.
          </p>
        </div>
      </div>

      <StepFooter
        nextHref="/conversion"
        nextDisabled={selectedCount === 0}
        nextLabel="Next: Select main conversion"
      />
    </Container>
  );
}
