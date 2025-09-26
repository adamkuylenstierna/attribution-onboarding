"use client";

import { useState, useEffect, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { useAppState, PlatformKey } from "@/lib/app-state";

// Mock UTM mapping data
interface UTMMapping {
  id: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  channelGroup: string;
  channel: string;
}

const MOCK_UTM_MAPPINGS: UTMMapping[] = [
  {
    id: "1",
    utmSource: "Trustpilot",
    utmMedium: "",
    utmCampaign: "",
    channelGroup: "Referral",
    channel: "Trustpilot"
  },
  {
    id: "2", 
    utmSource: "Yandex",
    utmMedium: "CPC",
    utmCampaign: "",
    channelGroup: "Search paid",
    channel: "Yandex"
  },
  {
    id: "3",
    utmSource: "Pricerunner",
    utmMedium: "CPC", 
    utmCampaign: "",
    channelGroup: "Price comparison",
    channel: "Pricerunner"
  },
  {
    id: "4",
    utmSource: "Klarna",
    utmMedium: "Referral",
    utmCampaign: "",
    channelGroup: "Referral", 
    channel: "Klarna"
  },
  {
    id: "5",
    utmSource: "Wordseed",
    utmMedium: "CPC",
    utmCampaign: "",
    channelGroup: "Affiliate",
    channel: "Wordseed"
  },
  {
    id: "6",
    utmSource: "Customer newsletter",
    utmMedium: "Email",
    utmCampaign: "",
    channelGroup: "CRM",
    channel: "Newsletter"
  },
  {
    id: "7",
    utmSource: "Rule",
    utmMedium: "Email", 
    utmCampaign: "",
    channelGroup: "CRM",
    channel: "Transaction"
  }
];

const CHANNEL_GROUPS = [
  "Referral",
  "Search paid", 
  "Price comparison",
  "Affiliate",
  "CRM",
  "Display",
  "Social paid",
  "Other"
];

const CHANNELS = [
  "Trustpilot",
  "Yandex", 
  "Pricerunner",
  "Klarna",
  "Wordseed",
  "Newsletter",
  "Transaction",
  "Facebook",
  "Google",
  "Other"
];

export default function ChannelBreakdownPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<UTMMapping[]>(MOCK_UTM_MAPPINGS);
  const [selectedBrand, setSelectedBrand] = useState("Diesel.com");

  const updateMapping = (id: string, field: keyof UTMMapping, value: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };

  const deleteMapping = (id: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  return (
    <Container className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Mapping"
          description="Manage how your web site traffic should be assigned to different channel groups and channels based on UTM parameters"
        />
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Diesel.com">Diesel.com</SelectItem>
            <SelectItem value="Other.com">Other.com</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="unmapped" className="w-full">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="unmapped">Unmapped traffic</TabsTrigger>
          <TabsTrigger value="existing">Existing mappings</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-6">
            Note that created mappings will only be applied to future visits and not to past visits before the mapping was created.
          </p>

          <TabsContent value="unmapped" className="mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                <div>UTM source</div>
                <div>UTM medium</div>
                <div>UTM campaign</div>
                <div>Channel group</div>
                <div>Channel</div>
                <div></div>
              </div>

              {mappings.map((mapping) => (
                <div key={mapping.id} className="grid grid-cols-6 gap-4 items-center">
                  <div className="bg-muted rounded px-3 py-2 text-sm">
                    {mapping.utmSource}
                  </div>
                  <div className="bg-muted rounded px-3 py-2 text-sm">
                    {mapping.utmMedium}
                  </div>
                  <div className="bg-muted rounded px-3 py-2 text-sm">
                    {mapping.utmCampaign}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">→</span>
                    <Select 
                      value={mapping.channelGroup} 
                      onValueChange={(value) => updateMapping(mapping.id, 'channelGroup', value)}
                    >
                      <SelectTrigger className="bg-blue-100 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select 
                      value={mapping.channel} 
                      onValueChange={(value) => updateMapping(mapping.id, 'channel', value)}
                    >
                      <SelectTrigger className="bg-blue-100 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNELS.map((channel) => (
                          <SelectItem key={channel} value={channel}>
                            {channel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMapping(mapping.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="existing" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              <p>No existing mappings configured yet.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <StepFooter
        nextHref="/summary"
        nextLabel="Save mappings"
        secondaryAction={
          <Button variant="ghost" onClick={() => router.push("/summary")}>
            Skip for now
          </Button>
        }
      />
    </Container>
  );
}
