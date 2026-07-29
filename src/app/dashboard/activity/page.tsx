"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { dashboardApi, RecentActivityItem } from "@/lib/api";

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

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await dashboardApi.getRecentActivity(50);
        setActivity(data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
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
        <h1 className="text-2xl font-medium text-gray-900">All Activity</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
        </div>
      ) : activity.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {activity.map((item, idx) => (
            <div
              key={`${item.type}-${idx}`}
              className="flex items-start justify-between gap-3 px-5 py-4"
            >
              <p className="text-sm text-gray-700">{item.message}</p>
              <span className="text-xs text-gray-400 shrink-0">
                {formatRelativeTime(item.occurredAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
