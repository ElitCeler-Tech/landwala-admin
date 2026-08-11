"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  propertySubmissionsApi,
  PropertySubmission,
  PaginationMeta,
} from "@/lib/api";
import { Pagination } from "@/components/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const STATUS_FILTERS = ["all", "pending", "reviewed", "approved", "rejected"];

export default function PropertySubmissionsPage() {
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsFetching(true);
      try {
        const response = await propertySubmissionsApi.getSubmissions(
          currentPage,
          limit,
          statusFilter === "all" ? undefined : statusFilter,
          searchQuery || undefined,
        );
        setSubmissions(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch property submissions:", error);
      } finally {
        setIsFetching(false);
        setIsInitialLoading(false);
      }
    };

    fetchSubmissions();
  }, [currentPage, limit, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getSubmitterName = (submission: PropertySubmission) => {
    if (submission.submittedBy === "AGENT" && submission.agent) {
      return `${submission.agent.fullName} (Agent)`;
    }
    if (submission.user) {
      return submission.user.name || submission.user.phone || "User";
    }
    return "-";
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
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Sell Requests
          </h1>
          <p className="text-gray-500 italic">
            Properties users and agents have submitted to sell. Review and approve/reject each request.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg capitalize transition-colors cursor-pointer ${
              statusFilter === status
                ? "bg-[#1e2667] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
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
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[22%]">
                  Title
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Category
                </th>
                <th className="py-4 font-medium text-gray-600 w-[13%]">
                  Size
                </th>
                <th className="py-4 font-medium text-gray-600 w-[13%]">
                  Price
                </th>
                <th className="py-4 font-medium text-gray-600 w-[17%]">
                  Submitted By
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
              <tr>
                <td className="h-4"></td>
              </tr>
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {submission.title}
                  </td>
                  <td className="py-5 text-gray-500">
                    {submission.category || "-"}
                  </td>
                  <td className="py-5 text-gray-500">
                    {submission.size} {submission.unit || ""}
                  </td>
                  <td className="py-5 text-gray-500">
                    {submission.price ? `₹${submission.price}` : "-"}
                  </td>
                  <td className="py-5 text-gray-500">
                    {getSubmitterName(submission)}
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusBadge(
                        submission.status,
                      )}`}
                    >
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <Link href={`/dashboard/property-submissions/${submission.id}`}>
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No property submissions found
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
