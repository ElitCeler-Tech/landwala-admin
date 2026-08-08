"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, Map } from "lucide-react";
import { enquiriesApi, Enquiry, PaginationMeta } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/Pagination";

export default function LayoutEnquiriesPage() {
    const [searchInput, setSearchInput] = useState("");
    const searchQuery = useDebouncedValue(searchInput, 350);
    const [currentPage, setCurrentPage] = useState(1);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState("");
    const limit = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        fetchEnquiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchQuery]);

    const fetchEnquiries = async () => {
        setIsFetching(true);
        setError("");
        try {
            const response = await enquiriesApi.getEnquiries(
                currentPage,
                limit,
                "LAYOUT",
                searchQuery || undefined,
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
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 mb-2 flex items-center gap-3">
                        <Map className="w-7 h-7 text-[#1e2667]" />
                        Layout Enquiries
                    </h1>
                    <p className="text-gray-500 italic">
                        Manage all layout related enquiries
                    </p>
                </div>

                <div className="flex items-center gap-4">
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
                        No layout enquiries found
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-full">
                            <thead>
                                <tr className="bg-[#f8f9fc]">
                                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                                        User Name
                                    </th>
                                    <th className="py-4 font-medium text-gray-600">Phone</th>
                                    <th className="py-4 font-medium text-gray-600">Email</th>
                                    <th className="py-4 font-medium text-gray-600">Layout</th>
                                    <th className="py-4 font-medium text-gray-600">Slot</th>
                                    <th className="py-4 font-medium text-gray-600">Message</th>
                                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600">
                                        Date
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
                                        <td className="py-5 pl-6 font-medium text-gray-900">
                                            <Link
                                                href={`/dashboard/users/${item.user.id}`}
                                                className="hover:text-[#1e2667] hover:underline"
                                            >
                                                {item.user.name || "N/A"}
                                            </Link>
                                        </td>
                                        <td className="py-5 text-gray-900">{item.user.phone || "N/A"}</td>
                                        <td className="py-5 text-gray-600">
                                            {item.user.email && item.user.email.length > 20
                                                ? item.user.email.substring(0, 20) + "..."
                                                : item.user.email || "N/A"}
                                        </td>
                                        <td className="py-5">
                                            {item.layout ? (
                                                <Link
                                                    href={`/dashboard/layouts/${item.layout.id}`}
                                                    className="text-[#1e2667] hover:underline font-medium"
                                                >
                                                    {item.layout.title}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-5">
                                            {item.slot ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                                    Plot #{item.slot.plotNumber}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">General</span>
                                            )}
                                        </td>
                                        <td className="py-5 text-gray-600 max-w-[200px] truncate">
                                            {item.message}
                                        </td>
                                        <td className="py-5 pr-6 text-gray-500">
                                            {formatDate(item.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex justify-between mb-6 items-center mt-6">
                <span className="text-gray-500 text-sm">
                    {meta
                        ? `Showing ${Math.min(
                              (currentPage - 1) * limit + 1,
                              meta.total,
                          )}-${Math.min(currentPage * limit, meta.total)} of ${meta.total}`
                        : "Showing 0"}
                </span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={meta?.totalPages ?? 1}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
