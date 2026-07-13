"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Repeat, Wallet, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminReportsApi } from "@/lib/adminReportsApi";
import KpiCard from "@/components/admin/reports/KpiCard";
import AcquisitionChart from "@/components/admin/reports/AcquisitionChart";
import RetentionChart from "@/components/admin/reports/RetentionChart";
import SegmentsChart from "@/components/admin/reports/SegmentsChart";
import RevenueChart from "@/components/admin/reports/RevenueChart";
import TopProductsTable from "@/components/admin/reports/TopProductsTable";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
];

export default function AdminReportsPage() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [acquisition, setAcquisition] = useState([]);
  const [retention, setRetention] = useState([]);
  const [segments, setSegments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, acq, ret, seg, rev, top] = await Promise.all([
        adminReportsApi.getOverview(range),
        adminReportsApi.getAcquisition(range),
        adminReportsApi.getRetention(range),
        adminReportsApi.getSegments(),
        adminReportsApi.getRevenue(range),
        adminReportsApi.getTopProducts(range),
      ]);
      setOverview(ov);
      setAcquisition(acq.trend);
      setRetention(ret.trend);
      setSegments(seg.segments);
      setRevenue(rev.trend);
      setTopProducts(top.products);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customer acquisition, retention, and sales performance
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Customers"
          value={overview?.totalCustomers ?? 0}
          icon={Users}
          loading={loading}
        />
        <KpiCard
          title="New Customers"
          value={overview?.newCustomers ?? 0}
          change={overview?.newCustomersChange}
          icon={UserPlus}
          loading={loading}
        />
        <KpiCard
          title="Returning Customers"
          value={overview?.returningCustomers ?? 0}
          icon={Repeat}
          loading={loading}
        />
        <KpiCard
          title="Retention Rate"
          value={overview?.retentionRate ?? 0}
          icon={Repeat}
          loading={loading}
        />
        <KpiCard
          title="Revenue"
          value={overview?.revenue ?? 0}
          change={overview?.revenueChange}
          icon={DollarSign}
          loading={loading}
          format="currency"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AcquisitionChart data={acquisition} loading={loading} />
        <RetentionChart data={retention} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} loading={loading} />
        </div>
        <SegmentsChart data={segments} loading={loading} />
      </div>

      <TopProductsTable products={topProducts} loading={loading} />
    </div>
  );
}
