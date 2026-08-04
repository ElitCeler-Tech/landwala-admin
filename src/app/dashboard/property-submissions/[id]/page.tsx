"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Loader2, ExternalLink } from "lucide-react";
import { propertySubmissionsApi, PropertySubmission } from "@/lib/api";

export default function PropertySubmissionDetailPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<PropertySubmission | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await propertySubmissionsApi.getSubmissionById(
          submissionId,
        );
        setSubmission(data);
      } catch (err) {
        console.error("Failed to fetch property submission:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    setError("");
    try {
      const result = await propertySubmissionsApi.approveSubmission(
        submissionId,
      );
      setSubmission(result.submission);
    } catch (err: any) {
      console.error("Failed to approve submission:", err);
      setError(
        err?.response?.data?.message || "Failed to approve submission",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    setError("");
    try {
      await propertySubmissionsApi.rejectSubmission(submissionId);
      setSubmission((prev) => (prev ? { ...prev, status: "rejected" } : prev));
    } catch (err: any) {
      console.error("Failed to reject submission:", err);
      setError(err?.response?.data?.message || "Failed to reject submission");
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

  if (!submission) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Property submission not found</p>
        <Link
          href="/dashboard/property-submissions"
          className="text-[#1e2667] hover:underline"
        >
          Back to Sell Requests
        </Link>
      </div>
    );
  }

  const submitterName =
    submission.submittedBy === "AGENT" && submission.agent
      ? submission.agent.fullName
      : submission.user?.name || "-";
  const submitterPhone =
    submission.submittedBy === "AGENT" && submission.agent
      ? submission.agent.phone
      : submission.user?.phone || "-";
  const submitterEmail =
    submission.submittedBy === "AGENT" && submission.agent
      ? submission.agent.email
      : submission.user?.email || "-";

  const canActOn =
    submission.status !== "approved" && submission.status !== "rejected";

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/property-submissions"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Sell Request Details
          </h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Review the submitted property before approving or rejecting
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
              {submission.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Submitted {formatDate(submission.createdAt)} by{" "}
              {submission.submittedBy === "AGENT" ? "Agent" : "User"}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusBadge(
              submission.status,
            )}`}
          >
            {submission.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-gray-500 text-sm mb-1">Category:</p>
            <p className="text-gray-900 font-medium">
              {submission.category || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Listing Type:</p>
            <p className="text-gray-900 font-medium">
              {submission.listingType || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Facing:</p>
            <p className="text-gray-900 font-medium">
              {submission.facing || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Size:</p>
            <p className="text-gray-900 font-medium">
              {submission.size} {submission.unit || ""}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Price:</p>
            <p className="text-gray-900 font-medium">
              {submission.price ? `₹${submission.price}` : "-"}
              {submission.priceNegotiable === "Yes" && (
                <span className="text-gray-500 text-sm"> (Negotiable)</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Pincode:</p>
            <p className="text-gray-900 font-medium">
              {submission.pincode || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Location:</p>
            <p className="text-gray-900 font-medium">
              {submission.location || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">
              Plot Location / Landmark:
            </p>
            <p className="text-gray-900 font-medium">
              {submission.plotLocation || "-"}
            </p>
          </div>
        </div>

        {submission.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Description:</p>
            <p className="text-gray-900">{submission.description}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Submitted By
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-500 text-sm mb-1">Name:</p>
              <p className="text-gray-900 font-medium">{submitterName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Phone:</p>
              <p className="text-gray-900 font-medium">{submitterPhone}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Email:</p>
              <p className="text-gray-900 font-medium">{submitterEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canActOn && (
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleReject}
            disabled={actionLoading !== null}
            className="bg-[#b91c1c] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === "reject" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={actionLoading !== null}
            className="bg-[#16a34a] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === "approve" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Approve
          </button>
        </div>
      )}

      {/* Media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Property Images
        </h2>
        {submission.imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {submission.imageUrls.map((url, idx) => (
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
                  alt={`Property image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-8">No images uploaded</p>
        )}

        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Layout Images
        </h2>
        {submission.layoutImageUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {submission.layoutImageUrls.map((url, idx) => (
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
                  alt={`Layout image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-8">No layout images uploaded</p>
        )}

        <h2 className="text-lg font-medium text-gray-900 mb-6">Documents</h2>
        {submission.documentUrls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.documentUrls.map((url, idx) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-900 font-medium flex-1">
                  Document {idx + 1}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No documents uploaded</p>
        )}
      </div>
    </div>
  );
}
