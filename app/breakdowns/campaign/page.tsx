"use client";

import { useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

export default function CampaignBreakdownPage() {
  const router = useRouter();
  const {
    state: {
      breakdowns: {
        campaign: { normalizationOn, coverageScore },
      },
    },
    actions,
  } = useAppState();

  const computedCoverage = useMemo(() => {
    const base = 62;
    return normalizationOn ? base + 12 : base;
  }, [normalizationOn]);

  useEffect(() => {
    if (coverageScore !== computedCoverage) {
      actions.updateBreakdowns({
        campaign: {
          normalizationOn,
          coverageScore: computedCoverage,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverageScore, computedCoverage, normalizationOn]);

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Campaign results depend on consistent naming"
        description="Turn on normalization and review coverage so you know how reliable this breakdown will be."
      />
      <Card>
        <CardHeader>
          <CardTitle>Normalize names</CardTitle>
          <CardDescription>
            Lowercase, trim, and remove common prefixes to tidy campaign names across platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Normalize names (lowercase, trim, remove common prefixes)</p>
            <p className="text-sm text-muted-foreground">
              Helpful when platforms use slightly different naming for the same campaign.
            </p>
          </div>
          <Switch
            checked={normalizationOn}
            onCheckedChange={(checked) => {
              const base = 62;
              const nextCoverage = checked ? base + 12 : base;
              actions.updateBreakdowns({
                campaign: {
                  normalizationOn: Boolean(checked),
                  coverageScore: nextCoverage,
                },
              });
            }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coverage snapshot</CardTitle>
          <CardDescription>
            Campaign coverage is currently {computedCoverage}% reliable. Improve naming to increase reliability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Joinable</p>
              <p className="text-2xl font-semibold">{computedCoverage}%</p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={computedCoverage} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Google Ads</div>
                  <div className="text-sm text-muted-foreground">
                    Based on impression/click IDs
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">78%</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Meta</div>
                  <div className="text-sm text-muted-foreground">
                    Requires UTMs or meta campaign ID in GA4
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">54%</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground">
            Campaign breakdown relies on consistent naming. If coverage is low, improve your naming conventions or start with Market only.
          </p>
        </CardContent>
      </Card>
      <StepFooter
        nextHref="/summary"
        nextLabel="Continue"
        secondaryAction={
          <Button variant="ghost" onClick={() => router.push("/summary")}>
            Skip for now
          </Button>
        }
      />
    </Container>
  );
}
