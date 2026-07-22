"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  newCustomers: { label: "New Customers", color: "hsl(var(--chart-1))" },
};

export default function AcquisitionChart({ data, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Acquisition</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 bg-muted animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={30}
                domain={[0, "dataMax + 2"]}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="natural"
                dataKey="newCustomers"
                stroke="var(--color-newCustomers)"
                fill="var(--color-newCustomers)"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 0,
                  fill: "var(--color-newCustomers)",
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
