"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { StepFooter } from "@/components/layout/step-footer";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GA4_PROPERTIES, COUNTRY_REGION_OPTIONS } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export default function Ga4Page() {
  const {
    state: {
      ga4: { configurations, selectedPropertyId },
    },
    actions,
  } = useAppState();
  
  const [currentConfigPropertyId, setCurrentConfigPropertyId] = useState<string | null>(
    selectedPropertyId || null
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get configuration for the currently selected property
  const currentConfig = configurations.find(c => c.propertyId === currentConfigPropertyId);
  const selectedProperty = GA4_PROPERTIES.find(p => p.id === currentConfigPropertyId);

  // Check if we have at least one configured property to enable navigation
  const hasConfiguredProperty = configurations.some(c => c.isConfigured);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAuthenticating(false);
    setIsAuthenticated(true);
  };

  const handlePropertySelect = (propertyId: string) => {
    // Only allow selection if no property is configured yet, or if selecting the already configured one
    const configuredProperty = configurations.find(c => c.isConfigured);
    if (configuredProperty && configuredProperty.propertyId !== propertyId) {
      return; // Don't allow selecting a different property if one is already configured
    }
    
    setCurrentConfigPropertyId(propertyId);
    actions.updateGa4({ selectedPropertyId: propertyId });
  };

  const handleBrandNameChange = (brandName: string) => {
    if (currentConfigPropertyId) {
      actions.updateGa4Property(currentConfigPropertyId, { brandName });
    }
  };

  const handleCountryRegionChange = (countryRegion: string) => {
    if (currentConfigPropertyId) {
      actions.updateGa4Property(currentConfigPropertyId, { countryRegion });
    }
  };

  const getPropertyStatus = (propertyId: string) => {
    const config = configurations.find(c => c.propertyId === propertyId);
    return config?.isConfigured ? "configured" : config ? "partial" : "not_started";
  };

  const getRadioIcon = (propertyId: string) => {
    const isSelected = selectedPropertyId === propertyId;
    return (
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
        isSelected 
          ? "border-primary bg-primary" 
          : "border-muted-foreground"
      )}>
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
    );
  };


  // Show authentication step first
  if (!isAuthenticated) {
    return (
      <Container className="space-y-8">
        <PageHeader
          title="Connect your GA4"
          description="Authenticate with Google Analytics to access your GA4 properties."
        />

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold">Google Analytics Authentication</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to your Google account to access GA4 properties
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">GA4</span>
                </div>
                <Button 
                  onClick={handleAuthenticate} 
                  disabled={isAuthenticating}
                  size="lg"
                  className="w-full"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    "Sign in with Google"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will open a secure Google sign-in window to authorize access to your GA4 data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <StepFooter
          nextHref="/accounts"
          nextDisabled={true}
          nextLabel="Next: Select ad accounts"
        />
      </Container>
    );
  }

  // Show property selection and configuration after authentication
  return (
    <Container className="space-y-8">
      <PageHeader
        title="Configure GA4 Property"
        description="Select your GA4 property and configure brand details for this Attribution View."
      />

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Left Panel - Property List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Select property</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select one property to configure for this brand
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {GA4_PROPERTIES.map((property) => {
              const isSelected = currentConfigPropertyId === property.id;
              const config = configurations.find(c => c.propertyId === property.id);
              const configuredProperty = configurations.find(c => c.isConfigured);
              const isSelectable = !configuredProperty || configuredProperty.propertyId === property.id;
              
              return (
                <div
                  key={property.id}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    isSelectable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : isSelectable 
                      ? "border-border hover:border-primary/50"
                      : "border-border"
                  )}
                  onClick={() => handlePropertySelect(property.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getRadioIcon(property.id)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{property.name}</p>
                        <p className="text-xs text-muted-foreground">{property.id}</p>
                        {config && (
                          <div className="mt-2 space-y-1">
                            {config.brandName && (
                              <p className="text-xs text-muted-foreground">
                                Brand: {config.brandName}
                              </p>
                            )}
                            {config.countryRegion && (
                              <p className="text-xs text-muted-foreground">
                                Market: {COUNTRY_REGION_OPTIONS.find(c => c.value === config.countryRegion)?.label}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Panel - Configuration Form */}
        <div className="space-y-6">
          {currentConfigPropertyId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Define Property
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure your brand details for <strong>{selectedProperty?.name}</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name / Brand</label>
                  <Input
                    value={currentConfig?.brandName || ""}
                    onChange={(e) => handleBrandNameChange(e.target.value)}
                    placeholder="Enter your brand name"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selectedProperty = GA4_PROPERTIES.find(p => p.id === selectedPropertyId);
                        if (selectedProperty) {
                          handleBrandNameChange(selectedProperty.name);
                        }
                      }}
                      className="text-xs h-7"
                    >
                      Use property name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleBrandNameChange("Attribution Onboarding")}
                      className="text-xs h-7"
                    >
                      Use workspace name
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Country / Region</label>
                  <Select
                    value={currentConfig?.countryRegion || ""}
                    onValueChange={handleCountryRegionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country or region" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Global & Regional
                        </p>
                      </div>
                      {COUNTRY_REGION_OPTIONS.filter(option => 
                        option.type === "global" || option.type === "regional"
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 mt-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Countries
                        </p>
                      </div>
                      {COUNTRY_REGION_OPTIONS.filter(option => 
                        option.type === "country"
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.label}</span>
                            {option.iso && (
                              <span className="text-xs text-muted-foreground">({option.iso})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the primary market this GA4 property represents
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Select a GA4 Property
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a property from the left panel to start configuration
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <StepFooter
        nextHref="/accounts"
        nextDisabled={!hasConfiguredProperty}
        nextLabel="Next: Select ad accounts"
      />
    </Container>
  );
}
