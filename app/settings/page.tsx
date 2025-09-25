"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { GA4_PROPERTIES, COUNTRY_REGION_OPTIONS, DETECTED_PLATFORMS } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Circle, BarChart3, AlertTriangle, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DataSource {
  key: string;
  title: string;
  description: string;
  emptyStatus: string;
  populatedStatus?: string;
  editPath: string;
  isPopulated: boolean;
  canAccess: boolean;
  dependencyMessage?: string;
}

interface AttributionConfig {
  key: string;
  title: string;
  description: string;
  emptyStatus: string;
  populatedStatus?: string;
  editPath: string;
  isPopulated: boolean;
  canAccess: boolean;
  dependencyMessage?: string;
  isHub?: boolean;
  hubItems?: { key: string; label: string; status: string; coverage?: string; healthScore?: number; description?: string }[];
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    state: { ga4, accounts, conversion, breakdownHub },
  } = useAppState();

  // Check dependencies
  const ga4Connected = ga4.configurations.some(c => c.isConfigured);
  const accountsLinked = accounts.selected.length > 0;
  const conversionSelected = !!conversion.mainGa4Event;

  // Mock health data - same as breakdown hub
  const getBreakdownHealthScore = (type: string): number => {
    switch (type) {
      case "channel": return 94;
      case "market": return 23;
      case "campaign": return 31;
      default: return 0;
    }
  };

  const getHealthStatus = (score: number): "healthy" | "needs_work" => {
    return score >= 90 ? "healthy" : "needs_work";
  };

  const getBreakdownCoverage = (type: string): string => {
    const score = getBreakdownHealthScore(type);
    return `${score}% health`;
  };

  function getBreakdownStatus(hub: any): string | undefined {
    const ready = [];
    if (hub.market.status === "ready") ready.push("Market");
    if (hub.campaign.status === "ready") ready.push("Campaign");
    if (hub.channel.status === "ready" || hub.channel.status === "auto_mapped") ready.push("Channel");

    if (ready.length === 0) return undefined;
    return ready.join(", ") + " active";
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

  function getDimensionStatusLabel(status: string, type?: string): string {
    switch (status) {
      case "ready": return "Active";
      case "in_progress": return "Configuring";
      case "auto_mapped": 
        return type === "channel" ? "Not active" : "Active";
      case "not_started":
      default: return "Not active";
    }
  }

  const getStatusIcon = (isPopulated: boolean, canAccess: boolean) => {
    if (isPopulated) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (canAccess) return <Circle className="h-4 w-4 text-muted-foreground" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  // Get configured GA4 property details
  const configuredGA4 = ga4.configurations.find(c => c.isConfigured);
  const ga4Property = configuredGA4 ? GA4_PROPERTIES.find(p => p.id === configuredGA4.propertyId) : null;
  
  const dataSources: DataSource[] = [
    {
      key: "ga4",
      title: "GA4 Properties",
      description: "Data source for conversions and revenue",
      emptyStatus: "Not connected",
      populatedStatus: ga4Connected ? `${ga4.configurations.filter(c => c.isConfigured).length} connected` : undefined,
      editPath: "/ga4",
      isPopulated: ga4Connected,
      canAccess: true, // Always accessible
    },
    {
      key: "accounts",
      title: "Ad Accounts",
      description: "Sources for advertising spend data",
      emptyStatus: accountsLinked ? "Not connected" : "Connect GA4 first",
      populatedStatus: accountsLinked ? `${accounts.selected.length} connected` : undefined,
      editPath: "/accounts",
      isPopulated: accountsLinked,
      canAccess: ga4Connected,
      dependencyMessage: ga4Connected ? undefined : "Connect GA4 first",
    },
  ];

  const attributionConfig: AttributionConfig[] = [
    {
      key: "conversion",
      title: "Main Conversion",
      description: "Primary event for CPA and ROAS calculations",
      emptyStatus: conversionSelected ? "Not defined" : "Connect data sources first",
      populatedStatus: conversionSelected ? `${conversion.mainGa4Event}` : undefined,
      editPath: "/conversion",
      isPopulated: conversionSelected,
      canAccess: ga4Connected && accountsLinked,
      dependencyMessage: (!ga4Connected || !accountsLinked) ? "Connect GA4 and ad accounts first" : undefined,
    },
    {
      key: "breakdowns",
      title: "Analysis Dimensions",
      description: "Active breakdowns for data analysis",
      emptyStatus: (breakdownHub.market.status === "ready" || breakdownHub.campaign.status === "ready" || breakdownHub.channel.status === "ready") ? "None active" : "Define conversion first",
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
              status: getDimensionStatusLabel(breakdownHub.market.status),
              coverage: getBreakdownCoverage("market"),
              healthScore: getBreakdownHealthScore("market"),
              description: "Compare performance by country/region"
            },
            { 
              key: "campaign", 
              label: "Campaign", 
              status: getDimensionStatusLabel(breakdownHub.campaign.status, "campaign"),
              coverage: getBreakdownCoverage("campaign"),
              healthScore: getBreakdownHealthScore("campaign"),
              description: "Compare performance by campaign name"
            },
            { 
              key: "channel", 
              label: "Channel", 
              status: getDimensionStatusLabel(breakdownHub.channel.status, "channel"),
              coverage: getBreakdownCoverage("channel"),
              healthScore: getBreakdownHealthScore("channel"),
              description: "Compare Paid Search, Social, Video, etc."
            },
          ],
    },
  ];

  const allSources = [...dataSources, ...attributionConfig];
  const anyPopulated = allSources.some(source => source.isPopulated);
  const allComplete = allSources.every(source => source.isPopulated);
  const completedCount = allSources.filter(source => source.isPopulated).length;

  const handleStartSetup = () => {
    // Go to next accessible incomplete step
    const nextStep = allSources.find(source => !source.isPopulated && source.canAccess);
    if (nextStep) {
      router.push(nextStep.editPath);
    } else {
      // All accessible steps complete, go to breakdown hub
      router.push("/breakdown-hub");
    }
  };

  return (
    <Container className="space-y-8">
          <PageHeader
            title="Attribution settings"
            description="Manage your data sources, conversion definitions, and analysis dimensions."
          />

        <div className="space-y-8">
          {/* Progress Overview Banner */}
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
                        ? "First, connect your GA4 properties"
                        : !accountsLinked
                        ? "Next, link your ad accounts"
                        : !conversionSelected
                        ? "Then, define your main conversion"
                        : "Finally, configure your analysis dimensions"
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
              <h2 className="text-xl font-semibold">Attribution Data Sources</h2>
              <p className="text-muted-foreground">
                Manage GA4 properties and ad account connections for data collection.
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
                    {/* Show GA4 property details when connected */}
                    {source.key === "ga4" && source.isPopulated && configuredGA4 && ga4Property && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              GA4
                            </div>
                            <div>
                              <p className="text-sm font-medium">{ga4Property.name}</p>
                              <p className="text-xs text-muted-foreground">{ga4Property.id}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Brand: {configuredGA4.brandName}</p>
                            <p>Market: {COUNTRY_REGION_OPTIONS.find(c => c.value === configuredGA4.countryRegion)?.label}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show linked platforms for Ad Accounts */}
                    {source.key === "accounts" && source.isPopulated && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Linked Platforms:</p>
                          <div className="space-y-1">
                            {DETECTED_PLATFORMS.map((platform) => {
                              const connection = accounts.platformConnections[platform.id];
                              const accountCount = connection?.selectedAccounts?.length || 0;
                              const isConnected = connection?.isConnected && accountCount > 0;
                              
                              return (
                                <div key={platform.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold", platform.color)}>
                                      {platform.icon.slice(0, 1)}
                                    </div>
                                    <span>{platform.name}</span>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {isConnected 
                                      ? `${accountCount} accounts` 
                                      : connection?.linkLater 
                                      ? "Skipped" 
                                      : "Not linked"
                                    }
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {source.dependencyMessage && (
                        <p className="text-xs text-muted-foreground italic">
                          {source.dependencyMessage}
                        </p>
                      )}
                      <div className="ml-auto">
                        {source.canAccess ? (
                          <Link href={source.editPath}>
                            <Button variant="ghost" size="sm">
                              {source.isPopulated ? "Manage" : "Connect"}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            {source.isPopulated ? "Manage" : "Connect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

              {/* Conversion Config Section */}
              <div className="space-y-4">
                <div className="space-y-2 border-t pt-6">
                  <h2 className="text-xl font-semibold">Conversion Definitions</h2>
                  <p className="text-muted-foreground">
                    Define your main conversion events and platform mappings.
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
                            {config.isPopulated ? (config.populatedStatus || "Configured") : config.emptyStatus}
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
                                <Button variant="ghost" size="sm">
                                  {config.isPopulated ? "Edit" : "Define"}
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                {config.isPopulated ? "Edit" : "Define"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Attribution Dimensions Section */}
              {(() => {
                const breakdownConfig = attributionConfig.find(config => config.isHub);
                return breakdownConfig ? (
                  <div className="space-y-4">
                    <div className="space-y-2 border-t pt-6">
                      <h2 className="text-xl font-semibold">Attribution Dimensions</h2>
                      <p className="text-muted-foreground">
                        Configure how you want to slice and analyze your attribution data.
                      </p>
                    </div>
                    <Card className="border-2 border-dashed border-muted-foreground/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(breakdownConfig.isPopulated, breakdownConfig.canAccess)}
                            <CardTitle className="text-base font-semibold">
                              Analysis Dimensions
                            </CardTitle>
                          </div>
                          <Badge
                            variant={breakdownConfig.isPopulated ? "default" : breakdownConfig.canAccess ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {breakdownConfig.isPopulated ? (breakdownConfig.populatedStatus || "Active") : breakdownConfig.emptyStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {breakdownConfig.hubItems && (
                          <div className="mb-4 space-y-3">
                            {breakdownConfig.hubItems.map((item) => {
                              const healthScore = item.healthScore || 0;
                              const healthStatus = getHealthStatus(healthScore);
                              
                              return (
                                <div 
                                  key={item.key} 
                                  className="rounded-lg border border-gray-200 bg-gray-50/30 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      {healthScore > 0 && (
                                        healthStatus === "healthy" 
                                          ? <CheckCircle className="h-4 w-4 text-green-600" />
                                          : <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold">{item.label}</span>
                                          {healthScore > 0 && (
                                            <>
                                              <Progress 
                                                value={healthScore} 
                                                className={cn(
                                                  "h-1 w-16",
                                                  healthStatus === "healthy" 
                                                    ? "[&>div]:bg-green-600" 
                                                    : "[&>div]:bg-amber-500"
                                                )}
                                              />
                                              <span className={cn(
                                                "text-xs font-medium",
                                                healthStatus === "healthy" ? "text-green-700" : "text-amber-700"
                                              )}>
                                                {healthScore}%
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      <Badge 
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          healthScore > 0 
                                            ? (healthStatus === "healthy" 
                                              ? "border-green-300 text-green-700" 
                                              : "border-amber-300 text-amber-700")
                                            : "border-slate-300 text-slate-700"
                                        )}
                                      >
                                        {healthScore > 0 
                                          ? (healthStatus === "healthy" ? "Ready" : "Poor")
                                          : item.status
                                        }
                                      </Badge>
                                      {healthScore > 0 && (
                                        <Link href={`/breakdowns/${item.key}`}>
                                          <Button 
                                            size="sm" 
                                            variant="ghost"
                                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-6 px-2 text-xs"
                                          >
                                            <Settings className="h-3 w-3 mr-1" />
                                            {healthStatus === "healthy" ? "Improve" : "Fix"}
                                          </Button>
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                                <Button variant="ghost" size="sm">
                                  {breakdownConfig.isPopulated ? "Manage" : "Configure"}
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                {breakdownConfig.isPopulated ? "Manage" : "Configure"}
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
    );
}
