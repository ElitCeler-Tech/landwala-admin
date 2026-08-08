"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { landVisitsApi, LandVisitTableRow } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

const REVIEW_FILTERS = ["all", "PENDING_REVIEW", "REVIEWED", "FLAGGED"];

export default function LandVisitsPage() {
  const [visits, setVisits] = useState<LandVisitTableRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      try {
        const response = await landVisitsApi.getVisits({
          page: currentPage,
          limit,
          reviewStatus: reviewFilter === "all" ? undefined : reviewFilter,
        });
        setVisits(response.data);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch land visits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [currentPage, limit, reviewFilter]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING_REVIEW: "bg-amber-100 text-amber-700",
      REVIEWED: "bg-green-100 text-green-700",
      FLAGGED: "bg-red-100 text-red-700",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Land Visits
          </h1>
          <p className="text-gray-500 italic">
            Review GPS-verified inspection visits — reviewing publishes
            results to the customer
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {REVIEW_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setReviewFilter(status);
              setCurrentPage(1);
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg capitalize transition-colors cursor-pointer ${
              reviewFilter === status
                ? "bg-[#1e2667] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status === "all"
              ? "All"
              : status.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[15%]">
                    Land Code
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[20%]">
                    Executive
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Visit Date
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[10%]">
                    Photos
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Status
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Review
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
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8 font-medium text-gray-900">
                      {visit.landCode || "-"}
                    </td>
                    <td className="py-5 text-gray-900">
                      {visit.executiveName}
                    </td>
                    <td className="py-5 text-gray-500">
                      {new Date(visit.visitDate).toLocaleDateString()}
                    </td>
                    <td className="py-5 text-gray-500">{visit.photoCount}</td>
                    <td className="py-5 text-gray-500">{visit.status}</td>
                    <td className="py-5">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                          visit.reviewStatus,
                        )}`}
                      >
                        {visit.reviewStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-5 pr-8">
                      <Link href={`/dashboard/land-visits/${visit.id}`}>
                        <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No land visits found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
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
