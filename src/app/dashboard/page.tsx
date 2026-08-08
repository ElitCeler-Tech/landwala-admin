"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Briefcase,
  Home,
  Clock,
  CheckCircle2,
  Tag,
  MessageSquare,
  TrendingUp,
  Landmark,
  Scale,
  FileSignature,
  Shield,
  IndianRupee,
  Wallet,
  PiggyBank,
  Loader2,
  MoveUpRight,
  MoveDownRight,
  MapPin,
  Award,
  UserCog,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  dashboardApi,
  DashboardOverview,
  RecentActivityItem,
  AreaDistributionZone,
  TopAgent,
  DashboardDateRange,
  PlotListingsGrowthPoint,
} from "@/lib/api";

const RANGE_OPTIONS: { value: DashboardDateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

// Short parenthetical used on the range-scoped tiles (Leads/Revenue) so
// their title reflects whichever period is currently selected above them.
function rangeSuffix(range: DashboardDateRange): string {
  switch (range) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "custom":
      return "Selected Period";
  }
}

const DONUT_COLORS = ["#1e2667", "#22c55e", "#e5e7eb"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface StatCardDef {
  title: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  accent: string;
}

function StatCard({ title, value, icon: Icon, href, accent }: StatCardDef) {
  return (
    <Link
      href={href}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:border-[#1e2667]/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className={`p-2.5 rounded-lg ${accent} shrink-0`}>
        <Icon className="w-4 h-4 text-[#1e2667]" />
      </div>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs font-medium truncate">{title}</p>
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {value}
        </h3>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<
    { date: string; amount: number }[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    [],
  );
  const [areaDistribution, setAreaDistribution] = useState<
    AreaDistributionZone[]
  >([]);
  const [topAgents, setTopAgents] = useState<TopAgent[]>([]);
  const [plotListingsGrowth, setPlotListingsGrowth] = useState<
    PlotListingsGrowthPoint[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [range, setRange] = useState<DashboardDateRange>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Note: intentionally does not catch -- callers decide how to handle a
  // failure (silent auto-retry on initial load vs. surfacing the error
  // banner on range changes / manual retry).
  const fetchOverview = useCallback(async () => {
    if (range === "custom" && (!customFrom || !customTo)) return;
    const data = await dashboardApi.getOverview(range, customFrom, customTo);
    setOverview(data);
  }, [range, customFrom, customTo]);

  // All of the dashboard's initial data in one shot -- used by the initial
  // mount load (with auto-retry below) and by the manual Retry button.
  const loadDashboardData = useCallback(async () => {
    const [revenue, activity, area, agents, listingsGrowth] =
      await Promise.all([
        dashboardApi.getRevenueGrowth(),
        dashboardApi.getRecentActivity(8),
        dashboardApi.getAreaDistribution(),
        dashboardApi.getTopAgents(5),
        dashboardApi.getPlotListingsGrowth(),
      ]);
    setRevenueGrowth(revenue.data);
    setRecentActivity(activity);
    setAreaDistribution(area);
    setTopAgents(agents);
    setPlotListingsGrowth(listingsGrowth.data);
    await fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    let cancelled = false;

    const runInitialLoad = async () => {
      setIsLoading(true);
      try {
        await loadDashboardData();
        if (!cancelled) setLoadError(null);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Most failures here are a one-off transient network blip rather
        // than a real backend fault, so give it a single silent retry
        // before bothering the user with an error banner.
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (cancelled) return;
        try {
          await loadDashboardData();
          if (!cancelled) setLoadError(null);
        } catch (retryError) {
          console.error("Retry of dashboard data fetch also failed:", retryError);
          if (!cancelled) {
            setLoadError(
              "Couldn't load dashboard data from the server. Numbers below may be stale or blank.",
            );
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    runInitialLoad();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOverview().catch((error) => {
      console.error("Failed to fetch dashboard overview:", error);
      setLoadError(
        "Couldn't load dashboard data from the server. Numbers below may be stale or blank.",
      );
    });
  }, [fetchOverview]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await loadDashboardData();
      setLoadError(null);
    } catch (error) {
      console.error("Manual dashboard data retry failed:", error);
      setLoadError(
        "Couldn't load dashboard data from the server. Numbers below may be stale or blank.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const revenueChartData = revenueGrowth.map((point) => ({
    name: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: point.amount,
  }));

  const listingsChartData = plotListingsGrowth.map((point) => ({
    name: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: point.count,
  }));

  const totalActive = overview?.activeListings ?? 0;
  const totalSold = overview?.soldProperties ?? 0;
  const totalOther = Math.max(
    (overview?.totalProperties ?? 0) - totalActive - totalSold,
    0,
  );
  const donutData = [
    { name: "Active", value: totalActive },
    { name: "Sold", value: totalSold },
    { name: "Other", value: totalOther },
  ].filter((d) => d.value > 0);

  if (isLoading) {
    return (
      <div className="p-8 font-sans bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  const statCards: StatCardDef[] = [
    {
      title: "Total Users",
      value: overview?.totalUsers ?? 0,
      icon: Users,
      href: "/dashboard/users",
      accent: "bg-blue-50",
    },
    {
      title: "Total Agents",
      value: overview?.totalAgents ?? 0,
      icon: UserCheck,
      href: "/dashboard/agents",
      accent: "bg-indigo-50",
    },
    {
      title: "Total Employees",
      value: overview?.totalEmployees ?? 0,
      icon: Briefcase,
      href: "/dashboard/executives",
      accent: "bg-violet-50",
    },
    {
      title: "Total Properties",
      value: overview?.totalProperties ?? 0,
      icon: Home,
      href: "/dashboard/plots",
      accent: "bg-emerald-50",
    },
    {
      title: "Pending Approval",
      value: overview?.propertiesPendingApproval ?? 0,
      icon: Clock,
      href: "/dashboard/property-submissions",
      accent: "bg-amber-50",
    },
    {
      title: "Active Listings",
      value: overview?.activeListings ?? 0,
      icon: CheckCircle2,
      href: "/dashboard/plots",
      accent: "bg-green-50",
    },
    {
      title: "Sold Properties",
      value: overview?.soldProperties ?? 0,
      icon: Tag,
      href: "/dashboard/plots",
      accent: "bg-rose-50",
    },
    {
      title: `Leads (${rangeSuffix(range)})`,
      value: overview?.periodLeads ?? 0,
      icon: MessageSquare,
      href: "/dashboard/enquiries",
      accent: "bg-cyan-50",
    },
    {
      title: "Total Leads",
      value: overview?.totalLeads ?? 0,
      icon: TrendingUp,
      href: "/dashboard/enquiries",
      accent: "bg-teal-50",
    },
    {
      title: `Loan Requests (${rangeSuffix(range)})`,
      value: overview?.loanRequests ?? 0,
      icon: Landmark,
      href: "/dashboard/loan-eligibility",
      accent: "bg-sky-50",
    },
    {
      title: `Legal Verification (${rangeSuffix(range)})`,
      value: overview?.legalVerificationRequests ?? 0,
      icon: Scale,
      href: "/dashboard/legal-verification",
      accent: "bg-orange-50",
    },
    {
      title: `Registration Requests (${rangeSuffix(range)})`,
      value: overview?.registrationRequests ?? 0,
      icon: FileSignature,
      href: "/dashboard/explore-categories/land-registrations",
      accent: "bg-fuchsia-50",
    },
    {
      title: `Land Protection (${rangeSuffix(range)})`,
      value: overview?.landProtectionRequests ?? 0,
      icon: Shield,
      href: "/dashboard/explore-categories/land-protection",
      accent: "bg-pink-50",
    },
    {
      title: `Revenue (${rangeSuffix(range)})`,
      value: formatCurrency(overview?.periodRevenue ?? 0),
      icon: IndianRupee,
      href: "/dashboard/subscription-purchases",
      accent: "bg-lime-50",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(overview?.monthlyRevenue ?? 0),
      icon: Wallet,
      href: "/dashboard/subscription-purchases",
      accent: "bg-yellow-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(overview?.totalRevenue ?? 0),
      icon: PiggyBank,
      href: "/dashboard/subscription-purchases",
      accent: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 font-sans bg-white min-h-full">
      {loadError && (
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {loadError}
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-xs font-semibold underline shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>

        <div className="flex items-center gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                range === opt.value
                  ? "bg-[#1e2667] text-white border-[#1e2667]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {range === "custom" && (
            <div className="flex items-center gap-2 ml-1">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Revenue chart + property donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[320px] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Revenue Overview
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(
                revenueGrowth.reduce((sum, r) => sum + r.amount, 0),
              )}
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e2667" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1e2667" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  interval={4}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1e2667"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[320px] flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Property Listings
          </h2>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No property data yet</p>
            )}
          </div>
          <div className="flex justify-center gap-4 pt-2">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                />
                <span className="text-gray-600">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property listings growth */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-[280px] flex flex-col mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Property Listings Growth
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {plotListingsGrowth.reduce((sum, p) => sum + p.count, 0)}
          </span>
        </div>
        <div className="flex-1 w-full min-h-0">
          {listingsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={listingsChartData}>
                <defs>
                  <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  interval={4}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorListings)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">No listings data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Area-wise distribution */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-[#1e2667]" />
          <h2 className="text-base font-semibold text-gray-900">
            Area-wise Property Distribution
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {areaDistribution.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">
              No properties yet
            </p>
          )}
          {areaDistribution.map((zone) => (
            <div
              key={zone.zone}
              className="border border-gray-100 rounded-lg p-3 bg-gray-50/50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  {zone.zone}
                </span>
                <span className="text-sm font-bold text-[#1e2667]">
                  {zone.total}
                </span>
              </div>
              <div className="space-y-1">
                {zone.byCategory.slice(0, 4).map((c) => (
                  <div
                    key={c.category}
                    className="flex justify-between text-xs text-gray-500"
                  >
                    <span className="truncate">{c.category}</span>
                    <span className="font-medium text-gray-700">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity + Top agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Activities
            </h2>
            <Link
              href="/dashboard/activity"
              className="ml-auto text-xs text-[#1e2667] hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-400">No recent activity</p>
            )}
            {recentActivity.map((item, idx) => (
              <div
                key={`${item.type}-${idx}`}
                className="flex items-start justify-between gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <p className="text-sm text-gray-700">{item.message}</p>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(item.occurredAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[#1e2667]" />
            <h2 className="text-base font-semibold text-gray-900">
              Top Performing Agents
            </h2>
            <Link
              href="/dashboard/top-agents"
              className="ml-auto text-xs text-[#1e2667] hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          {topAgents.length === 0 ? (
            <p className="text-sm text-gray-400">
              No active agent assignments yet
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Properties</th>
                  <th className="pb-2 font-medium">Leads</th>
                  <th className="pb-2 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent) => (
                  <tr
                    key={agent.agentId}
                    className="border-t border-gray-50 text-gray-700"
                  >
                    <td className="py-2 font-medium text-gray-900">
                      {agent.name}
                    </td>
                    <td className="py-2">{agent.properties}</td>
                    <td className="py-2">{agent.leads}</td>
                    <td className="py-2">
                      {agent.conversionRate !== null
                        ? `${agent.conversionRate}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Executive section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-4 h-4 text-[#1e2667]" />
          <h2 className="text-base font-semibold text-gray-900">Executives</h2>
          <Link
            href="/dashboard/executives"
            className="ml-auto text-xs text-[#1e2667] hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-gray-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {overview?.totalEmployees ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              {overview?.activeEmployees ?? 0}
              <MoveUpRight className="w-3 h-3" />
            </p>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-400 flex items-center justify-center gap-1">
              {overview?.inactiveEmployees ?? 0}
              <MoveDownRight className="w-3 h-3" />
            </p>
            <p className="text-xs text-gray-500 mt-1">Inactive</p>
          </div>
        </div>
      </div>
    </div>
  );
}
