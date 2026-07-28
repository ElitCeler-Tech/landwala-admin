"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Loader2,
  CheckCircle,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { layoutsApi } from "@/lib/api";

const steps = [
  { id: 1, label: "Basic Info & Images" },
  { id: 2, label: "Slots Management" },
];

interface Slot {
  sectionTitle: string;
  plotNumber: string;
  area: string;
  facing: string;
  price: string;
  width: string;
  height: string;
  status: string;
}

interface LayoutFormData {
  title: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  priceUnit: string;
  approvalType: string;
}

export default function CreateLayoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const layoutImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LayoutFormData>({
    title: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    priceUnit: "Cr",
    approvalType: "",
  });
  const [isPremium, setIsPremium] = useState(false);

  const [files, setFiles] = useState<{
    image: File | null;
    layoutImage: File | null;
  }>({
    image: null,
    layoutImage: null,
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot>({
    sectionTitle: "",
    plotNumber: "",
    area: "",
    facing: "",
    price: "",
    width: "",
    height: "",
    status: "available",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "layoutImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  const handleSlotChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewSlot((prev) => ({ ...prev, [name]: value }));
  };

  const addSlot = () => {
    if (!newSlot.plotNumber || !newSlot.sectionTitle || !newSlot.price) {
      alert("Please fill in at least Plot Number, Section Title, and Price.");
      return;
    }
    setSlots((prev) => [...prev, newSlot]);
    // Reset recurring fields lightly, keep section title maybe?
    setNewSlot({
      sectionTitle: newSlot.sectionTitle, // Keep section title for faster entry
      plotNumber: "",
      area: "",
      facing: "",
      price: "",
      width: "",
      height: "",
      status: "available",
    });
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value);
        }
      });
      submitData.append("isPremium", String(isPremium));

      if (slots.length > 0) {
        submitData.append("slots", JSON.stringify(slots));
      }

      if (files.image) {
        submitData.append("image", files.image);
      }

      if (files.layoutImage) {
        submitData.append("layoutImage", files.layoutImage);
      }

      await layoutsApi.createLayout(submitData);
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/layouts");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create layout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      if (
        !formData.title ||
        !formData.location ||
        !formData.minPrice ||
        !formData.maxPrice
      ) {
        setError("Please fill in all required fields in Step 1.");
        return;
      }
      setError("");
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Layout Created Successfully!
          </h2>
          <p className="text-gray-500">Redirecting to layouts list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/layouts"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Create Layout</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Add a new layout with details and slots
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center relative">
              <div className="relative flex flex-col items-center">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 relative transition-colors duration-200",
                    currentStep >= step.id
                      ? "border-[#1e2667]"
                      : "border-gray-200"
                  )}
                >
                  {currentStep >= step.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e2667]" />
                  )}
                </div>
                <div
                  className={clsx(
                    "absolute top-8 left-1/2 -translate-x-1/2 w-40 text-center text-xs font-medium transition-colors duration-200",
                    currentStep >= step.id ? "text-[#1e2667]" : "text-gray-400"
                  )}
                >
                  {step.label}
                </div>
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={clsx(
                    "h-0.5 w-32 md:w-64 mx-2 transition-colors duration-200",
                    currentStep > step.id ? "bg-[#1e2667]" : "bg-gray-100"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Basic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Layout Title"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Min Price *
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleInputChange}
                    placeholder="Min Price"
                    step="0.01"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Max Price *
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    placeholder="Max Price"
                    step="0.01"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Price Unit
                  </label>
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
                  >
                    <option value="Cr">Crore (Cr)</option>
                    <option value="L">Lakh (L)</option>
                    <option value="K">Thousand (K)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Approval Type
                  </label>
                  <select
                    name="approvalType"
                    value={formData.approvalType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
                  >
                    <option value="">None</option>
                    <option value="HMDA">HMDA</option>
                    <option value="DTCP">DTCP</option>
                    <option value="RERA">RERA</option>
                  </select>
                </div>
                <div className="space-y-2 flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Premium Layout
                  </label>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => handleFileChange(e, "image")}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    {files.image ? (
                      <span className="text-gray-900 font-medium">
                        {files.image.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Upload Image</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Master Layout Map
                  </label>
                  <input
                    type="file"
                    ref={layoutImageInputRef}
                    onChange={(e) => handleFileChange(e, "layoutImage")}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => layoutImageInputRef.current?.click()}
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    {files.layoutImage ? (
                      <span className="text-gray-900 font-medium">
                        {files.layoutImage.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Upload Layout Map</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-6">
            {/* Add New Slot Form */}
            <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Add Slot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Section *
                  </label>
                  <input
                    type="text"
                    name="sectionTitle"
                    value={newSlot.sectionTitle}
                    onChange={handleSlotChange}
                    placeholder="e.g. 32ft Road"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Plot No *
                  </label>
                  <input
                    type="text"
                    name="plotNumber"
                    value={newSlot.plotNumber}
                    onChange={handleSlotChange}
                    placeholder="e.g. 24"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={newSlot.area}
                    onChange={handleSlotChange}
                    placeholder="e.g. 165 sq.yd"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Facing
                  </label>
                  <input
                    type="text"
                    name="facing"
                    value={newSlot.facing}
                    onChange={handleSlotChange}
                    placeholder="e.g. East"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newSlot.price}
                    onChange={handleSlotChange}
                    placeholder="Price value"
                    step="0.01"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Width
                  </label>
                  <input
                    type="text"
                    name="width"
                    value={newSlot.width}
                    onChange={handleSlotChange}
                    placeholder="e.g. 30'4"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    Height
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={newSlot.height}
                    onChange={handleSlotChange}
                    placeholder="e.g. 60'0"
                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none"
                  />
                </div>
                <div className="space-y-1 flex items-end">
                  <button
                    onClick={addSlot}
                    className="w-full bg-[#1e2667] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Added Slots List */}
            {slots.length > 0 && (
              <div className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">
                    Added Slots ({slots.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white border-b border-gray-100">
                        <th className="py-3 px-4 font-medium text-gray-600">
                          Section
                        </th>
                        <th className="py-3 px-4 font-medium text-gray-600">
                          Plot No
                        </th>
                        <th className="py-3 px-4 font-medium text-gray-600">
                          Area
                        </th>
                        <th className="py-3 px-4 font-medium text-gray-600">
                          Price
                        </th>
                        <th className="py-3 px-4 font-medium text-gray-600">
                          Dims
                        </th>
                        <th className="py-3 px-4 font-medium text-gray-600 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {slots.map((slot, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">
                            {slot.sectionTitle}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {slot.plotNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {slot.area}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {slot.price}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {slot.width} x {slot.height}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => removeSlot(index)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-8">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-8 py-2 rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Previous
          </button>
        )}
        <Link href="/dashboard/layouts">
          <button className="px-8 py-2 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-2 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentStep === 2
            ? isSubmitting
              ? "Creating..."
              : "Create Layout"
            : "Next"}
        </button>
      </div>
    </div>
  );
}
