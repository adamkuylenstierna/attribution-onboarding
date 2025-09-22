"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

const METHOD_LABELS: Record<string, string> = {
  platform_geo: "Using platform geo",
  naming_rules: "Needs rules",
  ga4_fallback: "Using GA4 geography",
};

export default function CoveragePage() {
  const router = useRouter();
  const {
    state: {
      accounts: { selected: linkedAccounts },
      breakdowns: { market, campaign, channel },
      diagnostics,
      breakdownHub,
    },
  } = useAppState();

  const accountCoverageRows = useMemo(
    () =>
      linkedAccounts.map((account) => {
        const method = market.perAccountMethod[account.id] ?? "platform_geo";
        const defaultUnknown =
          method === "platform_geo" ? 3 : method === "ga4_fallback" ? 32 : 18;
        const unknownPct =
          diagnostics.unknownPercentByAccount[account.id] ?? defaultUnknown;
        const coverage = Math.max(0, 100 - unknownPct);
        return {
          id: account.id,
          name: account.name,
          method,
          coverage,
          unknown: unknownPct,
        };
      }),
    [linkedAccounts, market.perAccountMethod, diagnostics.unknownPercentByAccount]
  );

  const averageUnknown = accountCoverageRows.length
    ? accountCoverageRows.reduce((sum, row) => sum + row.unknown, 0) /
      accountCoverageRows.length
    : 0;

  const completenessScore = useMemo(() => {
    const base = (market.coverageScore + campaign.coverageScore + channel.coverageScore) / 3;
    const penalty = Math.max(0, averageUnknown - 20) * 0.8;
    return Math.max(0, Math.round(base - penalty));
  }, [market.coverageScore, campaign.coverageScore, channel.coverageScore, averageUnknown]);

  const lowestUnknown = accountCoverageRows.reduce((current, row) => {
    if (!current) return row;
    return row.unknown > current.unknown ? row : current;
  }, null as (typeof accountCoverageRows)[number] | null);

  const marketSelected = breakdownHub.market.status === "ready";

  const conversionDelta = diagnostics.platformVsGa4Delta ?? 12;

  const statusLabel =
    completenessScore >= 80
      ? "Good to go"
      : completenessScore >= 50
      ? "Needs attention"
      : "Consider fixing first";

  const statusDescription =
    completenessScore >= 80
      ? "Numbers look healthy. You can create the view now and fine-tune later."
      : completenessScore >= 50
      ? "Tackle the flagged items to build more trust before sharing."
      : "We recommend fixing the flagged items before creating the view.";

  const statusTone =
    completenessScore >= 80
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : completenessScore >= 50
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-rose-600 bg-rose-50 border-rose-200";

  const worstAccountHref = lowestUnknown
    ? `/breakdowns/market?account=${lowestUnknown.id}`
    : "/breakdowns/market";

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Pre-flight check"
        description="We run a quick health check so you know where to focus before creating the view."
      />
      <Card className={`border ${statusTone}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Badge variant="secondary">{statusLabel}</Badge>
            <span>{completenessScore} completeness score</span>
          </CardTitle>
          <CardDescription className="text-sm text-inherit">
            {statusDescription}
          </CardDescription>
        </CardHeader>
        {lowestUnknown ? (
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              Highest unknown: {lowestUnknown.name} · {lowestUnknown.unknown}% unknown market.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href={worstAccountHref}>Fix Market mapping</Link>
            </Button>
          </CardContent>
        ) : null}
      </Card>
      {!marketSelected ? (
        <Card>
          <CardHeader>
            <CardTitle>Start with Market</CardTitle>
            <CardDescription>
              We’ve seen faster wins when Market is configured first. Add it to unlock CPA and ROAS by market.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/breakdowns/market">Set up Market now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market mapping coverage</CardTitle>
            <CardDescription>
              How each account derives market and the share mapped to a known geo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Mapped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountCoverageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-sm text-muted-foreground">{row.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{METHOD_LABELS[row.method] ?? row.method}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.coverage}% mapped · {row.unknown}% unknown
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion comparison</CardTitle>
            <CardDescription>
              GA4 vs platform conversions to set expectations before the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Δ%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.id}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {conversionDelta >= 0 ? "+" : ""}
                      {conversionDelta}% platform vs GA4
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-3 text-sm text-muted-foreground">
              Platform numbers may differ from GA4. That’s normal—they’re calculated differently.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Completeness</CardTitle>
          <CardDescription>
            We combine coverage, unknown volume, and diagnostics into a simple score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-semibold">{completenessScore}</p>
            </div>
            <div className="w-full max-w-sm">
              <Progress value={completenessScore} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">Market mapped</p>
              <p className="text-lg font-semibold">{market.coverageScore}%</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">Campaign joinable</p>
              <p className="text-lg font-semibold">{campaign.coverageScore}%</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">Channel mapped</p>
              <p className="text-lg font-semibold">{channel.coverageScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <StepFooter
        nextHref="/summary"
        nextLabel="Create view"
        secondaryAction={
          <Button variant="ghost" onClick={() => router.push(worstAccountHref)}>
            Fix Market mapping
          </Button>
        }
      />
    </Container>
  );
}
