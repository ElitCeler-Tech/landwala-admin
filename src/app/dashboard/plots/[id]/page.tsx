"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  MapPin,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { propertiesApi, Property } from "@/lib/api";

export default function PlotDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const router = useRouter(); // Initialize router
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertiesApi.getPropertyById(propertyId);
        setProperty(data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await propertiesApi.deleteProperty(propertyId);
      router.push("/dashboard/plots");
    } catch (error) {
      console.error("Failed to delete property:", error);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOverviewValue = (label: string) => {
    const field = property?.overviewFields.find(
      (f) => f.label.toLowerCase() === label.toLowerCase()
    );
    return field?.value || "-";
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Property not found</p>
        <button
          onClick={() => router.back()}
          className="text-[#1e2667] hover:underline cursor-pointer"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-12 bg-white font-sans min-h-full flex flex-col relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Property</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.back()}
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Plot Details</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          View all the details about the Plot here
        </p>
      </div>

      {/* Main Plot Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Image */}
          <div className="w-full lg:w-1/3">
            <div className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group">
              {property.images[selectedImage] ? (
                <img
                  src={property.images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 content-center">
            <div>
              <span className="font-medium text-lg text-gray-900">
                Title -{" "}
              </span>
              <span className="text-gray-700 text-lg">{property.title}</span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">Size - </span>
              <span className="text-gray-700 text-lg">
                {getOverviewValue("Sizes")}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">Type - </span>
              <span className="text-gray-700 text-lg">
                {getOverviewValue("Type")}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Status -{" "}
              </span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${property.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {property.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Price -{" "}
              </span>
              <span className="text-gray-700 text-lg">
                {property.priceRange}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Location -
              </span>
              <span className="text-gray-700 text-sm">
                {property.city}, {property.state}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-lg text-gray-900">
                Address -
              </span>
              <span className="text-gray-700 text-sm">
                {property.locationAddress}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Featured -
              </span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${property.isFeatured
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {property.isFeatured ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Created -
              </span>
              <span className="text-gray-700 text-sm">
                {formatDate(property.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Views -{" "}
              </span>
              <span className="text-gray-700 text-lg">
                {property.viewCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility & Settings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Visibility & Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Featured Property</p>
              <p className="text-xs text-gray-500">Show in featured section</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleFeatured(property.id);
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle featured:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isFeatured ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isFeatured ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Explore Nearby Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Explore Nearby</p>
              <p className="text-xs text-gray-500">Show in explore nearby</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleExploreNearby(
                    property.id
                  );
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle explore nearby:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isExploreNearby ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isExploreNearby ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Trending Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Trending</p>
              <p className="text-xs text-gray-500">Show in trending section</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleTrending(
                    property.id
                  );
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle trending:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isTrending ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isTrending ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Hot Sale Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Hot Sale</p>
              <p className="text-xs text-gray-500">Show in hot sale section</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleHotSale(
                    property.id
                  );
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle hot sale:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isHotSale ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isHotSale ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Latest Listing Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Latest Listing</p>
              <p className="text-xs text-gray-500">Mark as latest listing</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleLatestListing(
                    property.id
                  );
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle latest listing:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isLatestListing ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isLatestListing ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Sold Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Sold</p>
              <p className="text-xs text-gray-500">Mark as sold</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.toggleSold(property.id);
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle sold:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isSold ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isSold ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Premium</p>
              <p className="text-xs text-gray-500">Mark as premium listing</p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = await propertiesApi.togglePremium(property.id);
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to toggle premium:", error);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e2667] focus:ring-offset-2 ${property.isPremium ? "bg-[#1e2667]" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${property.isPremium ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Archive / Restore */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {property.isArchived ? "Archived" : "Archive"}
              </p>
              <p className="text-xs text-gray-500">
                {property.isArchived
                  ? "Hidden from public listings"
                  : "Hide from public listings"}
              </p>
            </div>
            <button
              onClick={async () => {
                if (!property) return;
                try {
                  const updated = property.isArchived
                    ? await propertiesApi.restoreProperty(property.id)
                    : await propertiesApi.archiveProperty(property.id);
                  setProperty(updated);
                } catch (error) {
                  console.error("Failed to archive/restore property:", error);
                }
              }}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer ${property.isArchived
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
            >
              {property.isArchived ? "Restore" : "Archive"}
            </button>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      {property.images.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer hover:opacity-90 transition-opacity ${selectedImage === index ? "ring-2 ring-[#1e2667]" : ""
                  }`}
              >
                <img
                  src={image}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {property.descriptionTitle || "Description"}
        </h2>
        <p className="text-gray-600">
          {property.descriptionContent || property.description}
        </p>
        <p className="text-gray-500 text-sm mt-4 italic">{property.subtitle}</p>
      </div>

      {/* Overview Fields */}
      {property.overviewFields.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {property.overviewFields
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((field) => (
                <div key={field.id}>
                  <p className="text-gray-500 text-sm mb-1">{field.label}</p>
                  <p className="text-gray-900 font-medium">{field.value}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Brochure:</p>
            {property.brochureUrl ? (
              <a
                href={property.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-900 font-medium flex-1">
                  Brochure
                </span>
                <Download className="w-4 h-4 text-gray-400" />
              </a>
            ) : (
              <p className="text-sm text-gray-400">No brochure available</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Land Layout:
            </p>
            {property.landLayoutImageUrl ? (
              <a
                href={property.landLayoutImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-900 font-medium flex-1">
                  {property.landLayoutTitle || "Land Layout"}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ) : (
              <p className="text-sm text-gray-400">No layout available</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">City</p>
            <p className="text-gray-900 font-medium">{property.city}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">State</p>
            <p className="text-gray-900 font-medium">{property.state}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Pincode</p>
            <p className="text-gray-900 font-medium">{property.pincode}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Coordinates</p>
            <p className="text-gray-900 font-medium text-sm">
              {property.latitude}, {property.longitude}
            </p>
          </div>
        </div>
        <p className="text-gray-600">{property.locationAddress}</p>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-8 py-2 rounded-lg text-white font-medium bg-red-600 hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Delete
        </button>
        <Link href={`/dashboard/plots/${property.id}/edit`}>
          <button className="px-8 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-opacity-90 transition-opacity cursor-pointer">
            Edit
          </button>
        </Link>
        <button
          onClick={() => router.back()}
          className="px-8 py-2 rounded-lg text-white font-medium bg-gray-500 hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={async () => {
            if (!property) return;
            try {
              const updated = await propertiesApi.toggleStatus(property.id);
              setProperty(updated);
            } catch (error) {
              console.error("Failed to toggle property status:", error);
            }
          }}
          className="px-8 py-2 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          {property.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
