"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarClock,
  CalendarX2,
  ClipboardList,
  FileClock,
  Package,
  RefreshCw,
  Siren,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DashboardPanel,
  DashboardTable,
  StatusPill,
} from "@/components/shared/dashboard-widgets";
import { authFetch } from "@/lib/api/client";

interface SummaryMetrics {
  equipment_total?: number;
  available?: number;
  allocated?: number;
  calibration_due?: number;
  calibration_expired?: number;
  overdue_returns?: number;
  open_maintenance?: number;
  pending_reports?: number;
  pending_technicians?: number;
  open_faults?: number;
}

interface Summary {
  as_of: string;
  metrics: SummaryMetrics;
  categories: Array<{ name: string; value: number }>;
  statuses: Array<{ name: string; value: number }>;
  calibration_due: Array<{
    id: string;
    description: string;
    due: string;
    days: number;
  }>;
  allocated: Array<{
    id: string;
    description: string;
    custodian: string;
    site: string;
    since: string;
    return_date: string | null;
  }>;
  overdue: Array<{
    id: string;
    description: string;
    custodian: string;
    due: string;
    days: number;
  }>;
}

const colors = [
  "#0284c7",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#64748b",
];

function fmt(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
      new Date(value)
    );
  } catch {
    return String(value);
  }
}

export function SupervisorDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      const response = await authFetch("/api/dashboard/summary");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (payload && typeof payload === "object"
            ? payload.detail || payload.error
            : null) ?? "Dashboard could not be loaded."
        );
      }
      setData(payload as Summary);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Dashboard could not be loaded."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchSummary(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchSummary]);

  if (error && !data) {
    return (
      <div className="space-y-4 p-7">
        <p className="rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </p>
        <Button onClick={() => void fetchSummary()} variant="outline" size="sm">
          <RefreshCw className="mr-2 size-4" /> Retry loading dashboard
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center p-7 text-sm text-slate-500">
        <RefreshCw className="mr-2 size-4 animate-spin text-sky-600" />
        Loading dashboard…
      </div>
    );
  }

  const metricCards = [
    {
      label: "Total equipment",
      value: data.metrics.equipment_total ?? 0,
      icon: Package,
      color: "bg-sky-600",
      href: "/supervisor/equipment",
    },
    {
      label: "Available",
      value: data.metrics.available ?? 0,
      icon: ClipboardList,
      color: "bg-emerald-600",
      href: "/supervisor/equipment",
    },
    {
      label: "Allocated",
      value: data.metrics.allocated ?? 0,
      icon: Users,
      color: "bg-orange-500",
      href: "/supervisor/allocations",
    },
    {
      label: "Calibration due (30d)",
      value: data.metrics.calibration_due ?? 0,
      icon: CalendarClock,
      color: "bg-amber-500",
      href: "/supervisor/calibration",
    },
    {
      label: "Calibration expired",
      value: data.metrics.calibration_expired ?? 0,
      icon: CalendarX2,
      color: "bg-rose-500",
      href: "/supervisor/calibration",
    },
    {
      label: "Overdue returns",
      value: data.metrics.overdue_returns ?? 0,
      icon: Siren,
      color: "bg-rose-600",
      href: "/supervisor/allocations",
    },
    {
      label: "Open maintenance",
      value: data.metrics.open_maintenance ?? 0,
      icon: Wrench,
      color: "bg-violet-600",
      href: "/supervisor/maintenance",
    },
    {
      label: "Pending reports",
      value: data.metrics.pending_reports ?? 0,
      icon: FileClock,
      color: "bg-cyan-600",
      href: "/supervisor/reports",
    },
    {
      label: "Pending technicians",
      value: data.metrics.pending_technicians ?? 0,
      icon: UserCheck,
      color: "bg-indigo-600",
      href: "/supervisor/technicians",
    },
  ];

  const hasCategories = (data.categories ?? []).length > 0;
  const hasStatuses = (data.statuses ?? []).length > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Supervisor dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live operational overview · updated{" "}
            {new Date(data.as_of).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchSummary()}
          disabled={refreshing}
          className="gap-2 text-xs"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metricCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="group block rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <Card className="border-0 transition hover:shadow-md ring-1 ring-slate-200/80">
              <CardContent className="flex items-center gap-3.5 p-4">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-white ${color}`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-2xl font-semibold tabular-nums text-slate-900 group-hover:text-sky-700">
                    {value}
                  </strong>
                  <span className="block truncate text-xs text-slate-500">
                    {label}
                  </span>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel title="Equipment by category">
          {hasCategories ? (
            <ChartContainer
              config={{ value: { label: "Equipment" } }}
              className="h-72 w-full"
              initialDimension={{ width: 500, height: 288 }}
            >
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={100}
                >
                  {data.categories.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-72 items-center justify-center text-xs text-slate-400">
              No equipment categories found.
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel title="Equipment by status">
          {hasStatuses ? (
            <ChartContainer
              config={{ value: { label: "Equipment" } }}
              className="h-72 w-full"
              initialDimension={{ width: 500, height: 288 }}
            >
              <BarChart data={data.statuses}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.statuses.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-72 items-center justify-center text-xs text-slate-400">
              No equipment status data found.
            </div>
          )}
        </DashboardPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel title="Calibration due · next 30 days">
          <DashboardTable
            headers={["Equipment", "Description", "Due", "Days left"]}
            rows={(data.calibration_due ?? []).map((item) => [
              <Link
                key={`eq-${item.id}`}
                href="/supervisor/calibration"
                className="font-medium text-sky-700 hover:underline"
              >
                {item.id}
              </Link>,
              item.description,
              fmt(item.due),
              <StatusPill
                key={`pill-${item.id}`}
                tone={item.days <= 7 ? "red" : "amber"}
              >
                {item.days}
              </StatusPill>,
            ])}
          />
        </DashboardPanel>

        <DashboardPanel title="Overdue returns">
          <DashboardTable
            headers={["Equipment", "Description", "Custodian", "Due", "Days overdue"]}
            rows={(data.overdue ?? []).map((item) => [
              <Link
                key={`overdue-${item.id}`}
                href="/supervisor/allocations"
                className="font-medium text-rose-700 hover:underline"
              >
                {item.id}
              </Link>,
              item.description,
              item.custodian,
              fmt(item.due),
              <StatusPill key={`pill-overdue-${item.id}`} tone="red">
                {item.days}
              </StatusPill>,
            ])}
          />
        </DashboardPanel>
      </div>

      <DashboardPanel title="Currently allocated equipment">
        <DashboardTable
          headers={[
            "Equipment",
            "Description",
            "Custodian",
            "Project / site",
            "Allocated",
            "Expected return",
          ]}
          minWidth="min-w-[800px]"
          rows={(data.allocated ?? []).map((item) => [
            <Link
              key={`alloc-${item.id}`}
              href="/supervisor/allocations"
              className="font-medium text-sky-700 hover:underline"
            >
              {item.id}
            </Link>,
            item.description,
            item.custodian,
            item.site,
            fmt(item.since),
            fmt(item.return_date),
          ])}
        />
      </DashboardPanel>
    </div>
  );
}
