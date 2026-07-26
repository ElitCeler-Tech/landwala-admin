"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { layoutsApi, Layout, LayoutSlot } from "@/lib/api";
import clsx from "clsx";

export default function LayoutDetailsPage() {
  const params = useParams();
  const layoutId = params.id as string;

  const router = useRouter();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullLayout, setShowFullLayout] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const data = await layoutsApi.getLayoutById(layoutId);
        setLayout(data);
      } catch (error) {
        console.error("Failed to fetch layout:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (layoutId) {
      fetchLayout();
    }
  }, [layoutId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await layoutsApi.deleteLayout(layoutId);
      router.push("/dashboard/layouts");
    } catch (error) {
      console.error("Failed to delete layout:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Layout not found</p>
        <Link
          href="/dashboard/layouts"
          className="text-[#1e2667] hover:underline"
        >
          Back to Layouts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 pb-12 bg-white font-sans min-h-full flex flex-col relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Layout</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this layout? This action cannot be undone.
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
          <Link
            href="/dashboard/layouts"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Layout Details</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          View specific layout details and slot information
        </p>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Image */}
          <div className="w-full lg:w-1/3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              {layout.imageUrl ? (
                <img
                  src={layout.imageUrl}
                  alt={layout.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 content-center">
            <div>
              <span className="font-medium text-lg text-gray-900">
                Title -{" "}
              </span>
              <span className="text-gray-700 text-lg">{layout.title}</span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Location -{" "}
              </span>
              <span className="text-gray-700 text-lg">{layout.location}</span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Price Range -{" "}
              </span>
              <span className="text-gray-700 text-lg">{layout.priceRange}</span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Status -{" "}
              </span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${layout.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {layout.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Total Slots -{" "}
              </span>
              <span className="text-gray-700 text-lg">{layout.totalSlots}</span>
            </div>
            <div>
              <span className="font-medium text-lg text-gray-900">
                Availability -{" "}
              </span>
              <span className="text-green-600 text-lg font-medium">
                {layout.availableSlots} Available
              </span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-red-500 text-lg font-medium">
                {layout.notAvailableSlots} Sold
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Image */}
      {layout.layoutImageUrl && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Master Layout Map
            </h2>
            <button
              onClick={() => setShowFullLayout(!showFullLayout)}
              className="flex items-center gap-2 text-[#1e2667] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              {showFullLayout ? (
                <>
                  <Minimize2 className="w-4 h-4" /> Minimize
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" /> Maximize
                </>
              )}
            </button>
          </div>
          <div
            className={clsx(
              "relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200 transition-all duration-300",
              showFullLayout ? "h-[80vh]" : "h-96"
            )}
          >
            <img
              src={layout.layoutImageUrl}
              alt="Master Layout"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Slots Section */}
      <div className="space-y-8">
        {Object.entries(layout.slotsBySection).map(([sectionTitle, slots]) => (
          <div
            key={sectionTitle}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {sectionTitle}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="py-4 pl-6 font-medium text-gray-600 w-20">
                      Plot No
                    </th>
                    <th className="py-4 font-medium text-gray-600">Area</th>
                    <th className="py-4 font-medium text-gray-600">Facing</th>
                    <th className="py-4 font-medium text-gray-600">
                      Dimensions (W x H)
                    </th>
                    <th className="py-4 font-medium text-gray-600">Price</th>
                    <th className="py-4 pr-6 font-medium text-gray-600 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
                  {slots.map((slot) => (
                    <tr
                      key={slot.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 pl-6 font-medium text-gray-900">
                        {slot.plotNumber}
                      </td>
                      <td className="py-4">{slot.area}</td>
                      <td className="py-4">{slot.facing}</td>
                      <td className="py-4 text-gray-500">
                        {slot.width && slot.height
                          ? `${slot.width} x ${slot.height}`
                          : "-"}
                      </td>
                      <td className="py-4 font-medium text-gray-900">
                        {slot.priceFormatted}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span
                          className={clsx(
                            "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                            slot.status === "available"
                              ? "bg-green-100 text-green-700"
                              : slot.status === "booked"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {slot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-8 py-2 rounded-lg text-white font-medium bg-red-600 hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Delete
        </button>
        <Link href={`/dashboard/layouts/${layoutId}/edit`}>
          <button className="px-8 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-opacity-90 transition-opacity cursor-pointer">
            Edit
          </button>
        </Link>
        <Link href="/dashboard/layouts">
          <button className="px-8 py-2 rounded-lg text-white font-medium bg-gray-500 hover:bg-opacity-90 transition-opacity cursor-pointer">
            Back
          </button>
        </Link>
        <button
          onClick={async () => {
            if (!layout) return;
            try {
              const updated = await layoutsApi.toggleStatus(layout.id);
              setLayout(updated);
            } catch (error) {
              console.error("Failed to toggle layout status:", error);
            }
          }}
          className="px-8 py-2 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          {layout.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
