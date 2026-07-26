"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { landVisitsApi, LandVisitDetail } from "@/lib/api";

export default function LandVisitDetailPage() {
  const params = useParams();
  const visitId = params.id as string;

  const [visit, setVisit] = useState<LandVisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchVisit = useCallback(async () => {
    try {
      const data = await landVisitsApi.getVisitById(visitId);
      setVisit(data);
      setReviewNotes(data.adminReviewNotes || "");
    } catch (err) {
      console.error("Failed to fetch land visit:", err);
    } finally {
      setIsLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    if (visitId) fetchVisit();
  }, [visitId, fetchVisit]);

  const handleReview = async (status: "REVIEWED" | "FLAGGED") => {
    setActionLoading(status);
    setError("");
    try {
      await landVisitsApi.reviewVisit(
        visitId,
        status,
        reviewNotes.trim() || undefined,
      );
      await fetchVisit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review visit");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING_REVIEW: "bg-amber-100 text-amber-700",
      REVIEWED: "bg-green-100 text-green-700",
      FLAGGED: "bg-red-100 text-red-700",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Land visit not found</p>
        <Link
          href="/dashboard/land-visits"
          className="text-[#1e2667] hover:underline"
        >
          Back to Land Visits
        </Link>
      </div>
    );
  }

  const canReview = visit.reviewStatus === "PENDING_REVIEW";

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/land-visits"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Land Visit</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Reviewing this visit publishes the results to the customer
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {visit.ownerName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {visit.landCode || "No land code"} — inspected by{" "}
              {visit.executiveName}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
              visit.reviewStatus,
            )}`}
          >
            {visit.reviewStatus.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          <div>
            <p className="text-gray-500 text-sm mb-1">Visit Started:</p>
            <p className="text-gray-900 font-medium">
              {new Date(visit.startedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">GPS Distance:</p>
            <p className="text-gray-900 font-medium">
              {visit.startDistanceMeters.toFixed(1)}m from property
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Status:</p>
            <p className="text-gray-900 font-medium">{visit.status}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Encroachment:</p>
            <p className="text-gray-900 font-medium">
              {visit.encroachment === null
                ? "-"
                : visit.encroachment
                  ? "Yes"
                  : "No"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Boundary Condition:</p>
            <p className="text-gray-900 font-medium">
              {visit.boundaryCondition || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Illegal Construction:</p>
            <p className="text-gray-900 font-medium">
              {visit.illegalConstruction === null
                ? "-"
                : visit.illegalConstruction
                  ? "Yes"
                  : "No"}
            </p>
          </div>
        </div>

        {visit.remarks && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">
              Executive&apos;s Remarks:
            </p>
            <p className="text-gray-900">{visit.remarks}</p>
          </div>
        )}

        {visit.reviewStatus !== "PENDING_REVIEW" && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">
              Reviewed {visit.reviewedAt && new Date(visit.reviewedAt).toLocaleString()}
            </p>
            {visit.adminReviewNotes && (
              <p className="text-gray-900 mt-1">{visit.adminReviewNotes}</p>
            )}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Inspection Photos ({visit.photos.length})
        </h2>
        {visit.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {visit.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {photo.category.replace(/_/g, " ")}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No photos uploaded yet</p>
        )}
      </div>

      {/* Review action */}
      {canReview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Review This Visit
          </h3>
          <textarea
            rows={3}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Admin review notes (optional)"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleReview("FLAGGED")}
              disabled={actionLoading !== null}
              className="bg-[#b91c1c] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === "FLAGGED" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Flag Visit
            </button>
            <button
              onClick={() => handleReview("REVIEWED")}
              disabled={actionLoading !== null}
              className="bg-[#16a34a] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === "REVIEWED" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Approve &amp; Publish to Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
