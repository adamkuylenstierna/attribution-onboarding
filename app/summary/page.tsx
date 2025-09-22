"use client";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppState, BreakdownKey } from "@/lib/app-state";
import { GA4_PROPERTIES, BREAKDOWN_LABELS } from "@/lib/mock-data";

export default function SummaryPage() {
  const {
    state: {
      ga4,
      accounts,
      conversion,
      breakdownHub,
      breakdowns,
    },
  } = useAppState();

  const ga4Property = GA4_PROPERTIES.find(
    (property) => property.id === ga4.selectedPropertyId
  );

  const activeBreakdowns: BreakdownKey[] = [];
  if (breakdownHub.market.status === "ready") activeBreakdowns.push("market");
  if (breakdownHub.campaign.status === "ready") activeBreakdowns.push("campaign");
  if (breakdownHub.channel.status === "ready" || breakdownHub.channel.status === "auto_mapped") activeBreakdowns.push("channel");
  // Always include market as fallback if no breakdowns are ready yet
  if (activeBreakdowns.length === 0) activeBreakdowns.push("market");

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Review and create your Attribution View"
        description="Here’s a quick recap of what will be included. Everything stays local to this prototype."
      />
      <Card>
        <CardHeader>
          <CardTitle>Configuration summary</CardTitle>
          <CardDescription>Check the essentials below before you create the view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Brand</p>
              <p className="text-lg font-semibold">{ga4.brandLabel ?? "Brand"}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">GA4 property</p>
              <p className="text-lg font-semibold">
                {ga4Property ? `${ga4Property.name} · ${ga4Property.id}` : "Not selected"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Linked accounts ({accounts.selected.length})</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Platform</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.selected.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.id}</div>
                    </TableCell>
                    <TableCell className="capitalize">{account.platform.replace(/_/g, " ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Main conversion</p>
              <p className="text-lg font-semibold">{conversion.mainGa4Event}</p>
              <p className="text-sm text-muted-foreground">
                Revenue tracking {conversion.hasRevenue ? "on" : "off"}
              </p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Platform mapping</p>
              <p className="text-sm">
                {Object.keys(conversion.platformEventMap).length
                  ? "Custom mapping per account"
                  : "Using defaults (Purchase)"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Active breakdowns</h2>
            <div className="flex flex-wrap gap-2">
              {activeBreakdowns.map((key) => (
                <Badge key={key} variant={key === "market" ? "default" : "secondary"}>
                  {BREAKDOWN_LABELS[key]}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border p-4 text-sm">
              <p className="text-muted-foreground">Market coverage</p>
              <p className="text-xl font-semibold">{breakdowns.market.coverageScore}%</p>
            </div>
            <div className="rounded-md border p-4 text-sm">
              <p className="text-muted-foreground">Campaign coverage</p>
              <p className="text-xl font-semibold">{breakdowns.campaign.coverageScore}%</p>
            </div>
            <div className="rounded-md border p-4 text-sm">
              <p className="text-muted-foreground">Channel coverage</p>
              <p className="text-xl font-semibold">{breakdowns.channel.coverageScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <StepFooter nextHref="/dashboard" nextLabel="Create Attribution View" />
    </Container>
  );
}
