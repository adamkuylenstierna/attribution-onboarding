"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppState, BreakdownStatus } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, AlertTriangle, Settings, BarChart3, Loader2 } from "lucide-react";

interface BreakdownHealth {
  key: "market" | "campaign" | "channel";
  title: string;
  description: string;
  healthScore: number;
  issues?: string[];
  path: string;
}

// Mock health data - in real app this would come from data analysis
const getBreakdownHealth = (): BreakdownHealth[] => [
  {
    key: "channel",
    title: "Channel",
    description: "Compare Paid Search, Paid Social, Video, etc.",
    healthScore: 94,
    path: "/breakdowns/channel",
  },
  {
    key: "market",
    title: "Market", 
    description: "Compare results by country/region.",
    healthScore: 23,
    issues: ["67% of campaigns missing geo UTM parameters", "Platform geo data inconsistent"],
    path: "/breakdowns/market",
  },
  {
    key: "campaign",
    title: "Campaign",
    description: "Compare results by campaign name.",
    healthScore: 31,
    issues: ["Campaign naming inconsistent across platforms", "42% of GA4 campaigns unmapped"],
    path: "/breakdowns/campaign",
  },
];

function getHealthStatus(score: number): "healthy" | "needs_work" {
  return score >= 90 ? "healthy" : "needs_work";
}

function getHealthIcon(score: number) {
  const status = getHealthStatus(score);
  return status === "healthy" 
    ? <CheckCircle className="h-5 w-5 text-green-600" />
    : <AlertTriangle className="h-5 w-5 text-amber-500" />;
}

function getHealthBadge(score: number) {
  const status = getHealthStatus(score);
  return status === "healthy" 
    ? <Badge variant="outline" className="text-green-700 border-green-300">Ready to use</Badge>
    : <Badge variant="outline" className="text-amber-700 border-amber-300">Poor coverage</Badge>;
}

export default function BreakdownHubPage() {
  const {
    state: { breakdownHub },
    actions,
  } = useAppState();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [healthData, setHealthData] = useState<BreakdownHealth[]>([]);

  // Simulate data analysis loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHealthData(getBreakdownHealth());
      setIsAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing) {
    return (
      <Container className="space-y-8">
        <PageHeader
          title="Analyzing your data"
          description="We're checking how well your GA4 and platform data align for each breakdown type."
        />

        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Analyzing data alignment...</p>
            <p className="text-sm text-muted-foreground">
              Checking UTM parameters, campaign naming, and platform mappings
            </p>
          </div>
        </div>
      </Container>
    );
  }

  const healthyBreakdowns = healthData.filter(b => getHealthStatus(b.healthScore) === "healthy");
  const needsWorkBreakdowns = healthData.filter(b => getHealthStatus(b.healthScore) === "needs_work");
  const hasHealthyBreakdowns = healthyBreakdowns.length > 0;

  return (
    <Container className="space-y-6">
      <PageHeader
        title="Breakdown Health Analysis"
        description="Based on your GA4 and platform data alignment, here's what's ready to use and what needs fixing."
      />

      {/* Ready breakdowns */}
      {healthyBreakdowns.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Ready
            </h2>
            <p className="text-sm text-muted-foreground">
              These breakdowns are good enough to use immediately for reliable insights.
            </p>
          </div>
          
          {healthyBreakdowns.map((breakdown) => (
            <div
              key={breakdown.key}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{breakdown.title}</h3>
                    <span className="text-sm font-medium text-green-700">
                      {breakdown.healthScore}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{breakdown.description}</p>
                </div>
                <div className="w-24 mr-4">
                  <Progress 
                    value={breakdown.healthScore} 
                    className="h-2 [&>div]:bg-green-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  Ready to use
                </Badge>
                <Link href={breakdown.path}>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Improve mapping
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poor coverage breakdowns */}
      {needsWorkBreakdowns.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Poor coverage
            </h2>
            <p className="text-sm text-muted-foreground">
              These dimensions need your input to work well. You can fix them now or skip for later.
            </p>
          </div>
          
          {needsWorkBreakdowns.map((breakdown) => (
            <div
              key={breakdown.key}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{breakdown.title}</h3>
                    <span className="text-sm font-medium text-amber-700">
                      {breakdown.healthScore}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{breakdown.description}</p>
                  {breakdown.issues && (
                    <p className="text-xs text-amber-700 mt-1">
                      {breakdown.issues[0]} {breakdown.issues.length > 1 && `+${breakdown.issues.length - 1} more`}
                    </p>
                  )}
                </div>
                <div className="w-24 mr-4">
                  <Progress 
                    value={breakdown.healthScore} 
                    className="h-2 [&>div]:bg-amber-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                  Poor coverage
                </Badge>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Skip for now
                </Button>
                <Link href={breakdown.path}>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Fix issues
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Link href="/settings">
          <Button variant="ghost">
            Attribution Settings
          </Button>
        </Link>
        
        <Link href={hasHealthyBreakdowns ? "/dashboard" : "/settings"}>
          <Button>
            {hasHealthyBreakdowns ? "View Attribution Dashboard" : "Back to Settings"}
          </Button>
        </Link>
      </div>
    </Container>
  );
}
