"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Circle } from "lucide-react";
import Link from "next/link";

interface DataSource {
  key: string;
  title: string;
  description: string;
  emptyStatus: string;
  populatedStatus?: string;
  editPath: string;
  isPopulated: boolean;
}

interface AttributionConfig {
  key: string;
  title: string;
  description: string;
  emptyStatus: string;
  populatedStatus?: string;
  editPath: string;
  isPopulated: boolean;
  isHub?: boolean;
  hubItems?: { key: string; label: string; status: string; coverage?: string; description?: string }[];
}

export default function SettingsPage() {
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const router = useRouter();
  const {
    state: { ga4, accounts, conversion, breakdownHub },
  } = useAppState();

  // Check dependencies
  const ga4Connected = !!ga4.selectedPropertyId;
  const accountsLinked = accounts.selected.length > 0;
  const conversionSelected = !!conversion.mainGa4Event;

  const dataSources: (DataSource & { canAccess: boolean; dependencyMessage?: string })[] = [
    {
      key: "ga4",
      title: "GA4",
      description: "Anchor for conversions and revenue",
      emptyStatus: "Not connected",
      populatedStatus: ga4Connected ? `Connected: ${ga4.brandLabel || 'GA4 Account'}` : undefined,
      editPath: "/ga4",
      isPopulated: ga4Connected,
      canAccess: true, // Always accessible
    },
    {
      key: "accounts",
      title: "Ad accounts",
      description: "Where your spend comes from",
      emptyStatus: accountsLinked ? "No accounts linked" : "Connect GA4 first",
      populatedStatus: accountsLinked ? `${accounts.selected.length} account${accounts.selected.length !== 1 ? 's' : ''} linked` : undefined,
      editPath: "/accounts",
      isPopulated: accountsLinked,
      canAccess: ga4Connected,
      dependencyMessage: ga4Connected ? undefined : "Connect GA4 first",
    },
  ];

  const attributionConfig: (AttributionConfig & { canAccess: boolean; dependencyMessage?: string })[] = [
    {
      key: "conversion",
      title: "Conversion",
      description: "The key action you want to optimize for",
      emptyStatus: conversionSelected ? "Not selected" : "Connect data sources first",
      populatedStatus: conversionSelected ? `Main event: ${conversion.mainGa4Event}` : undefined,
      editPath: "/conversion",
      isPopulated: conversionSelected,
      canAccess: ga4Connected && accountsLinked,
      dependencyMessage: (!ga4Connected || !accountsLinked) ? "Connect GA4 and ad accounts first" : undefined,
    },
    {
      key: "breakdowns",
      title: "Breakdowns",
      description: "Set up how you want to slice and analyze your attribution data",
      emptyStatus: (breakdownHub.market.status === "ready" || breakdownHub.campaign.status === "ready" || breakdownHub.channel.status === "ready") ? "Not started" : "Select conversion first",
      populatedStatus: getBreakdownStatus(breakdownHub),
      editPath: "/breakdown-hub",
      isPopulated: breakdownHub.market.status === "ready" || breakdownHub.campaign.status === "ready" || breakdownHub.channel.status === "ready",
      canAccess: ga4Connected && accountsLinked && conversionSelected,
      dependencyMessage: (!ga4Connected || !accountsLinked || !conversionSelected) ? "Complete previous steps first" : undefined,
      isHub: true,
      hubItems: [
        { 
          key: "market", 
          label: "Market", 
          status: getStatusLabel(breakdownHub.market.status),
          coverage: getBreakdownCoverage("market"),
          description: "Compare performance by country/region"
        },
        { 
          key: "campaign", 
          label: "Campaign", 
          status: getStatusLabel(breakdownHub.campaign.status, "campaign"),
          coverage: getBreakdownCoverage("campaign"),
          description: "Compare performance by campaign name"
        },
        { 
          key: "channel", 
          label: "Channel", 
          status: getStatusLabel(breakdownHub.channel.status, "channel"),
          coverage: getBreakdownCoverage("channel"),
          description: "Compare Paid Search, Social, Video, etc."
        },
      ],
    },
  ];

  const allSources = [...dataSources, ...attributionConfig];
  const anyPopulated = allSources.some(source => source.isPopulated);
  const allComplete = allSources.every(source => source.isPopulated);
  const completedCount = allSources.filter(source => source.isPopulated).length;

  function getBreakdownStatus(hub: any): string | undefined {
    const ready = [];
    if (hub.market.status === "ready") ready.push("Market");
    if (hub.campaign.status === "ready") ready.push("Campaign"); 
    if (hub.channel.status === "ready") ready.push("Channel");
    
    if (ready.length === 0) return undefined;
    return ready.join(", ") + " ready";
  }

  function getStatusLabel(status: string, type?: string): string {
    switch (status) {
      case "ready": return "Ready";
      case "in_progress": return "In progress";
      case "auto_mapped": 
        // Don't show "auto-mapped" for channel, show "Not started" instead
        return type === "channel" ? "Not started" : "Auto-mapped";
      case "not_started":
      default: return "Not started";
    }
  }

  function getBreakdownCoverage(type: string): string {
    // Always return 0% for now - will be calculated later based on actual data
    return "0% coverage";
  }

  function getStatusIcon(isPopulated: boolean, canAccess: boolean) {
    if (isPopulated) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (canAccess) return <Circle className="h-4 w-4 text-muted-foreground" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  }

  const handleStartSetup = () => {
    if (!anyPopulated) {
      // First time setup - show intro overlay
      setShowIntroOverlay(true);
    } else {
      // Return visit - go to next accessible incomplete step
      const nextStep = allSources.find(source => !source.isPopulated && source.canAccess);
      if (nextStep) {
        router.push(nextStep.editPath);
      } else {
        // All accessible steps complete, go to breakdown hub
        router.push("/breakdown-hub");
      }
    }
  };

  const handleContinueSetup = () => {
    setShowIntroOverlay(false);
    router.push("/ga4");
  };

  return (
    <>
      <Container className="space-y-8">
          <PageHeader
            title="Attribution settings"
            description="Connect your data sources and configure how you want to analyze performance."
          />

        <div className="space-y-8">
          {/* Progress Overview */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50/50">
              <CardContent className="py-5 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <p className="text-lg font-semibold">
                      {!anyPopulated
                        ? "To get started, connect GA4 and ad accounts for your brand"
                        : allComplete
                        ? "Setup complete! Your Attribution View is ready"
                        : !ga4Connected
                        ? "First, connect your GA4 account"
                        : !accountsLinked
                        ? "Next, link your ad accounts"
                        : !conversionSelected
                        ? "Then, select your main conversion"
                        : "Finally, configure your breakdowns"
                      }
                    </p>
                    {anyPopulated && !allComplete && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>{completedCount} of 4 steps complete</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-8">
                    <Button onClick={handleStartSetup} size="lg">
                      {anyPopulated ? "Continue setup" : "Start setup"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Connect your data</h2>
              <p className="text-muted-foreground">
                Connect your GA4 and ad accounts so Attribution knows where to pull data.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {dataSources.map((source) => (
                <Card key={source.key} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(source.isPopulated, source.canAccess)}
                        <CardTitle className="text-base font-semibold">
                          {source.title}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant={source.isPopulated ? "default" : source.canAccess ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {source.isPopulated ? (source.populatedStatus || "Connected") : source.emptyStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {source.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      {source.dependencyMessage && (
                        <p className="text-xs text-muted-foreground italic">
                          {source.dependencyMessage}
                        </p>
                      )}
                      <div className="ml-auto">
                        {source.canAccess ? (
                          <Link href={source.editPath}>
                            <Button variant={source.isPopulated ? "ghost" : "default"} size="sm">
                              {source.isPopulated ? "Edit" : "Set up"}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            {source.isPopulated ? "Edit" : "Set up"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

              {/* Attribution Config Section */}
              <div className="space-y-4">
                <div className="space-y-2 border-t pt-6">
                  <h2 className="text-xl font-semibold">Configure attribution</h2>
                  <p className="text-muted-foreground">
                    Choose your main conversion and how you want to break results down.
                  </p>
                </div>
                <div className="space-y-4">
                  {attributionConfig.filter(config => !config.isHub).map((config) => (
                    <Card key={config.key} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(config.isPopulated, config.canAccess)}
                            <CardTitle className="text-base font-semibold">
                              {config.title}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={config.isPopulated ? "default" : config.canAccess ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {config.isPopulated ? (config.populatedStatus || "Ready") : config.emptyStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          {config.dependencyMessage && (
                            <p className="text-xs text-muted-foreground italic">
                              {config.dependencyMessage}
                            </p>
                          )}
                          <div className="ml-auto">
                            {config.canAccess ? (
                              <Link href={config.editPath}>
                                <Button variant={config.isPopulated ? "ghost" : "default"} size="sm">
                                  {config.isPopulated ? "Edit" : "Set up"}
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                {config.isPopulated ? "Edit" : "Set up"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Configure Breakdowns Section */}
              {(() => {
                const breakdownConfig = attributionConfig.find(config => config.isHub);
                return breakdownConfig ? (
                  <div className="space-y-4">
                    <div className="space-y-2 border-t pt-6">
                      <h2 className="text-xl font-semibold">Configure breakdowns</h2>
                      <p className="text-muted-foreground">
                        Set up how you want to slice and analyze your attribution data.
                      </p>
                    </div>
                    <Card className="border-2 border-dashed border-muted-foreground/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(breakdownConfig.isPopulated, breakdownConfig.canAccess)}
                            <CardTitle className="text-base font-semibold">
                              Breakdown setup
                            </CardTitle>
                          </div>
                          <Badge
                            variant={breakdownConfig.isPopulated ? "default" : breakdownConfig.canAccess ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {breakdownConfig.isPopulated ? (breakdownConfig.populatedStatus || "Ready") : breakdownConfig.emptyStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {breakdownConfig.hubItems && (
                          <div className="mb-4 space-y-3">
                            {breakdownConfig.hubItems.map((item) => (
                              <div key={item.key} className="rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <span className="text-sm font-semibold">{item.label}</span>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {item.status}
                                  </Badge>
                                </div>
                                {item.coverage && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 bg-muted rounded-full h-2">
                                      <div className="bg-green-500 h-2 rounded-full w-0"></div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {item.coverage}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {breakdownConfig.dependencyMessage && (
                            <p className="text-xs text-muted-foreground italic">
                              {breakdownConfig.dependencyMessage}
                            </p>
                          )}
                          <div className="ml-auto">
                            {breakdownConfig.canAccess ? (
                              <Link href={breakdownConfig.editPath}>
                                <Button variant={breakdownConfig.isPopulated ? "ghost" : "default"} size="sm">
                                  Configure
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                Configure
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null;
              })()}
        </div>
      </Container>

      {/* Intro Overlay */}
      <Dialog open={showIntroOverlay} onOpenChange={setShowIntroOverlay}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Before we begin</DialogTitle>
            <DialogDescription className="text-left">
              Here's what we'll set up together:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></span>
                <span>Each Attribution View connects to one GA4 for one brand (covering all markets)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></span>
                <span>You'll select the ad accounts you advertise on for this brand</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></span>
                <span>You'll pick a main conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></span>
                <span>You'll set up your breakdowns (Market first, Campaign/Channel optional)</span>
              </li>
            </ul>
            
            <div className="rounded-lg border border-muted bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                If your setup spans multiple GA4s across brands or markets, attribution requires extra configuration. Contact us and we'll help.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleContinueSetup} className="flex-1">
                Continue setup
              </Button>
              <Button variant="outline" onClick={() => setShowIntroOverlay(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
