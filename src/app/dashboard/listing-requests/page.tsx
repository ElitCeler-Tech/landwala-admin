"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { listingRequestsApi, ListingRequest, PaginationMeta } from "@/lib/api";
import Image from "next/image";
import { useListingRequestsStore } from "@/store/useListingRequestsStore";

export default function ListingRequestsPage() {
  const [requests, setRequests] = useState<ListingRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  const { setRequestDetail } = useListingRequestsStore();

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const response = await listingRequestsApi.getListingRequests(
          currentPage,
          limit,
        );
        setRequests(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch listing requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [currentPage]);

  const filteredRequests = requests.filter((req) => {
    const searchLower = searchQuery.toLowerCase();

    return (
      req.agent?.fullName.toLowerCase().includes(searchLower) ||
      req.agent?.email.toLowerCase().includes(searchLower) ||
      req.property?.title.toLowerCase().includes(searchLower) ||
      req.property?.locationAddress.toLowerCase().includes(searchLower)
    );
  });

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
            Listing Requests
          </h1>
          <p className="text-gray-500 italic">
            Review requests by Agents to list specific properties
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
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
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[25%]">
                  Agent details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[20%]">
                  Property
                </th>
                <th className="py-4 font-medium text-gray-600 w-[25%]">
                  Location
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Pricing
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">
                  Requested On
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[5%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {/* Spacer row */}
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/agents/${req.agentId}`}
                        className="font-medium text-[#1e2667] hover:underline flex items-center gap-1"
                      >
                        {req.agent?.fullName || "N/A"}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-xs text-gray-500 mt-1">
                        {req.agent?.email || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {req.agent?.phone || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      {req.property?.images?.[0] ? (
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden relative border border-gray-200 shrink-0">
                          <Image
                            src={req.property.images[0]}
                            alt={req.property.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 shrink-0" />
                      )}
                      <div>
                        <Link
                          href={`/dashboard/plots/${req.propertyId}`}
                          className="font-medium text-gray-900 hover:text-[#1e2667] line-clamp-2"
                        >
                          {req.property?.title || "Unknown Property"}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-gray-600">
                    <p
                      className="line-clamp-2"
                      title={req.property?.locationAddress}
                    >
                      {req.property?.locationAddress || "N/A"}
                    </p>
                  </td>
                  <td className="py-5 text-gray-900 font-medium whitespace-nowrap">
                    {req.property?.priceRange || "N/A"}
                  </td>
                  <td className="py-5 text-gray-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-5 pr-8">
                    <Link
                      href={`/dashboard/listing-requests/${req.id}`}
                      onClick={() => setRequestDetail(req.id, req)}
                    >
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No listing requests found
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
