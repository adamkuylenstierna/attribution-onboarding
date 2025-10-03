"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppState } from "@/lib/app-state";
import { GA4_PROPERTIES, COUNTRY_REGION_OPTIONS, DETECTED_PLATFORMS, PLATFORM_AD_ACCOUNTS, GA4_EVENT_OPTIONS, PLATFORM_CONVERSION_EVENTS } from "@/lib/mock-data";
import { Settings, TrendingUp, TrendingDown, Calendar, ChevronRight, ExternalLink, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock dashboard data matching the real dashboard structure
const MOCK_METRICS = {
  cost: { value: "$447K", change: 27, from: "$352K" },
  revenue: { value: "$2.63M", change: null, from: null },
  roas: { value: "5.89", change: -11, from: "6.64" },
  conversions: { value: "822", change: 12, from: "731" },
  cpa: { value: "$544", change: null, from: null },
  aov: { value: "$3.2K", change: null, from: null },
};

const CHANNEL_DATA = [
  { channel: "All", cost: "$446,832.44", revenue: "$2,630,400", roas: "5.89", conversions: 822, platform: 290, cpa: "$544", platformCpa: "$1,541", aov: "$3,200" },
  { channel: "Paid Social", cost: "$310,917.65", revenue: "$1,123,200", roas: "3.61", conversions: 351, platform: 169, cpa: "$886", platformCpa: "$1,840", aov: "$3,200" },
  { channel: "Direct", cost: "-", revenue: "$620,800", roas: "-", conversions: 194, platform: null, cpa: "$0", platformCpa: "-", aov: "$3,200" },
  { channel: "Organic Search", cost: "-", revenue: "$420,462", roas: "-", conversions: 131.4, platform: null, cpa: "$0", platformCpa: "-", aov: "$3,200" },
  { channel: "Paid Search", cost: "$135,914.79", revenue: "$345,480", roas: "2.54", conversions: 108, platform: 121, cpa: "$1,258", platformCpa: "$1,123", aov: "$3,199" },
];

const TRAFFIC_SOURCE_DATA = [
  { source: "All", cost: "$446,832.44", revenue: "$2,630,400", roas: "5.89", conversions: 822, platform: 290, cpa: "$544", platformCpa: "$1,541", aov: "$3,200" },
  { source: "Facebook Ads", cost: "$175,178.73", revenue: "$1,081,600", roas: "6.17", conversions: 338, platform: 128, cpa: "$518", platformCpa: "$1,369", aov: "$3,200" },
  { source: "Direct Traffic", cost: "-", revenue: "$620,800", roas: "-", conversions: 194, platform: null, cpa: "$0", platformCpa: "-", aov: "$3,200" },
  { source: "Google Organic", cost: "-", revenue: "$399,857", roas: "-", conversions: 125, platform: null, cpa: "$0", platformCpa: "-", aov: "$3,200" },
  { source: "Google Ads", cost: "$129,963.38", revenue: "$332,680", roas: "2.56", conversions: 104, platform: 118, cpa: "$1,250", platformCpa: "$1,101", aov: "$3,200" },
];

const CAMPAIGN_DATA = [
  { campaign: "Q4 Prospecting", cost: "$145,230", revenue: "$892,400", roas: "6.14", conversions: 278, cpa: "$522", aov: "$3,210" },
  { campaign: "Evergreen Retargeting", cost: "$98,450", revenue: "$654,200", roas: "6.64", conversions: 204, cpa: "$482", aov: "$3,207" },
  { campaign: "Brand Awareness", cost: "$87,340", revenue: "$412,800", roas: "4.73", conversions: 129, cpa: "$677", aov: "$3,200" },
  { campaign: "Holiday Special", cost: "$115,812", revenue: "$671,000", roas: "5.79", conversions: 211, cpa: "$549", aov: "$3,180" },
];

export default function DashboardPage() {
  const {
    state: { ga4, accounts, conversion },
    actions,
  } = useAppState();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"channel" | "traffic" | "campaign">("channel");

  // Get configured data
  const configuredGA4 = ga4.configurations.find(c => c.isConfigured);
  const ga4Property = configuredGA4 ? GA4_PROPERTIES.find(p => p.id === configuredGA4.propertyId) : null;
  
  const connectedPlatforms = DETECTED_PLATFORMS.filter(p => {
    const conn = accounts.platformConnections[p.id];
    return conn?.isConnected && conn.selectedAccounts.length > 0;
  });

  const pendingPlatforms = DETECTED_PLATFORMS.filter(p => {
    const conn = accounts.platformConnections[p.id];
    return conn?.linkLater === true;
  });

  const totalAccounts = Object.values(accounts.platformConnections).reduce(
    (sum, conn) => sum + (conn?.selectedAccounts?.length || 0), 0
  );

  // Platform account management
  const handleToggleAccount = (platformId: string, accountId: string, checked: boolean) => {
    const connection = accounts.platformConnections[platformId];
    if (!connection) return;

    const platformAccounts = PLATFORM_AD_ACCOUNTS[platformId as keyof typeof PLATFORM_AD_ACCOUNTS] || [];
    let updatedAccounts = [...connection.selectedAccounts];

    if (checked) {
      const account = platformAccounts.find(acc => acc.id === accountId);
      if (account) {
        updatedAccounts.push(account);
      }
    } else {
      updatedAccounts = updatedAccounts.filter(acc => acc.id !== accountId);
    }

    actions.updatePlatformConnection(platformId, {
      selectedAccounts: updatedAccounts,
      isConnected: updatedAccounts.length > 0,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">Attribution Performance Dashboard</h1>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Last full 30 days
                </Button>
              </div>
            </div>
          </Container>
        </div>

        {/* Configuration Summary Bar */}
        <div className="border-b bg-muted/30 overflow-x-auto">
          <div className="flex justify-center w-full py-3">
            <div className="flex items-center justify-between text-sm min-w-max px-6">
              <div className="flex items-center gap-x-6 gap-y-2 flex-nowrap">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground">GA4 Property:</span>
                  <span className="font-medium">{configuredGA4?.brandName || "Not configured"}</span>
                  {ga4Property && configuredGA4 && (
                    <Badge variant="outline" className="text-xs">
                      {COUNTRY_REGION_OPTIONS.find(c => c.value === configuredGA4.countryRegion)?.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground">Ad Platform Accounts:</span>
                  <span className="font-medium">{connectedPlatforms.length} platforms</span>
                  <Badge variant="outline" className="text-xs">
                    {totalAccounts} accounts
                  </Badge>
                  {pendingPlatforms.length > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      {pendingPlatforms.length} pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground">GA Main Conversion:</span>
                  <span className="font-medium">{conversion.mainGa4Event || "Not defined"}</span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground">Platform Conversions:</span>
                  <span className="font-medium">
                    {Object.keys(conversion.platformEventMap).length} of {connectedPlatforms.length} mapped
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="h-7 text-xs ml-6 flex-shrink-0"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Container className="py-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.cost.value}</div>
                {MOCK_METRICS.cost.change && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {MOCK_METRICS.cost.change}% from {MOCK_METRICS.cost.from}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.revenue.value}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ROAS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.roas.value}</div>
                {MOCK_METRICS.roas.change && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(MOCK_METRICS.roas.change)}% from {MOCK_METRICS.roas.from}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversions (GA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.conversions.value}</div>
                {MOCK_METRICS.conversions.change && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {MOCK_METRICS.conversions.change}% from {MOCK_METRICS.conversions.from}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">CPA (GA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.cpa.value}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AOV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{MOCK_METRICS.aov.value}</div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Tabs */}
          <div className="flex items-center gap-2 border-b">
            <Button
              variant={activeView === "channel" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("channel")}
              className="rounded-b-none"
            >
              Channel
            </Button>
            <Button
              variant={activeView === "traffic" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("traffic")}
              className="rounded-b-none"
            >
              Traffic Source
            </Button>
            <Button
              variant={activeView === "campaign" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("campaign")}
              className="rounded-b-none"
            >
              Campaign
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent" onClick={() => setBreakdownModalOpen(activeView)}>
                94% coverage
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBreakdownModalOpen(activeView)}
                className="h-7 text-xs"
              >
                Configure
              </Button>
            </div>
          </div>

          {/* Data Tables */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {activeView === "channel" ? "Channel (Attribution)" : activeView === "traffic" ? "Traffic Source (Attribution)" : "Campaign"}
                      </TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Revenue (GA)</TableHead>
                      <TableHead className="text-right">ROAS (GA)</TableHead>
                      <TableHead className="text-right">Conversions (GA)</TableHead>
                      {activeView !== "campaign" && <TableHead className="text-right">Conversions (Platform)</TableHead>}
                      <TableHead className="text-right">CPA (GA)</TableHead>
                      {activeView !== "campaign" && <TableHead className="text-right">CPA (Platform)</TableHead>}
                      <TableHead className="text-right">AOV (GA)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeView === "channel" && CHANNEL_DATA.map((row, idx) => (
                      <TableRow key={idx} className={idx === 0 ? "font-medium" : ""}>
                        <TableCell>{row.channel}</TableCell>
                        <TableCell className="text-right">{row.cost}</TableCell>
                        <TableCell className="text-right">{row.revenue}</TableCell>
                        <TableCell className="text-right">{row.roas}</TableCell>
                        <TableCell className="text-right">{row.conversions}</TableCell>
                        <TableCell className="text-right">{row.platform ?? "-"}</TableCell>
                        <TableCell className="text-right">{row.cpa}</TableCell>
                        <TableCell className="text-right">{row.platformCpa}</TableCell>
                        <TableCell className="text-right">{row.aov}</TableCell>
                      </TableRow>
                    ))}
                    {activeView === "traffic" && TRAFFIC_SOURCE_DATA.map((row, idx) => (
                      <TableRow key={idx} className={idx === 0 ? "font-medium" : ""}>
                        <TableCell>{row.source}</TableCell>
                        <TableCell className="text-right">{row.cost}</TableCell>
                        <TableCell className="text-right">{row.revenue}</TableCell>
                        <TableCell className="text-right">{row.roas}</TableCell>
                        <TableCell className="text-right">{row.conversions}</TableCell>
                        <TableCell className="text-right">{row.platform ?? "-"}</TableCell>
                        <TableCell className="text-right">{row.cpa}</TableCell>
                        <TableCell className="text-right">{row.platformCpa}</TableCell>
                        <TableCell className="text-right">{row.aov}</TableCell>
                      </TableRow>
                    ))}
                    {activeView === "campaign" && CAMPAIGN_DATA.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.campaign}</TableCell>
                        <TableCell className="text-right">{row.cost}</TableCell>
                        <TableCell className="text-right">{row.revenue}</TableCell>
                        <TableCell className="text-right">{row.roas}</TableCell>
                        <TableCell className="text-right">{row.conversions}</TableCell>
                        <TableCell className="text-right">{row.cpa}</TableCell>
                        <TableCell className="text-right">{row.aov}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>

      {/* Settings Side Panel */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="sticky top-0 bg-background border-b px-6 py-4">
            <SheetHeader className="space-y-1">
              <SheetTitle>Attribution Settings</SheetTitle>
              <SheetDescription className="text-xs">
                Manage your data sources and configuration
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-4 space-y-6">
            <TooltipProvider>
              {/* GA4 Property & Market - Merged */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">GA4 Property & Market</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The GA4 property provides conversion and revenue data. Market indicates which geographic region or country this property represents.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">Source for conversion and revenue tracking</p>
              {configuredGA4 && ga4Property ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      GA
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{configuredGA4.brandName}</p>
                      <p className="text-xs text-muted-foreground truncate">{ga4Property.name}</p>
                    </div>
                  </div>
                  <div className="pl-7">
                    <p className="text-xs text-muted-foreground">Market</p>
                    <p className="text-sm">
                      {COUNTRY_REGION_OPTIONS.find(c => c.value === configuredGA4.countryRegion)?.label}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not configured</p>
              )}
            </div>

            {/* Ad Platform Accounts - List view with manage button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Ad Platform Accounts</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Ad accounts from platforms like Google Ads, Meta, and TikTok provide spend data that's matched with GA4 conversions to calculate CPA and ROAS.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Sources for advertising spend data</p>
              
              <div className="space-y-2">
                {/* Connected platforms */}
                {DETECTED_PLATFORMS.map((platform) => {
                  const connection = accounts.platformConnections[platform.id];
                  const selectedAccounts = connection?.selectedAccounts || [];
                  
                  if (selectedAccounts.length === 0) return null;
                  
                  return (
                    <div key={platform.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold", platform.color)}>
                            {platform.icon}
                          </div>
                          <p className="text-sm font-medium">{platform.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {selectedAccounts.length}
                          </Badge>
                        </div>
                        <Link href="/accounts">
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                            Manage
                          </Button>
                        </Link>
                      </div>
                      <div className="pl-7 space-y-1">
                        {selectedAccounts.map((account) => (
                          <p key={account.id} className="text-xs text-muted-foreground truncate">
                            {account.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Pending platforms (link later) */}
                {pendingPlatforms.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs font-medium text-amber-600">Pending connection</p>
                    {pendingPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold", platform.color)}>
                            {platform.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{platform.name}</p>
                            <p className="text-xs text-amber-700">Not connected yet</p>
                          </div>
                        </div>
                        <Link href="/accounts">
                          <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                            Connect
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                
                <Link href="/accounts">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs mt-2">
                    Add another platform
                  </Button>
                </Link>
              </div>
            </div>

            {/* GA Main Conversion - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">GA Main Conversion</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The primary event tracked in GA4 (e.g., Purchase) used to measure success and calculate attribution metrics across all platforms.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Primary event for CPA and ROAS calculations</p>
              {conversion.mainGa4Event ? (
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {GA4_EVENT_OPTIONS.find(e => e.value === conversion.mainGa4Event)?.label || conversion.mainGa4Event}
                  </Badge>
                  <Link href="/conversion">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      Change
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not defined</p>
              )}
            </div>

            {/* Platform Main Conversions - List view */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Platform Conversion Mappings</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Each ad platform uses different names for conversion events. Map each platform's conversion event to your GA4 main conversion to ensure accurate tracking.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Link platform events to your GA4 conversion</p>
              
              {connectedPlatforms.length > 0 ? (
                <div className="space-y-2">
                  {connectedPlatforms.map((platform) => {
                    const mappedEvent = conversion.platformEventMap[platform.id];
                    const platformEvents = PLATFORM_CONVERSION_EVENTS[platform.id as keyof typeof PLATFORM_CONVERSION_EVENTS] || [];
                    const eventLabel = platformEvents.find(e => e.value === mappedEvent)?.label || mappedEvent;
                    const isMapped = !!mappedEvent;
                    
                    return (
                      <div key={platform.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold", platform.color)}>
                            {platform.icon.slice(0, 1)}
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-medium">{platform.name}</p>
                            {isMapped ? (
                              <Badge variant="secondary" className="text-xs">
                                {eventLabel}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                Not mapped yet
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Link href="/conversion">
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                            {isMapped ? "Edit" : "Map"}
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                  
                  {/* Pending platforms that can't be mapped yet */}
                  {pendingPlatforms.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-medium text-amber-600">Pending platforms (connect first)</p>
                      {pendingPlatforms.map((platform) => (
                        <div key={platform.id} className="flex items-center justify-between py-1 opacity-60">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={cn("w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold", platform.color)}>
                              {platform.icon.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{platform.name}</p>
                              <p className="text-xs text-amber-600">Platform not connected</p>
                            </div>
                          </div>
                          <Link href="/accounts">
                            <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                              Connect platform
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No platforms connected</p>
              )}
            </div>
          </TooltipProvider>
          </div>

          {/* Footer with full setup link */}
          <div className="sticky bottom-0 bg-background border-t px-6 py-4">
            <Link href="/settings">
              <Button variant="outline" className="w-full gap-2 h-9">
                <ExternalLink className="h-3.5 w-3.5" />
                Open full setup flow
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Breakdown Configuration Modal */}
      <Dialog open={breakdownModalOpen !== null} onOpenChange={() => setBreakdownModalOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize">{breakdownModalOpen} Breakdown Configuration</DialogTitle>
            <DialogDescription>
              Review and improve your {breakdownModalOpen} mapping for better attribution accuracy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Coverage status */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50/50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">94% data quality</p>
                  <p className="text-sm text-green-700">This breakdown is working well</p>
                </div>
              </div>
              <Badge variant="outline" className="border-green-300 text-green-700">Ready</Badge>
            </div>

            {/* Quick info about current mapping */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Current Configuration</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {breakdownModalOpen === "channel" && (
                  <>
                    <p>• Auto-mapped from UTM source/medium parameters</p>
                    <p>• 94% of spend successfully categorized</p>
                    <p>• 6% categorized as "Other" or "Unassigned"</p>
                  </>
                )}
                {breakdownModalOpen === "traffic" && (
                  <>
                    <p>• Based on traffic source and campaign parameters</p>
                    <p>• Automatically tracks major ad platforms</p>
                    <p>• High accuracy for paid traffic sources</p>
                  </>
                )}
                {breakdownModalOpen === "campaign" && (
                  <>
                    <p>• Extracted from UTM campaign parameters</p>
                    <p>• Campaign names normalized for consistency</p>
                    <p>• Manual overrides available for edge cases</p>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Link href={`/breakdowns/${breakdownModalOpen}`} className="flex-1">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure mapping rules
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setBreakdownModalOpen(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
