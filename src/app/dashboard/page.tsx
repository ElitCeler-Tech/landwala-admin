"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  FileText,
  MoveUpRight,
  Calendar,
  Loader2,
  UserCheck,
  MessageSquare,
  LandPlot,
  TrendingUp,
  Tag,
  Scale,
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
  Legend,
} from "recharts";
import { dashboardApi, DashboardData } from "@/lib/api";

const plotListingsData = [
  { name: "Jan 1", value: 0 },
  { name: "Jan 8", value: 100 },
  { name: "Jan 15", value: 50 },
  { name: "Jan 24", value: 150 },
  { name: "Jan 31", value: 150 },
  { name: "Feb 1", value: 300 },
  { name: "Feb 8", value: 150 },
  { name: "Feb 15", value: 200 },
  { name: "Feb 22", value: 250 },
  { name: "Feb 28", value: 150 },
];

const approvalStatusData = [
  { name: "Approved", value: 40, color: "#1e2667" },
  { name: "Pending", value: 30, color: "#fbbf24" },
  { name: "Rejected", value: 30, color: "#000000" },
  { name: "Verified", value: 20, color: "#22c55e" },
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 font-sans bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  // Helper to format checks for display
  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ElementType,
    subStats?: {
      label: string;
      value: string | number | undefined;
      color?: string;
    }[],
    className?: string,
  ) => (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full ${className || ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon &&
            React.createElement(icon, { className: "w-5 h-5 text-[#1e2667]" })}
        </div>
      </div>

      {subStats && subStats.length > 0 && (
        <div className="mt-auto space-y-2 pt-4 border-t border-gray-50">
          {subStats.map(
            (stat, idx) =>
              stat.value !== undefined && (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-500">{stat.label}</span>
                  <span
                    className={`font-semibold ${stat.color || "text-gray-900"}`}
                  >
                    {stat.value}
                  </span>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 font-sans bg-white min-h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h1>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Row 1 */}
        {renderStatCard(
          "Total Users",
          dashboardData?.totalUsers || 0,
          Users,
          [],
          "bg-blue-50/50",
        )}

        {renderStatCard(
          "Total Agents",
          dashboardData?.totalAgents.total || 0,
          UserCheck,
          [
            {
              label: "Active",
              value: dashboardData?.totalAgents.active,
              color: "text-green-600",
            },
            {
              label: "Pending KYC",
              value: dashboardData?.totalAgents.pendingKyc,
              color: "text-amber-600",
            },
          ],
          "lg:col-span-2 bg-indigo-50/50",
        )}

        {renderStatCard(
          "Layout Enquiries",
          dashboardData?.layoutEnquiries || 0,
          MessageSquare,
          [],
          "bg-purple-50/50",
        )}

        {/* Row 2 */}
        {renderStatCard(
          "Latest Listings",
          dashboardData?.latestListings.total || 0,
          Tag,
          [
            {
              label: "Active",
              value: dashboardData?.latestListings.active,
              color: "text-green-600",
            },
            {
              label: "Featured",
              value: dashboardData?.latestListings.featured,
              color: "text-purple-600",
            },
          ],
          "lg:col-span-2 bg-emerald-50/50",
        )}

        {renderStatCard(
          "Buy Plots Interest",
          dashboardData?.buyPlots.total || 0,
          LandPlot,
          [],
          "bg-teal-50/50",
        )}

        {renderStatCard(
          "Sell Requests",
          dashboardData?.sellPlots.total || 0,
          TrendingUp,
          [
            {
              label: "Pending",
              value: dashboardData?.sellPlots.pending,
              color: "text-amber-600",
            },
            {
              label: "Approved",
              value: dashboardData?.sellPlots.approved,
              color: "text-green-600",
            },
          ],
          "bg-cyan-50/50",
        )}

        {/* Row 3 */}
        {renderStatCard(
          "Legal Verification",
          dashboardData?.legalVerification.total || 0,
          Scale,
          [
            {
              label: "Pending",
              value: dashboardData?.legalVerification.pending,
              color: "text-amber-600",
            },
            {
              label: "Verified",
              value: dashboardData?.legalVerification.verified,
              color: "text-green-600",
            },
          ],
          "bg-orange-50/50",
        )}

        {renderStatCard(
          "Land Protection",
          dashboardData?.landProtection.total || 0,
          Shield,
          [
            {
              label: "Pending",
              value: dashboardData?.landProtection.pending,
              color: "text-amber-600",
            },
            {
              label: "Contacted",
              value: dashboardData?.landProtection.contacted,
              color: "text-blue-600",
            },
          ],
          "bg-rose-50/50",
        )}

        {renderStatCard(
          "Loan Applications",
          dashboardData?.loanApplications.total || 0,
          FileText,
          [
            {
              label: "Pending",
              value: dashboardData?.loanApplications.pending,
              color: "text-amber-600",
            },
            {
              label: "Approved",
              value: dashboardData?.loanApplications.approved,
              color: "text-green-600",
            },
          ],
          "lg:col-span-2 bg-sky-50/50",
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[400px]">
        {/* Line Chart */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Plot Listings Growth
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl text-black font-bold">
                  {dashboardData?.latestListings.total || 0}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  16.8% <MoveUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div className="relative">
              <button className="text-xs text-gray-500 border rounded px-3 py-1 flex items-center gap-2 cursor-pointer">
                <Calendar className="w-3 h-3" /> Last 30 Days
              </button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plotListingsData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e2667" stopOpacity={0.1} />
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
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  interval={2}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1e2667"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Land Approval Status
          </h2>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalStatusData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {approvalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {value}
                    </span>
                  )}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
