import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <Container className="space-y-8">
      <section className="space-y-6">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Prototype
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Create an Attribution View</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Validate the copy and flow for configuring attribution in minutes. We keep everything local, so feel free to explore different setups and diagnostics.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/settings">Start onboarding</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Preview dashboard</Link>
          </Button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audience</CardTitle>
            <CardDescription>
              Mid-market marketers and PMs configuring a single brand with multiple markets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Clarity over magic: no hidden steps.</p>
            <p>- Fast first value: Market first, others optional.</p>
            <p>- Trust via diagnostics: always show coverage gaps.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Flow overview</CardTitle>
            <CardDescription>
              Settings overview &gt; GA4 &gt; Accounts &gt; Conversion &gt; Breakdowns &gt; Summary &gt; Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Use mocked data, local state, and guardrails that mirror the real product.</p>
            <p>A reset button is available in the header for quick test runs.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
