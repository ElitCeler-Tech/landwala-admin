"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { executivesApi, Executive, PaginationMeta } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchExecutives = async () => {
      setIsFetching(true);
      try {
        const response = await executivesApi.getExecutives(
          currentPage,
          limit,
          searchQuery || undefined,
        );
        setExecutives(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch executives:", error);
      } finally {
        setIsFetching(false);
        setIsInitialLoading(false);
      }
    };

    fetchExecutives();
  }, [currentPage, limit, searchQuery]);

  const getAssignedLocations = (executive: Executive) => {
    const locations = [
      executive.assignedDistrict,
      executive.assignedMandal,
      executive.assignedVillage,
    ]
      .filter(Boolean)
      .join(", ");
    return locations || "Not assigned";
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
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Field Executives
            </h1>
            <p className="text-gray-500 italic">
              Executives perform GPS-verified land inspections — separate
              from Agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/executives/create">
            <button className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer">
              <Plus className="w-4 h-4" />
              Create Executive
            </button>
          </Link>
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
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                  Name
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Email
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Phone
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Assigned Locations
                </th>
                <th className="py-4 font-medium text-gray-600 w-[12%]">
                  Status
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[13%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              <tr>
                <td className="h-4"></td>
              </tr>
              {executives.map((executive) => (
                <tr
                  key={executive.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {executive.fullName}
                  </td>
                  <td className="py-5 text-gray-500">{executive.email}</td>
                  <td className="py-5 text-gray-500">{executive.phone}</td>
                  <td className="py-5 text-gray-500">
                    {getAssignedLocations(executive)}
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        executive.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {executive.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <Link href={`/dashboard/executives/${executive.id}`}>
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {executives.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No executives found
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
