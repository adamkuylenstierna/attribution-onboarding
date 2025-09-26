export interface OnboardingStep {
  key: string;
  path: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key: "start",
    path: "/settings",
    label: "Start",
  },
  {
    key: "ga4",
    path: "/ga4",
    label: "Connect GA4",
  },
  {
    key: "accounts",
    path: "/accounts",
    label: "Link platforms",
  },
  {
    key: "conversion",
    path: "/conversion",
    label: "Define conversions",
  },
  {
    key: "breakdowns",
    path: "/breakdown-hub",
    label: "Review breakdowns",
  },
];

const pathToIndex = new Map(ONBOARDING_STEPS.map((step, index) => [step.path, index]));

export function getStepIndex(pathname: string) {
  if (pathToIndex.has(pathname)) {
    return pathToIndex.get(pathname)!;
  }
  // fallback for dynamic query or trailing slashes
  const normalized = pathname.replace(/\/$/, "");
  if (pathToIndex.has(normalized)) {
    return pathToIndex.get(normalized)!;
  }
  return 0;
}

export function getSiblingStep(pathname: string, direction: "next" | "prev") {
  const currentIndex = getStepIndex(pathname);
  const delta = direction === "next" ? 1 : -1;
  const targetIndex = currentIndex + delta;
  if (targetIndex < 0 || targetIndex >= ONBOARDING_STEPS.length) {
    return undefined;
  }
  return ONBOARDING_STEPS[targetIndex];
}
