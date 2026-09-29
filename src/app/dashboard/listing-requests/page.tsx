"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  listingRequestsApi,
  ListingRequest,
  PaginationMeta,
  propertySubmissionsApi,
  PropertySubmission,
} from "@/lib/api";
import Image from "next/image";
import { useListingRequestsStore } from "@/store/useListingRequestsStore";
import { Pagination } from "@/components/Pagination";

const getStatusBadge = (status: string) => {
  const statusStyles: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };
  return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
};

export default function ListingRequestsPage() {
  const [requests, setRequests] = useState<ListingRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [limit, setLimit] = useState(10);

  // Agent uploads live in property submissions, not listing requests, so they
  // were only reachable under Sell Requests mixed in with customer ones. They
  // get their own tab here, which is where an agent's listing activity is
  // actually looked for.
  const [tab, setTab] = useState<"requested" | "uploaded">("requested");
  const [uploads, setUploads] = useState<PropertySubmission[]>([]);
  const [uploadsMeta, setUploadsMeta] = useState<PaginationMeta | null>(null);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);

  const { setRequestDetail } = useListingRequestsStore();

  useEffect(() => {
    if (tab !== "uploaded") return;
    const fetchUploads = async () => {
      setIsLoadingUploads(true);
      try {
        const response = await propertySubmissionsApi.getSubmissions(
          currentPage,
          limit,
          undefined,
          searchQuery || undefined,
          undefined,
          "AGENT",
        );
        setUploads(response.data);
        setUploadsMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch agent uploads:", error);
      } finally {
        setIsLoadingUploads(false);
      }
    };
    fetchUploads();
  }, [tab, currentPage, limit, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab]);

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
  }, [currentPage, limit]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setActionLoadingId(`${id}-${status}`);
    try {
      const updated = await listingRequestsApi.updateStatus(id, status);
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, ...updated } : req)),
      );
      setMessage({
        type: "success",
        text:
          status === "APPROVED"
            ? "Listing request accepted"
            : "Listing request ignored",
      });
    } catch (error: any) {
      console.error("Failed to update listing request status:", error);
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Failed to update listing request",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

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
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Agent Listing Properties
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
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(
          [
            ["requested", "Requested Listings"],
            ["uploaded", "Agent Uploaded"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm px-5 py-2 rounded-lg transition-colors cursor-pointer ${
              tab === key
                ? "bg-[#1e2667] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {tab === "uploaded" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
          {isLoadingUploads ? (
            <div className="flex-1 flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
            </div>
          ) : uploads.length === 0 ? (
            <p className="text-gray-400 text-center py-16">
              No properties uploaded by agents yet.
            </p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-sm font-medium text-gray-500">Property</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Agent</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Location</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Submitted</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="py-4 pr-4 text-sm text-gray-900">
                        {s.title}
                        {s.category && (
                          <span className="block text-xs text-gray-400">
                            {s.category}
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-sm text-gray-600">
                        {s.agent ? (
                          <Link
                            href={`/dashboard/agents/${s.agent.id}`}
                            className="text-[#1e2667] hover:underline"
                          >
                            {s.agent.fullName}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 pr-4 text-sm text-gray-600">
                        {s.location || s.plotLocation || "-"}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getStatusBadge(
                            s.status,
                          )}`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-sm text-gray-500">
                        {new Date(s.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/dashboard/property-submissions/${s.id}`}
                          className="text-sm text-[#1e2667] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {uploadsMeta && uploadsMeta.totalPages > 1 && (
            <p className="text-sm text-gray-500 mt-4">
              {uploadsMeta.total} uploaded by agents
            </p>
          )}
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-[#f8f9fc] text-sm">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                  Agent details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[16%]">
                  Property
                </th>
                <th className="py-4 font-medium text-gray-600 w-[18%]">
                  Location
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">
                  Pricing
                </th>
                <th className="py-4 font-medium text-gray-600 w-[9%]">
                  Requested On
                </th>
                <th className="py-4 font-medium text-gray-600 w-[9%]">
                  Status
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[18%]">
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
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/dashboard/agents/${req.agentId}`}
                        className="font-medium text-[#1e2667] hover:underline flex items-center gap-1 min-w-0"
                      >
                        <span className="truncate">
                          {req.agent?.fullName || "N/A"}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                      <span className="text-xs text-gray-500 mt-1 truncate">
                        {req.agent?.email || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {req.agent?.phone || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-3 min-w-0">
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
                      <div className="min-w-0">
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
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusBadge(
                        req.status,
                      )}`}
                    >
                      {req.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/listing-requests/${req.id}`}
                        onClick={() => setRequestDetail(req.id, req)}
                      >
                        <button className="bg-[#1e2667] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                          View
                        </button>
                      </Link>
                      {req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(req.id, "APPROVED")
                            }
                            disabled={actionLoadingId !== null}
                            className="bg-[#16a34a] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {actionLoadingId === `${req.id}-APPROVED` && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(req.id, "REJECTED")
                            }
                            disabled={actionLoadingId !== null}
                            className="bg-[#b91c1c] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {actionLoadingId === `${req.id}-REJECTED` && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Ignore
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No listing requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <div className="mb-6 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={
            (tab === "uploaded" ? uploadsMeta?.totalPages : meta?.totalPages) ?? 1
          }
          onPageChange={setCurrentPage}
          totalItems={
            (tab === "uploaded" ? uploadsMeta?.total : meta?.total) ?? 0
          }
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
