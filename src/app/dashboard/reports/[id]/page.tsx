"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ImageIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { reportsApi, Report } from "@/lib/api";
import Image from "next/image";
import { useReportsStore } from "@/store/useReportsStore";

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getReportDetail } = useReportsStore();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // 1. Try passing the report via cache/store to avoid an api call
        const cachedReport = getReportDetail(id);
        if (cachedReport) {
          setReport(cachedReport);
          setIsLoading(false);
          return;
        }

        // 2. Fallback to API if user landed here directly via URL
        const data = await reportsApi.getReportById(id);
        setReport(data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, getReportDetail]);

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Report not found</p>
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="flex items-center gap-2 text-[#1e2667] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      resolved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      in_progress: "bg-blue-100 text-blue-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const reporterInfo =
    report.reportedBy === "USER"
      ? {
          name: report.user?.name || "Unknown User",
          email: report.user?.email || "N/A",
          phone: report.user?.phone || "N/A",
          link: report.user?.id ? `/dashboard/users/${report.user.id}` : null,
        }
      : {
          name: report.agent?.fullName || "Unknown Agent",
          email: report.agent?.email || "N/A",
          phone: report.agent?.phone || "N/A",
          link: report.agent?.id
            ? `/dashboard/agents/${report.agent.id}`
            : null,
        };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/reports")}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">
            Report Details
          </h1>
          <p className="text-sm text-gray-500 italic">ID: {report.id}</p>
        </div>
        <div className="ml-auto">
          <span
            className={`text-sm font-medium px-4 py-2 rounded-full capitalize ${getStatusBadge(
              report.status,
            )}`}
          >
            {report.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Issue Information
            </h2>
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Title
                </span>
                <p className="text-gray-900 font-medium text-lg">
                  {report.title}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Description
                </span>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700 border border-gray-100 min-h-[150px]">
                  {report.description || "No description provided."}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-4">
                  Attachments
                </span>
                {report.imageUrls && report.imageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {report.imageUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-[#1e2667] transition-colors"
                      >
                        {url.match(/\.(jpeg|jpg|gif|png|webp)(?:\?|$)/i) ? (
                          <Image
                            src={url}
                            alt={`Attachment ${i + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 group-hover:text-[#1e2667] transition-colors">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium px-2 truncate text-center w-full">
                              Attachment {i + 1}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No files attached to this report.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Meta Data */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Reporter Profile
            </h2>

            <div className="flex items-center justify-between mb-6">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide ${
                  report.reportedBy === "USER"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {report.reportedBy}
              </span>

              {reporterInfo.link && (
                <Link
                  href={reporterInfo.link}
                  className="text-xs text-[#1e2667] hover:underline font-medium flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{reporterInfo.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p
                  className="font-medium text-gray-900 truncate"
                  title={reporterInfo.email}
                >
                  {reporterInfo.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {reporterInfo.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Report Meta
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="font-medium text-gray-900">
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(report.updatedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
