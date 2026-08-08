"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { dashboardApi, RecentActivityItem } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

// The recent-activity endpoint returns a single bounded "recent" feed
// (backend caps it at 50 items, no server-side page param) rather than a
// full paginated table, so pagination here is applied client-side over
// the already-fetched list.
const FETCH_LIMIT = 50;

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityPage() {
  const router = useRouter();
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await dashboardApi.getRecentActivity(FETCH_LIMIT);
        setActivity(data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const totalPages = Math.max(Math.ceil(activity.length / pageLimit), 1);
  const pagedActivity = useMemo(
    () =>
      activity.slice(
        (currentPage - 1) * pageLimit,
        currentPage * pageLimit,
      ),
    [activity, currentPage, pageLimit],
  );

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-2xl font-medium text-gray-900">All Activity</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
        </div>
      ) : activity.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity</p>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {pagedActivity.map((item, idx) => (
              <div
                key={`${item.type}-${(currentPage - 1) * pageLimit + idx}`}
                className="flex items-start justify-between gap-3 px-5 py-4"
              >
                <p className="text-sm text-gray-700">{item.message}</p>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatRelativeTime(item.occurredAt)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={activity.length}
              pageSize={pageLimit}
              onPageSizeChange={(size) => {
                setPageLimit(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        </>
      )}
    </div>
  );
}
