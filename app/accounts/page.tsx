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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DETECTED_PLATFORMS, PLATFORM_AD_ACCOUNTS, GA4_PROPERTIES, COUNTRY_REGION_OPTIONS } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountsPage() {
  const {
    state: {
      ga4,
      accounts: { platformConnections },
    },
    actions,
  } = useAppState();

  const [authenticatingPlatform, setAuthenticatingPlatform] = useState<string | null>(null);
  const [showAccountSelection, setShowAccountSelection] = useState<string | null>(null);

  // Get the configured GA4 property for context
  const configuredGA4 = ga4.configurations.find(c => c.isConfigured);
  const ga4Property = configuredGA4 ? GA4_PROPERTIES.find(p => p.id === configuredGA4.propertyId) : null;

  const handlePlatformConnect = async (platformId: string) => {
    setAuthenticatingPlatform(platformId);
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    actions.updatePlatformConnection(platformId, {
      isAuthenticated: true,
      linkLater: false, // Reset link later state when connecting
    });
    
    setAuthenticatingPlatform(null);
    setShowAccountSelection(platformId);
  };

  const handleAccountSelection = (platformId: string, accountIds: string[]) => {
    const platformAccounts = PLATFORM_AD_ACCOUNTS[platformId as keyof typeof PLATFORM_AD_ACCOUNTS] || [];
    const selectedAccounts = platformAccounts.filter(acc => accountIds.includes(acc.id));
    
    actions.updatePlatformConnection(platformId, {
      isConnected: true,
      selectedAccounts,
    });
    
    setShowAccountSelection(null);
  };

  const handleLinkLater = (platformId: string) => {
    actions.updatePlatformConnection(platformId, {
      isConnected: false,
      isAuthenticated: false,
      linkLater: true, // Add explicit "link later" state
    });
  };

  const getPlatformStatus = (platformId: string) => {
    const connection = platformConnections[platformId];
    if (!connection) return "not_started";
    if (connection.isConnected && connection.selectedAccounts.length > 0) return "connected";
    if (connection.isAuthenticated) return "authenticated";
    if (connection.linkLater) return "link_later";
    return "not_started";
  };


  const getStatusBadge = (platformId: string) => {
    const status = getPlatformStatus(platformId);
    const connection = platformConnections[platformId];
    
    switch (status) {
      case "connected":
        const accountCount = connection?.selectedAccounts.length || 0;
        return <Badge variant="default" className="text-xs">{accountCount} linked</Badge>;
      case "authenticated":
        return <Badge variant="secondary" className="text-xs">Select accounts</Badge>;
      case "link_later":
        return <Badge variant="outline" className="text-xs text-muted-foreground">Skipped</Badge>;
      case "not_started":
      default:
        return null;
    }
  };

  // Check if we can proceed (all platforms are either connected or marked as "link later")
  const allPlatforms = DETECTED_PLATFORMS;
  const canProceed = allPlatforms.every(platform => {
    const connection = platformConnections[platform.id];
    return connection && (connection.isConnected || connection.isAuthenticated === false);
  });

  const totalLinkedAccounts = Object.values(platformConnections).reduce((sum, conn) => 
    sum + (conn?.selectedAccounts?.length || 0), 0
  );

  return (
    <>
      <Container className="space-y-8">
        <PageHeader
          title="Link ad platforms"
          description="Connect the advertising platforms detected in your GA4 data to enable complete attribution tracking."
        />

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Context Panel - GA4 Property Overview */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  GA4
                </div>
                {configuredGA4?.brandName || "GA4 Property"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {configuredGA4 && ga4Property ? (
                <>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{ga4Property.name} · {ga4Property.id}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Market: {COUNTRY_REGION_OPTIONS.find(c => c.value === configuredGA4.countryRegion)?.label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Your Ad Platforms</p>
                    <div className="space-y-2">
                      {DETECTED_PLATFORMS.map((platform) => {
                        const connection = platformConnections[platform.id];
                        const accountCount = connection?.selectedAccounts?.length || 0;
                        const isConnected = connection?.isConnected && accountCount > 0;
                        
                        return (
                          <div key={platform.id} className="flex items-center gap-2 text-xs">
                            <div className={cn("w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold", platform.color)}>
                              {platform.icon.slice(0, 1)}
                            </div>
                            <span className="flex-1">{platform.name}</span>
                            <span className="text-muted-foreground">
                              {isConnected 
                                ? `${accountCount} linked` 
                                : connection?.linkLater 
                                ? "Skipped" 
                                : "Not linked"
                              }
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No GA4 property configured</p>
              )}
            </CardContent>
          </Card>

          {/* Platform Connection Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Link Platforms</CardTitle>
              <CardDescription>
                We found events from these advertising platforms in your GA4 data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DETECTED_PLATFORMS.map((platform) => {
                const status = getPlatformStatus(platform.id);
                const connection = platformConnections[platform.id];
                const isAuthenticating = authenticatingPlatform === platform.id;
                
                return (
                  <div
                    key={platform.id}
                    className="rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", platform.color)}>
                          {platform.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{platform.name}</p>
                          {status === "connected" && connection?.selectedAccounts && (
                            <p className="text-xs text-green-700 mt-0.5">
                              {connection.selectedAccounts.length} accounts linked: {connection.selectedAccounts.slice(0, 2).map(acc => acc.name).join(", ")}
                              {connection.selectedAccounts.length > 2 && ` +${connection.selectedAccounts.length - 2} more`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusBadge(platform.id)}
                        
                        {status === "not_started" && (
                          <>
                            <Button
                              onClick={() => handlePlatformConnect(platform.id)}
                              disabled={isAuthenticating}
                              size="sm"
                            >
                              {isAuthenticating ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLinkLater(platform.id)}
                            >
                              Link later
                            </Button>
                          </>
                        )}
                        
                        {status === "authenticated" && (
                          <Button
                            onClick={() => setShowAccountSelection(platform.id)}
                            size="sm"
                            variant="secondary"
                          >
                            Select accounts
                            <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        )}
                        
                        {status === "connected" && (
                          <Button
                            onClick={() => setShowAccountSelection(platform.id)}
                            size="sm"
                            variant="ghost"
                          >
                            Edit selection
                          </Button>
                        )}
                        
                        {status === "link_later" && (
                          <Button
                            onClick={() => handlePlatformConnect(platform.id)}
                            disabled={isAuthenticating}
                            size="sm"
                            variant="outline"
                          >
                            {isAuthenticating ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                Connecting...
                              </>
                            ) : (
                              "Connect now"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <StepFooter
          nextHref="/conversion"
          nextDisabled={!canProceed}
          nextLabel="Next: Select main conversion"
        />
      </Container>

      {/* Account Selection Modal */}
      {showAccountSelection && (
        <AccountSelectionModal
          platformId={showAccountSelection}
          onClose={() => setShowAccountSelection(null)}
          onConfirm={handleAccountSelection}
          platformConnections={platformConnections}
        />
      )}
    </>
  );
}

// Account Selection Modal Component
function AccountSelectionModal({
  platformId,
  onClose,
  onConfirm,
  platformConnections,
}: {
  platformId: string;
  onClose: () => void;
  onConfirm: (platformId: string, accountIds: string[]) => void;
  platformConnections: any;
}) {
  const platform = DETECTED_PLATFORMS.find(p => p.id === platformId);
  const platformAccounts = PLATFORM_AD_ACCOUNTS[platformId as keyof typeof PLATFORM_AD_ACCOUNTS] || [];
  const connection = platformConnections[platformId];
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    connection?.selectedAccounts?.map((acc: any) => acc.id) || []
  );

  const handleToggle = (accountId: string, checked: boolean) => {
    setSelectedAccountIds(prev => 
      checked 
        ? [...prev, accountId]
        : prev.filter(id => id !== accountId)
    );
  };

  const handleConfirm = () => {
    onConfirm(platformId, selectedAccountIds);
  };

  if (!platform) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-sm", platform.color)}>
              {platform.icon}
            </div>
            {platform.name} Accounts
          </DialogTitle>
          <DialogDescription>
            Select the ad accounts you want to link for attribution tracking
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {platformAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-md border border-border/60 bg-card px-3 py-2"
            >
              <Checkbox
                checked={selectedAccountIds.includes(account.id)}
                onCheckedChange={(checked) => handleToggle(account.id, Boolean(checked))}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{account.name}</p>
                <p className="text-xs text-muted-foreground">{account.accountId}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button onClick={handleConfirm} className="flex-1" disabled={selectedAccountIds.length === 0}>
            Link {selectedAccountIds.length} account{selectedAccountIds.length !== 1 ? 's' : ''}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
