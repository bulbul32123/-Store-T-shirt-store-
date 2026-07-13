"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  loading,
  format,
}) {
  const isPositive = change >= 0;
  const displayValue =
    format === "currency"
      ? `৳${Number(value).toLocaleString()}`
      : Number(value).toLocaleString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{displayValue}</div>
            {change !== undefined && (
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(change)}% vs previous period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
