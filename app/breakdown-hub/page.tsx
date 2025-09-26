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
import { CheckCircle, Circle, Settings, BarChart3, Loader2 } from "lucide-react";

interface BreakdownOption {
  key: "market" | "campaign" | "channel";
  title: string;
  description: string;
  healthScore: number;
  isDefault: boolean;
  isOptional: boolean;
  issues?: string[];
  path: string;
}

// Breakdown options with data quality insights
const getBreakdownOptions = (): BreakdownOption[] => [
  {
    key: "channel",
    title: "Channel",
    description: "Compare Paid Search, Paid Social, Video, etc.",
    healthScore: 94,
    isDefault: true,
    isOptional: false,
    path: "/breakdowns/channel",
  },
  {
    key: "market",
    title: "Market", 
    description: "Compare results by country/region.",
    healthScore: 23,
    isDefault: false,
    isOptional: true,
    issues: ["Some campaigns missing geo UTM parameters", "Platform geo data needs alignment"],
    path: "/breakdowns/market",
  },
  {
    key: "campaign",
    title: "Campaign",
    description: "Compare results by campaign name.",
    healthScore: 31,
    isDefault: false,
    isOptional: true,
    issues: ["Campaign naming could be more consistent", "Some GA4 campaigns need mapping"],
    path: "/breakdowns/campaign",
  },
];

function getDataQuality(score: number): "good" | "needs_improvement" {
  return score >= 90 ? "good" : "needs_improvement";
}

function getBreakdownIcon(breakdown: BreakdownOption) {
  if (breakdown.isDefault) {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  }
  const quality = getDataQuality(breakdown.healthScore);
  return quality === "good" 
    ? <CheckCircle className="h-4 w-4 text-green-600" />
    : <Circle className="h-4 w-4 text-slate-400" />;
}

function getQualityBadge(breakdown: BreakdownOption) {
  if (breakdown.isDefault) {
    return <Badge variant="outline" className="text-green-700 border-green-300">Default view</Badge>;
  }
  const quality = getDataQuality(breakdown.healthScore);
  return quality === "good" 
    ? <Badge variant="outline" className="text-green-700 border-green-300">Ready to use</Badge>
    : <Badge variant="outline" className="text-slate-600 border-slate-300">Needs setup</Badge>;
}

export default function BreakdownHubPage() {
  const {
    state: { breakdownHub },
    actions,
  } = useAppState();

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [healthData, setHealthData] = useState<BreakdownOption[]>([]);

  // Simulate data analysis loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHealthData(getBreakdownOptions());
      setIsAnalyzing(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing) {
    return (
      <Container className="space-y-8">
        <PageHeader
          title="Analyzing your data"
          description="We're checking data quality for different ways to view your attribution results."
        />

        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          </div>
          <div className="text-center space-y-2">
                <p className="text-lg font-medium">Analyzing data quality...</p>
                <p className="text-sm text-muted-foreground">
                  Checking how your data works with different breakdown views
                </p>
          </div>
        </div>
      </Container>
    );
  }

  const defaultBreakdowns = healthData.filter(b => b.isDefault);
  const optionalBreakdowns = healthData.filter(b => b.isOptional);
  const readyBreakdowns = healthData.filter(b => getDataQuality(b.healthScore) === "good");
  const hasReadyBreakdowns = readyBreakdowns.length > 0;

  return (
    <Container className="space-y-6">
      <PageHeader
        title="Choose your breakdown views"
        description="Select how you want to analyze your attribution data. Channel is included by default, Market and Campaign are optional."
      />

      {/* Default breakdown */}
      {defaultBreakdowns.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Default view
            </h2>
            <p className="text-sm text-muted-foreground">
              This breakdown is included in your attribution dashboard by default.
            </p>
          </div>
          
          {defaultBreakdowns.map((breakdown) => (
            <div
              key={breakdown.key}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50/30"
            >
              <div className="flex items-center gap-3 flex-1">
                {getBreakdownIcon(breakdown)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{breakdown.title}</h3>
                    <span className="text-sm font-medium text-slate-600">
                      {breakdown.healthScore}% data quality
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
                {getQualityBadge(breakdown)}
                <Link href={breakdown.path}>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Optional breakdowns */}
      {optionalBreakdowns.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Circle className="h-5 w-5 text-slate-400" />
              Optional views
            </h2>
            <p className="text-sm text-muted-foreground">
              Add these breakdowns to get more detailed insights. You can set them up now or add them later.
            </p>
          </div>
          
          {optionalBreakdowns.map((breakdown) => (
            <div
              key={breakdown.key}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50/30"
            >
              <div className="flex items-center gap-3 flex-1">
                {getBreakdownIcon(breakdown)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{breakdown.title}</h3>
                    <span className="text-sm font-medium text-slate-600">
                      {breakdown.healthScore}% data quality
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{breakdown.description}</p>
                  {breakdown.issues && (
                    <p className="text-xs text-slate-600 mt-1">
                      {breakdown.issues[0]} {breakdown.issues.length > 1 && `+${breakdown.issues.length - 1} more`}
                    </p>
                  )}
                </div>
                <div className="w-24 mr-4">
                  <Progress 
                    value={breakdown.healthScore} 
                    className="h-2 [&>div]:bg-slate-400"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getQualityBadge(breakdown)}
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Add later
                </Button>
                <Link href={breakdown.path}>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Set up now
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
        
        <Link href="/dashboard">
          <Button>
            View Attribution Dashboard
          </Button>
        </Link>
      </div>
    </Container>
  );
}
