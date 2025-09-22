"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS, getStepIndex } from "@/lib/navigation";

export function Stepper() {
  const pathname = usePathname();
  const activeIndex = getStepIndex(pathname);

  return (
    <nav aria-label="Onboarding steps" className="flex flex-wrap items-center gap-2 text-xs">
      {ONBOARDING_STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <Link
            key={step.key}
            href={step.path}
            className={cn(
              "group flex items-center gap-2 rounded-lg border px-2.5 py-1 transition-colors",
              isActive && "border-primary bg-primary/10 text-primary",
              isComplete && !isActive && "border-border bg-muted/60 text-foreground",
              !isActive && !isComplete && "border-transparent bg-muted text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold",
                isActive && "border-primary bg-primary text-primary-foreground",
                isComplete && "border-primary bg-primary/80 text-primary-foreground",
                !isActive && !isComplete && "border-border bg-background"
              )}
            >
              {isComplete ? "✓" : index + 1}
            </span>
            <span className="flex flex-col">
              <span className="font-medium leading-tight text-xs lg:text-sm">
                {step.label}
              </span>
              {step.description ? (
                <span className="text-[11px] text-muted-foreground">
                  {step.description}
                </span>
              ) : null}
            </span>
            {step.optional ? (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Optional
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
