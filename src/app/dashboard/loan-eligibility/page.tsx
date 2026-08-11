"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Loader2,
    FileText,
    X,
} from "lucide-react";
import { userActionsApi, LoanApplication, PaginationMeta } from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";
import { Pagination } from "@/components/Pagination";

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
    const [docsTarget, setDocsTarget] = useState<LoanApplication | null>(null);
    const [limit, setLimit] = useState(10);

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
    }, [currentPage, limit]);

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
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
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
                                <th className="py-4 font-medium text-gray-600">Documents</th>
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
                                    <td className="py-5">
                                        <button
                                            onClick={() => setDocsTarget(app)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-[#1e2667] hover:underline cursor-pointer"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            View Docs {app.documents?.length ? `(${app.documents.length})` : ""}
                                        </button>
                                    </td>
                                    <td className="py-5 pr-8">
                                        <div className="flex items-center gap-2">
                                            <select
                                              onFocus={scrollSelectIntoView}
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

            {docsTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Uploaded Documents
                            </h2>
                            <button
                                onClick={() => setDocsTarget(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {docsTarget.documents && docsTarget.documents.length > 0 ? (
                            <div className="space-y-2">
                                {docsTarget.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-lg"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700 truncate">
                                                {doc.documentType}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {doc.fileName}
                                            </p>
                                        </div>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-[#1e2667] hover:underline shrink-0 ml-3"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded</p>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setDocsTarget(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
