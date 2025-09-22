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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GA4_EVENT_OPTIONS, PLATFORM_EVENT_OPTIONS } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";

export default function ConversionPage() {
  const {
    state: {
      accounts: { selected: linkedAccounts },
      conversion: { mainGa4Event, platformEventMap, hasRevenue },
    },
    actions,
  } = useAppState();

  const nextHref = "/breakdown-hub";

  const handleGa4Change = (value: string) => {
    actions.updateConversion({
      mainGa4Event: value,
      hasRevenue: value === "purchase",
    });
  };

  const handleMapChange = (accountId: string, value: string) => {
    actions.updateConversion({
      platformEventMap: {
        ...platformEventMap,
        [accountId]: value,
      },
    });
  };

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Select your main conversion"
        description="We'll use this for CPA (and ROAS if revenue is tracked)."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">GA4 conversion event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">GA4 event</label>
                <Select
                  value={mainGa4Event}
                  onValueChange={handleGa4Change}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {GA4_EVENT_OPTIONS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Track revenue for ROAS</p>
                  <p className="text-xs text-muted-foreground">
                    Available when your GA4 event contains revenue parameters
                  </p>
                </div>
                <Switch
                  checked={hasRevenue}
                  onCheckedChange={(checked) =>
                    actions.updateConversion({ hasRevenue: Boolean(checked) })
                  }
                  disabled={mainGa4Event !== "purchase"}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Platform event mapping (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Platform event</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedAccounts.map((account) => {
                    const mappedValue = platformEventMap[account.id] ?? "Purchase";
                    const isUnmapped = mappedValue === "None";
                    return (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {account.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mappedValue}
                            onValueChange={(value) => handleMapChange(account.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLATFORM_EVENT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          {isUnmapped ? (
                            <Badge variant="outline" className="text-xs">Comparison off</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Comparing</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {linkedAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No accounts selected yet. Head back to connect at least one account.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-dashed border-border/70 bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Context</p>
          <p className="mt-2 text-muted-foreground">
            GA4 and platform numbers are calculated differently. Small differences are normal.
          </p>
        </div>
      </div>
      <StepFooter
        nextHref={nextHref}
        nextDisabled={!mainGa4Event}
        nextLabel="Next: Set up breakdowns"
      />
    </Container>
  );
}
