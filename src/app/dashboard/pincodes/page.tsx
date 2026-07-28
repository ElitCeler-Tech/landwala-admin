"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Upload,
} from "lucide-react";
import { pincodesApi, PincodeItem } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function PincodesPage() {
  const [items, setItems] = useState<PincodeItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const limit = 20;

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPincode, setNewPincode] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newArea, setNewArea] = useState("");

  // Bulk add
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPincode, setEditPincode] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editArea, setEditArea] = useState("");

  const fetchPincodes = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await pincodesApi.getPincodes(
        searchQuery || undefined,
        currentPage,
        limit,
      );
      setItems(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error("Failed to fetch pincodes:", err);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchPincodes();
  }, [fetchPincodes]);

  const handleAdd = async () => {
    if (!/^\d{6}$/.test(newPincode.trim())) {
      setError("Pincode must be exactly 6 digits");
      return;
    }
    if (!newLocation.trim()) {
      setError("Location is required");
      return;
    }
    setActionLoading("add");
    setError("");
    try {
      await pincodesApi.addPincode(
        newPincode.trim(),
        newLocation.trim(),
        newArea.trim() || undefined,
      );
      setNewPincode("");
      setNewLocation("");
      setNewArea("");
      setShowAddForm(false);
      await fetchPincodes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add pincode");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAdd = async () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: { pincode: string; location: string; area?: string }[] = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 2 || !/^\d{6}$/.test(parts[0])) {
        setError(
          `Invalid line: "${line}" - expected "pincode,location,area(optional)" with a 6-digit pincode`,
        );
        return;
      }
      parsed.push({
        pincode: parts[0],
        location: parts[1],
        area: parts[2] || undefined,
      });
    }

    if (parsed.length === 0) {
      setError("Enter at least one pincode line");
      return;
    }

    setActionLoading("bulk");
    setError("");
    try {
      const result = await pincodesApi.bulkAddPincodes(parsed);
      setBulkText("");
      setShowBulkForm(false);
      await fetchPincodes();
      console.log(`Bulk added ${result.added} pincodes`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to bulk add pincodes");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (item: PincodeItem) => {
    setEditingId(item.id);
    setEditPincode(item.pincode);
    setEditLocation(item.location);
    setEditArea(item.area || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!/^\d{6}$/.test(editPincode.trim())) {
      setError("Pincode must be exactly 6 digits");
      return;
    }
    setActionLoading(`save-${id}`);
    setError("");
    try {
      await pincodesApi.updatePincode(id, {
        pincode: editPincode.trim(),
        location: editLocation.trim(),
        area: editArea.trim() || undefined,
      });
      setEditingId(null);
      await fetchPincodes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update pincode");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pincode? It will no longer be serviceable.")) {
      return;
    }
    setActionLoading(`delete-${id}`);
    setError("");
    try {
      await pincodesApi.deletePincode(id);
      await fetchPincodes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete pincode");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Pincode Serviceability
          </h1>
          <p className="text-gray-500 italic">
            Manage which pincodes are within our service area — used by the
            app and website to validate land protection requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search pincode or location"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
          <button
            onClick={() => {
              setShowBulkForm((v) => !v);
              setShowAddForm(false);
            }}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Bulk Add
          </button>
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setShowBulkForm(false);
            }}
            className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Pincode
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 bg-gray-50 rounded-xl border border-gray-100 p-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              maxLength={6}
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
              Area (optional)
            </label>
            <input
              type="text"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={actionLoading !== null}
            className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === "add" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save
          </button>
        </div>
      )}

      {showBulkForm && (
        <div className="mb-6 bg-gray-50 rounded-xl border border-gray-100 p-6">
          <label className="block text-xs text-gray-500 mb-2">
            One pincode per line: <code>pincode,location,area(optional)</code>
          </label>
          <textarea
            rows={6}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"500001,Hyderabad,Abids\n500002,Hyderabad,Gunfoundry"}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
          />
          <button
            onClick={handleBulkAdd}
            disabled={actionLoading !== null}
            className="mt-3 bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === "bulk" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Add All
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
          </div>
        )}
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                    Pincode
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[35%]">
                    Location
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%]">
                    Area
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[15%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {editingId === item.id ? (
                      <>
                        <td className="py-3 pl-8">
                          <input
                            type="text"
                            maxLength={6}
                            value={editPincode}
                            onChange={(e) => setEditPincode(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={editArea}
                            onChange={(e) => setEditArea(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                          />
                        </td>
                        <td className="py-3 pr-8">
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(item.id)}
                              disabled={actionLoading !== null}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                            >
                              {actionLoading === `save-${item.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-5 pl-8 font-medium text-gray-900">
                          {item.pincode}
                        </td>
                        <td className="py-5 text-gray-900">{item.location}</td>
                        <td className="py-5 text-gray-500">
                          {item.area || "-"}
                        </td>
                        <td className="py-5 pr-8">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={actionLoading !== null}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {actionLoading === `delete-${item.id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">
                      No pincodes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      <div className="flex justify-between mb-6 items-center mt-6">
        <span className="text-gray-500 text-sm">
          Showing{" "}
          {total > 0
            ? `${(currentPage - 1) * limit + 1}-${Math.min(
                currentPage * limit,
                total,
              )} of ${total}`
            : "0"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
