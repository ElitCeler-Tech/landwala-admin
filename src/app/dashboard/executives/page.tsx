"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { executivesApi, Executive, PaginationMeta } from "@/lib/api";

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  useEffect(() => {
    const fetchExecutives = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchExecutives();
  }, [currentPage, searchQuery]);

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
            Field Executives
          </h1>
          <p className="text-gray-500 italic">
            Executives perform GPS-verified land inspections — separate from
            Agents
          </p>
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
