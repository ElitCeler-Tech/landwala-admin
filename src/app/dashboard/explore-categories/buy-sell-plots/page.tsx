"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Store } from "lucide-react";
import {
    enquiriesApi,
    Enquiry,
    PaginationMeta,
    PROPERTY_CATEGORIES,
} from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";


type RangeKey = "all" | "today" | "7d" | "30d";

const RANGE_TABS: { key: RangeKey; label: string }[] = [
    { key: "all", label: "All time" },
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 days" },
    { key: "30d", label: "Last 30 days" },
];

/**
 * Start of the selected window as a plain date, or undefined for "all time".
 * Local midnight, so "today" means the operator's today rather than UTC's.
 */
function rangeStart(range: RangeKey): string | undefined {
    if (range === "all") return undefined;
    const days = range === "today" ? 0 : range === "7d" ? 6 : 29;
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
}

export default function BuySellPlotsPage() {
    const [searchInput, setSearchInput] = useState("");
    const searchQuery = useDebouncedValue(searchInput, 350);
    const [currentPage, setCurrentPage] = useState(1);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState("");
    const [limit, setLimit] = useState(10);
    const [range, setRange] = useState<RangeKey>("all");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, range, category]);

    useEffect(() => {
        fetchEnquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, limit, searchQuery, range, category]);

    const fetchEnquiries = async () => {
        setIsFetching(true);
        setError("");
        try {
            const response = await enquiriesApi.getEnquiries(
                currentPage,
                limit,
                "PROPERTY",
                searchQuery || undefined,
                undefined,
                {
                    dateFrom: rangeStart(range),
                    category: category === "All" ? undefined : category,
                },
            );
            setEnquiries(response.data);
            setMeta(response.meta);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch enquiries");
        } finally {
            setIsFetching(false);
            setIsInitialLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-3">
                        <Store className="w-7 h-7 text-[#1e2667] shrink-0" />
                        Buy Plots / Enquiries
                    </h1>
                    <p className="text-gray-500 italic max-w-2xl">
                        Users interested in buying a listed, approved property, tracked as an enquiry when they message about it. Looking for sell requests? See{" "}
                        <Link href="/dashboard/property-submissions" className="text-[#1e2667] underline">
                            Sell Requests
                        </Link>
                        .
                    </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
                        />
                    </div>
                </div>
            </div>

            {/* Which enquiries came in, and for what kind of property. */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                    {RANGE_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setRange(tab.key)}
                            className={`text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                range === tab.key
                                    ? "bg-[#1e2667] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                >
                    <option value="All">All categories</option>
                    {PROPERTY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                {(range !== "all" || category !== "All" || searchInput) && (
                    <button
                        onClick={() => {
                            setRange("all");
                            setCategory("All");
                            setSearchInput("");
                        }}
                        className="text-sm text-[#1e2667] underline cursor-pointer"
                    >
                        Clear filters
                    </button>
                )}
                {meta && (
                    <span className="text-sm text-gray-500 ml-auto">
                        {meta.total} enquir{meta.total === 1 ? "y" : "ies"}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative">
                {isFetching && !isInitialLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
                    </div>
                )}
                {isInitialLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex items-center justify-center text-red-500">
                        {error}
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        No property enquiries found
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-full table-fixed">
                            <thead>
                                <tr className="bg-[#f8f9fc]">
                                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600 w-[14%]">
                                        User Name
                                    </th>
                                    <th className="py-4 font-medium text-gray-600 w-[10%] whitespace-nowrap">Phone</th>
                                    <th className="py-4 font-medium text-gray-600 w-[14%]">Email</th>
                                    <th className="py-4 font-medium text-gray-600 w-[16%]">Property</th>
                                    <th className="py-4 font-medium text-gray-600 w-[10%]">Location</th>
                                    <th className="py-4 font-medium text-gray-600 w-[18%]">Message</th>
                                    <th className="py-4 font-medium text-gray-600 w-[10%] whitespace-nowrap">
                                        Date
                                    </th>
                                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right w-[8%] whitespace-nowrap">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-600">
                                <tr>
                                    <td className="h-4"></td>
                                </tr>
                                {enquiries.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <td className="py-5 pl-6 font-medium text-gray-900 truncate max-w-0">
                                            <Link
                                                href={`/dashboard/users/${item.user.id}`}
                                                className="hover:text-[#1e2667] hover:underline"
                                            >
                                                {item.user.name || "N/A"}
                                            </Link>
                                        </td>
                                        <td className="py-5 text-gray-900 whitespace-nowrap">{item.user.phone || "N/A"}</td>
                                        <td className="py-5 text-gray-600 truncate max-w-0">
                                            {item.user.email || "N/A"}
                                        </td>
                                        <td className="py-5 truncate max-w-0">
                                            {item.property ? (
                                                <Link
                                                    href={`/dashboard/plots/${item.property.id}`}
                                                    className="text-[#1e2667] hover:underline font-medium"
                                                >
                                                    {item.property.title}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-5 text-gray-600 truncate max-w-0">
                                            {item.property?.city || item.user.location || "-"}
                                        </td>
                                        <td className="py-5 text-gray-600 truncate max-w-0">
                                            {item.message}
                                        </td>
                                        <td className="py-5 text-gray-500 whitespace-nowrap">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="py-5 pr-6 text-right whitespace-nowrap">
                                            {item.property ? (
                                                <Link href={`/dashboard/plots/${item.property.id}`}>
                                                    <button className="bg-[#1e2667] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer">
                                                        View
                                                    </button>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
