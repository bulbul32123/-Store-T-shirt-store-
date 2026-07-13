"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

const SEGMENT_LABELS = {
  regular: "Regular",
  repeat_buyer: "Repeat Buyer",
  high_spender: "High Spender",
  inactive: "Inactive",
};

const chartConfig = {
  regular: { label: "Regular", color: "hsl(var(--chart-1))" },
  repeat_buyer: { label: "Repeat Buyer", color: "hsl(var(--chart-2))" },
  high_spender: { label: "High Spender", color: "hsl(var(--chart-3))" },
  inactive: { label: "Inactive", color: "hsl(var(--chart-4))" },
};

export default function SegmentsChart({ data, loading }) {
  const formatted = data.map((d) => ({
    ...d,
    label: SEGMENT_LABELS[d.segment] || d.segment,
    fill: `var(--color-${d.segment})`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Segments</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {loading ? (
          <div className="h-56 w-56 bg-muted animate-pulse rounded-full" />
        ) : formatted.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
            No data
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Pie
                data={formatted}
                dataKey="count"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              >
                {formatted.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
