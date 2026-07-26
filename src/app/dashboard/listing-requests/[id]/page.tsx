"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { listingRequestsApi, ListingRequest } from "@/lib/api";
import Image from "next/image";
import { useListingRequestsStore } from "@/store/useListingRequestsStore";

export default function ListingRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<ListingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getRequestDetail } = useListingRequestsStore();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const cachedRequest = getRequestDetail(id);
        if (cachedRequest) {
          setRequest(cachedRequest);
          setIsLoading(false);
          return;
        }

        const data = await listingRequestsApi.getListingRequestById(id);
        setRequest(data);
      } catch (error) {
        console.error("Failed to fetch listing request:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id, getRequestDetail]);

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Request not found</p>
        <button
          onClick={() => router.push("/dashboard/listing-requests")}
          className="flex items-center gap-2 text-[#1e2667] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listing Requests
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/listing-requests")}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">
            Listing Request Details
          </h1>
          <p className="text-sm text-gray-500 italic">ID: {request.id}</p>
        </div>
        <div className="ml-auto">
          <span className="text-sm font-medium px-4 py-2 rounded-full capitalize bg-blue-100 text-blue-700">
            Agent Referral
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center justify-between">
              <span>Property Information</span>
              <Link
                href={`/dashboard/plots/${request.propertyId}`}
                className="text-sm font-medium text-[#1e2667] hover:underline flex items-center gap-1"
              >
                View Property <ExternalLink className="w-4 h-4" />
              </Link>
            </h2>

            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Title
                </span>
                <p className="text-gray-900 font-medium text-lg">
                  {request.property?.title}
                </p>
                {request.property?.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {request.property.subtitle}
                  </p>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Location
                </span>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-[#1e2667] shrink-0 mt-0.5" />
                  <div>
                    <p>{request.property?.locationAddress}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {request.property?.city}, {request.property?.state} -{" "}
                      {request.property?.pincode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                    Price Range
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {request.property?.priceRange}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                    Property ID
                  </span>
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={request.propertyId}
                  >
                    {request.propertyId}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">
                  Description
                </span>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700 border border-gray-100 min-h-[100px]">
                  {request.property?.description || "No description provided."}
                </div>
              </div>

              {request.property?.images &&
                request.property.images.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-4">
                      Property Showcase
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {request.property.images.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block aspect-4/3 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-[#1e2667] transition-colors"
                        >
                          <Image
                            src={url}
                            alt={`Property Image ${i + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Column - Meta Data */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Agent Profile
            </h2>

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold px-3 py-1 rounded-full tracking-wide bg-blue-100 text-blue-700">
                AGENT
              </span>

              {request.agentId && (
                <Link
                  href={`/dashboard/agents/${request.agentId}`}
                  className="text-xs text-[#1e2667] hover:underline font-medium flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">
                  {request.agent?.fullName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p
                  className="font-medium text-gray-900 truncate"
                  title={request.agent?.email}
                >
                  {request.agent?.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {request.agent?.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              Request Meta
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Requested On</p>
                <p className="font-medium text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 pb-4 border-b border-gray-100">
              About This Request
            </h2>
            <p className="text-sm text-gray-500">
              This agent flagged the property above as worth listing. It has
              no separate approve/reject workflow — manage the property
              itself (activate, edit, etc.) from its own page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
