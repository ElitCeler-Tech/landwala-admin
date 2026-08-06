"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { agentsApi, Agent, Property, PaginationMeta } from "@/lib/api";

const AGENT_PROPERTIES_LIMIT = 9;

const tabs = [
  "KYC Document",
  "Bank Details",
  "Assigned Location",
  "Leads Handled",
  "Land Listing",
  "Commission & Payout",
];

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("KYC Document");

  // Land Listing tab data -- properties this agent has had approved via
  // their submissions (GET /admin/agents/:id/properties)
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [propertiesMeta, setPropertiesMeta] = useState<PaginationMeta | null>(
    null,
  );
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState("");

  const fetchAgent = async () => {
    try {
      const data = await agentsApi.getAgentById(agentId);
      setAgent(data);
    } catch (error) {
      console.error("Failed to fetch agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  // Land Listing tab: fetch (and re-fetch on page change) whenever the tab
  // is active, mirroring the lazy-load pattern used by other tabs.
  useEffect(() => {
    if (activeTab !== "Land Listing" || !agentId) return;
    const fetchAgentProperties = async () => {
      setIsLoadingProperties(true);
      setPropertiesError("");
      try {
        const response = await agentsApi.getAgentProperties(
          agentId,
          propertiesPage,
          AGENT_PROPERTIES_LIMIT,
        );
        setAgentProperties(response.data);
        setPropertiesMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch agent properties:", error);
        setPropertiesError("Failed to load land listings");
      } finally {
        setIsLoadingProperties(false);
      }
    };
    fetchAgentProperties();
  }, [activeTab, agentId, propertiesPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getKycStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const handleApproveKyc = async () => {
    setActionLoading("approve");
    try {
      await agentsApi.approveKyc(agentId);
      await fetchAgent();
    } catch (error) {
      console.error("Failed to approve KYC:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectKyc = async () => {
    setActionLoading("reject");
    try {
      await agentsApi.rejectKyc(agentId);
      await fetchAgent();
    } catch (error) {
      console.error("Failed to reject KYC:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async () => {
    setActionLoading("toggle");
    try {
      if (agent?.isActive) {
        await agentsApi.deactivateAgent(agentId);
      } else {
        await agentsApi.activateAgent(agentId);
      }
      await fetchAgent();
    } catch (error) {
      console.error("Failed to toggle agent status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this agent? This cannot be undone from the admin panel.",
      )
    ) {
      return;
    }
    setActionLoading("delete");
    try {
      await agentsApi.deleteAgent(agentId);
      router.push("/dashboard/agents");
    } catch (error) {
      console.error("Failed to delete agent:", error);
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

  if (!agent) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Agent not found</p>
        <Link
          href="/dashboard/agents"
          className="text-[#1e2667] hover:underline"
        >
          Back to Agents
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
            href="/dashboard/agents"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Agent Details</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          View all the details about the Agent here
        </p>
      </div>

      {/* Agent Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-8">
          <div className="w-24 h-24 rounded-full bg-[#1e2667] flex items-center justify-center text-white text-4xl font-medium shrink-0">
            {agent.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <span className="text-sm font-medium text-gray-900">Name- </span>
              <span className="text-sm text-gray-700">{agent.fullName}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Phone number -
              </span>
              <span className="text-sm text-gray-700"> {agent.phone}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Agent ID:-{" "}
              </span>
              <span className="text-sm text-gray-700 break-all">
                {agent.id.slice(0, 8)}...
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Agent Code -{" "}
              </span>
              <span className="text-sm text-gray-700">
                {agent.agentCode || "—"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                E mail ID-
              </span>
              <span className="text-sm text-gray-700"> {agent.email}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                KYC Status: -{" "}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getKycStatusBadge(
                  agent.kycStatus
                )}`}
              >
                {agent.kycStatus}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">Status-</span>
              <span className="text-sm text-gray-700">
                {" "}
                {agent.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Gender -{" "}
              </span>
              <span className="text-sm text-gray-700">{agent.gender}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">DOB - </span>
              <span className="text-sm text-gray-700">
                {formatDate(agent.dateOfBirth)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Registered -{" "}
              </span>
              <span className="text-sm text-gray-700">
                {formatDate(agent.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        {agent.kycStatus === "pending" && (
          <>
            <button
              onClick={handleRejectKyc}
              disabled={actionLoading !== null}
              className="bg-[#b91c1c] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading === "reject" && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject KYC
            </button>
            <button
              onClick={handleApproveKyc}
              disabled={actionLoading !== null}
              className="bg-[#16a34a] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading === "approve" && <Loader2 className="w-4 h-4 animate-spin" />}
              Approve KYC
            </button>
          </>
        )}
        <button
          onClick={handleToggleActive}
          disabled={actionLoading !== null}
          className="bg-[#1e2667] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {actionLoading === "toggle" && <Loader2 className="w-4 h-4 animate-spin" />}
          {agent.isActive ? "Deactivate Agent" : "Activate Agent"}
        </button>
        <button
          onClick={handleDelete}
          disabled={actionLoading !== null}
          className="bg-[#b91c1c] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {actionLoading === "delete" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete Agent
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex w-full min-w-max md:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer flex-1 text-center px-4",
                activeTab === tab
                  ? "text-[#1e2667] border-b-2 border-[#1e2667]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 ">
        {activeTab === "KYC Document" && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Documents Upload
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Aadhaar Card:
                </p>
                {agent.aadharCardUrl ? (
                  <a
                    href={agent.aadharCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-900 font-medium flex-1">
                      Aadhaar Card
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Not uploaded</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  PAN Card:
                </p>
                {agent.panCardUrl ? (
                  <a
                    href={agent.panCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-900 font-medium flex-1">
                      PAN Card
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Not uploaded</p>
                )}
              </div>
            </div>
            {agent.kycRemarks && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  KYC Remarks:
                </p>
                <p className="text-sm text-gray-900">{agent.kycRemarks}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Bank Details" && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">Payee Name:</p>
                <p className="text-gray-900 font-medium">
                  {agent.payeeName || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Account Number:</p>
                <p className="text-gray-900 font-medium">
                  {agent.accountNumber || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Bank Name:</p>
                <p className="text-gray-900 font-medium">
                  {agent.bankName || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Branch Name:</p>
                <p className="text-gray-900 font-medium">
                  {agent.branch || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">IFSC Code:</p>
                <p className="text-gray-900 font-medium">
                  {agent.ifscCode || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Account Type:</p>
                <p className="text-gray-900 font-medium">
                  {agent.accountType || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Assigned Location" && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Assigned Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">District:</p>
                <p className="text-gray-900 font-medium">
                  {agent.assignedDistrict || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Mandal:</p>
                <p className="text-gray-900 font-medium">
                  {agent.assignedMandal || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Village:</p>
                <p className="text-gray-900 font-medium">
                  {agent.assignedVillage || "-"}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Agent's Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Address Line:</p>
                  <p className="text-gray-900 font-medium">
                    {agent.addressLine || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">District:</p>
                  <p className="text-gray-900 font-medium">
                    {agent.district || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Mandal:</p>
                  <p className="text-gray-900 font-medium">
                    {agent.mandal || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Village:</p>
                  <p className="text-gray-900 font-medium">
                    {agent.village || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Pincode:</p>
                  <p className="text-gray-900 font-medium">
                    {agent.pincode || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Leads Handled" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Leads Handled By Agent
              </h2>
              <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                View all
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <p>No leads data available yet.</p>
              <p className="text-sm mt-2">
                This feature will be available when leads API is integrated.
              </p>
            </div>
          </div>
        )}

        {activeTab === "Land Listing" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Land Listing By Agent
              </h2>
            </div>

            {propertiesError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {propertiesError}
              </div>
            )}

            {isLoadingProperties ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : agentProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agentProperties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/dashboard/plots/${property.id}`}
                      className="hover:shadow-md transition-shadow rounded-xl"
                    >
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
                        <div className="relative w-full h-36 bg-gray-100">
                          {property.images?.[0] ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                              No image
                            </div>
                          )}
                          {property.category && (
                            <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-gray-700">
                              {property.category}
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 line-clamp-1">
                              {property.title}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                                property.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {property.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {property.city}, {property.state}
                          </p>
                          <p className="text-sm text-gray-900 font-medium mt-2">
                            {property.priceRange}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                  <span className="text-gray-500 text-sm">
                    Showing{" "}
                    {propertiesMeta
                      ? `${(propertiesPage - 1) * AGENT_PROPERTIES_LIMIT + 1}-${Math.min(
                          propertiesPage * AGENT_PROPERTIES_LIMIT,
                          propertiesMeta.total,
                        )} of ${propertiesMeta.total}`
                      : "0"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPropertiesPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={!propertiesMeta?.hasPrevPage}
                      className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPropertiesPage((prev) => prev + 1)}
                      disabled={!propertiesMeta?.hasNextPage}
                      className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No approved land listings yet.</p>
                <p className="text-sm mt-2">
                  Properties approved from this agent&apos;s submissions will
                  appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Commission & Payout" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Commissions & Payouts
              </h2>
              <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                View all
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <p>No commission data available yet.</p>
              <p className="text-sm mt-2">
                This feature will be available when commission API is
                integrated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
