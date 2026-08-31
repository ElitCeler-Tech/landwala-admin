"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronDown, Loader2 } from "lucide-react";
import {
  landVisitsApi,
  LandVisitDetail,
  VisitItemReviewFields,
} from "@/lib/api";

// Fields shared by VisitPhoto/VisitExtraPhoto/VisitVideo -- everything the
// grouping/review UI below needs, regardless of which media type it's
// rendering.
type MediaItem = VisitItemReviewFields & {
  id: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  capturedAt: string;
};

// A photo/extra-photo/video retake always chains back via supersedesId to
// the version it replaced, so grouping by "walk supersedesId to the root"
// naturally reconstructs one group per category/label (photos, extra
// photos) or per distinct video, oldest-to-newest, regardless of media type.
function groupVersions<T extends MediaItem>(
  items: T[],
): { current: T; history: T[] }[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const rootId = (item: T): string => {
    let cur = item;
    while (cur.supersedesId && byId.has(cur.supersedesId)) {
      cur = byId.get(cur.supersedesId)!;
    }
    return cur.id;
  };

  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = rootId(item);
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map((list) => {
    list.sort((a, b) => a.version - b.version);
    const current = list.find((i) => i.isCurrent) ?? list[list.length - 1];
    const history = list.filter((i) => i.id !== current.id);
    return { current, history };
  });
}

function itemStatusBadge(status: VisitItemReviewFields["itemReviewStatus"]) {
  const styles: Record<string, string> = {
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
}

interface MediaCardProps<T extends MediaItem> {
  title: string;
  current: T;
  history: T[];
  mediaUrl: string;
  getMediaUrl: (item: T) => string;
  isVideo: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
  actionLoadingId: string | null;
}

function MediaCard<T extends MediaItem>({
  title,
  current,
  history,
  mediaUrl,
  getMediaUrl,
  isVideo,
  onApprove,
  onReject,
  actionLoadingId,
}: MediaCardProps<T>) {
  const [showHistory, setShowHistory] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
      <div className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white mb-2">
        {isVideo ? (
          <video
            controls
            src={mediaUrl}
            className="w-full h-full object-cover"
          />
        ) : (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </a>
        )}
      </div>

      <p className="text-xs font-medium text-gray-900 text-center mb-1">
        {title}
      </p>

      <div className="flex items-center justify-center mb-2">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${itemStatusBadge(
            current.itemReviewStatus,
          )}`}
        >
          {current.itemReviewStatus.replace("_", " ")}
        </span>
      </div>

      <div className="text-[11px] text-gray-500 text-center mb-2 space-y-0.5">
        <p>
          {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
        </p>
        <p>{current.distanceMeters.toFixed(1)}m from property</p>
        <p>{new Date(current.capturedAt).toLocaleString()}</p>
      </div>

      {current.itemReviewNotes && current.itemReviewStatus === "REJECTED" && (
        <p className="text-[11px] text-red-600 text-center mb-2">
          {current.itemReviewNotes}
        </p>
      )}

      {current.itemReviewStatus === "PENDING_REVIEW" && (
        <div className="space-y-1">
          {showRejectInput ? (
            <>
              <textarea
                rows={2}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Why is this rejected? (required)"
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    if (!rejectNotes.trim()) return;
                    onReject(current.id, rejectNotes.trim());
                  }}
                  disabled={actionLoadingId === current.id || !rejectNotes.trim()}
                  className="flex-1 bg-[#b91c1c] text-white text-xs px-2 py-1 rounded hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="text-xs px-2 py-1 rounded text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => onApprove(current.id)}
                disabled={actionLoadingId === current.id}
                className="flex-1 bg-[#16a34a] text-white text-xs px-2 py-1 rounded hover:bg-opacity-90 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
              >
                {actionLoadingId === current.id && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Approve
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoadingId === current.id}
                className="flex-1 bg-[#b91c1c] text-white text-xs px-2 py-1 rounded hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            History ({history.length})
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>
          {showHistory && (
            <div className="mt-2 space-y-2">
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <div
                    key={h.id}
                    className="text-[11px] bg-white border border-gray-100 rounded p-2"
                  >
                    <a
                      href={getMediaUrl(h)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e2667] hover:underline"
                    >
                      Version {h.version}
                    </a>
                    <span
                      className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${itemStatusBadge(
                        h.itemReviewStatus,
                      )}`}
                    >
                      {h.itemReviewStatus.replace("_", " ")}
                    </span>
                    {h.itemReviewNotes && (
                      <p className="text-gray-500 mt-1">{h.itemReviewNotes}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LandVisitDetailPage() {
  const params = useParams();
  const visitId = params.id as string;

  const [visit, setVisit] = useState<LandVisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false);
  const [itemActionLoadingId, setItemActionLoadingId] = useState<
    string | null
  >(null);
  const [error, setError] = useState("");

  const fetchVisit = useCallback(async () => {
    try {
      const data = await landVisitsApi.getVisitById(visitId);
      setVisit(data);
    } catch (err) {
      console.error("Failed to fetch land visit:", err);
    } finally {
      setIsLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    if (visitId) fetchVisit();
  }, [visitId, fetchVisit]);

  const handleBulkApprove = async () => {
    setBulkApproveLoading(true);
    setError("");
    try {
      await landVisitsApi.reviewVisit(visitId);
      await fetchVisit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review visit");
    } finally {
      setBulkApproveLoading(false);
    }
  };

  const handlePhotoReview = async (
    photoId: string,
    decision: "APPROVED" | "REJECTED",
    notes?: string,
  ) => {
    setItemActionLoadingId(photoId);
    setError("");
    try {
      await landVisitsApi.reviewPhoto(visitId, photoId, decision, notes);
      await fetchVisit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review photo");
    } finally {
      setItemActionLoadingId(null);
    }
  };

  const handleExtraPhotoReview = async (
    extraPhotoId: string,
    decision: "APPROVED" | "REJECTED",
    notes?: string,
  ) => {
    setItemActionLoadingId(extraPhotoId);
    setError("");
    try {
      await landVisitsApi.reviewExtraPhoto(
        visitId,
        extraPhotoId,
        decision,
        notes,
      );
      await fetchVisit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review photo");
    } finally {
      setItemActionLoadingId(null);
    }
  };

  const handleVideoReview = async (
    videoId: string,
    decision: "APPROVED" | "REJECTED",
    notes?: string,
  ) => {
    setItemActionLoadingId(videoId);
    setError("");
    try {
      await landVisitsApi.reviewVideo(visitId, videoId, decision, notes);
      await fetchVisit();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to review video");
    } finally {
      setItemActionLoadingId(null);
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

  const photoGroups = groupVersions(visit.photos);
  const extraPhotoGroups = groupVersions(visit.extraPhotos);
  const videoGroups = groupVersions(visit.videos);

  const hasAnyPending = [
    ...visit.photos,
    ...visit.extraPhotos,
    ...visit.videos,
  ].some((i) => i.isCurrent && i.itemReviewStatus === "PENDING_REVIEW");

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
          A photo/video is shown to the customer as soon as it&apos;s
          individually approved below
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
              <Link
                href={`/dashboard/executives/${visit.executiveId}`}
                className="text-[#1e2667] hover:underline"
              >
                {visit.executiveName}
              </Link>
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
            <p className="text-gray-500 text-sm mb-1">Start GPS:</p>
            <p className="text-gray-900 font-medium">
              {visit.startLatitude.toFixed(5)}, {visit.startLongitude.toFixed(5)}{" "}
              ({visit.startDistanceMeters.toFixed(1)}m from property)
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
              Last status change{" "}
              {visit.reviewedAt && new Date(visit.reviewedAt).toLocaleString()}
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
          Inspection Photos ({photoGroups.length})
        </h2>
        {photoGroups.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photoGroups.map(({ current, history }) => (
              <MediaCard
                key={current.id}
                title={current.category.replace(/_/g, " ")}
                current={current}
                history={history}
                mediaUrl={current.imageUrl}
                getMediaUrl={(item) => item.imageUrl}
                isVideo={false}
                onApprove={(id) => handlePhotoReview(id, "APPROVED")}
                onReject={(id, notes) =>
                  handlePhotoReview(id, "REJECTED", notes)
                }
                actionLoadingId={itemActionLoadingId}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No photos uploaded yet</p>
        )}
      </div>

      {/* Extra Photos */}
      {extraPhotoGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Extra Photos ({extraPhotoGroups.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {extraPhotoGroups.map(({ current, history }) => (
              <MediaCard
                key={current.id}
                title={current.label}
                current={current}
                history={history}
                mediaUrl={current.imageUrl}
                getMediaUrl={(item) => item.imageUrl}
                isVideo={false}
                onApprove={(id) => handleExtraPhotoReview(id, "APPROVED")}
                onReject={(id, notes) =>
                  handleExtraPhotoReview(id, "REJECTED", notes)
                }
                actionLoadingId={itemActionLoadingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Videos ({videoGroups.length})
        </h2>
        {videoGroups.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videoGroups.map(({ current, history }, index) => (
              <MediaCard
                key={current.id}
                title={`Video ${index + 1}`}
                current={current}
                history={history}
                mediaUrl={current.videoUrl}
                getMediaUrl={(item) => item.videoUrl}
                isVideo={true}
                onApprove={(id) => handleVideoReview(id, "APPROVED")}
                onReject={(id, notes) =>
                  handleVideoReview(id, "REJECTED", notes)
                }
                actionLoadingId={itemActionLoadingId}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No videos uploaded yet</p>
        )}
      </div>

      {/* Bulk approve */}
      {hasAnyPending && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-md font-medium text-gray-900 mb-4">
            Approve everything still pending at once
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            To reject a specific photo or video instead, use the Reject
            button on that item above.
          </p>
          <button
            onClick={handleBulkApprove}
            disabled={bulkApproveLoading}
            className="bg-[#16a34a] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {bulkApproveLoading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Approve All Pending &amp; Publish to Customer
          </button>
        </div>
      )}
    </div>
  );
}
