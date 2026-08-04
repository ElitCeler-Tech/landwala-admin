"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Users } from "lucide-react";
import { propertiesApi, AdminRecentlyViewedItem } from "@/lib/api";

const LIMIT_OPTIONS = [10, 20, 50] as const;

export default function RecentlyViewedPage() {
    const [items, setItems] = useState<AdminRecentlyViewedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [limit, setLimit] = useState<number>(20);

    const fetchRecentlyViewed = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await propertiesApi.getRecentlyViewedAdmin(limit);
            setItems(response.data);
        } catch (error) {
            console.error("Failed to fetch recently viewed properties:", error);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchRecentlyViewed();
    }, [fetchRecentlyViewed]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredData = items.filter(
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
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">
                        Recently Viewed
                    </h1>
                    <p className="text-gray-500 italic">
                        Properties users are viewing right now, across everyone &mdash;
                        ordered by the most recent view. Not any single user&apos;s
                        personal history.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] cursor-pointer"
                    >
                        {LIMIT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                Show {option}
                            </option>
                        ))}
                    </select>
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
                                <th className="py-4 font-medium text-gray-600">
                                    Last Viewed
                                </th>
                                <th className="py-4 font-medium text-gray-600">
                                    Recent Viewers
                                </th>
                                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 text-right">
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
                                    <td className="py-5 text-gray-600">
                                        {formatDateTime(item.lastViewedAt)}
                                    </td>
                                    <td className="py-5">
                                        <span className="inline-flex items-center gap-1.5 text-gray-900 font-medium">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            {item.recentViewersCount}
                                        </span>
                                    </td>
                                    <td className="py-5 pr-8 text-right">
                                        <Link href={`/dashboard/plots/${item.id}`}>
                                            <button className="bg-[#1e2667] text-white text-xs font-medium px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity w-20 cursor-pointer">
                                                View
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">
                                        No recently viewed properties yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
