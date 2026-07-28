"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, FileText, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import clsx from "clsx";
import {
  userActionsApi,
  usersApi,
  enquiriesApi,
  propertySubmissionsApi,
  subscriptionPurchasesApi,
  genericPaymentsApi,
  User,
  LoanApplication,
  LegalVerification,
  LandRegistration,
  LandProtection,
  Enquiry,
  PropertySubmission,
  SubscriptionPurchase,
  GenericPayment,
} from "@/lib/api";

const TOP_TABS = ["Overview", "Properties", "Services", "Payments"] as const;
type TopTab = (typeof TOP_TABS)[number];

const SERVICE_TABS = [
  "Loan Applications",
  "Legal Verifications",
  "Land Registrations",
  "Land Protections",
] as const;
type ServiceTab = (typeof SERVICE_TABS)[number];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [activeTopTab, setActiveTopTab] = useState<TopTab>("Overview");
  const [activeServiceTab, setActiveServiceTab] =
    useState<ServiceTab>("Loan Applications");

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Services tab data
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(
    [],
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

  // Properties tab data
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [sellSubmissions, setSellSubmissions] = useState<PropertySubmission[]>(
    [],
  );
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // Payments tab data
  const [subscriptionPurchases, setSubscriptionPurchases] = useState<
    SubscriptionPurchase[]
  >([]);
  const [genericPayments, setGenericPayments] = useState<GenericPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

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

  // Properties tab: fetch once when selected
  useEffect(() => {
    if (activeTopTab !== "Properties" || !userId) return;
    if (enquiries.length > 0 || sellSubmissions.length > 0) return;
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const [enquiryRes, submissionRes] = await Promise.all([
          enquiriesApi.getEnquiries(1, 50, undefined, undefined, userId),
          propertySubmissionsApi.getSubmissions(1, 50, undefined, undefined, userId),
        ]);
        setEnquiries(enquiryRes.data);
        setSellSubmissions(submissionRes.data);
      } catch (error) {
        console.error("Failed to fetch user properties", error);
      } finally {
        setIsLoadingProperties(false);
      }
    };
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopTab, userId]);

  // Payments tab: fetch once when selected
  useEffect(() => {
    if (activeTopTab !== "Payments" || !userId) return;
    if (subscriptionPurchases.length > 0 || genericPayments.length > 0) return;
    const fetchPayments = async () => {
      setIsLoadingPayments(true);
      try {
        const [subRes, payRes] = await Promise.all([
          subscriptionPurchasesApi.getAllPurchases(1, 50, undefined, userId),
          genericPaymentsApi.getAllPayments(1, 50, undefined, userId),
        ]);
        setSubscriptionPurchases(subRes.data);
        setGenericPayments(payRes.data);
      } catch (error) {
        console.error("Failed to fetch user payments", error);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopTab, userId]);

  // Services tab: fetch per sub-tab
  useEffect(() => {
    if (activeTopTab !== "Services") return;
    const fetchData = async () => {
      if (
        activeServiceTab === "Loan Applications" &&
        loanApplications.length === 0
      ) {
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

      if (
        activeServiceTab === "Legal Verifications" &&
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

      if (
        activeServiceTab === "Land Registrations" &&
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

      if (
        activeServiceTab === "Land Protections" &&
        landProtections.length === 0
      ) {
        setIsLoadingProt(true);
        try {
          const response = await userActionsApi.getLandProtections(
            1,
            100,
            undefined,
            userId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopTab, activeServiceTab, userId]);

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

      {/* Action Buttons */}
      {user && (
        <div className="flex justify-end gap-3 mb-6">
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

      {/* Top-level Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto">
        <div className="flex w-full min-w-max md:min-w-0 gap-2">
          {TOP_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTopTab(tab)}
              className={clsx(
                "pb-3 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer px-4",
                activeTopTab === tab
                  ? "text-[#1e2667] border-b-2 border-[#1e2667]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- Overview --- */}
      {activeTopTab === "Overview" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                      {formatDate(user.createdAt)}
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
      )}

      {/* --- Properties --- */}
      {activeTopTab === "Properties" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Buy Interest (Enquiries)
            </h2>
            {isLoadingProperties ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : enquiries.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fc]">
                      <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                        Type
                      </th>
                      <th className="py-4 font-medium text-gray-600">
                        Property / Layout
                      </th>
                      <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600">
                        Enquired On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-gray-50/50">
                        <td className="py-4 pl-6">
                          <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            {enq.type}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-gray-900">
                          {enq.property?.title || enq.layout?.title || "—"}
                        </td>
                        <td className="py-4 pr-6">
                          {formatDate(enq.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No buy enquiries found.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Sell Requests (Property Submissions)
            </h2>
            {isLoadingProperties ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : sellSubmissions.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fc]">
                      <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                        Title
                      </th>
                      <th className="py-4 font-medium text-gray-600">
                        Location
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
                    {sellSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50">
                        <td className="py-4 pl-6 font-medium text-gray-900">
                          {sub.title}
                        </td>
                        <td className="py-4">{sub.location || "—"}</td>
                        <td className="py-4">{formatDate(sub.createdAt)}</td>
                        <td className="py-4 pr-6 text-right">
                          <span className="bg-cyan-100 text-cyan-800 text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No sell requests found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Services --- */}
      {activeTopTab === "Services" && (
        <div>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {SERVICE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveServiceTab(tab)}
                className={clsx(
                  "text-xs font-medium px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer transition-colors",
                  activeServiceTab === tab
                    ? "bg-[#1e2667] text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[300px]">
            {/* --- Loan Applications --- */}
            {activeServiceTab === "Loan Applications" && (
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
                        <th className="py-4 font-medium text-gray-600">
                          Amount
                        </th>
                        <th className="py-4 font-medium text-gray-600">
                          Purpose
                        </th>
                        <th className="py-4 font-medium text-gray-600">
                          Income
                        </th>
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
                            {formatDate(loan.submittedAt)}
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
            {activeServiceTab === "Legal Verifications" && (
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
                            {formatDate(item.submittedAt)}
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
            {activeServiceTab === "Land Registrations" && (
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
                        <th className="py-4 font-medium text-gray-600">
                          Phone
                        </th>
                        <th className="py-4 font-medium text-gray-600">
                          Email
                        </th>
                        <th className="py-4 font-medium text-gray-600">
                          Location
                        </th>
                        <th className="py-4 font-medium text-gray-600">
                          Type
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
                      {landRegistrations.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="py-4 pl-6 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {item.phone}
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {item.user.email}
                          </td>
                          <td className="py-4">{item.location}</td>
                          <td className="py-4">{item.plotType}</td>
                          <td className="py-4">
                            {formatDate(item.createdAt)}
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
            {activeServiceTab === "Land Protections" && (
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
                            {formatDate(item.createdAt)}
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
      )}

      {/* --- Payments --- */}
      {activeTopTab === "Payments" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Subscription Purchases
            </h2>
            {isLoadingPayments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : subscriptionPurchases.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fc]">
                      <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                        Plan
                      </th>
                      <th className="py-4 font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="py-4 font-medium text-gray-600">
                        Purchased
                      </th>
                      <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                    {subscriptionPurchases.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50">
                        <td className="py-4 pl-6 font-medium text-gray-900">
                          {sub.plan?.title || "—"}
                        </td>
                        <td className="py-4">
                          ₹{sub.plan?.price?.toLocaleString() ?? 0}
                        </td>
                        <td className="py-4">{formatDate(sub.createdAt)}</td>
                        <td className="py-4 pr-6 text-right">
                          <span className="bg-lime-100 text-lime-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            {sub.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No subscription purchases found.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              One-off Payments
            </h2>
            {isLoadingPayments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
              </div>
            ) : genericPayments.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fc]">
                      <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                        Note
                      </th>
                      <th className="py-4 font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="py-4 font-medium text-gray-600">Paid</th>
                      <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                    {genericPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50">
                        <td className="py-4 pl-6 font-medium text-gray-900">
                          {payment.note || "—"}
                        </td>
                        <td className="py-4">
                          {payment.currency}{" "}
                          {payment.amount.toLocaleString()}
                        </td>
                        <td className="py-4">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No one-off payments found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
