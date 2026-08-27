"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, X, Upload, Film } from "lucide-react";
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

export default function BannersPage() {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
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
  const [coverMediaFile, setCoverMediaFile] = useState<File | null>(null);
  const [coverMediaPreviewUrl, setCoverMediaPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bannersApi.getBanners(
        currentPage,
        pageLimit,
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
  }, [currentPage, pageLimit, typeFilter]);

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
    clearCoverMedia();
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
    clearCoverMedia();
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
        coverMediaFile || undefined,
      );
      setShowAddForm(false);
      clearCoverMedia();
      await fetchBanners();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add to banner");
    } finally {
      setActionLoading(null);
    }
  };

  const clearCoverMedia = () => {
    if (coverMediaPreviewUrl) URL.revokeObjectURL(coverMediaPreviewUrl);
    setCoverMediaFile(null);
    setCoverMediaPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCoverMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (coverMediaPreviewUrl) URL.revokeObjectURL(coverMediaPreviewUrl);
    setCoverMediaFile(file);
    setCoverMediaPreviewUrl(URL.createObjectURL(file));
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
    item.coverMediaUrl ??
    (item.type === "PROPERTY" ? item.property?.images?.[0] : item.layout?.imageUrl);
  const getItemLocation = (item: BannerItem) =>
    item.type === "PROPERTY"
      ? item.property?.locationAddress
      : item.layout?.location;

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
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
              onClick={() => {
                setShowAddForm(false);
                clearCoverMedia();
              }}
              className="bg-gray-200 text-gray-700 text-sm font-medium px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">
              Cover Image or Video (optional)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Leave blank to use the {addType === "PROPERTY" ? "property" : "layout"}&apos;s own default image.
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleCoverMediaChange}
                className="hidden"
                id="cover-media-input"
              />
              <label
                htmlFor="cover-media-input"
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {coverMediaFile ? "Change file" : "Choose file"}
              </label>
              {coverMediaFile && (
                <>
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    {coverMediaFile.type.startsWith("video/") ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/80">
                        <Film className="w-5 h-5 text-white" />
                      </div>
                    ) : coverMediaPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverMediaPreviewUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="text-xs text-gray-500 truncate max-w-[160px]">
                    {coverMediaFile.name}
                  </span>
                  <button
                    onClick={clearCoverMedia}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
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
                    {item.coverMediaType === "VIDEO" ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/85">
                        <Film className="w-8 h-8 text-white" />
                      </div>
                    ) : image ? (
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
                    {item.coverMediaUrl && (
                      <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-white/90 text-gray-700">
                        Custom cover
                      </span>
                    )}
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
        <div className="mb-6 mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={meta?.totalPages || 1}
            onPageChange={setCurrentPage}
            totalItems={meta?.total ?? 0}
            pageSize={pageLimit}
            onPageSizeChange={(size) => {
              setPageLimit(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
