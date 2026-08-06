"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, ExternalLink } from "lucide-react";
import {
  userActionsApi,
  agentsApi,
  LandProtection,
  LandProtectionAssignment,
  Agent,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

export default function LandProtectionDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<LandProtection | null>(null);
  const [assignments, setAssignments] = useState<LandProtectionAssignment[]>(
    [],
  );
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [quoteAmount, setQuoteAmount] = useState("");
  const [visitFrequency, setVisitFrequency] = useState<
    "" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY"
  >("");
  const [selectedAgentId, setSelectedAgentId] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const [requestData, assignmentData, agentsData] = await Promise.all([
        userActionsApi.getLandProtectionById(requestId),
        userActionsApi.getLandProtectionAssignmentHistory(requestId),
        agentsApi.getAgents(1, 100),
      ]);
      setRequest(requestData);
      setAssignments(assignmentData);
      setAgents(agentsData.data);
    } catch (err) {
      console.error("Failed to fetch land protection details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      fetchAll();
    }
  }, [requestId, fetchAll]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: "bg-amber-100 text-amber-700",
      CONTACTED: "bg-blue-100 text-blue-700",
      QUOTE_SENT: "bg-indigo-100 text-indigo-700",
      ACCEPTED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-700";
  };

  const currentAssignment = assignments[0];
  const canReassign = currentAssignment?.status === "REJECTED";
  const canAssign = !currentAssignment || currentAssignment.status === "REJECTED";

  const handleSendQuote = async () => {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid quote amount");
      return;
    }
    setActionLoading("quote");
    setError("");
    try {
      const updated = await userActionsApi.sendLandProtectionQuote(
        requestId,
        amount,
        visitFrequency || undefined,
      );
      setRequest(updated);
      setQuoteAmount("");
      setVisitFrequency("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send quote");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveOutOfRange = async () => {
    setActionLoading("approve");
    setError("");
    try {
      await userActionsApi.approveOutOfRange(requestId);
      await fetchAll();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to approve out-of-range",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgentId) {
      setError("Select an agent first");
      return;
    }
    setActionLoading("assign");
    setError("");
    try {
      if (canReassign) {
        await userActionsApi.reassignLandProtection(requestId, selectedAgentId);
      } else {
        await userActionsApi.assignLandProtection(requestId, selectedAgentId);
      }
      setSelectedAgentId("");
      await fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign agent");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Land protection request not found</p>
        <Link
          href="/dashboard/explore-categories/land-protection"
          className="text-[#1e2667] hover:underline"
        >
          Back to Land Protection
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/explore-categories/land-protection"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Land Protection Request
          </h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Send a quote, approve out-of-range requests, and assign to agents
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {request.fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Requested {formatDate(request.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {request.isOutOfRange && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                Out of range
              </span>
            )}
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                request.status,
              )}`}
            >
              {request.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-gray-500 text-sm mb-1">Phone:</p>
            <p className="text-gray-900 font-medium">
              {request.countryCode} {request.phone}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Land Location:</p>
            <p className="text-gray-900 font-medium">{request.landLocation}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Location:</p>
            <p className="text-gray-900 font-medium">{request.location}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Land Area:</p>
            <p className="text-gray-900 font-medium">{request.landArea}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Pincode:</p>
            <p className="text-gray-900 font-medium">{request.pincode}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Survey Numbers:</p>
            <p className="text-gray-900 font-medium">
              {request.surveyNumbers && request.surveyNumbers.length > 0
                ? request.surveyNumbers.join(", ")
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Quoted Amount:</p>
            <p className="text-gray-900 font-medium">
              {request.quotedAmount ? `₹${request.quotedAmount}` : "Not quoted yet"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Quote Sent At:</p>
            <p className="text-gray-900 font-medium">
              {formatDate(request.quoteSentAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Visit Frequency:</p>
            <p className="text-gray-900 font-medium">
              {request.visitFrequency
                ? request.visitFrequency.replace("_", " ")
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Admin Approved:</p>
            <p className="text-gray-900 font-medium">
              {request.adminApproved ? `Yes (${formatDate(request.adminApprovedAt)})` : "No"}
            </p>
          </div>
        </div>

        {request.adminNotes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Admin Notes:</p>
            <p className="text-gray-900">{request.adminNotes}</p>
          </div>
        )}

        {request.layoutUrl && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <a
              href={request.layoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#1e2667] hover:underline"
            >
              View Land Layout <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {(request.userLayoutUrl || request.dimensionPageUrl) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-3">
              Customer Submitted Documents:
            </p>
            <div className="flex flex-wrap gap-4">
              {request.userLayoutUrl && (
                <a
                  href={request.userLayoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#1e2667] hover:underline"
                >
                  View Customer&apos;s Layout Photo{" "}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {request.dimensionPageUrl && (
                <a
                  href={request.dimensionPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#1e2667] hover:underline"
                >
                  View Dimension Page{" "}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {request.imageUrls && request.imageUrls.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-3">Inspection Images:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {request.imageUrls.map((url, idx) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Inspection image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Send Quote */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Send Quote
          </h3>
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              placeholder="Amount (₹)"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <select
              onFocus={scrollSelectIntoView}
              value={visitFrequency}
              onChange={(e) =>
                setVisitFrequency(
                  e.target.value as "" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY",
                )
              }
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            >
              <option value="">Visit Frequency</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="HALF_YEARLY">Half Yearly</option>
            </select>
            <button
              onClick={handleSendQuote}
              disabled={actionLoading !== null}
              className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading === "quote" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Send
            </button>
          </div>
          {request.isOutOfRange && !request.adminApproved && (
            <button
              onClick={handleApproveOutOfRange}
              disabled={actionLoading !== null}
              className="mt-4 w-full bg-orange-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading === "approve" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Approve Out-of-Range (Enable Payment)
            </button>
          )}
        </div>

        {/* Assign to Agent */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            {canReassign ? "Reassign to Agent" : "Assign to Agent"}
          </h3>
          {canAssign ? (
            <div className="flex gap-3">
              <select
                onFocus={scrollSelectIntoView}
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={actionLoading !== null}
                className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === "assign" && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {canReassign ? "Reassign" : "Assign"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Already assigned to{" "}
              <span className="font-medium text-gray-900">
                {currentAssignment?.agent?.fullName}
              </span>{" "}
              (
              {currentAssignment?.status.toLowerCase()}
              ). {currentAssignment?.status === "REJECTED"
                ? ""
                : "Reject the assignment before reassigning."}
            </p>
          )}
        </div>
      </div>

      {/* Assignment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Assignment History
        </h2>
        {assignments.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fc] text-sm">
                  <th className="py-3 pl-4 rounded-l-lg font-medium text-gray-600">
                    Agent
                  </th>
                  <th className="py-3 font-medium text-gray-600">Status</th>
                  <th className="py-3 font-medium text-gray-600">Assigned</th>
                  <th className="py-3 font-medium text-gray-600">
                    Accepted/Rejected
                  </th>
                  <th className="py-3 pr-4 rounded-r-lg font-medium text-gray-600">
                    Rejection Reason
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pl-4 font-medium text-gray-900">
                      {a.agent?.fullName || "-"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                          a.status,
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3">{formatDate(a.createdAt)}</td>
                    <td className="py-3">
                      {formatDate(a.acceptedAt || a.rejectedAt)}
                    </td>
                    <td className="py-3 pr-4">{a.rejectionReason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Not yet assigned to any agent
          </p>
        )}
      </div>
    </div>
  );
}
