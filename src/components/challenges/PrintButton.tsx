"use client";

import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  label: string;
}

/** Tiny client island — just calls window.print() on click. */
export function PrintButton({ label }: PrintButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
    >
      {label}
    </Button>
  );
}
