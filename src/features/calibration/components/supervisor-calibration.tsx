"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  Calibration,
  CalibrationPage,
  CalibrationSummary,
  SiteReferenceOption,
} from "@/features/calibration/types";
import type { EquipmentReference } from "@/features/equipment/types";
import { authFetch, downloadAuthenticatedFile } from "@/lib/api/client";

const emptySummary: CalibrationSummary = {
  total: 0,
  equipment_tracked: 0,
  valid: 0,
  due_soon: 0,
  expired: 0,
  scheduled: 0,
  revoked: 0,
  completed_this_year: 0,
  upcoming_buckets: { days_0_7: 0, days_8_14: 0, days_15_30: 0, days_over_30: 0 },
};

const tones: Record<string, string> = {
  valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  due_soon: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
  scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  revoked: "bg-slate-100 text-slate-700 border-slate-200",
};

function date(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`)
  );
}

function displayValidity(record: Calibration) {
  if (record.revoked) return "revoked";
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const due = new Date(`${record.due_date}T00:00:00Z`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "due_soon";
  return "valid";
}


function exportCsv(records: Calibration[]) {
  const rows = [
    ["Equipment", "Description", "Category", "Site", "Certificate", "Calibration date", "Due date", "Provider", "Validity"],
    ...records.map((r) => [
      r.equipment_number,
      r.equipment_description,
      r.equipment_category,
      r.site_name || "Store",
      r.certificate_number,
      r.calibration_date,
      r.due_date,
      r.provider,
      displayValidity(r),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "calibrations.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// Days of week header
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SupervisorCalibration() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [data, setData] = useState<CalibrationPage>({ count: 0, next: null, previous: null, results: [] });
  const [calendarRecords, setCalendarRecords] = useState<Calibration[]>([]);
  const [summary, setSummary] = useState(emptySummary);

  const [categories, setCategories] = useState<EquipmentReference[]>([]);
  const [sites, setSites] = useState<SiteReferenceOption[]>([]);

  // Filter form state
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [site, setSite] = useState("");
  const [dateRangePreset, setDateRangePreset] = useState("all");
  const [ordering, setOrdering] = useState("-calibration_date");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load table and summary records
  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize), ordering });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("validity", status);
    if (site) params.set("site", site);

    // Apply date range filters if preset selected
    const today = new Date();
    if (dateRangePreset === "next_7") {
      const future = new Date(today);
      future.setDate(today.getDate() + 7);
      params.set("start_date", today.toISOString().split("T")[0]);
      params.set("end_date", future.toISOString().split("T")[0]);
    } else if (dateRangePreset === "next_30") {
      const future = new Date(today);
      future.setDate(today.getDate() + 30);
      params.set("start_date", today.toISOString().split("T")[0]);
      params.set("end_date", future.toISOString().split("T")[0]);
    } else if (dateRangePreset === "expired") {
      params.set("validity", "expired");
    } else if (selectedCalendarDate) {
      params.set("start_date", selectedCalendarDate);
      params.set("end_date", selectedCalendarDate);
    }

    const statsParams = new URLSearchParams(params);
    statsParams.delete("page");
    statsParams.delete("page_size");

    // Also fetch 200 records for populating the calendar view dots
    const calParams = new URLSearchParams();
    calParams.set("page", "1");
    calParams.set("page_size", "200");
    calParams.set("ordering", "due_date");

    try {
      const [listResponse, statsResponse, calResponse] = await Promise.all([
        authFetch(`/api/calibrations?${params}`),
        authFetch(`/api/calibrations/summary?${statsParams}`),
        authFetch(`/api/calibrations?${calParams}`),
      ]);

      if (!listResponse.ok || !statsResponse.ok || !calResponse.ok) throw new Error();

      const [listData, summaryData, calData] = (await Promise.all([
        listResponse.json(),
        statsResponse.json(),
        calResponse.json(),
      ])) as [CalibrationPage, CalibrationSummary, CalibrationPage];

      setData(listData);
      setSummary(summaryData);
      setCalendarRecords(calData.results);
      setError("");
    } catch {
      setError("Calibration records could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, ordering, search, category, status, site, dateRangePreset, selectedCalendarDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    authFetch("/api/calibrations/references")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((res) => {
        setCategories(res.categories || []);
        setSites(res.sites || []);
      })
      .catch(() => setError("Calibration filter references could not be loaded."));
  }, []);

  // Dynamically derive stats from all current records to ensure graphs and cards reflect exact reality
  const derivedStats = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    let valid = 0;
    let dueSoon = 0;
    let expired = 0;
    let scheduled = 0;
    let revoked = 0;
    let completedThisYear = 0;

    let b0_7 = 0;
    let b8_14 = 0;
    let b15_30 = 0;
    let bOver30 = 0;

    const currentYear = today.getUTCFullYear();

    calendarRecords.forEach((r) => {
      if (r.revoked) {
        revoked++;
        return;
      }
      const due = new Date(`${r.due_date}T00:00:00Z`);
      const calDate = new Date(`${r.calibration_date}T00:00:00Z`);
      const diffDays = Math.ceil((due.getTime() - todayTime) / dayMs);

      if (calDate.getUTCFullYear() === currentYear && calDate.getTime() <= todayTime) {
        completedThisYear++;
      }

      if (diffDays < 0) {
        expired++;
      } else if (diffDays <= 30) {
        dueSoon++;
      } else {
        valid++;
      }

      // Upcoming intervals
      if (diffDays >= 0 && diffDays <= 7) b0_7++;
      else if (diffDays > 7 && diffDays <= 14) b8_14++;
      else if (diffDays > 14 && diffDays <= 30) b15_30++;
      else if (diffDays > 30) bOver30++;
    });

    const total = calendarRecords.length;
    const tracked = new Set(calendarRecords.map((r) => r.equipment)).size;

    return {
      total: total || summary.total,
      equipment_tracked: tracked || summary.equipment_tracked,
      valid: calendarRecords.length ? valid : summary.valid,
      due_soon: calendarRecords.length ? dueSoon : summary.due_soon,
      expired: calendarRecords.length ? expired : summary.expired,
      scheduled: calendarRecords.length ? scheduled : summary.scheduled,
      revoked: calendarRecords.length ? revoked : summary.revoked,
      completed_this_year: calendarRecords.length ? completedThisYear : summary.completed_this_year,
      upcoming_buckets: calendarRecords.length
        ? { days_0_7: b0_7, days_8_14: b8_14, days_15_30: b15_30, days_over_30: bOver30 }
        : summary.upcoming_buckets || { days_0_7: 0, days_8_14: 0, days_15_30: 0, days_over_30: 0 },
    };
  }, [calendarRecords, summary]);

  // Top KPI Metric Cards data
  const kpiCards = [
    {
      title: "Under Calibration Tracking",
      value: derivedStats.equipment_tracked || derivedStats.total,
      subtitle: "Total tracked items",
      color: "from-sky-500 to-blue-600",
      icon: CalendarCheck2,
      textColor: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      title: "Valid Certificates",
      value: derivedStats.valid,
      subtitle: "Current & verified",
      color: "from-emerald-500 to-green-600",
      icon: ShieldCheck,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Due Soon (< 30 Days)",
      value: derivedStats.due_soon,
      subtitle: "Upcoming renewal",
      color: "from-amber-500 to-yellow-600",
      icon: CalendarClock,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Requires Attention",
      value: derivedStats.expired,
      subtitle: "Expired / overdue",
      color: "from-rose-500 to-red-600",
      icon: AlertTriangle,
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
    },
    {
      title: "Completed This Year",
      value: derivedStats.completed_this_year,
      subtitle: `${new Date().getFullYear()} calibrations`,
      color: "from-violet-500 to-purple-600",
      icon: CheckCircle2,
      textColor: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  // Donut Chart Data
  const donutData = useMemo(() => {
    const raw = [
      { name: "In Calibration", value: derivedStats.valid, color: "#10b981" },
      { name: "Due Soon (< 30 Days)", value: derivedStats.due_soon, color: "#f59e0b" },
      { name: "Expired", value: derivedStats.expired, color: "#ef4444" },
      { name: "Not Required", value: derivedStats.revoked, color: "#94a3b8" },
    ];
    if (raw.every((d) => d.value === 0)) {
      return [{ name: "No Data", value: 1, color: "#e2e8f0" }];
    }
    return raw;
  }, [derivedStats]);

  // Bar Chart Data (Upcoming Buckets)
  const barChartData = useMemo(() => {
    const buckets = derivedStats.upcoming_buckets || {
      days_0_7: 0,
      days_8_14: 0,
      days_15_30: 0,
      days_over_30: 0,
    };
    return [
      { name: "0-7 Days", count: buckets.days_0_7, fill: "#f59e0b" },
      { name: "8-14 Days", count: buckets.days_8_14, fill: "#0ea5e9" },
      { name: "15-30 Days", count: buckets.days_15_30, fill: "#38bdf8" },
      { name: "> 30 Days", count: buckets.days_over_30, fill: "#94a3b8" },
    ];
  }, [derivedStats]);


  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: {
      day: number;
      isCurrentMonth: boolean;
      dateStr: string;
      events: { expired: number; due_soon: number; scheduled: number; valid: number };
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 12 : month;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: false, dateStr, events: { expired: 0, due_soon: 0, scheduled: 0, valid: 0 } });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      
      const dayRecords = calendarRecords.filter((r) => r.due_date === dateStr || r.calibration_date === dateStr);
      const events = {
        expired: dayRecords.filter((r) => displayValidity(r) === "expired").length,
        due_soon: dayRecords.filter((r) => displayValidity(r) === "due_soon").length,
        scheduled: dayRecords.filter((r) => r.validity_status === "scheduled").length,
        valid: dayRecords.filter((r) => displayValidity(r) === "valid").length,
      };

      days.push({ day: d, isCurrentMonth: true, dateStr, events });
    }

    // Next month padding to fill complete grid of 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 1 : month + 2;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, isCurrentMonth: false, dateStr, events: { expired: 0, due_soon: 0, scheduled: 0, valid: 0 } });
    }

    return days;
  }, [year, month, calendarRecords]);

  // Calendar navigation handlers
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function jumpToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedCalendarDate(today.toISOString().split("T")[0]);
    setPage(1);
  }

  // Filter actions
  function handleApplyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSearch(searchDraft.trim());
    setPage(1);
  }

  function handleReset() {
    setSearchDraft("");
    setSearch("");
    setCategory("");
    setStatus("");
    setSite("");
    setDateRangePreset("all");
    setSelectedCalendarDate(null);
    setOrdering("-calibration_date");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(data.count / pageSize));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50/60 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Calibration Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor equipment calibration compliance, schedules, certificates, and upcoming renewals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(data.results)}
            disabled={!data.results.length}
            className="h-10 gap-2 border-slate-200 bg-white shadow-xs hover:bg-slate-50"
          >
            <Download className="size-4 text-slate-600" />
            <span>Export CSV</span>
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/supervisor/calibration/new" />}
          >
            <Plus className="size-4" />
            <span>Add Calibration</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="relative overflow-hidden border-0 bg-white shadow-xs ring-1 ring-slate-200/80 transition-all hover:shadow-sm"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </span>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">
                    {kpi.value}
                  </div>
                  <p className="text-xs text-slate-400">{kpi.subtitle}</p>
                </div>
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${kpi.bgColor} ${kpi.textColor} ring-1 ring-black/5`}
                >
                  <Icon className="size-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3-Column Analytics Row */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Column 1: Calibration Status by Equipment Type (Donut Chart) */}
        <Card className="lg:col-span-4 border-0 bg-white shadow-xs ring-1 ring-slate-200/80 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Calibration Status by Equipment Type
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2 pb-6 min-w-0">
            <div className="relative flex items-center justify-center size-52 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [val, "Count"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {derivedStats.total}
                </span>
                <span className="text-xs font-medium text-slate-500">Total</span>
              </div>
            </div>

            {/* Custom Status Legend */}
            <div className="mt-4 w-full space-y-2.5 px-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                  In Calibration
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{derivedStats.valid}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="size-3 rounded-full bg-amber-500 inline-block" />
                  Due Soon (&lt; 30 Days)
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{derivedStats.due_soon}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="size-3 rounded-full bg-rose-500 inline-block" />
                  Expired
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{derivedStats.expired}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="size-3 rounded-full bg-slate-400 inline-block" />
                  Not Required
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{derivedStats.revoked}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Upcoming Calibrations (Next 30 Days) Bar Chart */}
        <Card className="lg:col-span-4 border-0 bg-white shadow-xs ring-1 ring-slate-200/80 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Upcoming Calibrations (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 flex-1 flex flex-col justify-between min-w-0">
            <div className="h-56 w-full mt-2 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val) => [val, "Equipments"]}
                    cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    label={{
                      position: "top",
                      fill: "#334155",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center border-t border-slate-100 pt-3">
              <div className="text-[11px] text-slate-500 font-medium">0-7 Days</div>
              <div className="text-[11px] text-slate-500 font-medium">8-14 Days</div>
              <div className="text-[11px] text-slate-500 font-medium">15-30 Days</div>
              <div className="text-[11px] text-slate-500 font-medium">&gt; 30 Days</div>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Calibration Calendar Widget with Month Navigation */}
        <Card className="lg:col-span-4 border-0 bg-white shadow-xs ring-1 ring-slate-200/80 flex flex-col justify-between">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Calibration Calendar
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={prevMonth}
                  className="size-7 rounded-md border-slate-200 p-0 text-slate-600 hover:bg-slate-100"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-semibold text-slate-800 min-w-28 text-center">
                  {monthName} {year}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={nextMonth}
                  className="size-7 rounded-md border-slate-200 p-0 text-slate-600 hover:bg-slate-100"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToToday}
                  className="h-7 text-xs px-2 ml-1 border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              {/* Calendar Grid */}
              <div className="min-w-[200px]">
                <div className="grid grid-cols-7 mb-1 text-center">
                  {weekDays.map((d) => (
                    <span key={d} className="text-[11px] font-semibold text-slate-400 py-1">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((item, idx) => {
                    const isSelected = selectedCalendarDate === item.dateStr;
                    const hasEvents =
                      item.events.expired > 0 ||
                      item.events.due_soon > 0 ||
                      item.events.scheduled > 0 ||
                      item.events.valid > 0;

                    return (
                      <button
                        key={`${item.dateStr}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (selectedCalendarDate === item.dateStr) {
                            setSelectedCalendarDate(null);
                          } else {
                            setSelectedCalendarDate(item.dateStr);
                          }
                          setPage(1);
                        }}
                        className={`group relative flex flex-col items-center justify-center rounded-lg py-1 transition-all h-9 text-xs ${
                          isSelected
                            ? "bg-sky-600 font-bold text-white shadow-xs"
                            : item.isCurrentMonth
                            ? "text-slate-800 hover:bg-slate-100 font-medium"
                            : "text-slate-300 hover:text-slate-500"
                        }`}
                      >
                        <span>{item.day}</span>
                        {/* Event indicator dots */}
                        {hasEvents && (
                          <span className="flex gap-0.5 mt-0.5">
                            {item.events.expired > 0 && (
                              <span className="size-1.5 rounded-full bg-rose-500 inline-block" />
                            )}
                            {item.events.due_soon > 0 && (
                              <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
                            )}
                            {item.events.scheduled > 0 && (
                              <span className="size-1.5 rounded-full bg-sky-500 inline-block" />
                            )}
                            {item.events.valid > 0 && (
                              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Indicator Sidebar */}
              <div className="flex flex-col justify-center space-y-2 border-l border-slate-100 pl-3 min-w-[110px]">
                <div className="flex items-center justify-between text-xs bg-rose-50/50 p-1.5 rounded-md border border-rose-100">
                  <span className="flex items-center gap-1.5 font-medium text-rose-700">
                    <span className="size-2 rounded-full bg-rose-500" />
                    Expired
                  </span>
                  <span className="font-bold text-rose-800 tabular-nums">{derivedStats.expired}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-amber-50/50 p-1.5 rounded-md border border-amber-100">
                  <span className="flex items-center gap-1.5 font-medium text-amber-700">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Due Soon
                  </span>
                  <span className="font-bold text-amber-800 tabular-nums">{derivedStats.due_soon}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-sky-50/50 p-1.5 rounded-md border border-sky-100">
                  <span className="flex items-center gap-1.5 font-medium text-sky-700">
                    <span className="size-2 rounded-full bg-sky-500" />
                    Scheduled
                  </span>
                  <span className="font-bold text-sky-800 tabular-nums">{derivedStats.scheduled}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-emerald-50/50 p-1.5 rounded-md border border-emerald-100">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                  <span className="font-bold text-emerald-800 tabular-nums">
                    {derivedStats.completed_this_year}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Unified Filter Toolbar */}
      <Card className="border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
        <CardContent className="p-4">
          <form
            onSubmit={handleApplyFilters}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                aria-label="Search equipment"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search equipment, description, certificate number..."
                className="pl-9 h-10 rounded-lg border-slate-200 bg-white text-sm focus-visible:ring-sky-500"
              />
            </div>

            {/* Category Dropdown */}
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              aria-label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Status</option>
              <option value="valid">Valid / In Calibration</option>
              <option value="due_soon">Due Soon (&lt; 30 Days)</option>
              <option value="expired">Expired</option>
              <option value="scheduled">Scheduled</option>
              <option value="revoked">Revoked</option>
            </select>

            {/* Site Dropdown */}
            <select
              aria-label="Site"
              value={site}
              onChange={(e) => {
                setSite(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Sites</option>
              <option value="store">Store (Warehouse)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Dates Filter Dropdown */}
            <select
              aria-label="Date Range"
              value={dateRangePreset}
              onChange={(e) => {
                setDateRangePreset(e.target.value);
                setSelectedCalendarDate(null);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Dates</option>
              <option value="next_7">Due in next 7 days</option>
              <option value="next_30">Due in next 30 days</option>
              <option value="expired">Expired dates</option>
            </select>

            {/* Reset Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-10 border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="size-4 mr-1.5" />
              Reset
            </Button>

            {/* Apply Filters Button */}
            <Button
              type="submit"
            >
              Apply Filters
            </Button>
          </form>

          {/* Active Calendar Filter Notice */}
          {selectedCalendarDate && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 border border-sky-200">
              <span className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-sky-600" />
                Filtered by selected calendar date: <strong>{selectedCalendarDate}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCalendarDate(null);
                  setPage(1);
                }}
                className="font-semibold underline hover:text-sky-950"
              >
                Clear date filter
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center gap-2"
        >
          <AlertTriangle className="size-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Calibration Records Table */}
      <Card className="border-0 bg-white shadow-xs ring-1 ring-slate-200/80">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Calibration Records
            </CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {data.count} {data.count === 1 ? "record" : "records"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Sort records"
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"
            >
              <option value="-calibration_date">Newest Calibration</option>
              <option value="calibration_date">Oldest Calibration</option>
              <option value="due_date">Due Date (Earliest)</option>
              <option value="-due_date">Due Date (Latest)</option>
              <option value="certificate_number">Certificate Number</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="bg-sky-50/70 border-b border-sky-100 text-xs font-semibold text-slate-700">
                  <th className="px-4 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Site / Location</th>
                  <th className="px-4 py-3.5">Certificate #</th>
                  <th className="px-4 py-3.5">Calibration Date</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Provider</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Certificate</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((record) => {
                  const state = displayValidity(record);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/supervisor/calibration/${record.id}`}
                          className="font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          {record.equipment_number}
                        </Link>
                        <span className="block text-xs text-slate-500 max-w-[220px] truncate">
                          {record.equipment_description}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 text-xs font-medium">
                        {record.equipment_category || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-800">
                          {record.site_name || "Store"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-800 font-medium">
                        {record.certificate_number}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">
                        {date(record.calibration_date)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium text-xs">
                        {date(record.due_date)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">
                        {record.provider || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize border ${tones[state]}`}
                        >
                          {state.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {record.certificate ? (
                          <button
                            className="inline-flex items-center gap-1.5 text-sky-700 font-medium hover:underline hover:text-sky-900"
                            type="button"
                            onClick={() =>
                              void downloadAuthenticatedFile(
                                `/api/calibrations/${record.id}/certificate`,
                                `${record.certificate_number}.pdf`
                              )
                            }
                          >
                            <Download className="size-3.5" /> PDF
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          nativeButton={false}
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/supervisor/calibration/${record.id}`} />}
                          aria-label={`View certificate ${record.certificate_number}`}
                          className="hover:bg-sky-50 text-sky-700"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {loading ? (
              <p className="py-12 text-center text-sm text-slate-500">Loading calibration records…</p>
            ) : !data.results.length ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-slate-600">No calibration records match your filters.</p>
                <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2 text-sky-700">
                  Reset filters
                </Button>
              </div>
            ) : null}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-sm text-slate-600">
            <label className="flex items-center gap-2 text-xs">
              Show
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              entries
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.previous || loading}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                className="h-8 border-slate-200 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs font-medium px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.next || loading}
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                className="h-8 border-slate-200 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
