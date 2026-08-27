"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { inspectionLandsApi, InspectionLand } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";

export default function InspectionLandsPage() {
  const [lands, setLands] = useState<InspectionLand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const [limit, setLimit] = useState(10);

  const fetchLands = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await inspectionLandsApi.getLands(
        currentPage,
        limit,
        searchQuery || undefined,
      );
      setLands(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch inspection lands:", err);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [currentPage, limit, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Inspection Lands
          </h1>
          <p className="text-gray-500 italic">
            Lands to be GPS-verified by field executives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
              </div>
            )}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                    Owner
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Land Code
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%]">
                    Location
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Status
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[20%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {lands.map((land) => (
                  <tr
                    key={land.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8 font-medium text-gray-900">
                      {land.ownerName}
                      {land.landProtectionId && (
                        <span className="ml-2 inline-block text-[10px] font-medium text-[#1e2667] bg-indigo-50 px-2 py-0.5 rounded-full align-middle">
                          Land Protection
                        </span>
                      )}
                    </td>
                    <td className="py-5 text-gray-500">
                      {land.landCode || "-"}
                    </td>
                    <td className="py-5 text-gray-900">
                      {land.village}, {land.mandal}, {land.district}
                    </td>
                    <td className="py-5">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          land.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {land.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-5 pr-8">
                      <Link href={`/dashboard/inspection-lands/${land.id}`}>
                        <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                          View / Assign
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {lands.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      No inspection lands found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
