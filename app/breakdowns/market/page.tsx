"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAppState, Rule, AppState } from "@/lib/app-state";
import { CAMPAIGN_SAMPLES, MARKET_CODES } from "@/lib/mock-data";

const METHOD_DESCRIPTIONS: Record<string, string> = {
  platform_geo: "Recommended when accounts run per country.",
  naming_rules: "Match parts of campaign names to a market.",
  ga4_fallback: "Fallback when no platform geo exists.",
};

const METHOD_LABELS: Record<string, string> = {
  platform_geo: "Using platform geo",
  naming_rules: "Needs rules",
  ga4_fallback: "Using GA4 geography",
};

const STATUS_THRESHOLD = 85;

const formatPlatformLabel = (value: string) => value.replace(/_/g, " ");

type MarketMethod = keyof typeof METHOD_LABELS;
type MarketState = AppState["breakdowns"]["market"];

function makeRule(priority: number): Rule {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `rule-${priority}-${Math.random().toString(36).slice(2, 7)}`,
    type: "contains",
    value: "",
    output: MARKET_CODES[0] ?? "DE",
    priority,
  };
}

function calculateCoverage(method: string, ruleCount: number) {
  if (method === "platform_geo") return 0.97;
  if (method === "ga4_fallback") return 0.65;
  const base = 0.5 + ruleCount * 0.1;
  return Math.min(base, 0.85);
}

const SUGGESTED_RULES: Array<Pick<Rule, "type" | "value" | "output">> = [
  { type: "contains", value: "[de]", output: "DE" },
  { type: "prefix", value: "DE-", output: "DE" },
  { type: "contains", value: "[se]", output: "SE" },
  { type: "prefix", value: "ES-", output: "ES" },
];

export default function MarketBreakdownPage() {
  const router = useRouter();
  const {
    state: {
      accounts: { selected: linkedAccounts },
      breakdowns: { market: marketState },
      diagnostics,
    },
    actions,
  } = useAppState();

  const coverageSummaries = useMemo(() => {
    return linkedAccounts.map((account) => {
      const method = (marketState.perAccountMethod[account.id] ?? "platform_geo") as MarketMethod;
      const ruleCount = marketState.namingRules[account.id]?.length ?? 0;
      return {
        account,
        method,
        coverage: calculateCoverage(method, ruleCount),
      };
    });
  }, [linkedAccounts, marketState.perAccountMethod, marketState.namingRules]);

  const averageCoverage = useMemo(() => {
    if (coverageSummaries.length === 0) return 0;
    const total = coverageSummaries.reduce(
      (sum, item) => sum + item.coverage,
      0
    );
    return Math.round((total / coverageSummaries.length) * 100);
  }, [coverageSummaries]);

  useEffect(() => {
    if (averageCoverage !== marketState.coverageScore) {
      const nextMarket: MarketState = {
        ...marketState,
        coverageScore: averageCoverage,
      };
      actions.updateBreakdowns({
        market: nextMarket,
      });
    }
    const unknownMap = Object.fromEntries(
      coverageSummaries.map(({ account, coverage }) => [
        account.id,
        Math.max(0, Math.round((1 - coverage) * 100)),
      ])
    );
    const existing = diagnostics.unknownPercentByAccount ?? {};
    const hasSameEntries =
      Object.keys(existing).length === Object.keys(unknownMap).length &&
      Object.entries(unknownMap).every(
        ([key, value]) => existing[key] === value
      );
    if (!hasSameEntries) {
      actions.updateDiagnostics({
        unknownPercentByAccount: unknownMap,
      });
    }
  }, [actions, averageCoverage, coverageSummaries, diagnostics.unknownPercentByAccount, marketState]);

  const orderedAccounts = useMemo(() => {
    return [...coverageSummaries].sort((a, b) => a.coverage - b.coverage);
  }, [coverageSummaries]);

  const [activeAccountId, setActiveAccountId] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("account") ?? orderedAccounts[0]?.account.id ?? "";
    }
    return orderedAccounts[0]?.account.id ?? "";
  });

  useEffect(() => {
    if (!activeAccountId && orderedAccounts[0]) {
      setActiveAccountId(orderedAccounts[0].account.id);
    }
  }, [activeAccountId, orderedAccounts]);

  const activeAccountSummary = orderedAccounts.find(
    ({ account }) => account.id === activeAccountId
  );
  const activeAccount = activeAccountSummary?.account;
  const activeCoveragePct = activeAccountSummary
    ? Math.round(activeAccountSummary.coverage * 100)
    : 0;
  const activeMethod: MarketMethod = activeAccount
    ? ((marketState.perAccountMethod[activeAccount.id] ?? "platform_geo") as MarketMethod)
    : "platform_geo";
  const activeRules = activeAccount
    ? marketState.namingRules[activeAccount.id] ?? []
    : [];

  const platformSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        coverage: number;
        method: string;
        count: number;
      }
    >();
    coverageSummaries.forEach(({ account, coverage, method }) => {
      const existing = map.get(account.platform) ?? {
        coverage: 0,
        method,
        count: 0,
      };
      map.set(account.platform, {
        coverage: existing.coverage + coverage,
        method,
        count: existing.count + 1,
      });
    });
    return Array.from(map.entries()).map(([platform, value]) => {
      const avgCoverage = value.count ? value.coverage / value.count : 0;
      return {
        platform,
        coverage: Math.round(avgCoverage * 100),
        method: value.method,
      };
    });
  }, [coverageSummaries]);

  const methodLabel = METHOD_LABELS[activeMethod] ?? "Using platform geo";

  const setMethod = (accountId: string, method: MarketMethod) => {
    const updated = {
      ...(marketState.perAccountMethod as MarketState["perAccountMethod"]),
      [accountId]: method,
    } as MarketState["perAccountMethod"];
    const nextMarket: MarketState = {
      ...marketState,
      perAccountMethod: updated,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
  };

  const addRule = (accountId: string) => {
    const existing = marketState.namingRules[accountId] ?? [];
    const nextRule = makeRule(existing.length + 1);
    const updatedRules = {
      ...marketState.namingRules,
      [accountId]: [...existing, nextRule],
    } as MarketState["namingRules"];
    const nextMarket: MarketState = {
      ...marketState,
      namingRules: updatedRules,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
  };

  const updateRule = (
    accountId: string,
    ruleId: string,
    partial: Partial<Omit<Rule, "id" | "priority">>
  ) => {
    const existing = marketState.namingRules[accountId] ?? [];
    const updated = existing.map((rule) =>
      rule.id === ruleId
        ? {
            ...rule,
            ...partial,
          }
        : rule
    );
    const namingRules = {
      ...marketState.namingRules,
      [accountId]: updated,
    } as MarketState["namingRules"];
    const nextMarket: MarketState = {
      ...marketState,
      namingRules,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
  };

  const moveRule = (accountId: string, ruleId: string, direction: -1 | 1) => {
    const existing = marketState.namingRules[accountId] ?? [];
    const index = existing.findIndex((rule) => rule.id === ruleId);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= existing.length) return;
    const reordered = [...existing];
    const [rule] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, rule);
    const namingRules = {
      ...marketState.namingRules,
      [accountId]: reordered.map((item, idx) => ({
        ...item,
        priority: idx + 1,
      })),
    } as MarketState["namingRules"];
    const nextMarket: MarketState = {
      ...marketState,
      namingRules,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
  };

  const removeRule = (accountId: string, ruleId: string) => {
    const existing = marketState.namingRules[accountId] ?? [];
    const namingRules = {
      ...marketState.namingRules,
      [accountId]: existing.filter((rule) => rule.id !== ruleId),
    } as MarketState["namingRules"];
    const nextMarket: MarketState = {
      ...marketState,
      namingRules,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
  };

  const suggestRules = (accountId: string) => {
    const existing = marketState.namingRules[accountId] ?? [];
    if (existing.length >= SUGGESTED_RULES.length) {
      toast("Rules already cover the common tokens.");
      return;
    }
    const nextRules = SUGGESTED_RULES.map((rule, index) => ({
      id: `suggest-${index}-${rule.value}`,
      type: rule.type,
      value: rule.value,
      output: rule.output,
      priority: existing.length + index + 1,
    }));
    const namingRules = {
      ...marketState.namingRules,
      [accountId]: [...existing, ...nextRules],
    } as MarketState["namingRules"];
    const nextMarket: MarketState = {
      ...marketState,
      namingRules,
    };
    actions.updateBreakdowns({
      market: nextMarket,
    });
    toast.success("Suggested rules added. Tidy them up as needed.");
  };

  const applyRulesToPlatform = (accountId: string) => {
    const sourceAccount = linkedAccounts.find((account) => account.id === accountId);
    if (!sourceAccount) return;
    const templateMethod = (marketState.perAccountMethod[accountId] ?? "platform_geo") as MarketMethod;
    const templateRules = marketState.namingRules[accountId] ?? [];
    const updates = {
      ...marketState.namingRules,
    } as MarketState["namingRules"];
    linkedAccounts
      .filter((account) => account.platform === sourceAccount.platform)
      .forEach((account) => {
        updates[account.id] = templateRules.map((rule, index) => ({
          ...rule,
          id: `${rule.id}-${account.id}-${index}`,
          priority: index + 1,
        }));
      });
    const updatedNamingRules: MarketState["namingRules"] = {
      ...marketState.namingRules,
      ...updates,
    };
    const methodAssignments = Object.fromEntries(
      linkedAccounts
        .filter((account) => account.platform === sourceAccount.platform)
        .map((account) => [account.id, templateMethod])
    ) as Record<string, MarketMethod>;

    const updatedMethods = {
      ...(marketState.perAccountMethod as MarketState["perAccountMethod"]),
      ...methodAssignments,
    } as MarketState["perAccountMethod"];

    const nextMarket: MarketState = {
      ...marketState,
      perAccountMethod: updatedMethods,
      namingRules: updatedNamingRules,
    };

    actions.updateBreakdowns({
      market: nextMarket,
    });
    toast.success(
      `Applied rules to all ${formatPlatformLabel(sourceAccount.platform)}`
    );
  };

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Market coverage"
        description="Review the overall status, knock out the accounts that need attention, then confirm you’re happy with coverage."
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">
              {averageCoverage}% mapped · {Math.max(0, 100 - averageCoverage)}% needs setup
            </CardTitle>
            <CardDescription>
              We’ll start with the fastest option. Fix the accounts below to lift coverage.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-4">
            {platformSummaries.map((summary) => {
              const status = summary.coverage >= STATUS_THRESHOLD ? "✅ OK" : "⚠ Needs setup";
              return (
                <div key={summary.platform} className="flex items-center gap-2">
                  <Badge variant="outline">
                    {formatPlatformLabel(summary.platform)}
                  </Badge>
                  <span>
                    {summary.coverage}% ({METHOD_LABELS[summary.method] ?? "Using platform geo"}) {status}
                  </span>
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts needing setup</CardTitle>
          <CardDescription>
            We order these by lowest coverage so you always know what’s next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderedAccounts.map(({ account, method, coverage }) => {
            const coveragePct = Math.round(coverage * 100);
            const statusLabel = coveragePct >= STATUS_THRESHOLD ? "✅ OK" : "⚠ Needs setup";
            const samePlatformCount = linkedAccounts.filter(
              (item) => item.platform === account.platform
            ).length;
            const showApplyAll =
              samePlatformCount > 1 && method === "naming_rules" && coveragePct < STATUS_THRESHOLD;
            return (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {METHOD_LABELS[method] ?? "Using platform geo"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{coveragePct}%</Badge>
                  <Badge variant="outline">{statusLabel}</Badge>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveAccountId(account.id);
                      router.replace(`/breakdowns/market?account=${account.id}`);
                    }}
                  >
                    Fix
                  </Button>
                  {showApplyAll ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyRulesToPlatform(account.id)}
                    >
                      Apply to all {formatPlatformLabel(account.platform)}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
          {orderedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No accounts need setup. Nice work—head to coverage to finish up.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {activeAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>{activeAccount.name}</CardTitle>
            <CardDescription>
              Pick the mapping method, then add rules if you need more coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Mapping method</p>
              <RadioGroup
                value={activeMethod}
                onValueChange={(value) =>
                  setMethod(activeAccount.id, value as MarketMethod)
                }
                className="grid gap-3"
              >
                {[
                  { value: "platform_geo", label: "Use platform geo" },
                  { value: "naming_rules", label: "Add naming rules" },
                  { value: "ga4_fallback", label: "Use GA4 geography" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border/70 bg-muted/30 p-4"
                  >
                    <RadioGroupItem value={option.value} />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {METHOD_DESCRIPTIONS[option.value]}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="rounded-md border bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Coverage preview</p>
                  <p className="text-sm text-muted-foreground">
                    {methodLabel} · {activeCoveragePct}% mapped · {100 - activeCoveragePct}% needs setup
                  </p>
                </div>
                <Badge variant={activeCoveragePct >= STATUS_THRESHOLD ? "secondary" : "outline"}>
                  {activeCoveragePct >= STATUS_THRESHOLD ? "✅ OK" : "⚠ Needs setup"}
                </Badge>
              </div>
              <Progress value={activeCoveragePct} className="mt-3" />
            </div>

            {activeMethod === "naming_rules" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">Naming rules</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => suggestRules(activeAccount.id)}>
                      Suggest rules
                    </Button>
                    <Button size="sm" onClick={() => addRule(activeAccount.id)}>
                      Add rule
                    </Button>
                  </div>
                </div>
                {activeRules.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border/70 bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                    No rules yet. Add a couple to map your naming patterns.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeRules.map((rule, index) => (
                      <div key={rule.id} className="space-y-3 rounded-md border bg-card/60 p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Priority {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveRule(activeAccount.id, rule.id, -1)}
                              disabled={index === 0}
                              aria-label="Move rule up"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveRule(activeAccount.id, rule.id, 1)}
                              disabled={index === activeRules.length - 1}
                              aria-label="Move rule down"
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRule(activeAccount.id, rule.id)}
                              aria-label="Remove rule"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Match type</label>
                            <Select
                              value={rule.type}
                              onValueChange={(value) =>
                                updateRule(activeAccount.id, rule.id, {
                                  type: value as Rule["type"],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "prefix",
                                  "suffix",
                                  "bracketed",
                                  "contains",
                                  "delimited",
                                  "regex",
                                ].map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Pattern</label>
                            <Input
                              value={rule.value}
                              onChange={(event) =>
                                updateRule(activeAccount.id, rule.id, {
                                  value: event.target.value,
                                })
                              }
                              placeholder="e.g. DE-"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Market</label>
                            <Select
                              value={rule.output}
                              onValueChange={(value) =>
                                updateRule(activeAccount.id, rule.id, {
                                  output: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MARKET_CODES.map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Sample campaign names</p>
                  <div className="space-y-2">
                    {CAMPAIGN_SAMPLES.map((sample) => (
                      <div
                        key={sample}
                        className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                      >
                        <span>{sample}</span>
                        <Badge variant="secondary">
                          {activeRules[0]?.output ?? MARKET_CODES[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyRulesToPlatform(activeAccount.id)}
                  >
                    Apply these rules to all {formatPlatformLabel(activeAccount.platform)}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <StepFooter nextHref="/coverage" nextLabel="Check coverage" />
    </Container>
  );
}
