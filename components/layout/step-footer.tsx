"use client";

import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSiblingStep } from "@/lib/navigation";

interface StepFooterProps {
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  continueLoadingText?: string;
  backLabel?: string;
  onNext?: () => void | boolean | Promise<void | boolean>;
  onBack?: () => void;
  secondaryAction?: ReactNode;
  hideNext?: boolean;
  hideBack?: boolean;
}

export function StepFooter({
  backHref,
  nextHref,
  nextLabel = "Continue",
  nextDisabled,
  continueLoadingText = "Saving...",
  backLabel = "Back",
  onNext,
  onBack,
  secondaryAction,
  hideNext,
  hideBack,
}: StepFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prevStep = getSiblingStep(pathname, "prev");
  const nextStep = getSiblingStep(pathname, "next");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    if (backHref) {
      router.push(backHref);
    } else if (prevStep) {
      router.push(prevStep.path);
    }
  };

  const handleNext = async () => {
    if (typeof onNext === "function") {
      try {
        setIsSubmitting(true);
        const result = await onNext();
        if (result === false) {
          setIsSubmitting(false);
          return;
        }
      } finally {
        setIsSubmitting(false);
      }
    }
    const target = nextHref ?? nextStep?.path;
    if (target) {
      router.push(target);
    }
  };

  return (
    <div className="mx-auto mt-10 flex w-full max-w-5xl items-center justify-between gap-4 border-t border-border/70 px-6 py-6">
      <div className="flex items-center gap-2">
        {!hideBack ? (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!backHref && !prevStep}
          >
            {backLabel}
          </Button>
        ) : null}
        {secondaryAction}
      </div>
      {!hideNext ? (
        <Button
          onClick={handleNext}
          disabled={nextDisabled || isSubmitting}
        >
          {isSubmitting ? continueLoadingText : nextLabel}
        </Button>
      ) : null}
    </div>
  );
}
