"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { inspectionLandsApi, InspectionLand } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";

export default function InspectionLandsPage() {
  const [lands, setLands] = useState<InspectionLand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 350);
  const [limit, setLimit] = useState(10);

  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    surveyNumbers: "",
    district: "",
    mandal: "",
    village: "",
    location: "",
    pincode: "",
    areaValue: "",
    areaUnit: "",
    latitude: "",
    longitude: "",
  });

  const fetchLands = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await inspectionLandsApi.getLands(
        currentPage,
        limit,
        searchQuery || undefined,
      );
      setLands(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch inspection lands:", err);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
    }
  }, [currentPage, limit, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchLands();
  }, [fetchLands]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (
      !form.ownerName.trim() ||
      !form.surveyNumbers.trim() ||
      !form.district.trim() ||
      !form.mandal.trim() ||
      !form.village.trim() ||
      !form.location.trim() ||
      !form.pincode.trim() ||
      !form.latitude.trim() ||
      !form.longitude.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setAddLoading(true);
    setError("");
    try {
      await inspectionLandsApi.createLand({
        ownerName: form.ownerName.trim(),
        ownerPhone: form.ownerPhone.trim() || undefined,
        surveyNumbers: form.surveyNumbers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        district: form.district.trim(),
        mandal: form.mandal.trim(),
        village: form.village.trim(),
        location: form.location.trim(),
        pincode: form.pincode.trim(),
        areaValue: form.areaValue ? parseFloat(form.areaValue) : undefined,
        areaUnit: form.areaUnit.trim() || undefined,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });
      setForm({
        ownerName: "",
        ownerPhone: "",
        surveyNumbers: "",
        district: "",
        mandal: "",
        village: "",
        location: "",
        pincode: "",
        areaValue: "",
        areaUnit: "",
        latitude: "",
        longitude: "",
      });
      setShowAddForm(false);
      await fetchLands();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create inspection land",
      );
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Inspection Lands
          </h1>
          <p className="text-gray-500 italic">
            Lands to be GPS-verified by field executives
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Land
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
        <div className="mb-6 bg-gray-50 rounded-xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Owner Name *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="ownerPhone"
              value={form.ownerPhone}
              onChange={handleChange}
              placeholder="Owner Phone (optional)"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="surveyNumbers"
              value={form.surveyNumbers}
              onChange={handleChange}
              placeholder="Survey Numbers (comma-separated) *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="District *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="mandal"
              value={form.mandal}
              onChange={handleChange}
              placeholder="Mandal *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="village"
              value={form.village}
              onChange={handleChange}
              placeholder="Village *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Location *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode *"
              maxLength={6}
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <div className="flex gap-2">
              <input
                name="areaValue"
                value={form.areaValue}
                onChange={handleChange}
                placeholder="Area value"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
              <input
                name="areaUnit"
                value={form.areaUnit}
                onChange={handleChange}
                placeholder="Unit"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
              />
            </div>
            <input
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Latitude *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
            <input
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Longitude *"
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={addLoading}
              className="bg-[#1e2667] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
              </div>
            )}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                    Owner
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Land Code
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[30%]">
                    Location
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Status
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[20%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {lands.map((land) => (
                  <tr
                    key={land.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8 font-medium text-gray-900">
                      {land.ownerName}
                      {land.landProtectionId && (
                        <span className="ml-2 inline-block text-[10px] font-medium text-[#1e2667] bg-indigo-50 px-2 py-0.5 rounded-full align-middle">
                          Land Protection
                        </span>
                      )}
                    </td>
                    <td className="py-5 text-gray-500">
                      {land.landCode || "-"}
                    </td>
                    <td className="py-5 text-gray-900">
                      {land.village}, {land.mandal}, {land.district}
                    </td>
                    <td className="py-5">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          land.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {land.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-5 pr-8">
                      <Link href={`/dashboard/inspection-lands/${land.id}`}>
                        <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                          View / Assign
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {lands.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      No inspection lands found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>

      <div className="mb-6 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          pageSize={limit}
          onPageSizeChange={(size) => {
            setLimit(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
