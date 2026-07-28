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
import { agentsApi, Agent, PaginationMeta } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const limit = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsFetching(true);
      try {
        const response = await agentsApi.getAgents(
          currentPage,
          limit,
          searchQuery || undefined,
        );
        setAgents(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      } finally {
        setIsFetching(false);
        setIsInitialLoading(false);
      }
    };

    fetchAgents();
  }, [currentPage, searchQuery]);

  const getAssignedLocations = (agent: Agent) => {
    const locations = [
      agent.assignedDistrict,
      agent.assignedMandal,
      agent.assignedVillage,
    ]
      .filter(Boolean)
      .join(", ");
    return locations || "Not assigned";
  };

  const getKycStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
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
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            All Agents
          </h1>
          <p className="text-gray-500 italic">
            Manage all registered Agents here for Landwala
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/agents/create">
            <button className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer">
              <Plus className="w-4 h-4" />
              Create Agent
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
                  KYC Status
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[13%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {/* Spacer row */}
              <tr>
                <td className="h-4"></td>
              </tr>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    {agent.fullName}
                  </td>
                  <td className="py-5 text-gray-500">{agent.email}</td>
                  <td className="py-5 text-gray-500">{agent.phone}</td>
                  <td className="py-5 text-gray-500">
                    {getAssignedLocations(agent)}
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getKycStatusBadge(
                        agent.kycStatus
                      )}`}
                    >
                      {agent.kycStatus}
                    </span>
                  </td>
                  <td className="py-5 pr-8">
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No agents found
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
                meta.total
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
