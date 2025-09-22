"use client";

import { useMemo } from "react";
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
import { GA4_PROPERTIES } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";

export default function Ga4Page() {
  const {
    state: {
      ga4: { selectedPropertyId, brandLabel },
    },
    actions,
  } = useAppState();

  const selectedProperty = GA4_PROPERTIES.find(p => p.id === selectedPropertyId);
  const showSystemLabelHint = useMemo(() => {
    if (!brandLabel) return false;
    return /^default-\d+$/.test(brandLabel.trim());
  }, [brandLabel]);

  const handlePropertyChange = (value: string) => {
    const property = GA4_PROPERTIES.find((item) => item.id === value);
    actions.updateGa4({
      selectedPropertyId: value,
      brandLabel: brandLabel && brandLabel.length > 0 ? brandLabel : property?.name,
    });
  };

  return (
    <Container className="space-y-8">
      <PageHeader
        title="Connect your GA4"
        description="Choose the GA4 account that includes all markets for this brand. One Attribution View connects to one GA4."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Select GA4 account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">GA4 account</label>
              <Select
                value={selectedPropertyId}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a GA4 account" />
                </SelectTrigger>
                <SelectContent>
                  {GA4_PROPERTIES.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{property.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{property.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brand name</label>
              <Input
                value={brandLabel ?? ""}
                onChange={(event) =>
                  actions.updateGa4({
                    brandLabel: event.target.value,
                  })
                }
                placeholder="Enter brand name"
              />
              {showSystemLabelHint && (
                <p className="text-xs text-amber-600">
                  Rename for clarity (optional)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-dashed border-border/70 bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Context</p>
          <p className="mt-2 text-muted-foreground">
            Pick the GA4 that truly covers all markets for this brand. If your brand uses multiple GA4s, contact us and we'll help.
          </p>
        </div>
      </div>

      <StepFooter
        nextHref="/accounts"
        nextDisabled={!selectedPropertyId}
        nextLabel="Next: Select ad accounts"
      />
    </Container>
  );
}
