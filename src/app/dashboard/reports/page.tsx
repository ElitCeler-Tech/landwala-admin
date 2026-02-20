"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { reportsApi, Report, PaginationMeta } from "@/lib/api";
import { useReportsStore } from "@/store/useReportsStore";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  const { setReportDetail } = useReportsStore();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await reportsApi.getReports(currentPage, limit);
        setReports(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [currentPage]);

  const filteredReports = reports.filter((report) => {
    const searchLower = searchQuery.toLowerCase();
    const reporterName =
      report.reportedBy === "USER"
        ? report.user?.name || report.user?.email || ""
        : report.agent?.fullName || report.agent?.email || "";

    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      reporterName.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      resolved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      in_progress: "bg-blue-100 text-blue-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getReporterInfo = (report: Report) => {
    if (report.reportedBy === "USER") {
      return {
        name: report.user?.name || "Unknown User",
        email: report.user?.email || "N/A",
        phone: report.user?.phone || "N/A",
      };
    } else if (report.reportedBy === "AGENT") {
      return {
        name: report.agent?.fullName || "Unknown Agent",
        email: report.agent?.email || "N/A",
        phone: report.agent?.phone || "N/A",
      };
    }
    return { name: "Unknown", email: "N/A", phone: "N/A" };
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Issue Reports
          </h1>
          <p className="text-gray-500 italic">
            Manage all reported issues from users and agents
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 bg-white cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc] text-sm">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[15%]">
                  Reporter Name
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Email
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">Role</th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Issue Title
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Description
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">
                  Status
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[10%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {/* Spacer row */}
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredReports.map((report) => {
                const reporterInfo = getReporterInfo(report);
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {reporterInfo.name}
                        </span>
                        {reporterInfo.phone && reporterInfo.phone !== "N/A" && (
                          <span className="text-xs text-gray-500">
                            {reporterInfo.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-sm text-gray-500">
                        {reporterInfo.email}
                      </span>
                    </td>
                    <td className="py-5">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          report.reportedBy === "USER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {report.reportedBy}
                      </span>
                    </td>
                    <td className="py-5 text-gray-900 font-medium">
                      {report.title}
                    </td>
                    <td className="py-5 text-gray-500">
                      <p className="line-clamp-2" title={report.description}>
                        {report.description?.split(" ").length > 4
                          ? `${report.description.split(" ").slice(0, 4).join(" ")}...`
                          : report.description}
                      </p>
                    </td>
                    <td className="py-5">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusBadge(
                          report.status,
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-5 pr-8">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        onClick={() => setReportDetail(report.id, report)}
                      >
                        <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between mb-6 items-center mt-6">
        <span className="text-gray-500 text-sm">
          Showing{" "}
          {meta
            ? `${(currentPage - 1) * limit + 1}-${Math.min(
                currentPage * limit,
                meta.total,
              )} of ${meta.total}`
            : "0"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!meta?.hasPrevPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!meta?.hasNextPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
