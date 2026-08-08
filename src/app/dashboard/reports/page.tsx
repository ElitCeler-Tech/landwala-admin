"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { reportsApi, Report, PaginationMeta } from "@/lib/api";
import { useReportsStore } from "@/store/useReportsStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const [limit, setLimit] = useState(10);
  const [reportedByFilter, setReportedByFilter] = useState("");

  const { setReportDetail } = useReportsStore();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, reportedByFilter]);

  useEffect(() => {
    const fetchReports = async () => {
      setIsFetching(true);
      try {
        const response = await reportsApi.getReports(
          currentPage,
          limit,
          searchQuery || undefined,
          reportedByFilter || undefined,
        );
        setReports(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsFetching(false);
        setIsInitialLoading(false);
      }
    };

    fetchReports();
  }, [currentPage, limit, searchQuery, reportedByFilter]);

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
    } else if (report.reportedBy === "EXECUTIVE") {
      return {
        name: report.executive?.fullName || "Unknown Executive",
        email: report.executive?.email || "N/A",
        phone: report.executive?.phone || "N/A",
      };
    }
    return { name: "Unknown", email: "N/A", phone: "N/A" };
  };

  if (isInitialLoading) {
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
            Manage all reported issues from users, agents, and executives
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            onFocus={scrollSelectIntoView}
            value={reportedByFilter}
            onChange={(e) => setReportedByFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
          >
            <option value="">All reporters</option>
            <option value="USER">Users</option>
            <option value="AGENT">Agents</option>
            <option value="EXECUTIVE">Executives</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
          </div>
        )}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
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
              {reports.map((report) => {
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
                            : report.reportedBy === "EXECUTIVE"
                              ? "bg-teal-100 text-teal-700"
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusBadge(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
                        {report.adminRemark && (
                          <span
                            title={`Admin remark: ${report.adminRemark}`}
                            className="shrink-0"
                          >
                            <MessageSquareText className="w-3.5 h-3.5 text-gray-400" />
                          </span>
                        )}
                      </div>
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
              {reports.length === 0 && (
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

      <div className="mb-6 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={meta?.totalPages ?? 1}
          onPageChange={setCurrentPage}
          totalItems={meta?.total ?? 0}
          pageSize={limit}
          onPageSizeChange={(size) => {
            setLimit(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
