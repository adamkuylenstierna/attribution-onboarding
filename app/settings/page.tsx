"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { GA4_PROPERTIES, COUNTRY_REGION_OPTIONS, DETECTED_PLATFORMS } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Settings } from "lucide-react";
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

  // Mock data quality scores - same as breakdown hub
  const getBreakdownDataQuality = (type: string): number => {
    switch (type) {
      case "channel": return 94;
      case "market": return 23;
      case "campaign": return 31;
      default: return 0;
    }
  };

  const getDataQualityStatus = (score: number): "good" | "needs_setup" => {
    return score >= 90 ? "good" : "needs_setup";
  };

  const getBreakdownCoverage = (type: string): string => {
    const score = getBreakdownDataQuality(type);
    return `${score}% data quality`;
  };

  const isBreakdownDefault = (type: string): boolean => {
    return type === "channel";
  };

  const isBreakdownOptional = (type: string): boolean => {
    return type === "market" || type === "campaign";
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
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  // Get configured GA4 property details
  const configuredGA4 = ga4.configurations.find(c => c.isConfigured);
  const ga4Property = configuredGA4 ? GA4_PROPERTIES.find(p => p.id === configuredGA4.propertyId) : null;
  
  const dataSources: DataSource[] = [
    {
      key: "ga4",
      title: "GA4 Property",
      description: "Data source for conversions and revenue",
      emptyStatus: "Not connected",
      populatedStatus: ga4Connected ? `${ga4.configurations.filter(c => c.isConfigured).length} connected` : undefined,
      editPath: "/ga4",
      isPopulated: ga4Connected,
      canAccess: true, // Always accessible
    },
    {
      key: "accounts",
      title: "Ad Platforms",
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
              key: "channel", 
              label: "Channel", 
              status: "Default view",
              coverage: getBreakdownCoverage("channel"),
              healthScore: getBreakdownDataQuality("channel"),
              description: "Compare Paid Search, Social, Video, etc. (included by default)"
            },
            { 
              key: "market", 
              label: "Market", 
              status: getDimensionStatusLabel(breakdownHub.market.status),
              coverage: getBreakdownCoverage("market"),
              healthScore: getBreakdownDataQuality("market"),
              description: "Compare performance by country/region (optional)"
            },
            { 
              key: "campaign", 
              label: "Campaign", 
              status: getDimensionStatusLabel(breakdownHub.campaign.status, "campaign"),
              coverage: getBreakdownCoverage("campaign"),
              healthScore: getBreakdownDataQuality("campaign"),
              description: "Compare performance by campaign name (optional)"
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
        <Container className="space-y-6">
          <PageHeader
            title="Attribution settings"
            description="Manage your data sources, conversion definitions, and analysis dimensions."
          />

          {/* Progress Overview Banner */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50/50">
            <CardContent className="py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {completedCount} of 4 steps complete
                    </p>
                  )}
                </div>
                <Button onClick={handleStartSetup}>
                  {anyPopulated ? "Continue setup" : "Start setup"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compact Settings Grid */}
          <div className="grid gap-4">
            {/* Data Sources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataSources.map((source) => (
                  <div key={source.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(source.isPopulated, source.canAccess)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{source.title}</p>
                          <Badge variant={source.isPopulated ? "default" : "outline"} className="text-xs">
                            {source.isPopulated ? (source.populatedStatus || "Connected") : source.emptyStatus}
                          </Badge>
                        </div>
                        {/* Compact details for connected sources */}
                        {source.key === "ga4" && source.isPopulated && configuredGA4 && ga4Property && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {configuredGA4.brandName} • {COUNTRY_REGION_OPTIONS.find(c => c.value === configuredGA4.countryRegion)?.label}
                          </p>
                        )}
                        {source.key === "accounts" && source.isPopulated && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {Object.values(accounts.platformConnections).reduce((sum, conn) => sum + (conn?.selectedAccounts?.length || 0), 0)} accounts across {Object.keys(accounts.platformConnections).filter(id => accounts.platformConnections[id]?.isConnected).length} platforms
                          </p>
                        )}
                        {source.dependencyMessage && (
                          <p className="text-xs text-muted-foreground italic mt-1">{source.dependencyMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
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
                ))}
              </CardContent>
            </Card>

            {/* Conversion */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversion Events</CardTitle>
              </CardHeader>
              <CardContent>
                {attributionConfig.filter(config => !config.isHub).map((config) => (
                  <div key={config.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(config.isPopulated, config.canAccess)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{config.title}</p>
                          <Badge variant={config.isPopulated ? "default" : "outline"} className="text-xs">
                            {config.isPopulated ? (config.populatedStatus || "Configured") : config.emptyStatus}
                          </Badge>
                        </div>
                        {config.dependencyMessage && (
                          <p className="text-xs text-muted-foreground italic mt-1">{config.dependencyMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
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
                ))}
              </CardContent>
            </Card>

            {/* Analysis Dimensions */}
            {(() => {
              const breakdownConfig = attributionConfig.find(config => config.isHub);
              return breakdownConfig ? (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Analysis Dimensions</CardTitle>
                      <Badge variant={breakdownConfig.isPopulated ? "default" : "outline"} className="text-xs">
                        {breakdownConfig.isPopulated ? (breakdownConfig.populatedStatus || "Active") : breakdownConfig.emptyStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {breakdownConfig.hubItems && breakdownConfig.hubItems.map((item) => {
                      const dataQuality = item.healthScore || 0;
                      const qualityStatus = getDataQualityStatus(dataQuality);
                      const isDefault = isBreakdownDefault(item.key);
                      
                      return (
                        <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div className="flex items-center gap-3 flex-1">
                            {isDefault ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : dataQuality > 0 ? (
                              qualityStatus === "good" 
                                ? <CheckCircle className="h-4 w-4 text-green-600" />
                                : <Circle className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-400" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{item.label}</p>
                                {dataQuality > 0 && (
                                  <>
                                    <Progress 
                                      value={dataQuality} 
                                      className={cn(
                                        "h-1 w-12",
                                        isDefault || qualityStatus === "good"
                                          ? "[&>div]:bg-green-600" 
                                          : "[&>div]:bg-slate-400"
                                      )}
                                    />
                                    <span className="text-xs text-slate-600">{dataQuality}%</span>
                                  </>
                                )}
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    isDefault 
                                      ? "border-green-300 text-green-700"
                                      : dataQuality > 0 
                                      ? (qualityStatus === "good" 
                                        ? "border-green-300 text-green-700" 
                                        : "border-slate-300 text-slate-600")
                                      : "border-slate-300 text-slate-700"
                                  )}
                                >
                                  {isDefault 
                                    ? "Default"
                                    : dataQuality > 0 
                                    ? (qualityStatus === "good" ? "Ready" : "Setup needed")
                                    : "Not active"
                                  }
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4">
                            {dataQuality > 0 ? (
                              <Link href={`/breakdowns/${item.key}`}>
                                <Button variant="ghost" size="sm">
                                  {isDefault ? "Configure" : qualityStatus === "good" ? "Improve" : "Set up"}
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="ghost" size="sm" disabled>
                                Set up
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {breakdownConfig.dependencyMessage && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground italic">{breakdownConfig.dependencyMessage}</p>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-end">
                        {breakdownConfig.canAccess ? (
                          <Link href={breakdownConfig.editPath}>
                            <Button variant="ghost" size="sm">
                              Manage all dimensions
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            Manage all dimensions
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </div>
        </Container>
      );
}
