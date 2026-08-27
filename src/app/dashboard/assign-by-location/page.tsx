"use client";

import { useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import {
  inspectionLandsApi,
  landInspectionAssignmentApi,
  executivesApi,
  InspectionLand,
  Executive,
  LandInspectionAssignment,
} from "@/lib/api";

interface LandRowState {
  selectedExecutiveId: string;
  nextVisitDueAt: string;
  saving: boolean;
  error: string;
}

/**
 * Location-first assignment workflow: pick a district/mandal/village,
 * see every inspection land there alongside only the executives whose
 * own coverage area matches that same location, then assign/reassign
 * and reschedule per property -- without hunting through the full
 * unfiltered executive list on each land's own detail page.
 */
export default function AssignByLocationPage() {
  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [lands, setLands] = useState<InspectionLand[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [assignmentsByLandId, setAssignmentsByLandId] = useState<
    Record<string, LandInspectionAssignment>
  >({});
  const [rowState, setRowState] = useState<Record<string, LandRowState>>({});

  const location = {
    district: district.trim() || undefined,
    mandal: mandal.trim() || undefined,
    village: village.trim() || undefined,
  };

  const handleSearch = async () => {
    if (!location.district && !location.mandal && !location.village) {
      setError("Enter at least a district, mandal, or village to search");
      return;
    }
    setIsLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const [landsRes, executivesRes] = await Promise.all([
        inspectionLandsApi.getLands(1, 100, undefined, location),
        executivesApi.getExecutives(1, 100, undefined, location),
      ]);
      setLands(landsRes.data);
      setExecutives(executivesRes.data.filter((e) => e.isActive));

      const initialRowState: Record<string, LandRowState> = {};
      landsRes.data.forEach((land) => {
        initialRowState[land.id] = {
          selectedExecutiveId: "",
          nextVisitDueAt: "",
          saving: false,
          error: "",
        };
      });
      setRowState(initialRowState);

      if (landsRes.data.length > 0) {
        const assignmentsRes = await landInspectionAssignmentApi.getAssignments({
          isActive: true,
          limit: 100,
        });
        const landIds = new Set(landsRes.data.map((l) => l.id));
        const byLandId: Record<string, LandInspectionAssignment> = {};
        assignmentsRes.data.forEach((a) => {
          if (landIds.has(a.landId)) byLandId[a.landId] = a;
        });
        setAssignmentsByLandId(byLandId);
      } else {
        setAssignmentsByLandId({});
      }
    } catch (err) {
      console.error("Failed to search by location:", err);
      setError("Failed to load properties/executives for this location");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRow = (landId: string, patch: Partial<LandRowState>) => {
    setRowState((prev) => ({
      ...prev,
      [landId]: { ...prev[landId], ...patch },
    }));
  };

  const handleAssign = async (land: InspectionLand) => {
    const state = rowState[land.id];
    if (!state?.selectedExecutiveId) {
      updateRow(land.id, { error: "Select an executive first" });
      return;
    }
    updateRow(land.id, { saving: true, error: "" });
    try {
      const currentAssignment = assignmentsByLandId[land.id];
      const updated = currentAssignment
        ? await landInspectionAssignmentApi.reassign(
            currentAssignment.id,
            state.selectedExecutiveId,
            state.nextVisitDueAt || undefined,
          )
        : await landInspectionAssignmentApi.assign(
            land.id,
            state.selectedExecutiveId,
            state.nextVisitDueAt || undefined,
          );
      setAssignmentsByLandId((prev) => ({ ...prev, [land.id]: updated }));
      updateRow(land.id, {
        saving: false,
        selectedExecutiveId: "",
        nextVisitDueAt: "",
      });
    } catch (err: any) {
      updateRow(land.id, {
        saving: false,
        error: err?.response?.data?.message || "Failed to assign executive",
      });
    }
  };

  const executiveLabel = (e: Executive) =>
    `${e.fullName}${e.executiveCode ? ` (${e.executiveCode})` : ""}`;

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col relative">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#1e2667]" />
          Assign by Location
        </h1>
        <p className="text-gray-500 italic">
          Pick a location to see its properties and only the executives who
          cover that area, then assign or reschedule each one.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Rangareddy"
              className="px-3 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Mandal
            </label>
            <input
              type="text"
              value={mandal}
              onChange={(e) => setMandal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Shamshabad"
              className="px-3 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Village
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Kothwalguda"
              className="px-3 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#1e2667] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>

      {hasSearched && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
          <div className="mb-4 text-sm text-gray-500">
            {lands.length} propert{lands.length === 1 ? "y" : "ies"} •{" "}
            {executives.length} executive{executives.length === 1 ? "" : "s"}{" "}
            covering this location
          </div>

          {executives.length === 0 && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              No executive has this district/mandal/village set as their
              coverage area yet. Add or edit an executive&apos;s assigned
              area first, or assign from the property&apos;s own detail page.
            </div>
          )}

          {lands.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No properties found for this location
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc] text-sm">
                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                      Property
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Currently Assigned
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Assign / Reassign To
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Next Visit Due
                    </th>
                    <th className="py-4 rounded-r-xl font-medium text-gray-600 pr-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {lands.map((land) => {
                    const state = rowState[land.id];
                    const currentAssignment = assignmentsByLandId[land.id];
                    return (
                      <tr
                        key={land.id}
                        className="border-b border-gray-50 last:border-0 align-top"
                      >
                        <td className="py-4 pl-6">
                          <div className="font-medium text-gray-900">
                            {land.landCode || land.ownerName}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1" title={land.location}>
                            {land.location}
                          </div>
                        </td>
                        <td className="py-4">
                          {currentAssignment?.executive ? (
                            <div className="text-gray-900">
                              {currentAssignment.executive.fullName}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          <select
                            value={state?.selectedExecutiveId || ""}
                            onChange={(e) =>
                              updateRow(land.id, {
                                selectedExecutiveId: e.target.value,
                              })
                            }
                            disabled={executives.length === 0}
                            className="px-3 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm disabled:bg-gray-50"
                          >
                            <option value="">Select an executive</option>
                            {executives.map((e) => (
                              <option key={e.id} value={e.id}>
                                {executiveLabel(e)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4">
                          <input
                            type="date"
                            value={state?.nextVisitDueAt || ""}
                            onChange={(e) =>
                              updateRow(land.id, {
                                nextVisitDueAt: e.target.value,
                              })
                            }
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
                          />
                        </td>
                        <td className="py-4 pr-6">
                          <button
                            onClick={() => handleAssign(land)}
                            disabled={state?.saving}
                            className="bg-[#1e2667] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                          >
                            {state?.saving
                              ? "Saving..."
                              : currentAssignment
                                ? "Reassign"
                                : "Assign"}
                          </button>
                          {state?.error && (
                            <p className="text-red-600 text-xs mt-1 max-w-[150px]">
                              {state.error}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
