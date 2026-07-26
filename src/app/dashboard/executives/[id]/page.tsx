"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
  executivesApi,
  landInspectionAssignmentApi,
  Executive,
  ExecutivePerformance,
  LandInspectionAssignment,
} from "@/lib/api";

export default function ExecutiveDetailsPage() {
  const params = useParams();
  const executiveId = params.id as string;

  const [executive, setExecutive] = useState<Executive | null>(null);
  const [performance, setPerformance] = useState<ExecutivePerformance | null>(
    null,
  );
  const [assignments, setAssignments] = useState<LandInspectionAssignment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [executiveData, performanceData, assignmentsData] =
        await Promise.all([
          executivesApi.getExecutiveById(executiveId),
          executivesApi.getPerformance(executiveId),
          landInspectionAssignmentApi.getAssignments({
            executiveId,
            isActive: true,
            limit: 50,
          }),
        ]);
      setExecutive(executiveData);
      setPerformance(performanceData);
      setAssignments(assignmentsData.data);
    } catch (error) {
      console.error("Failed to fetch executive details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [executiveId]);

  useEffect(() => {
    if (executiveId) {
      fetchAll();
    }
  }, [executiveId, fetchAll]);

  const handleToggleActive = async () => {
    if (!executive) return;
    setActionLoading(true);
    try {
      await executivesApi.setStatus(executiveId, !executive.isActive);
      await fetchAll();
    } catch (error) {
      console.error("Failed to toggle executive status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!executive) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Executive not found</p>
        <Link
          href="/dashboard/executives"
          className="text-[#1e2667] hover:underline"
        >
          Back to Executives
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/executives"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Executive Details
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-8">
          <div className="w-24 h-24 rounded-full bg-[#1e2667] flex items-center justify-center text-white text-4xl font-medium shrink-0">
            {executive.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <span className="text-sm font-medium text-gray-900">Name- </span>
              <span className="text-sm text-gray-700">
                {executive.fullName}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Phone number -
              </span>
              <span className="text-sm text-gray-700"> {executive.phone}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Executive Code:-{" "}
              </span>
              <span className="text-sm text-gray-700">
                {executive.executiveCode || "-"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                E mail ID-
              </span>
              <span className="text-sm text-gray-700"> {executive.email}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Coverage -{" "}
              </span>
              <span className="text-sm text-gray-700">
                {[
                  executive.assignedDistrict,
                  executive.assignedMandal,
                  executive.assignedVillage,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                Status-
              </span>
              <span
                className={`ml-1 text-xs font-medium px-2 py-1 rounded-full ${
                  executive.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {executive.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-8">
        <button
          onClick={handleToggleActive}
          disabled={actionLoading}
          className="bg-[#1e2667] text-white text-sm px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {executive.isActive ? "Deactivate Executive" : "Activate Executive"}
        </button>
      </div>

      {/* Performance */}
      {performance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {performance.assignedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Assigned (all-time)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {performance.visitedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Visited (all-time)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {performance.visitedThisMonth}
              </p>
              <p className="text-xs text-gray-500 mt-1">Visited this month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {performance.pendingCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {performance.overdueCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Overdue</p>
            </div>
          </div>
        </div>
      )}

      {/* Currently assigned lands */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Currently Assigned Lands
        </h2>
        {assignments.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fc] text-sm">
                  <th className="py-3 pl-4 rounded-l-lg font-medium text-gray-600">
                    Owner
                  </th>
                  <th className="py-3 font-medium text-gray-600">Location</th>
                  <th className="py-3 pr-4 rounded-r-lg font-medium text-gray-600">
                    Next Visit Due
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pl-4 font-medium text-gray-900">
                      {a.land?.ownerName || "-"}
                    </td>
                    <td className="py-3">
                      {a.land?.location || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      {a.nextVisitDueAt
                        ? new Date(a.nextVisitDueAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No lands currently assigned</p>
        )}
      </div>
    </div>
  );
}
