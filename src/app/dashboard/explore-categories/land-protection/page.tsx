"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { userActionsApi, LandProtection, PaginationMeta } from "@/lib/api";

const STATUS_FILTERS = [
  "all",
  "PENDING",
  "CONTACTED",
  "QUOTE_SENT",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
];

export default function LandProtectionPage() {
  const [protections, setProtections] = useState<LandProtection[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 10;

  useEffect(() => {
    const fetchProtections = async () => {
      setIsLoading(true);
      try {
        const response = await userActionsApi.getLandProtections(
          currentPage,
          limit,
          statusFilter === "all" ? undefined : statusFilter,
        );
        setProtections(response.requests);
        setMeta({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: Math.ceil(response.total / response.limit),
          hasNextPage: response.page * response.limit < response.total,
          hasPrevPage: response.page > 1,
        });
      } catch (error) {
        console.error("Failed to fetch land protections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtections();
  }, [currentPage, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      CONTACTED: "bg-blue-100 text-blue-700",
      QUOTE_SENT: "bg-indigo-100 text-indigo-700",
      ACCEPTED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredProtections = protections.filter((item) => {
    const fullName = item.fullName || "";
    const phone = item.phone || "";
    const query = searchQuery.toLowerCase();

    return (
      fullName.toLowerCase().includes(query) ||
      phone.includes(searchQuery) ||
      item.location.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Land Protection
          </h1>
          <p className="text-gray-500 italic">
            Manage all land protection requests — send quotes and assign to
            agents
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
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
            {status === "all" ? "All" : status.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                  Full Name
                </th>
                <th className="py-4 font-medium text-gray-600">Phone</th>
                <th className="py-4 font-medium text-gray-600">Location</th>
                <th className="py-4 font-medium text-gray-600">Area</th>
                <th className="py-4 font-medium text-gray-600">Quoted</th>
                <th className="py-4 font-medium text-gray-600">Status</th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredProtections.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {item.fullName}
                  </td>
                  <td className="py-5 text-gray-900">{item.phone}</td>
                  <td className="py-5 text-gray-900">
                    <div className="flex items-center gap-2">
                      {item.location}
                      {item.isOutOfRange && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Out of range
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 text-gray-500">{item.landArea}</td>
                  <td className="py-5 text-gray-500">
                    {item.quotedAmount ? `₹${item.quotedAmount}` : "-"}
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                        item.status,
                      )}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <Link
                      href={`/dashboard/explore-categories/land-protection/${item.id}`}
                    >
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProtections.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No land protection requests found
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
