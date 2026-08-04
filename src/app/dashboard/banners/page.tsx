"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import {
  bannersApi,
  propertiesApi,
  layoutsApi,
  BannerItem,
  BannerItemType,
  PaginationMeta,
  Property,
  Layout,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";
import { Pagination } from "@/components/Pagination";

const TYPE_FILTERS: ("ALL" | BannerItemType)[] = ["ALL", "PROPERTY", "LAYOUT"];
const PAGE_LIMIT = 12;

export default function BannersPage() {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | BannerItemType>("ALL");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<BannerItemType>("PROPERTY");
  const [pickerItems, setPickerItems] = useState<(Property | Layout)[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bannersApi.getBanners(
        currentPage,
        PAGE_LIMIT,
        typeFilter === "ALL" ? undefined : typeFilter,
      );
      setItems(
        [...response.data].sort((a, b) => a.displayOrder - b.displayOrder),
      );
      setMeta(response.meta);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleTypeFilterChange = (type: "ALL" | BannerItemType) => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const openAddForm = async () => {
    setShowAddForm(true);
    setError("");
    setSelectedItemId("");
    setDisplayOrder("");
    setPickerLoading(true);
    try {
      if (addType === "PROPERTY") {
        const response = await propertiesApi.getProperties(1, 100);
        setPickerItems(response.data);
      } else {
        const response = await layoutsApi.getLayouts(1, 100);
        setPickerItems(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch items for picker:", err);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleAddTypeChange = async (type: BannerItemType) => {
    setAddType(type);
    setSelectedItemId("");
    setPickerLoading(true);
    try {
      if (type === "PROPERTY") {
        const response = await propertiesApi.getProperties(1, 100);
        setPickerItems(response.data);
      } else {
        const response = await layoutsApi.getLayouts(1, 100);
        setPickerItems(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch items for picker:", err);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedItemId) {
      setError("Select a property or layout first");
      return;
    }
    setActionLoading("add");
    setError("");
    try {
      await bannersApi.addToBanner(
        addType,
        selectedItemId,
        displayOrder ? parseInt(displayOrder, 10) : undefined,
      );
      setShowAddForm(false);
      await fetchBanners();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add to banner");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (bannerItemId: string) => {
    if (!confirm("Remove this item from the banner carousel?")) return;
    setActionLoading(`remove-${bannerItemId}`);
    setError("");
    try {
      await bannersApi.removeFromBanner(bannerItemId);
      await fetchBanners();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to remove from banner");
    } finally {
      setActionLoading(null);
    }
  };

  const getItemTitle = (item: BannerItem) =>
    item.type === "PROPERTY" ? item.property?.title : item.layout?.title;
  const getItemImage = (item: BannerItem) =>
    item.type === "PROPERTY" ? item.property?.images?.[0] : item.layout?.imageUrl;
  const getItemLocation = (item: BannerItem) =>
    item.type === "PROPERTY"
      ? item.property?.locationAddress
      : item.layout?.location;

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Home Banner
          </h1>
          <p className="text-gray-500 italic">
            Feature properties or layouts on the app/website home carousel
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add to Banner
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeFilterChange(type)}
            className={`text-sm font-medium px-4 py-2 rounded-lg capitalize transition-colors cursor-pointer ${
              typeFilter === type
                ? "bg-[#1e2667] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type === "ALL" ? "All" : type.toLowerCase()}
          </button>
        ))}
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
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleAddTypeChange("PROPERTY")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                addType === "PROPERTY"
                  ? "bg-[#1e2667] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              Property
            </button>
            <button
              onClick={() => handleAddTypeChange("LAYOUT")}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                addType === "LAYOUT"
                  ? "bg-[#1e2667] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              Layout
            </button>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                {addType === "PROPERTY" ? "Property" : "Layout"} *
              </label>
              {pickerLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : (
                <select
                  onFocus={scrollSelectIntoView}
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                >
                  <option value="">Select...</option>
                  {pickerItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="w-40">
              <label className="block text-xs text-gray-500 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
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
              Add
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const title = getItemTitle(item);
              const image = getItemImage(item);
              const location = getItemLocation(item);
              return (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="relative w-full h-40 bg-gray-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={title || "Banner item"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-gray-700">
                      {item.type}
                    </span>
                    <span className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-[#1e2667] text-white">
                      #{item.displayOrder}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {title || "Untitled"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {location || "-"}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={actionLoading !== null}
                      className="mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === `remove-${item.id}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Remove from Banner
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">
            No items featured on the banner yet
          </div>
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="flex justify-between mb-6 items-center mt-6">
          <span className="text-gray-500 text-sm">
            Showing{" "}
            {meta && meta.total > 0
              ? `${(currentPage - 1) * PAGE_LIMIT + 1}-${Math.min(
                  currentPage * PAGE_LIMIT,
                  meta.total,
                )} of ${meta.total}`
              : "0"}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={meta?.totalPages || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
