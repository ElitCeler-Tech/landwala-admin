"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
  transactionsApi,
  AgentCommissionDetail,
  CommissionAssignmentItem,
} from "@/lib/api";

export default function CommissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [detail, setDetail] = useState<AgentCommissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const data = await transactionsApi.getAgentCommissionDetail(agentId);
      setDetail(data);
    } catch (error) {
      console.error("Failed to fetch commission detail:", error);
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString()}`;
  };

  const handleRevoke = async (assignment: CommissionAssignmentItem) => {
    if (
      !window.confirm(
        `Revoke the commission assignment for "${assignment.propertyTitle ?? assignment.propertyId}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setRevokingId(assignment.id);
    try {
      await transactionsApi.revokeCommission(assignment.id);
      await fetchDetail();
    } catch (error) {
      console.error("Failed to revoke commission:", error);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Agent commission record not found</p>
        <button
          onClick={() => router.push("/dashboard/transactions")}
          className="flex items-center gap-2 text-[#1e2667] hover:underline cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/transactions"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-medium text-gray-900">
            Commission Details — {detail.agentName}
          </h1>
        </div>
        <p className="text-gray-500 italic ml-9">
          View all commission assignments for this agent
        </p>
      </div>

      {/* Agent Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          Agent Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Name:</p>
            <p className="text-gray-900 font-medium text-base">
              {detail.agentName}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Phone:</p>
            <p className="text-gray-900 font-medium text-base">
              {detail.phone}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Email Id</p>
            <p className="text-gray-900 font-medium text-base">
              {detail.email}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Agent Code:
            </p>
            <p className="text-gray-900 font-medium text-base">
              {detail.agentCode || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Total Commission Assigned:
            </p>
            <p className="text-gray-900 font-medium text-base">
              {formatCurrency(detail.totalCommissionAssigned)}
            </p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          Commission Assignments ({detail.assignmentCount})
        </h2>

        {detail.assignments.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">
            No active commission assignments for this agent.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-[#f8f9fc] text-sm">
                  <th className="py-3 px-4 rounded-l-lg font-medium text-gray-600">
                    Property
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600">
                    Plot Size
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600">
                    Assigned On
                  </th>
                  <th className="py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="py-3 px-4 rounded-r-lg font-medium text-gray-600 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {detail.assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-4 px-4">
                      {assignment.propertyId ? (
                        <Link
                          href={`/dashboard/plots/${assignment.propertyId}`}
                          className="font-medium text-[#1e2667] hover:underline"
                        >
                          {assignment.propertyTitle ?? "View Property"}
                        </Link>
                      ) : (
                        assignment.propertyTitle ?? "N/A"
                      )}
                    </td>
                    <td className="py-4 px-4">{assignment.plotSize}</td>
                    <td className="py-4 px-4 font-medium">
                      {formatCurrency(assignment.totalCommissionAmount)}
                    </td>
                    <td className="py-4 px-4">
                      {formatDate(assignment.assignedAt)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRevoke(assignment)}
                        disabled={revokingId === assignment.id}
                        className="bg-[#ce1313] text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {revokingId === assignment.id
                          ? "Revoking..."
                          : "Revoke"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        <Link href="/dashboard/transactions">
          <button className="px-8 py-2.5 rounded-lg text-[#1e2667] font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer text-sm">
            Back to Transactions
          </button>
        </Link>
      </div>
    </div>
  );
}
