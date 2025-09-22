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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppState, PlatformKey } from "@/lib/app-state";

const DEFAULT_CHANNEL: Record<PlatformKey, string> = {
  google_ads: "Paid Search",
  meta: "Paid Social",
  tiktok: "Paid Social",
  linkedin: "Paid Social",
};

const CHANNEL_OPTIONS = [
  "Paid Search",
  "Paid Social",
  "Video",
  "Display",
  "Affiliate",
  "Other",
];

function calculateChannelCoverage(
  overrides: Record<string, string>,
  platforms: PlatformKey[]
) {
  const base = 92;
  const uniqueOverrides = Object.entries(overrides)
    .filter(([platform]) => platforms.includes(platform as PlatformKey))
    .map(([, value]) => value.toLowerCase());
  const adjustments = Math.max(0, new Set(uniqueOverrides).size - platforms.length);
  return Math.max(85, base - adjustments * 3);
}

export default function ChannelBreakdownPage() {
  const router = useRouter();
  const {
    state: {
      accounts: { selected: linkedAccounts },
      breakdowns: { channel },
    },
    actions,
  } = useAppState();

  const platformsInUse = Array.from(
    new Set(linkedAccounts.map((account) => account.platform))
  ) as PlatformKey[];

  const overrides = channel.overrides;
  const coverage = useMemo(
    () => calculateChannelCoverage(overrides, platformsInUse),
    [overrides, platformsInUse]
  );

  useEffect(() => {
    if (channel.coverageScore !== coverage) {
      actions.updateBreakdowns({
        channel: {
          overrides,
          coverageScore: coverage,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverage, overrides, channel.coverageScore]);

  const handleOverride = (platform: PlatformKey, value: string) => {
    const nextOverrides = {
      ...overrides,
      [platform]: value,
    } as Record<PlatformKey, string>;
    const nextCoverage = calculateChannelCoverage(nextOverrides, platformsInUse);
    actions.updateBreakdowns({
      channel: {
        overrides: nextOverrides,
        coverageScore: nextCoverage,
      },
    });
  };

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Channel mapping"
        description="We automatically detect channels for most platforms. Adjust any edge cases here."
      />
      <Card>
        <CardHeader>
          <CardTitle>Default mapping</CardTitle>
          <CardDescription>
            Review the defaults and override only when a platform serves multiple buying motions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Current channel</TableHead>
                <TableHead className="text-right">Override</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformsInUse.map((platform) => (
                <TableRow key={platform}>
                  <TableCell className="font-medium capitalize">
                    {platform.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {overrides[platform] ?? DEFAULT_CHANNEL[platform]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={overrides[platform] ?? DEFAULT_CHANNEL[platform]}
                      onValueChange={(value) =>
                        handleOverride(platform, value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {platformsInUse.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No platforms connected yet. Add accounts earlier in the flow to configure channel mapping.
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coverage</CardTitle>
          <CardDescription>
            Mocked share of spend automatically attributed to a channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mapped</p>
              <p className="text-2xl font-semibold">{coverage}%</p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={coverage} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Most coverage comes from defaults. Overrides help tidy edge cases without dropping trust in the numbers.
          </p>
        </CardContent>
      </Card>
      <StepFooter
        nextHref="/coverage"
        nextLabel="Check coverage"
        secondaryAction={
          <Button variant="ghost" onClick={() => router.push("/coverage")}>I’ll do this later</Button>
        }
      />
    </Container>
  );
}
