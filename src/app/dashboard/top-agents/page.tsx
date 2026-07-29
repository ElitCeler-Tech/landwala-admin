"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { dashboardApi, TopAgent } from "@/lib/api";

export default function TopAgentsPage() {
  const router = useRouter();
  const [topAgents, setTopAgents] = useState<TopAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        const data = await dashboardApi.getTopAgents(20);
        setTopAgents(data);
      } catch (error) {
        console.error("Failed to fetch top agents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopAgents();
  }, []);

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-medium text-gray-900">
          Top Performing Agents
        </h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
        </div>
      ) : topAgents.length === 0 ? (
        <p className="text-sm text-gray-400">
          No active agent assignments yet
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="pb-2 font-medium">Agent</th>
                <th className="pb-2 font-medium">Properties</th>
                <th className="pb-2 font-medium">Leads</th>
                <th className="pb-2 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {topAgents.map((agent) => (
                <tr
                  key={agent.agentId}
                  className="border-t border-gray-50 text-gray-700"
                >
                  <td className="py-2 font-medium text-gray-900">
                    {agent.name}
                  </td>
                  <td className="py-2">{agent.properties}</td>
                  <td className="py-2">{agent.leads}</td>
                  <td className="py-2">
                    {agent.conversionRate !== null
                      ? `${agent.conversionRate}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
