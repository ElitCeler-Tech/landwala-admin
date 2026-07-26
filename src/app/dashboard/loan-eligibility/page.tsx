"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { userActionsApi, LoanApplication, PaginationMeta } from "@/lib/api";

const STATUS_OPTIONS = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
];

export default function LoanEligibilityPage() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const limit = 10;

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            try {
                const response = await userActionsApi.getLoanApplications(
                    currentPage,
                    limit
                );
                setApplications(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to fetch loan applications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, [currentPage]);

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        setError("");
        try {
            await userActionsApi.updateLoanApplicationStatus(id, status);
            setApplications((prev) =>
                prev.map((app) => (app.id === id ? { ...app, status } : app)),
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredApplications = applications.filter((app) => {
        const fullName = app.fullName || "";
        const userEmail = app.user?.email || "";
        const userPhone = app.user?.phone || "";
        const query = searchQuery.toLowerCase();

        return (
            fullName.toLowerCase().includes(query) ||
            userEmail.toLowerCase().includes(query) ||
            userPhone.includes(searchQuery)
        );
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            APPROVED: "bg-green-100 text-green-700",
            REJECTED: "bg-red-100 text-red-700",
            UNDER_REVIEW: "bg-amber-100 text-amber-700",
            SUBMITTED: "bg-blue-100 text-blue-700",
            CANCELLED: "bg-gray-100 text-gray-700",
            DRAFT: "bg-gray-100 text-gray-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

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
                        Loan Eligibility
                    </h1>
                    <p className="text-gray-500 italic">
                        Manage all registered users applied for loan eligibility
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

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-full">
                        <thead>
                            <tr className="bg-[#f8f9fc]">
                                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600">
                                    Full Name
                                </th>
                                <th className="py-4 font-medium text-gray-600">Phone Number</th>
                                <th className="py-4 font-medium text-gray-600">Email</th>
                                <th className="py-4 font-medium text-gray-600">Amount</th>
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
                            {filteredApplications.map((app) => (
                                <tr
                                    key={app.id}
                                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <td className="py-5 pl-8 font-medium text-gray-900">
                                        {app.fullName}
                                    </td>
                                    <td className="py-5 text-gray-900">{app.user?.phone}</td>
                                    <td className="py-5 text-gray-600">{app.user?.email}</td>
                                    <td className="py-5 text-gray-900">
                                        ₹{app.desiredAmount?.toLocaleString() ?? 0}
                                    </td>
                                    <td className="py-5">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                                                app.status,
                                            )}`}
                                        >
                                            {app.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="py-5 pr-8">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={app.status}
                                                disabled={actionLoading !== null}
                                                onChange={(e) =>
                                                    handleStatusChange(app.id, e.target.value)
                                                }
                                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] disabled:opacity-50"
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.replace("_", " ")}
                                                    </option>
                                                ))}
                                            </select>
                                            {actionLoading === app.id && (
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

            <div className="flex justify-between mb-6 items-center mt-6">
                <span className="text-gray-500 text-sm">
                    Showing{" "}
                    {meta
                        ? `${(currentPage - 1) * limit + 1}-${Math.min(
                            currentPage * limit,
                            meta.total
                        )} of ${meta.total}`
                        : "01 of 10"}
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
