"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Pencil, Check, X } from "lucide-react";
import {
  inspectionLandsApi,
  landInspectionAssignmentApi,
  executivesApi,
  InspectionLand,
  LandInspectionAssignment,
  Executive,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

interface EditForm {
  ownerName: string;
  ownerPhone: string;
  surveyNumbers: string;
  district: string;
  mandal: string;
  village: string;
  location: string;
  pincode: string;
  areaValue: string;
  areaUnit: string;
  latitude: string;
  longitude: string;
}

function toEditForm(land: InspectionLand): EditForm {
  return {
    ownerName: land.ownerName,
    ownerPhone: land.ownerPhone || "",
    surveyNumbers: land.surveyNumbers.join(", "),
    district: land.district,
    mandal: land.mandal,
    village: land.village,
    location: land.location,
    pincode: land.pincode,
    areaValue: land.areaValue?.toString() || "",
    areaUnit: land.areaUnit || "",
    latitude: land.latitude.toString(),
    longitude: land.longitude.toString(),
  };
}

export default function InspectionLandDetailPage() {
  const params = useParams();
  const landId = params.id as string;

  const [land, setLand] = useState<InspectionLand | null>(null);
  const [assignments, setAssignments] = useState<LandInspectionAssignment[]>(
    [],
  );
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [nextVisitDueAt, setNextVisitDueAt] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [landData, assignmentsData, executivesData] = await Promise.all([
        inspectionLandsApi.getLandById(landId),
        landInspectionAssignmentApi.getAssignments({ landId, limit: 20 }),
        executivesApi.getExecutives(1, 100),
      ]);
      setLand(landData);
      setAssignments(
        [...assignmentsData.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setExecutives(executivesData.data);
    } catch (err) {
      console.error("Failed to fetch inspection land details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [landId]);

  useEffect(() => {
    if (landId) fetchAll();
  }, [landId, fetchAll]);

  const currentAssignment = assignments.find((a) => a.isActive);

  const handleAssign = async () => {
    if (!selectedExecutiveId) {
      setError("Select an executive first");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      if (currentAssignment) {
        await landInspectionAssignmentApi.reassign(
          currentAssignment.id,
          selectedExecutiveId,
          nextVisitDueAt || undefined,
        );
      } else {
        await landInspectionAssignmentApi.assign(
          landId,
          selectedExecutiveId,
          nextVisitDueAt || undefined,
        );
      }
      setSelectedExecutiveId("");
      setNextVisitDueAt("");
      await fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign executive");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!currentAssignment || !scheduleDate) {
      setError("Select a date first");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await landInspectionAssignmentApi.schedule(
        currentAssignment.id,
        scheduleDate,
      );
      setScheduleDate("");
      await fetchAll();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to schedule next visit",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = () => {
    if (!land) return;
    setEditForm(toEditForm(land));
    setIsEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const saveEdit = async () => {
    if (!editForm) return;
    if (
      !editForm.ownerName.trim() ||
      !editForm.district.trim() ||
      !editForm.mandal.trim() ||
      !editForm.village.trim() ||
      !editForm.location.trim() ||
      !editForm.pincode.trim() ||
      !editForm.latitude.trim() ||
      !editForm.longitude.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await inspectionLandsApi.updateLand(landId, {
        ownerName: editForm.ownerName.trim(),
        ownerPhone: editForm.ownerPhone.trim() || undefined,
        surveyNumbers: editForm.surveyNumbers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        district: editForm.district.trim(),
        mandal: editForm.mandal.trim(),
        village: editForm.village.trim(),
        location: editForm.location.trim(),
        pincode: editForm.pincode.trim(),
        areaValue: editForm.areaValue
          ? parseFloat(editForm.areaValue)
          : undefined,
        areaUnit: editForm.areaUnit.trim() || undefined,
        latitude: parseFloat(editForm.latitude),
        longitude: parseFloat(editForm.longitude),
      });
      setIsEditing(false);
      setEditForm(null);
      await fetchAll();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to update inspection land",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!land) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Inspection land not found</p>
        <Link
          href="/dashboard/inspection-lands"
          className="text-[#1e2667] hover:underline"
        >
          Back to Inspection Lands
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/inspection-lands"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Inspection Land Details
          </h1>
        </div>
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
              {land.ownerName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {land.landCode || "No land code assigned"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                land.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {land.isActive ? "Active" : "Inactive"}
            </span>
            {!isEditing && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-sm font-medium text-[#1e2667] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        {isEditing && editForm ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="ownerName"
                value={editForm.ownerName}
                onChange={handleEditChange}
                placeholder="Owner Name *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="ownerPhone"
                value={editForm.ownerPhone}
                onChange={handleEditChange}
                placeholder="Owner Phone"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="surveyNumbers"
                value={editForm.surveyNumbers}
                onChange={handleEditChange}
                placeholder="Survey Numbers (comma-separated)"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="district"
                value={editForm.district}
                onChange={handleEditChange}
                placeholder="District *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="mandal"
                value={editForm.mandal}
                onChange={handleEditChange}
                placeholder="Mandal *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="village"
                value={editForm.village}
                onChange={handleEditChange}
                placeholder="Village *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                placeholder="Location *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="pincode"
                value={editForm.pincode}
                onChange={handleEditChange}
                placeholder="Pincode *"
                maxLength={6}
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <div className="flex gap-2">
                <input
                  name="areaValue"
                  value={editForm.areaValue}
                  onChange={handleEditChange}
                  placeholder="Area value"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
                <input
                  name="areaUnit"
                  value={editForm.areaUnit}
                  onChange={handleEditChange}
                  placeholder="Unit"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <input
                name="latitude"
                value={editForm.latitude}
                onChange={handleEditChange}
                placeholder="Latitude *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="longitude"
                value={editForm.longitude}
                onChange={handleEditChange}
                placeholder="Longitude *"
                className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="bg-[#16a34a] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
            <div>
              <p className="text-gray-500 text-sm mb-1">Owner Phone:</p>
              <p className="text-gray-900 font-medium">
                {land.ownerPhone || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Survey Numbers:</p>
              <p className="text-gray-900 font-medium">
                {land.surveyNumbers.join(", ") || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Location:</p>
              <p className="text-gray-900 font-medium">
                {land.village}, {land.mandal}, {land.district}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Address:</p>
              <p className="text-gray-900 font-medium">{land.location}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Pincode:</p>
              <p className="text-gray-900 font-medium">{land.pincode}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Area:</p>
              <p className="text-gray-900 font-medium">
                {land.areaValue
                  ? `${land.areaValue} ${land.areaUnit || ""}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Coordinates:</p>
              <p className="text-gray-900 font-medium">
                {land.latitude}, {land.longitude}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Assignment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-md font-medium text-gray-900 mb-4">
          {currentAssignment ? "Reassign to Executive" : "Assign to Executive"}
        </h3>
        {currentAssignment && (
          <p className="text-sm text-gray-600 mb-4">
            Currently assigned to{" "}
            <span className="font-medium text-gray-900">
              {currentAssignment.executive?.fullName}
            </span>
            {currentAssignment.nextVisitDueAt && (
              <>
                {" "}
                — next visit due{" "}
                {new Date(
                  currentAssignment.nextVisitDueAt,
                ).toLocaleDateString()}
              </>
            )}
          </p>
        )}
        <div className="flex gap-3 flex-wrap">
          <select
            onFocus={scrollSelectIntoView}
            value={selectedExecutiveId}
            onChange={(e) => setSelectedExecutiveId(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
          >
            <option value="">Select an executive</option>
            {executives.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={nextVisitDueAt}
            onChange={(e) => setNextVisitDueAt(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
          />
          <button
            onClick={handleAssign}
            disabled={actionLoading}
            className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentAssignment ? "Reassign" : "Assign"}
          </button>
        </div>

        {currentAssignment && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <button
              onClick={handleSchedule}
              disabled={actionLoading}
              className="bg-gray-100 text-gray-700 text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Set Next Visit Due Date
            </button>
          </div>
        )}
      </div>

      {/* Assignment history */}
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
                    Executive
                  </th>
                  <th className="py-3 font-medium text-gray-600">Status</th>
                  <th className="py-3 font-medium text-gray-600">Assigned</th>
                  <th className="py-3 pr-4 rounded-r-lg font-medium text-gray-600">
                    Unassigned
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pl-4 font-medium text-gray-900">
                      {a.executive?.fullName || "-"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          a.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.isActive ? "Active" : "Ended"}
                      </span>
                    </td>
                    <td className="py-3">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      {a.unassignedAt
                        ? new Date(a.unassignedAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Not yet assigned to any executive
          </p>
        )}
      </div>
    </div>
  );
}
