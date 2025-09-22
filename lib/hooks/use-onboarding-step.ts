"use client";

import { usePathname } from "next/navigation";
import { getStepIndex, ONBOARDING_STEPS } from "@/lib/navigation";

export function useOnboardingStep() {
  const pathname = usePathname();
  const index = getStepIndex(pathname);
  const step = ONBOARDING_STEPS[index];
  const previous = index > 0 ? ONBOARDING_STEPS[index - 1] : undefined;
  const next =
    index < ONBOARDING_STEPS.length - 1
      ? ONBOARDING_STEPS[index + 1]
      : undefined;

  return {
    step,
    index,
    previous,
    next,
  };
}
