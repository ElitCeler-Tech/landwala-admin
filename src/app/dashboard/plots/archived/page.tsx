"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { propertiesApi, Property, PaginationMeta } from "@/lib/api";

export default function ArchivedPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const limit = 10;

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await propertiesApi.getArchivedProperties(
        currentPage,
        limit,
      );
      setProperties(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch archived properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await propertiesApi.restoreProperty(id);
      await fetchProperties();
    } catch (error) {
      console.error("Failed to restore property:", error);
    } finally {
      setRestoringId(null);
    }
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
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/dashboard/plots"
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-2xl font-medium text-gray-900">
          Archived Properties
        </h1>
      </div>
      <p className="text-gray-500 italic ml-8 mb-8">
        Properties hidden from public listings. Restore to make them live again.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                  Title
                </th>
                <th className="py-4 font-medium text-gray-600">Price</th>
                <th className="py-4 font-medium text-gray-600">Location</th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              <tr>
                <td className="h-4"></td>
              </tr>
              {properties.map((property) => (
                <tr
                  key={property.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {property.title}
                  </td>
                  <td className="py-5 text-gray-900 font-medium">
                    {property.priceRange}
                  </td>
                  <td className="py-5 text-gray-500">
                    {property.city}
                  </td>
                  <td className="py-5 pr-8 text-right">
                    <button
                      onClick={() => handleRestore(property.id)}
                      disabled={restoringId === property.id}
                      className="bg-green-600 text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {restoringId === property.id && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No archived properties
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
          {meta && meta.total > 0
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
