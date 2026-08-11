"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { userActionsApi, LandRegistration, PaginationMeta } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";
import { Pagination } from "@/components/Pagination";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function LandRegistrationsPage() {
    const [registrations, setRegistrations] = useState<LandRegistration[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const searchQuery = useDebouncedValue(searchInput, 350);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const fetchRegistrations = async () => {
            setIsFetching(true);
            try {
                const response = await userActionsApi.getLandRegistrations(
                    currentPage,
                    limit,
                    undefined,
                    searchQuery || undefined,
                );
                setRegistrations(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to fetch land registrations:", error);
            } finally {
                setIsFetching(false);
                setIsInitialLoading(false);
            }
        };

        fetchRegistrations();
    }, [currentPage, limit, searchQuery]);

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        setError("");
        try {
            await userActionsApi.updateLandRegistrationStatus(id, status);
            setRegistrations((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status } : item)),
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            COMPLETED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700",
            IN_PROGRESS: "bg-amber-100 text-amber-700",
            PENDING: "bg-blue-100 text-blue-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    if (isInitialLoading) {
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
                        Land Registrations
                    </h1>
                    <p className="text-gray-500 italic">
                        Manage all registered Land registrations
                    </p>
                </div>

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
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1e2667]" />
                    </div>
                )}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-full">
                        <thead>
                            <tr className="bg-[#f8f9fc]">
                                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                                    Full Name
                                </th>
                                <th className="py-4 font-medium text-gray-600">Phone Number</th>
                                <th className="py-4 font-medium text-gray-600">Email</th>
                                <th className="py-4 font-medium text-gray-600">Plot Type</th>
                                <th className="py-4 font-medium text-gray-600">Status</th>
                                <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600">
                                    Update Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            {/* Spacer row */}
                            <tr>
                                <td className="h-4"></td>
                            </tr>
                            {registrations.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <td className="py-5 pl-8 font-medium text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="py-5 text-gray-900">{item.phone}</td>
                                    <td className="py-5 text-gray-600">{item.user?.email}</td>
                                    <td className="py-5 text-gray-900">{item.plotType}</td>
                                    <td className="py-5">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                                                item.status,
                                            )}`}
                                        >
                                            {item.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="py-5 pr-8">
                                        <div className="flex items-center gap-2">
                                            <select
                                              onFocus={scrollSelectIntoView}
                                                value={item.status}
                                                disabled={actionLoading !== null}
                                                onChange={(e) =>
                                                    handleStatusChange(item.id, e.target.value)
                                                }
                                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] disabled:opacity-50"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                            {actionLoading === item.id && (
                                                <Loader2 className="w-4 h-4 animate-spin text-[#1e2667]" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
