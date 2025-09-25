"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type BreakdownKey = "market" | "campaign" | "channel";
export type PlatformKey = "google_ads" | "meta" | "tiktok" | "linkedin";

export type RuleType =
  | "prefix"
  | "suffix"
  | "bracketed"
  | "contains"
  | "delimited"
  | "regex";

export interface Rule {
  id: string;
  type: RuleType;
  value: string;
  output: string;
  priority: number;
}

export type BreakdownStatus = "not_started" | "in_progress" | "ready" | "auto_mapped";

export interface GA4PropertyConfiguration {
  propertyId: string;
  brandName?: string;
  countryRegion?: string;
  isConfigured: boolean;
}

export interface AppState {
  ga4: {
    configurations: GA4PropertyConfiguration[];
    selectedPropertyId?: string; // Currently selected for configuration
  };
  accounts: {
    platformConnections: Record<string, {
      isConnected: boolean;
      isAuthenticated: boolean;
      linkLater?: boolean;
      selectedAccounts: {
        id: string;
        name: string;
        accountId: string;
      }[];
    }>;
    // Legacy field for backward compatibility
    selected: {
      id: string;
      name: string;
      platform: PlatformKey;
    }[];
  };
  conversion: {
    mainGa4Event?: string;
    platformEventMap: Record<string, string>;
    hasRevenue: boolean;
  };
  breakdownHub: {
    market: {
      status: BreakdownStatus;
    };
    campaign: {
      status: BreakdownStatus;
    };
    channel: {
      status: BreakdownStatus;
    };
  };
  breakdowns: {
    market: {
      perAccountMethod: Record<string, "platform_geo" | "naming_rules" | "ga4_fallback">;
      namingRules: Record<string, Rule[]>;
      coverageScore: number;
    };
    campaign: {
      normalizationOn: boolean;
      coverageScore: number;
    };
    channel: {
      overrides: Record<string, string>;
      coverageScore: number;
    };
  };
  diagnostics: {
    unknownPercentByAccount: Record<string, number>;
    platformVsGa4Delta: number;
  };
}

function createInitialState(): AppState {
  return {
    ga4: {
      configurations: [],
      selectedPropertyId: undefined,
    },
    accounts: {
      platformConnections: {},
      selected: [],
    },
    conversion: {
      mainGa4Event: undefined,
      platformEventMap: {},
      hasRevenue: true,
    },
    breakdownHub: {
      market: {
        status: "not_started",
      },
      campaign: {
        status: "not_started",
      },
      channel: {
        status: "auto_mapped",
      },
    },
    breakdowns: {
      market: {
        perAccountMethod: {},
        namingRules: {},
        coverageScore: 0,
      },
      campaign: {
        normalizationOn: true,
        coverageScore: 0,
      },
      channel: {
        overrides: {},
        coverageScore: 0,
      },
    },
    diagnostics: {
      unknownPercentByAccount: {},
      platformVsGa4Delta: 12,
    },
  };
}

interface AppStateContextValue {
  state: AppState;
  actions: {
    reset: () => void;
    updateGa4: (partial: Partial<AppState["ga4"]>) => void;
    updateGa4Property: (propertyId: string, config: Partial<GA4PropertyConfiguration>) => void;
    updateAccounts: (selected: AppState["accounts"]["selected"]) => void;
    updatePlatformConnection: (platformId: string, connection: Partial<AppState["accounts"]["platformConnections"][string]>) => void;
    updateConversion: (partial: Partial<AppState["conversion"]>) => void;
    updateBreakdownHub: (partial: Partial<AppState["breakdownHub"]>) => void;
    updateBreakdowns: (
      partial: Partial<AppState["breakdowns"]>
    ) => void;
    updateDiagnostics: (
      partial: Partial<AppState["diagnostics"]>
    ) => void;
  };
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());

  const actions = useMemo(() => ({
    reset: () => setState(createInitialState()),
    updateGa4: (partial: Partial<AppState["ga4"]>) =>
      setState((prev) => ({
        ...prev,
        ga4: { ...prev.ga4, ...partial },
      })),
    updateGa4Property: (propertyId: string, config: Partial<GA4PropertyConfiguration>) =>
      setState((prev) => {
        const configurations = [...prev.ga4.configurations];
        const existingIndex = configurations.findIndex(c => c.propertyId === propertyId);
        
        if (existingIndex >= 0) {
          // Update existing configuration
          const updatedConfig = {
            ...configurations[existingIndex],
            ...config,
          };
          updatedConfig.isConfigured = !!(updatedConfig.brandName && updatedConfig.countryRegion);
          configurations[existingIndex] = updatedConfig;
        } else {
          // Create new configuration
          configurations.push({
            propertyId,
            brandName: config.brandName,
            countryRegion: config.countryRegion,
            isConfigured: !!(config.brandName && config.countryRegion)
          });
        }
        
        return {
          ...prev,
          ga4: {
            ...prev.ga4,
            configurations
          }
        };
      }),
        updateAccounts: (selected: AppState["accounts"]["selected"]) =>
          setState((prev) => ({
            ...prev,
            accounts: { ...prev.accounts, selected },
          })),
        updatePlatformConnection: (platformId: string, connection: Partial<AppState["accounts"]["platformConnections"][string]>) =>
          setState((prev) => ({
            ...prev,
            accounts: {
              ...prev.accounts,
              platformConnections: {
                ...prev.accounts.platformConnections,
                [platformId]: {
                  ...{
                    isConnected: false,
                    isAuthenticated: false,
                    linkLater: false,
                    selectedAccounts: [],
                  },
                  ...prev.accounts.platformConnections[platformId],
                  ...connection,
                }
              }
            },
          })),
    updateConversion: (partial: Partial<AppState["conversion"]>) =>
      setState((prev) => ({
        ...prev,
        conversion: { ...prev.conversion, ...partial },
      })),
    updateBreakdownHub: (partial: Partial<AppState["breakdownHub"]>) =>
      setState((prev) => ({
        ...prev,
        breakdownHub: {
          market: {
            ...prev.breakdownHub.market,
            ...partial.market,
          },
          campaign: {
            ...prev.breakdownHub.campaign,
            ...partial.campaign,
          },
          channel: {
            ...prev.breakdownHub.channel,
            ...partial.channel,
          },
        },
      })),
    updateBreakdowns: (partial: Partial<AppState["breakdowns"]>) =>
      setState((prev) => ({
        ...prev,
        breakdowns: {
          market: {
            ...prev.breakdowns.market,
            ...partial.market,
          },
          campaign: {
            ...prev.breakdowns.campaign,
            ...partial.campaign,
          },
          channel: {
            ...prev.breakdowns.channel,
            ...partial.channel,
          },
        },
      })),
    updateDiagnostics: (partial: Partial<AppState["diagnostics"]>) =>
      setState((prev) => ({
        ...prev,
        diagnostics: { ...prev.diagnostics, ...partial },
      })),
  }), []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}

export const DEFAULT_APP_STATE = createInitialState();
