"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { StepFooter } from "@/components/layout/step-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState, BreakdownStatus } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BreakdownCard {
  key: "market" | "campaign" | "channel";
  title: string;
  description: string;
  recommendedFor?: string;
  path: string;
}

const breakdownCards: BreakdownCard[] = [
  {
    key: "market",
    title: "Market",
    description: "Compare results by country/region.",
    recommendedFor: "Fastest path to results. Works with platform geo or simple naming rules.",
    path: "/breakdowns/market",
  },
  {
    key: "campaign",
    title: "Campaign",
    description: "Compare results by campaign name.",
    recommendedFor: "Best with consistent naming. You can add rules later if needed.",
    path: "/breakdowns/campaign",
  },
  {
    key: "channel",
    title: "Channel",
    description: "Compare Paid Search, Paid Social, Video, etc.",
    recommendedFor: "Mostly automatic. Adjust edge cases if you want.",
    path: "/breakdowns/channel",
  },
];

function getStatusText(status: BreakdownStatus): string {
  switch (status) {
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "ready":
      return "Ready";
    case "auto_mapped":
      return "Auto-mapped";
  }
}

function getStatusVariant(status: BreakdownStatus): "default" | "secondary" | "outline" {
  switch (status) {
    case "not_started":
      return "outline";
    case "in_progress":
      return "secondary";
    case "ready":
      return "default";
    case "auto_mapped":
      return "default";
  }
}

function getActionLabel(status: BreakdownStatus): string {
  switch (status) {
    case "not_started":
      return "Start";
    case "in_progress":
      return "Continue";
    case "ready":
    case "auto_mapped":
      return "Review";
  }
}

export default function BreakdownHubPage() {
  const {
    state: { breakdownHub },
    actions,
  } = useAppState();

  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const isMarketReady = breakdownHub.market.status === "ready";
  
  const contextContent = focusedCard === "market"
    ? "Fastest path to results. Works with platform geo or simple naming rules."
    : focusedCard === "campaign"
    ? "Best with consistent naming. You can add rules later if needed."
    : focusedCard === "channel"
    ? "Mostly automatic. Adjust edge cases if you want."
    : "Choose what to work on now. You can come back anytime to set up more breakdowns.";

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Set up your breakdowns"
        description="Choose what to work on now. You can come back anytime."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
        <div className="space-y-4">
          {breakdownCards.map((card) => {
            const status = breakdownHub[card.key].status;
            const isRecommended = card.key === "market";
            
            return (
              <Card
                key={card.key}
                className={cn(
                  "transition-colors cursor-pointer",
                  focusedCard === card.key && "ring-2 ring-primary/20 border-primary/50"
                )}
                onMouseEnter={() => setFocusedCard(card.key)}
                onMouseLeave={() => setFocusedCard(null)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-semibold">
                        {card.title}
                        {isRecommended && (
                          <Badge variant="default" className="ml-2 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <Badge variant={getStatusVariant(status)} className="text-xs">
                      {getStatusText(status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {card.description}
                  </p>
                  <Link href={card.path}>
                    <Button 
                      variant={status === "ready" ? "outline" : "default"}
                      size="sm"
                    >
                      {getActionLabel(status)}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-lg border border-dashed border-border/70 bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Context</p>
          <p className="mt-2 text-muted-foreground">{contextContent}</p>
        </div>
      </div>

      <StepFooter
        nextDisabled={!isMarketReady}
        nextHref="/summary"
        nextLabel="Next: Ready to enter Attribution View"
        onNext={() => {
          if (!isMarketReady) {
            // Auto-mark market as ready if user tries to proceed
            actions.updateBreakdownHub({
              market: { status: "ready" }
            });
          }
        }}
      />
    </Container>
  );
}
