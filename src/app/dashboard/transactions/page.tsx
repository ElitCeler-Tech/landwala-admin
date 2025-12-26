"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { transactionsApi, CommissionSummary, LeaderboardEntry } from "@/lib/api";

const tabs = ["Commission Summary", "Leaderboard"];

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("Commission Summary");
  const [commissions, setCommissions] = useState<CommissionSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchData(1);
  }, [activeTab]);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      if (activeTab === "Commission Summary") {
        const response = await transactionsApi.getCommissions(page, 10);
        setCommissions(response.data);
        if (response.meta) {
          setMeta({
            total: response.meta.total,
            page: response.meta.page,
            limit: response.meta.limit,
            totalPages: response.meta.totalPages
          });
        }
      } else {
        const response = await transactionsApi.getLeaderboard(page, 10);
        setLeaderboard(response.data);
        if (response.meta) {
          setMeta({
            total: response.meta.total,
            page: response.meta.page,
            limit: response.meta.limit,
            totalPages: response.meta.totalPages
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Commission Summary
          </h1>
          <p className="text-gray-500 italic">
            Manage commission assignments to agents
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/transactions/assign">
            <button className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity whitespace-nowrap cursor-pointer">
              <Plus className="w-4 h-4" />
              Assign Commision
            </button>
          </Link>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1e2667] w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              activeTab === tab
                ? "bg-[#1e2667] text-white"
                : "bg-[#eaeaec] text-[#1e2667] hover:bg-gray-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-none md:rounded-xl shadow-sm border-0 md:border border-gray-100 p-0 md:p-6 flex-1 flex flex-col">
        {activeTab === "Commission Summary" ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[30%] text-sm">
                    Agent Name
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%] text-center text-sm">
                    Total Commission Assigned
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[20%] text-center text-sm">
                    Date Assigned
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[20%] text-right text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {/* Spacer row */}
                <tr>
                  <td className="h-4"></td>
                </tr>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">Loading commissions...</td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">No commissions found.</td>
                  </tr>
                ) : (
                  commissions.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <td className="py-6 pl-8 font-medium text-gray-500">
                        {item.agentName}
                      </td>
                      <td className="py-6 text-gray-500 text-center font-medium">
                        {formatCurrency(item.totalCommissionAssigned)}
                      </td>
                      <td className="py-6 text-gray-500 text-center">
                        {formatDate(item.lastAssignedAt)}
                      </td>
                      <td className="py-6 pr-8 text-right">
                        <Link href={`/dashboard/transactions/${item.agentId}`}>
                          <button className="bg-[#1e2667] text-white text-xs font-medium px-8 py-2.5 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[10%] text-sm">
                    Rank
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%] text-sm">
                    Agent Name
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%] text-center text-sm">
                    Total Commission
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[30%] text-center text-sm">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">Loading leaderboard...</td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">No data found.</td>
                  </tr>
                ) : (
                  leaderboard.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <td className="py-6 pl-8 font-bold text-gray-900">
                        #{item.rank}
                      </td>
                      <td className="py-6 font-medium text-gray-500">
                        {item.agentName}
                      </td>
                      <td className="py-6 text-gray-500 text-center font-medium">
                        {formatCurrency(item.totalCommissionAssigned)}
                      </td>
                      <td className="py-6 pr-8 text-gray-500 text-center">
                        {formatDate(item.lastAssignedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mb-2 items-center mt-auto pt-6">
        <span className="text-gray-500 text-sm">
          Showing {Math.min((meta.page - 1) * meta.limit + 1, meta.total)} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
        </span>
        <div className="flex gap-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => fetchData(meta.page - 1)}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchData(meta.page + 1)}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
