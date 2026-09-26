"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, ExternalLink, Plus, X } from "lucide-react";
import {
  userActionsApi,
  executivesApi,
  LandProtection,
  LandProtectionAssignment,
  LandProtectionComment,
  Executive,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

export default function LandProtectionDetailPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<LandProtection | null>(null);
  const [assignments, setAssignments] = useState<LandProtectionAssignment[]>(
    [],
  );
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [comments, setComments] = useState<LandProtectionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [error, setError] = useState("");

  const [quoteAmount, setQuoteAmount] = useState("");
  const [visitFrequency, setVisitFrequency] = useState<
    "" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY"
  >("");
  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  // Only asked for when the request itself carries no coordinates, which is
  // the case for requests submitted before the app started sending them.
  const [mapsLink, setMapsLink] = useState("");
  const [extraPhotoRequirements, setExtraPhotoRequirements] = useState<
    string[]
  >([]);

  const fetchAll = useCallback(async () => {
    try {
      const [requestData, assignmentData, executivesData, commentsData] =
        await Promise.all([
          userActionsApi.getLandProtectionById(requestId),
          userActionsApi.getLandProtectionAssignmentHistory(requestId),
          executivesApi.getExecutives(1, 100),
          userActionsApi.getLandProtectionComments(requestId),
        ]);
      setRequest(requestData);
      setAssignments(assignmentData);
      setExecutives(executivesData.data);
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to fetch land protection details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  const selectedExecutive = executives.find(
    (e) => e.id === selectedExecutiveId,
  );

  /**
   * Pull a lat/lng out of whatever the admin pasted: a Google Maps share URL
   * (".../@17.385,78.486,17z" or "?q=17.385,78.486") or a plain
   * "17.385, 78.486" pair. Returns null when nothing usable is present.
   */
  const parseCoordinates = (
    value: string,
  ): { latitude: number; longitude: number } | null => {
    const match = value.match(/(-?\d{1,3}\.\d+)[, ]+\s*(-?\d{1,3}\.\d+)/);
    if (!match) return null;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
    return { latitude, longitude };
  };

  useEffect(() => {
    if (requestId) {
      fetchAll();
    }
  }, [requestId, fetchAll]);

  const handleAddPhotoRequirement = () => {
    setExtraPhotoRequirements((prev) =>
      prev.length >= 10 ? prev : [...prev, ""],
    );
  };

  const handlePhotoRequirementChange = (index: number, value: string) => {
    setExtraPhotoRequirements((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const handleRemovePhotoRequirement = (index: number) => {
    setExtraPhotoRequirements((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleSetPayment = async (
    paymentStatus: "UNPAID" | "PAID" | "WAIVED",
  ) => {
    setActionLoading(`payment-${paymentStatus}`);
    setError("");
    try {
      await userActionsApi.setPaymentStatus(
        requestId,
        paymentStatus,
        paymentNote.trim() || undefined,
      );
      setPaymentNote("");
      await fetchAll();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to update payment status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedExecutiveId) {
      setError("Select an executive first");
      return;
    }
    const hasCoordinates =
      request?.latitude != null && request?.longitude != null;
    const parsed = hasCoordinates ? null : parseCoordinates(mapsLink);
    if (!hasCoordinates && !parsed) {
      setError(
        "This request has no map location saved. Paste its Google Maps link or coordinates below.",
      );
      return;
    }
    setActionLoading("assign");
    setError("");
    try {
      const cleanedPhotoRequirements = extraPhotoRequirements
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      await userActionsApi.assignLandProtectionToExecutive(requestId, {
        executiveId: selectedExecutiveId,
        ...(parsed ?? {}),
        extraPhotoRequirements:
          cleanedPhotoRequirements.length > 0
            ? cleanedPhotoRequirements
            : undefined,
      });
      setSelectedExecutiveId("");
      setMapsLink("");
      setExtraPhotoRequirements([]);
      await fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign executive");
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
          Send a quote, approve out-of-range requests, and assign to an executive
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
            {/* Payment sits next to the status, because a request that is
                paid for but still early in the workflow read as nothing but
                PENDING before. */}
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                request.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-700"
                  : request.paymentStatus === "WAIVED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {request.paymentStatus === "PAID"
                ? "Paid"
                : request.paymentStatus === "WAIVED"
                  ? "Waived"
                  : "Unpaid"}
            </span>
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
            <p className="text-gray-500 text-sm mb-1">Selected Plan:</p>
            <p className="text-gray-900 font-medium">
              {request.planTitle
                ? `${request.planTitle}${
                    request.planAmount != null ? ` (₹${request.planAmount})` : ""
                  }`
                : request.paymentStatus === "PAID"
                  ? "Paid, plan not recorded"
                  : "Not selected yet"}
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

        {/* Requests now reach admin as soon as the form is submitted, so
            payment is tracked separately and can be recorded by hand for a
            settlement taken outside the platform. */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <p className="text-gray-500 text-sm">Payment:</p>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                request.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-700"
                  : request.paymentStatus === "WAIVED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {request.paymentStatus}
            </span>
            {request.paymentMarkedAt && (
              <span className="text-xs text-gray-400">
                updated {new Date(request.paymentMarkedAt).toLocaleString()}
              </span>
            )}
          </div>

          {request.paymentNote && (
            <p className="text-sm text-gray-700 mb-3">{request.paymentNote}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Reference or reason (optional)"
              className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1e2667]"
            />
            {(["PAID", "WAIVED", "UNPAID"] as const)
              .filter((s) => s !== request.paymentStatus)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => handleSetPayment(s)}
                  disabled={actionLoading !== null}
                  className="text-xs font-medium px-4 py-2 rounded-lg border border-[#1e2667] text-[#1e2667] hover:bg-[#1e2667] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading === `payment-${s}`
                    ? "Saving..."
                    : `Mark ${s.toLowerCase()}`}
                </button>
              ))}
          </div>
        </div>

        {/* Always shown, so a missing document reads as "not uploaded"
            rather than the section silently disappearing. */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-3">
            Customer Submitted Documents
          </p>
          <div className="flex flex-wrap gap-6">
            {request.dimensionPageUrl ? (
              <a
                href={request.dimensionPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#1e2667] hover:underline"
              >
                View Dimension Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-sm text-gray-400">
                Dimension page not uploaded
              </span>
            )}
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
          </div>
        </div>

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
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              min="1"
              placeholder="Amount (₹)"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              className="flex-1 min-w-0 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <select
              onFocus={scrollSelectIntoView}
              value={visitFrequency}
              onChange={(e) =>
                setVisitFrequency(
                  e.target.value as "" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY",
                )
              }
              className="sm:w-44 shrink-0 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            >
              <option value="">Visit Frequency</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="HALF_YEARLY">Half Yearly</option>
            </select>
            <button
              onClick={handleSendQuote}
              disabled={actionLoading !== null}
              className="shrink-0 bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Assign to Executive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Assign to Executive
          </h3>
          <div className="space-y-3">
            <select
              onFocus={scrollSelectIntoView}
              value={selectedExecutiveId}
              onChange={(e) => setSelectedExecutiveId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            >
              <option value="">Select an executive</option>
              {executives.map((executive) => (
                <option key={executive.id} value={executive.id}>
                  {executive.fullName}
                </option>
              ))}
            </select>
            {selectedExecutive && (
              <p className="text-xs text-gray-500">
                Coverage area taken from this executive:{" "}
                {[
                  selectedExecutive.assignedVillage,
                  selectedExecutive.assignedMandal,
                  selectedExecutive.assignedDistrict,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {(request.latitude == null || request.longitude == null) && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  This request has no map location saved. Paste its Google Maps
                  link or coordinates.
                </p>
                <input
                  type="text"
                  value={mapsLink}
                  onChange={(e) => setMapsLink(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... or 17.385044, 78.486671"
                  className="w-full min-w-0 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Extra photo requirements (optional)
              </p>
              <div className="space-y-2">
                {extraPhotoRequirements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handlePhotoRequirementChange(index, e.target.value)
                      }
                      placeholder="e.g. Water source photo"
                      className="flex-1 min-w-0 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhotoRequirement(index)}
                      className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      aria-label="Remove requirement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {extraPhotoRequirements.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddPhotoRequirement}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#1e2667] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add requirement
                </button>
              )}
            </div>
            <button
              onClick={handleAssign}
              disabled={actionLoading !== null}
              className="w-full bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading === "assign" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Assign
            </button>
            <p className="text-xs text-gray-400">
              Auto-filled from the executive&apos;s coverage area -- adjust if
              this request&apos;s land is elsewhere. This creates (or reuses)
              an Inspection Land record linked to this request, visible under{" "}
              <Link
                href="/dashboard/inspection-lands"
                className="text-[#1e2667] hover:underline"
              >
                Inspection Lands
              </Link>
              .
            </p>
          </div>
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

      {/* Customer Comments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Customer Comments
        </h2>
        {comments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="border border-gray-100 rounded-lg p-4 bg-[#f8f9fc]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {c.user?.name || request.fullName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {c.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No comments from the customer yet</p>
        )}
      </div>
    </div>
  );
}
