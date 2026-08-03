"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Matches the --chart-1..5 tokens already defined in globals.css.
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ChartContainer({
  className,
  height = 280,
  children,
}: {
  className?: string;
  height?: number;
  children: React.ReactElement;
}) {
  return (
    <div data-slot="chart" className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export { ChartContainer };
