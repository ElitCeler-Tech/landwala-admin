"use client";

import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { enquiriesApi, Enquiry, PaginationMeta } from "@/lib/api";
import { Pagination } from "@/components/Pagination";

export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        const fetchEnquiries = async () => {
            setIsLoading(true);
            try {
                const response = await enquiriesApi.getEnquiries(currentPage, limit);
                setEnquiries(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to fetch enquiries:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnquiries();
    }, [currentPage, limit]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const truncateId = (id: string | null) => {
        if (!id) return "-";
        return `${id.substring(0, 8)}...`;
    };

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
                    <h1 className="text-2xl font-medium text-gray-900 mb-2">Enquiries</h1>
                    <p className="text-gray-500 italic">
                        View all enquiries submitted by users
                    </p>
                </div>

                <div className="flex items-center gap-4">
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
                                    ID
                                </th>
                                <th className="py-4 font-medium text-gray-600">User ID</th>
                                <th className="py-4 font-medium text-gray-600">Type</th>
                                <th className="py-4 font-medium text-gray-600">Property ID</th>
                                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {/* Spacer row */}
                            <tr>
                                <td className="h-4"></td>
                            </tr>
                            {enquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No enquiries found.
                                    </td>
                                </tr>
                            ) : (
                                enquiries.map((enquiry) => (
                                    <tr
                                        key={enquiry.id}
                                        className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <td className="py-5 pl-8 font-medium text-gray-900" title={enquiry.id}>
                                            {truncateId(enquiry.id)}
                                        </td>
                                        <td className="py-5 text-gray-500 font-mono" title={enquiry.userId}>
                                            {truncateId(enquiry.userId)}
                                        </td>
                                        <td className="py-5">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                                {enquiry.type}
                                            </span>
                                        </td>
                                        <td className="py-5 text-gray-500 font-mono" title={enquiry.propertyId || enquiry.layoutId || undefined}>
                                            {truncateId(enquiry.propertyId || enquiry.layoutId)}
                                        </td>
                                        <td className="py-5 pr-8 text-gray-500">
                                            {formatDate(enquiry.createdAt)}
                                        </td>
                                    </tr>
                                ))
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
