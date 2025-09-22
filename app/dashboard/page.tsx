"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppState, BreakdownKey } from "@/lib/app-state";
import { GA4_PROPERTIES } from "@/lib/mock-data";

const KPI_ROWS = [
  {
    id: "spend",
    label: "Spend",
    value: "$68.2k",
  },
  {
    id: "conversions",
    label: "Conversions (GA4)",
    value: "3,420",
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "$210k",
  },
  {
    id: "cpa",
    label: "CPA",
    value: "$19.95",
  },
  {
    id: "roas",
    label: "ROAS",
    value: "3.1x",
  },
];

const TABLE_DATA: Record<BreakdownKey, Array<{ key: string; spend: string; conversions: string; revenue: string; cpa: string; roas: string }>> = {
  market: [
    { key: "DE", spend: "$24.0k", conversions: "1,090", revenue: "$78k", cpa: "$22", roas: "3.2x" },
    { key: "SE", spend: "$18.3k", conversions: "940", revenue: "$63k", cpa: "$19", roas: "3.4x" },
    { key: "ES", spend: "$15.9k", conversions: "820", revenue: "$49k", cpa: "$19", roas: "3.0x" },
  ],
  campaign: [
    { key: "Prospecting_Q4", spend: "$21.5k", conversions: "720", revenue: "$62k", cpa: "$30", roas: "2.9x" },
    { key: "Retargeting_Q4", spend: "$12.7k", conversions: "610", revenue: "$58k", cpa: "$21", roas: "4.5x" },
    { key: "Always_On", spend: "$10.4k", conversions: "420", revenue: "$35k", cpa: "$25", roas: "3.3x" },
  ],
  channel: [
    { key: "Paid Search", spend: "$28.4k", conversions: "1,180", revenue: "$92k", cpa: "$24", roas: "3.2x" },
    { key: "Paid Social", spend: "$24.8k", conversions: "1,020", revenue: "$78k", cpa: "$24", roas: "3.1x" },
    { key: "Video", spend: "$14.1k", conversions: "310", revenue: "$40k", cpa: "$45", roas: "2.8x" },
  ],
};

const OPTIONAL_BREAKDOWN_SCOPES: Record<Exclude<BreakdownKey, "market">, string> = {
  campaign: "Campaign",
  channel: "Channel",
};

const METHOD_LABELS: Record<string, string> = {
  platform_geo: "Using platform geo",
  naming_rules: "Needs rules",
  ga4_fallback: "Using GA4 geography",
};

export default function DashboardPreviewPage() {
  const {
    state: {
      ga4,
      breakdownHub,
      breakdowns,
      accounts,
      diagnostics,
      conversion,
    },
  } = useAppState();

  const ga4Property = GA4_PROPERTIES.find(
    (property) => property.id === ga4.selectedPropertyId
  );

  const availableBreakdowns: BreakdownKey[] = useMemo(() => {
    const base: BreakdownKey[] = [];
    if (breakdownHub.market.status === "ready") base.push("market");
    if (breakdownHub.campaign.status === "ready") base.push("campaign");
    if (breakdownHub.channel.status === "ready" || breakdownHub.channel.status === "auto_mapped") base.push("channel");
    // Always include market as fallback if no breakdowns are ready yet
    if (base.length === 0) base.push("market");
    return base;
  }, [breakdownHub.market.status, breakdownHub.campaign.status, breakdownHub.channel.status]);

  const [activeBreakdown, setActiveBreakdown] = useState<BreakdownKey>(
    availableBreakdowns[0]
  );

  useEffect(() => {
    if (!availableBreakdowns.includes(activeBreakdown)) {
      setActiveBreakdown(availableBreakdowns[0] ?? "market");
    }
  }, [availableBreakdowns, activeBreakdown]);

  const disabledBreakdowns = (Object.keys(OPTIONAL_BREAKDOWN_SCOPES) as BreakdownKey[]).filter(
    (key) => !availableBreakdowns.includes(key)
  );

  const methodBadges = accounts.selected.map((account) => ({
    id: account.id,
    label: account.name,
    method:
      breakdowns.market.perAccountMethod[account.id] ?? "platform_geo",
  }));

  return (
    <Container className="space-y-8">
      <PageHeader
        title={ga4.brandLabel ?? "Attribution view"}
        description={
          ga4Property
            ? `${ga4Property.name} · ${ga4Property.id}`
            : "Preview with mocked data"
        }
      />
      <TooltipProvider>
        <Tabs
          value={activeBreakdown}
          onValueChange={(value) => setActiveBreakdown(value as BreakdownKey)}
        >
          <TabsList className="flex flex-wrap justify-start gap-2">
            {availableBreakdowns.map((key) => (
              <TabsTrigger key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </TabsTrigger>
            ))}
            {disabledBreakdowns.map((key) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" disabled>
                    {OPTIONAL_BREAKDOWN_SCOPES[key as Exclude<BreakdownKey, "market">]}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Configure {OPTIONAL_BREAKDOWN_SCOPES[key as Exclude<BreakdownKey, "market">]} in onboarding to unlock.
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        <TabsContent value={activeBreakdown} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-5">
            {KPI_ROWS.filter((kpi) =>
              conversion.hasRevenue ? true : !["revenue", "roas"].includes(kpi.id)
            ).map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeBreakdown === "market"
                  ? "Performance by market"
                  : activeBreakdown === "campaign"
                  ? "Performance by campaign"
                  : "Performance by channel"}
              </CardTitle>
              <CardDescription>
                Mocked numbers to illustrate the structure of the final dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{activeBreakdown.toUpperCase()}</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Conversions</TableHead>
                    {conversion.hasRevenue ? <TableHead>Revenue</TableHead> : null}
                    <TableHead>CPA</TableHead>
                    {conversion.hasRevenue ? <TableHead>ROAS</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TABLE_DATA[activeBreakdown].map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{row.key}</TableCell>
                      <TableCell>{row.spend}</TableCell>
                      <TableCell>{row.conversions}</TableCell>
                      {conversion.hasRevenue ? <TableCell>{row.revenue}</TableCell> : null}
                      <TableCell>{row.cpa}</TableCell>
                      {conversion.hasRevenue ? <TableCell>{row.roas}</TableCell> : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </TooltipProvider>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Diagnostics</CardTitle>
          <CardDescription>
            What we highlight alongside the dashboard to keep trust high.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 text-sm">
            <p>
              Coverage: {breakdowns.market.coverageScore}% mapped · {100 - breakdowns.market.coverageScore}% unknown
            </p>
            <p>GA4 vs platform delta: {diagnostics.platformVsGa4Delta >= 0 ? "+" : ""}{diagnostics.platformVsGa4Delta}%</p>
            <div className="flex flex-wrap gap-2">
              {methodBadges.map((entry) => (
                <Badge key={entry.id} variant="outline">
                  {entry.label}: {METHOD_LABELS[entry.method] ?? METHOD_LABELS.platform_geo}
                </Badge>
              ))}
            </div>
          </div>
          <Button asChild>
            <Link href="/breakdowns/market">Fix unknowns</Link>
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
