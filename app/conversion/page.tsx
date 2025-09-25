"use client";
import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  GA4_EVENT_OPTIONS, 
  DETECTED_PLATFORMS, 
  PLATFORM_CONVERSION_EVENTS, 
  SMART_EVENT_MAPPING,
  GA4_PROPERTIES,
  COUNTRY_REGION_OPTIONS
} from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { CheckCircle, ArrowRight, Target, Link as LinkIcon, Edit2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConversionPage() {
  const {
    state: {
      ga4,
      accounts: { platformConnections },
      conversion: { mainGa4Event, platformEventMap },
    },
    actions,
  } = useAppState();

  // Get connected platforms
  const connectedPlatforms = DETECTED_PLATFORMS.filter(platform => {
    const connection = platformConnections[platform.id];
    return connection?.isConnected && connection.selectedAccounts.length > 0;
  });

  // Get the configured GA4 property for context
  const configuredGA4 = ga4.configurations.find(c => c.isConfigured);
  const ga4Property = configuredGA4 ? GA4_PROPERTIES.find(p => p.id === configuredGA4.propertyId) : null;

  // Smart default: suggest the highest count main conversion event
  const suggestedMainEvent = useMemo(() => {
    const mainConversions = GA4_EVENT_OPTIONS.filter(event => event.type === "main_conversion");
    return mainConversions.sort((a, b) => b.count - a.count)[0];
  }, []);

  // Initialize with smart defaults if not set
  const selectedMainEvent = mainGa4Event || suggestedMainEvent?.value;

  const handleMainEventChange = (eventValue: string) => {
    actions.updateConversion({ mainGa4Event: eventValue });
    
    // Auto-update platform mappings with smart suggestions
    if (SMART_EVENT_MAPPING[eventValue as keyof typeof SMART_EVENT_MAPPING]) {
      const smartMappings = SMART_EVENT_MAPPING[eventValue as keyof typeof SMART_EVENT_MAPPING];
      const newPlatformEventMap: Record<string, string> = {};
      
      connectedPlatforms.forEach(platform => {
        if (smartMappings[platform.id as keyof typeof smartMappings]) {
          newPlatformEventMap[platform.id] = smartMappings[platform.id as keyof typeof smartMappings];
        }
      });
      
      actions.updateConversion({ platformEventMap: newPlatformEventMap });
    }
  };

  const handlePlatformEventChange = (platformId: string, eventValue: string) => {
    actions.updateConversion({
      platformEventMap: {
        ...platformEventMap,
        [platformId]: eventValue,
      },
    });
  };

  // Check if GA4 is confirmed and all platform mappings are complete
  const isGA4Confirmed = !!mainGa4Event;
  const allMappingsComplete = connectedPlatforms.every(platform => 
    platformEventMap[platform.id] && platformEventMap[platform.id] !== ""
  );

  const canProceed = isGA4Confirmed && allMappingsComplete;

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Define your main conversion"
        description="Select your GA4 conversion event and confirm equivalent events across your platforms."
      />

      {selectedMainEvent ? (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* GA4 Event Selection - Left Side */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  GA4
                </div>
                Main Conversion Event
              </CardTitle>
              <CardDescription>
                Your primary conversion event
              </CardDescription>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Event counts from last 30 days</span>
              </div>
            </CardHeader>
            
            <CardContent>
              {(() => {
                const selectedEvent = GA4_EVENT_OPTIONS.find(e => e.value === selectedMainEvent);
                return (
                  <div className="relative">
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border transition-all duration-300",
                      isGA4Confirmed ? "border-green-200 bg-green-50/50" : "border-border"
                    )}>
                      {/* GA4 Info */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          GA4
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                      {/* Event Selection */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-medium text-sm truncate">
                          {selectedEvent?.label}
                        </span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {selectedEvent?.count.toLocaleString()}
                        </Badge>
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isGA4Confirmed ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium hidden sm:inline">Confirmed</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                actions.updateConversion({ mainGa4Event: undefined });
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Confirm the selected event
                              actions.updateConversion({ mainGa4Event: selectedMainEvent });
                            }}
                            className="h-7 px-3 text-xs"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Platform Event Mapping - Right Side */}
          {connectedPlatforms.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Platform Event Mapping
                </CardTitle>
                <CardDescription>
                  Equivalent events across your connected platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedPlatforms.map((platform, index) => {
                    const platformEvents = PLATFORM_CONVERSION_EVENTS[platform.id as keyof typeof PLATFORM_CONVERSION_EVENTS] || [];
                    const currentMapping = platformEventMap[platform.id];
                    const smartMapping = SMART_EVENT_MAPPING[selectedMainEvent as keyof typeof SMART_EVENT_MAPPING]?.[platform.id as keyof typeof SMART_EVENT_MAPPING[keyof typeof SMART_EVENT_MAPPING]];
                    const suggestedEvent = currentMapping || smartMapping;
                    const mappedEvent = platformEvents.find(e => e.value === suggestedEvent);
                    const isLinkedIn = platform.id === 'linkedin';
                    const isConfigured = !!currentMapping;
                    
                    // Mock event counts for platforms
                    const platformEventCount = selectedMainEvent === 'purchase' ? 
                      (platform.id === 'google_ads' ? 312 : platform.id === 'meta' ? 298 : platform.id === 'tiktok' ? 156 : 89) :
                      selectedMainEvent === 'lead_submit' ?
                      (platform.id === 'google_ads' ? 89 : platform.id === 'meta' ? 76 : platform.id === 'tiktok' ? 45 : 234) :
                      (platform.id === 'google_ads' ? 67 : platform.id === 'meta' ? 54 : platform.id === 'tiktok' ? 32 : 123);
                    
                    return (
                      <div
                        key={platform.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                          isConfigured ? "border-green-200 bg-green-50/50" : "border-border",
                          "animate-in slide-in-from-right-4"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Platform Info */}
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", platform.color)}>
                            {platform.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platformConnections[platform.id]?.selectedAccounts?.length || 0} account{(platformConnections[platform.id]?.selectedAccounts?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Event Mapping */}
                        <div className="flex-1 flex items-center gap-3">
                          {isLinkedIn ? (
                            <Select
                              value={currentMapping || ""}
                              onValueChange={(value) => handlePlatformEventChange(platform.id, value)}
                              disabled={!isGA4Confirmed}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select event" />
                              </SelectTrigger>
                              <SelectContent>
                                {platformEvents.map((event) => (
                                  <SelectItem key={event.value} value={event.value}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{event.label}</span>
                                      {event.value === smartMapping && (
                                        <Badge variant="outline" className="text-xs ml-2">Suggested</Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="font-medium text-sm">
                              {mappedEvent?.label || suggestedEvent}
                            </span>
                          )}
                          
                          <Badge variant="secondary" className="text-xs">
                            {platformEventCount.toLocaleString()} events
                          </Badge>
                        </div>

                        {/* Status & Action */}
                        <div className="flex items-center gap-2">
                          {isConfigured ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">Confirmed</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                // Auto-confirm the smart mapping
                                handlePlatformEventChange(platform.id, suggestedEvent || smartMapping);
                              }}
                              disabled={!isGA4Confirmed}
                              className="h-7 px-3 text-xs"
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No Platforms Connected
                </p>
                <p className="text-sm text-muted-foreground">
                  Go back to connect your advertising platforms to enable event mapping
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                GA4
              </div>
              Main Conversion Event
            </CardTitle>
            <CardDescription>
              Select your primary conversion event from GA4
            </CardDescription>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Event counts from last 30 days</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {GA4_EVENT_OPTIONS.filter(event => event.type === "main_conversion").map((event) => (
                <div
                  key={event.value}
                  className={cn(
                    "rounded-lg border p-4 transition-all duration-200 cursor-pointer hover:border-primary/50 hover:shadow-sm",
                    "border-border"
                  )}
                  onClick={() => handleMainEventChange(event.value)}
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        GA4
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <p className="font-medium text-sm">{event.label}</p>
                        {event.value === suggestedMainEvent?.value && (
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 bg-muted/50 rounded text-center">
                        <Badge variant="secondary" className="text-xs">
                          {event.count.toLocaleString()} events
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StepFooter
        nextHref="/breakdown-hub"
        nextDisabled={!canProceed}
        nextLabel="Next: Set up breakdowns"
      />
    </Container>
  );
}
