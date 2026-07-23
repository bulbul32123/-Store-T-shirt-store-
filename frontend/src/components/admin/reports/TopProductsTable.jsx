"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TopProductsTable({ products, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No sales in this period
          </p>
        ) : (
          <div className="space-y-1">
            {products.map((p, i) => (
              <div
                key={p._id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <span className="text-xs font-medium text-muted-foreground w-4">
                  {i + 1}
                </span>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-9 w-9 rounded object-cover border"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.unitsSold} units sold
                  </p>
                </div>
                <Badge variant="secondary">৳{p.revenue.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
