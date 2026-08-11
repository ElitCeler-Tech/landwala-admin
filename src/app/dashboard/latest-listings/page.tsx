"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { propertiesApi, Property, PaginationMeta } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

export default function LatestListingsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [limit, setLimit] = useState(10);

    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await propertiesApi.getProperties(
                currentPage,
                limit,
                true,
            );
            setProperties(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error("Failed to fetch latest listings:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, limit]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const handleRemove = async (id: string) => {
        setActionLoading(id);
        try {
            await propertiesApi.toggleLatestListing(id);
            await fetchProperties();
        } catch (error) {
            console.error("Failed to remove from latest listings:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredData = properties.filter(
        (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.locationAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="p-8 bg-white font-sans min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
            </div>
        );
    }

    return (
        <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">
                        Latest Listings
                    </h1>
                    <p className="text-gray-500 italic">
                        Properties currently marked as latest listings — toggle from a
                        property&apos;s detail page to add more
                    </p>
                </div>

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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-full">
                        <thead>
                            <tr className="bg-[#f8f9fc]">
                                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                                    Title
                                </th>
                                <th className="py-4 font-medium text-gray-600">Location</th>
                                <th className="py-4 font-medium text-gray-600">Price Range</th>
                                <th className="py-4 font-medium text-gray-600">Status</th>
                                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {/* Spacer row */}
                            <tr>
                                <td className="h-4"></td>
                            </tr>
                            {filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <td className="py-5 pl-8 font-medium text-gray-900">
                                        <Link
                                            href={`/dashboard/plots/${item.id}`}
                                            className="hover:text-[#1e2667] hover:underline"
                                        >
                                            {item.title}
                                        </Link>
                                    </td>
                                    <td className="py-5 text-gray-900">
                                        {item.city}, {item.state}
                                    </td>
                                    <td className="py-5 text-gray-600">{item.priceRange}</td>
                                    <td className="py-5">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                                                item.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {item.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-5 pr-8">
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            disabled={actionLoading !== null}
                                            className="bg-red-50 text-red-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {actionLoading === item.id && (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            )}
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">
                                        No properties marked as latest listings
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-6 mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={meta?.totalPages ?? 1}
                    onPageChange={setCurrentPage}
                    totalItems={meta?.total ?? 0}
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
