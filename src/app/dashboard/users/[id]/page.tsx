"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, FileText, Loader2 } from "lucide-react";
import clsx from "clsx";
import {
  userActionsApi,
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
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState("Loan Applications");

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

  // Fetch Data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      // Loan Applications
      if (activeTab === "Loan Applications" && loanApplications.length === 0) {
        setIsLoadingLoans(true);
        try {
          const response = await userActionsApi.getLoanApplications(1, 100);
          const filtered = response.data.filter(
            (item) => item.user.id === userId
          );
          setLoanApplications(filtered.length > 0 ? filtered : response.data); // Keep using fallback for demo visibility
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
          const response = await userActionsApi.getLegalVerifications(1, 100);
          const filtered = response.data.filter(
            (item) => item.user.id === userId
          );
          setLegalVerifications(filtered.length > 0 ? filtered : response.data);
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
          const response = await userActionsApi.getLandRegistrations(1, 100);
          const filtered = response.data.filter(
            (item) => item.user.id === userId
          );
          setLandRegistrations(filtered.length > 0 ? filtered : response.data);
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

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-[#1e2667] flex items-center justify-center text-white text-3xl font-medium shrink-0">
            {userId.slice(0, 1).toUpperCase()}
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
                <span className="text-sm text-gray-600">Rohan Mehta</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  Phone number -{" "}
                </span>
                <span className="text-sm text-gray-600">+91 9654324323</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  User Type -{" "}
                </span>
                <span className="text-sm text-gray-600">Buyer</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  Registerd on -{" "}
                </span>
                <span className="text-sm text-gray-600">Oct 6</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  Status-{" "}
                </span>
                <span className="text-sm text-gray-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
