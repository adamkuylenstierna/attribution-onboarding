"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { actions } = useAppState();
  const showReset = process.env.NODE_ENV !== "production";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className={cn("hidden flex-1 justify-center lg:flex")}> 
          <Stepper key={pathname} />
        </div>
        <div className="flex items-center gap-2">
          {showReset ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.reset()}
            >
              Reset flow
            </Button>
          ) : null}
        </div>
      </div>
      <div className="border-t lg:hidden">
        <div className="mx-auto max-w-6xl px-5 py-2.5">
          <Stepper key={`${pathname}-mobile`} />
        </div>
      </div>
    </header>
  );
}
