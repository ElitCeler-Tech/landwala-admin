"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import {
  propertiesApi,
  Property,
  PaginationMeta,
  PROPERTY_CATEGORIES,
} from "@/lib/api";

const categoryTabs = ["All", ...PROPERTY_CATEGORIES];

export default function PlotsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const limit = 8;

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await propertiesApi.getProperties(
          currentPage,
          limit,
          undefined,
          activeCategory === "All" ? undefined : activeCategory
        );
        setProperties(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [currentPage, activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const getPlotSize = (property: Property) => {
    const sizeField = property.overviewFields.find(
      (field) => field.label.toLowerCase() === "sizes"
    );
    return sizeField?.value || "-";
  };

  const getPlotType = (property: Property) => {
    const typeField = property.overviewFields.find(
      (field) => field.label.toLowerCase() === "type"
    );
    return typeField?.value || "-";
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.locationAddress
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">All Plots</h1>
          <p className="text-gray-500 italic">
            Manage all registered Plots here for Landwalaa
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/plots/create">
            <button className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-opacity cursor-pointer">
              <Plus className="w-4 h-4" />
              Create Plot
            </button>
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {categoryTabs.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={clsx(
              "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              activeCategory === category
                ? "bg-[#1e2667] text-white"
                : "bg-[#eaeaec] text-[#1e2667] hover:bg-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[25%]">
                  Title
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Price
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">Size</th>
                <th className="py-4 font-medium text-gray-600 w-[25%]">
                  Location
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">
                  Status
                </th>
                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[10%] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {/* Spacer row */}
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredProperties.map((property) => (
                <tr
                  key={property.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      {property.images[0] && (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="max-w-[200px]">
                        <p className="truncate">{property.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {getPlotType(property)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-gray-900 font-medium">
                    {property.priceRange}
                  </td>
                  <td className="py-5 text-gray-500">
                    {getPlotSize(property)}
                  </td>
                  <td className="py-5 text-gray-500">
                    <div className="max-w-[200px]">
                      <p className="truncate">{property.city}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {property.locationAddress}
                      </p>
                    </div>
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        property.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-5 pr-8 text-right">
                    <Link href={`/dashboard/plots/${property.id}`}>
                      <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No properties found
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
          {meta
            ? `${(currentPage - 1) * limit + 1}-${Math.min(
                currentPage * limit,
                meta.total
              )} of ${meta.total}`
            : "0"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!meta?.hasPrevPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!meta?.hasNextPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
