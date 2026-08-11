"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  userActionsApi,
  LandProtectionAssignment,
  PaginationMeta,
} from "@/lib/api";
import { Pagination } from "@/components/Pagination";

export default function AssignLandProtectionsPage() {
  const [assignments, setAssignments] = useState<LandProtectionAssignment[]>(
    [],
  );
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const response = await userActionsApi.getLandProtectionAssignments(
          currentPage,
          limit,
          "ACCEPTED",
        );
        setAssignments(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch assigned land protections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [currentPage, limit]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const searchLower = searchQuery.toLowerCase();
    const customerMatch =
      assignment.landProtection.fullName.toLowerCase().includes(searchLower) ||
      assignment.landProtection.phone.includes(searchLower);
    const agentMatch =
      assignment.agent.fullName.toLowerCase().includes(searchLower) ||
      assignment.agent.agentCode.toLowerCase().includes(searchLower);
    return customerMatch || agentMatch;
  });

  if (isLoading && assignments.length === 0) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col relative">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Assign - Land Protections
          </h1>
          <p className="text-gray-500 italic">
            Manage accepted agent assignments for land protections
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Customer or Agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-[#f8f9fc] text-sm">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                  Customer Details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Land Details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Agent Details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Accepted At
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Status
                </th>
                <th className="py-4 rounded-r-xl font-medium text-gray-600 w-[10%] pr-8">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">
                        {assignment.landProtection.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {assignment.landProtection.countryCode}{" "}
                        {assignment.landProtection.phone}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-gray-900 line-clamp-1"
                        title={assignment.landProtection.landLocation}
                      >
                        {assignment.landProtection.landLocation}
                      </span>
                      <span className="text-xs text-gray-500">
                        Area: {assignment.landProtection.landArea}
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">
                        {assignment.agent.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {assignment.agent.agentCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 text-gray-500">
                    <div className="flex flex-col gap-1">
                      <span>{formatDate(assignment.acceptedAt)}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {assignment.status}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <Link
                      href={`/dashboard/explore-categories/land-protection/${assignment.landProtectionId}`}
                    >
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No accepted assignments found
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
