"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        className: "rounded-md border bg-background text-foreground",
      }}
    />
  );
}
