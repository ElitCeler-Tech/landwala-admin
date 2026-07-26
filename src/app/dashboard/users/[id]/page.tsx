"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, FileText, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import clsx from "clsx";
import {
  userActionsApi,
  usersApi,
  User,
  LoanApplication,
  LegalVerification,
  LandRegistration,
  LandProtection,
} from "@/lib/api";

const tabs = [
  "Loan Applications",
  "Legal Verifications",
  "Land Registrations",
  "Land Protections",
];

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState("Loan Applications");

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Data States
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(
    []
  );
  const [legalVerifications, setLegalVerifications] = useState<
    LegalVerification[]
  >([]);
  const [landRegistrations, setLandRegistrations] = useState<
    LandRegistration[]
  >([]);
  const [landProtections, setLandProtections] = useState<LandProtection[]>([]);

  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [isLoadingLegal, setIsLoadingLegal] = useState(false);
  const [isLoadingReg, setIsLoadingReg] = useState(false);
  const [isLoadingProt, setIsLoadingProt] = useState(false);

  const fetchUser = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const data = await usersApi.getUserById(userId);
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId, fetchUser]);

  const handleToggleActive = async () => {
    if (!user) return;
    setActionLoading("toggle");
    setActionError("");
    try {
      await usersApi.setUserStatus(userId, !user.isActive);
      await fetchUser();
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      setActionError("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerify = async () => {
    setActionLoading("verify");
    setActionError("");
    try {
      await usersApi.verifyUser(userId);
      await fetchUser();
    } catch (error) {
      console.error("Failed to verify user:", error);
      setActionError("Failed to verify user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this user? This cannot be undone from the admin panel.")) {
      return;
    }
    setActionLoading("delete");
    setActionError("");
    try {
      await usersApi.deleteUser(userId);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      setActionError("Failed to delete user");
      setActionLoading(null);
    }
  };

  // Fetch Data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      // Loan Applications
      if (activeTab === "Loan Applications" && loanApplications.length === 0) {
        setIsLoadingLoans(true);
        try {
          const response = await userActionsApi.getLoanApplications(
            1,
            100,
            userId,
          );
          setLoanApplications(response.data);
        } catch (error) {
          console.error("Failed to fetch loans", error);
        } finally {
          setIsLoadingLoans(false);
        }
      }

      // Legal Verifications
      if (
        activeTab === "Legal Verifications" &&
        legalVerifications.length === 0
      ) {
        setIsLoadingLegal(true);
        try {
          const response = await userActionsApi.getLegalVerifications(
            1,
            100,
            userId,
          );
          setLegalVerifications(response.data);
        } catch (error) {
          console.error("Failed to fetch legal verifications", error);
        } finally {
          setIsLoadingLegal(false);
        }
      }

      // Land Registrations
      if (
        activeTab === "Land Registrations" &&
        landRegistrations.length === 0
      ) {
        setIsLoadingReg(true);
        try {
          const response = await userActionsApi.getLandRegistrations(
            1,
            100,
            userId,
          );
          setLandRegistrations(response.data);
        } catch (error) {
          console.error("Failed to fetch land registrations", error);
        } finally {
          setIsLoadingReg(false);
        }
      }

      // Land Protections
      if (activeTab === "Land Protections" && landProtections.length === 0) {
        setIsLoadingProt(true);
        try {
          const response = await userActionsApi.getLandProtections(
            1,
            100,
            undefined,
            userId
          );
          setLandProtections(response.requests);
        } catch (error) {
          console.error("Failed to fetch land protections", error);
        } finally {
          setIsLoadingProt(false);
        }
      }
    };

    fetchData();
  }, [activeTab, userId]);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/users"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">User Details</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          View all the details about the user here
        </p>
      </div>

      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {actionError}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        {isLoadingUser ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : user ? (
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-[#1e2667] flex items-center justify-center text-white text-3xl font-medium shrink-0">
              {(user.name || userId).slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    User ID-{" "}
                  </span>
                  <span className="text-sm text-gray-600 truncate block md:inline">
                    {userId}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Name-{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.name || "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Phone number -{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.phone
                      ? `${user.countryCode || ""} ${user.phone}`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Email -{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.email || "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Registered on -{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    Status-{" "}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {user.isVerified && (
                    <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">User not found</p>
        )}
      </div>

      {/* Action Buttons */}
      {user && (
        <div className="flex justify-end gap-3 mb-8">
          {!user.isVerified && (
            <button
              onClick={handleVerify}
              disabled={actionLoading !== null}
              className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === "verify" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Verify User
            </button>
          )}
          <button
            onClick={handleToggleActive}
            disabled={actionLoading !== null}
            className="bg-[#1e2667] text-white text-sm px-5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === "toggle" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {user.isActive ? "Deactivate User" : "Activate User"}
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading !== null}
            className="bg-[#b91c1c] text-white text-sm px-5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === "delete" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete User
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex w-full min-w-max md:min-w-0 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer px-4",
                activeTab === tab
                  ? "text-[#1e2667] border-b-2 border-[#1e2667]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">{activeTab}</h2>
        </div>

        {/* --- Loan Applications --- */}
        {activeTab === "Loan Applications" && (
          <div className="w-full overflow-x-auto">
            {isLoadingLoans ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : loanApplications.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc]">
                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                      Full Name
                    </th>
                    <th className="py-4 font-medium text-gray-600">Amount</th>
                    <th className="py-4 font-medium text-gray-600">Purpose</th>
                    <th className="py-4 font-medium text-gray-600">Income</th>
                    <th className="py-4 font-medium text-gray-600">
                      Submitted
                    </th>
                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                  {loanApplications.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50/50">
                      <td className="py-4 pl-6 font-medium text-gray-900">
                        {loan.fullName}
                      </td>
                      <td className="py-4">
                        ₹{loan.desiredAmount?.toLocaleString() ?? 0}
                      </td>
                      <td className="py-4">{loan.loanPurpose}</td>
                      <td className="py-4">
                        ₹{loan.monthlyIncome?.toLocaleString() ?? 0}
                      </td>
                      <td className="py-4">
                        {new Date(loan.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No loan applications found.
              </div>
            )}
          </div>
        )}

        {/* --- Legal Verifications --- */}
        {activeTab === "Legal Verifications" && (
          <div className="w-full overflow-x-auto">
            {isLoadingLegal ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : legalVerifications.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc]">
                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                      ID
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Submitted
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Documents
                    </th>
                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                  {legalVerifications.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-4 pl-6 text-gray-900 font-medium text-xs font-mono">
                        {item.id.slice(0, 8)}...
                      </td>
                      <td className="py-4">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {item.titleDeedUrl && (
                            <a
                              href={item.titleDeedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"
                              title="Title Deed"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {item.saleAgreementUrl && (
                            <a
                              href={item.saleAgreementUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"
                              title="Sale Agreement"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                          {item.taxReceiptUrl && (
                            <a
                              href={item.taxReceiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"
                              title="Tax Receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No legal verification requests found.
              </div>
            )}
          </div>
        )}

        {/* --- Land Registrations --- */}
        {activeTab === "Land Registrations" && (
          <div className="w-full overflow-x-auto">
            {isLoadingReg ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : landRegistrations.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc]">
                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                      Applicant
                    </th>
                    <th className="py-4 font-medium text-gray-600">Phone</th>
                    <th className="py-4 font-medium text-gray-600">Email</th>
                    <th className="py-4 font-medium text-gray-600">Location</th>
                    <th className="py-4 font-medium text-gray-600">Type</th>
                    <th className="py-4 font-medium text-gray-600">
                      Submitted
                    </th>
                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                  {landRegistrations.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-4 pl-6 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-4 text-sm text-gray-600">{item.phone}</td>
                      <td className="py-4 text-sm text-gray-600">{item.user.email}</td>
                      <td className="py-4">{item.location}</td>
                      <td className="py-4">{item.plotType}</td>
                      <td className="py-4">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No land registrations found.
              </div>
            )}
          </div>
        )}

        {/* --- Land Protections --- */}
        {activeTab === "Land Protections" && (
          <div className="w-full overflow-x-auto">
            {isLoadingProt ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : landProtections.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc]">
                    <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                      Applicant
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Land Location
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Land Area
                    </th>
                    <th className="py-4 font-medium text-gray-600">
                      Submitted
                    </th>
                    <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                  {landProtections.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-4 pl-6 font-medium text-gray-900">
                        {item.fullName}
                      </td>
                      <td className="py-4">{item.landLocation}</td>
                      <td className="py-4">{item.landArea}</td>
                      <td className="py-4">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-medium">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No land protection requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
