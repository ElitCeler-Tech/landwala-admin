"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileCheck,
  Shield,
  FileText,
  MoveUpRight,
  Calendar,
  Loader2,
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
];

// Table Data
const usersData = Array(5).fill({
  id: "MA3414",
  name: "Rohan Sen",
  email: "rohan24@gmail.com",
  date: "Oct 6",
});

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
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

  const stats = dashboardData
    ? [
      {
        label: "Total Users",
        value: dashboardData.totalUsers,
        icon: Users,
      },
      {
        label: "Loan Applications",
        value: dashboardData.loanApplications.total,
        pending: dashboardData.loanApplications.pending,
        icon: FileText,
      },
      {
        label: "Legal Verifications",
        value: dashboardData.legalVerification.total,
        pending: dashboardData.legalVerification.pending,
        icon: FileCheck,
      },
      {
        label: "Land Protection",
        value: dashboardData.landProtection.total,
        pending: dashboardData.landProtection.pending,
        icon: Shield,
      },
    ]
    : [];

  if (isLoading) {
    return (
      <div className="p-8 font-sans bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 font-sans bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex flex-col gap-4">
              <div className="text-gray-500 text-sm font-medium flex items-center gap-2">
                <stat.icon className="w-4 h-4" /> {stat.label}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </span>
                {"pending" in stat && stat.pending !== undefined && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    {stat.pending} Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[400px]">
        {/* Line Chart */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Plot Listings
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl text-black font-bold">257</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  16.8% <MoveUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
            <div className="relative">
              <button className="text-xs text-gray-500 border rounded px-3 py-1 flex items-center gap-2 cursor-pointer">
                <Calendar className="w-3 h-3" /> Jan 2024
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

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <button className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                  User ID
                </th>
                <th className="py-4 font-medium text-gray-600">Name</th>
                <th className="py-4 font-medium text-gray-600">Email</th>
                <th className="py-4 font-medium text-gray-600">
                  Registered Date
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {/* Spacer row */}
              <tr>
                <td className="h-4"></td>
              </tr>
              {usersData.map((user, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="py-5 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="py-5 text-gray-500">{user.email}</td>
                  <td className="py-5 text-gray-500">{user.date}</td>
                  <td className="py-5 pr-8">
                    <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
