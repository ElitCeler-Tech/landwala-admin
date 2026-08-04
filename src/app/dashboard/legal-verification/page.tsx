"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Scale,
    X,
} from "lucide-react";
import {
    userActionsApi,
    LegalVerification,
    PaginationMeta,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "IN_REVIEW", "VERIFIED", "REJECTED"];

export default function LegalVerificationPage() {
    const [verifications, setVerifications] = useState<LegalVerification[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState("");
    const limit = 10;

    const [assignTargetId, setAssignTargetId] = useState<string | null>(null);
    const [lawyerForm, setLawyerForm] = useState({ name: "", phone: "", email: "" });
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        const fetchVerifications = async () => {
            setIsLoading(true);
            try {
                const response = await userActionsApi.getLegalVerifications(
                    currentPage,
                    limit
                );
                setVerifications(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to fetch legal verifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerifications();
    }, [currentPage]);

    const handleStatusChange = async (id: string, status: string) => {
        setActionLoading(id);
        setError("");
        try {
            await userActionsApi.updateLegalVerificationStatus(id, status);
            setVerifications((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status } : item)),
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update status");
        } finally {
            setActionLoading(null);
        }
    };

    const openAssignModal = (item: LegalVerification) => {
        setAssignTargetId(item.id);
        setLawyerForm({
            name: item.assignedLawyerName || "",
            phone: item.assignedLawyerPhone || "",
            email: item.assignedLawyerEmail || "",
        });
        setError("");
    };

    const handleAssignLawyer = async () => {
        if (!assignTargetId || !lawyerForm.name.trim()) {
            setError("Lawyer name is required");
            return;
        }
        setIsAssigning(true);
        setError("");
        try {
            await userActionsApi.assignLawyer(
                assignTargetId,
                lawyerForm.name,
                lawyerForm.phone,
                lawyerForm.email,
            );
            setVerifications((prev) =>
                prev.map((item) =>
                    item.id === assignTargetId
                        ? {
                              ...item,
                              assignedLawyerName: lawyerForm.name,
                              assignedLawyerPhone: lawyerForm.phone,
                              assignedLawyerEmail: lawyerForm.email,
                          }
                        : item,
                ),
            );
            setAssignTargetId(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to assign lawyer");
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredVerifications = verifications.filter((item) => {
        const userName = item.user?.name || "";
        const userEmail = item.user?.email || "";
        const userPhone = item.user?.phone || "";
        const query = searchQuery.toLowerCase();

        return (
            userName.toLowerCase().includes(query) ||
            userEmail.toLowerCase().includes(query) ||
            userPhone.includes(searchQuery)
        );
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            VERIFIED: "bg-green-100 text-green-700",
            REJECTED: "bg-red-100 text-red-700",
            IN_REVIEW: "bg-amber-100 text-amber-700",
            SUBMITTED: "bg-blue-100 text-blue-700",
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
                        Legal Verification
                    </h1>
                    <p className="text-gray-500 italic">
                        Manage all registered legal verifications
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
                                <th className="py-4 font-medium text-gray-600">Status</th>
                                <th className="py-4 font-medium text-gray-600">
                                    Assigned Lawyer
                                </th>
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
                            {filteredVerifications.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <td className="py-5 pl-8 font-medium text-gray-900">
                                        {item.user.name}
                                    </td>
                                    <td className="py-5 text-gray-900">{item.user.phone}</td>
                                    <td className="py-5 text-gray-600">{item.user.email}</td>
                                    <td className="py-5">
                                        <span
                                            className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                                                item.status,
                                            )}`}
                                        >
                                            {item.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="py-5">
                                        {item.assignedLawyerName ? (
                                            <button
                                                onClick={() => openAssignModal(item)}
                                                className="text-sm text-gray-900 hover:text-[#1e2667] cursor-pointer"
                                            >
                                                {item.assignedLawyerName}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openAssignModal(item)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-[#1e2667] hover:underline cursor-pointer"
                                            >
                                                <Scale className="w-3.5 h-3.5" />
                                                Assign Lawyer
                                            </button>
                                        )}
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

            {assignTargetId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Assign Lawyer
                            </h2>
                            <button
                                onClick={() => setAssignTargetId(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Lawyer Name
                                </label>
                                <input
                                    type="text"
                                    value={lawyerForm.name}
                                    onChange={(e) =>
                                        setLawyerForm({ ...lawyerForm, name: e.target.value })
                                    }
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={lawyerForm.phone}
                                    onChange={(e) =>
                                        setLawyerForm({ ...lawyerForm, phone: e.target.value })
                                    }
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={lawyerForm.email}
                                    onChange={(e) =>
                                        setLawyerForm({ ...lawyerForm, email: e.target.value })
                                    }
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setAssignTargetId(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignLawyer}
                                disabled={isAssigning}
                                className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium disabled:opacity-50"
                            >
                                {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
